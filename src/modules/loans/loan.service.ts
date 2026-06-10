import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { loanApplications, loanDecisions, members } from "../../db/schema.js";
import { AppError } from "../../http/errors.js";
import { auditService } from "../audits/audit.service.js";
import { consentService } from "../consents/consent.service.js";
import { loanPolicyService } from "./loan-policy.service.js";
import type {
  CreateLoanApplicationInput,
  RecordLoanDecisionInput,
  TriageLoanApplicationInput
} from "./loan.validator.js";

export class LoanService {
  async createApplication(input: CreateLoanApplicationInput) {
    const member = await db.query.members.findFirst({
      where: eq(members.id, input.memberId)
    });

    if (!member) {
      throw new AppError(404, "Member not found.");
    }

    const [application] = await db
      .insert(loanApplications)
      .values({
        ...input,
        requestedAmount: input.requestedAmount.toFixed(2)
      })
      .returning();

    await auditService.record({
      actorType: "system",
      entityType: "loan_application",
      entityId: application.id,
      action: "loan_application.created",
      metadata: {
        requestedAmount: input.requestedAmount,
        occupationCategory: input.occupationCategory,
        county: input.county
      }
    });

    return application;
  }

  async getApplication(id: string) {
    const application = await db.query.loanApplications.findFirst({
      where: eq(loanApplications.id, id),
      with: {
        member: true,
        decisions: true,
        handoffs: true
      }
    });

    if (!application) {
      throw new AppError(404, "Loan application not found.");
    }

    return application;
  }

  async triageApplication(applicationId: string, input: TriageLoanApplicationInput) {
    const application = await this.getApplication(applicationId);
    const activeConsent = await consentService.getActiveForMember(application.memberId);

    if (!activeConsent?.automatedDecisionAllowed) {
      throw new AppError(403, "Automated triage requires active automated-decision consent.");
    }

    if (input.transactionSummaryProvided && !activeConsent.transactionDataAllowed) {
      throw new AppError(403, "Transaction-history triage requires active transaction-data consent.");
    }

    const triage = loanPolicyService.calculateTriage(input, application, application.member);
    const status = triage.outcome === "escalate" ? "escalated" : "triage";

    const [updated] = await db
      .update(loanApplications)
      .set({
        status,
        riskScore: triage.riskScore,
        repaymentCapacityMonthly: triage.repaymentCapacityMonthly.toFixed(2),
        affordabilityEvidence: {
          averageMonthlyIncome: input.averageMonthlyIncome,
          averageMonthlyObligations: input.averageMonthlyObligations,
          currentSavingsBalance: input.currentSavingsBalance,
          seasonalEvidence: input.seasonalEvidence,
          schoolFeePressureMonths: input.schoolFeePressureMonths,
          riskFlags: triage.riskFlags
        },
        biasChecks: triage.biasChecks,
        updatedAt: new Date()
      })
      .where(eq(loanApplications.id, applicationId))
      .returning();

    await db.insert(loanDecisions).values({
      applicationId,
      outcome: triage.outcome,
      reviewerType: "ai",
      reasons: triage.riskFlags.length ? triage.riskFlags : ["repayment capacity appears sufficient"],
      memberMessage: triage.memberMessage,
      modelVersion: "policy-engine-v1"
    });

    await auditService.record({
      actorType: "ai",
      actorId: "guardian-agent",
      entityType: "loan_application",
      entityId: applicationId,
      action: "loan_application.triaged",
      metadata: triage
    });

    return { application: updated, triage };
  }

  async recordDecision(applicationId: string, input: RecordLoanDecisionInput) {
    try {
      loanPolicyService.validateDecision(input);
    } catch (error) {
      throw new AppError(422, error instanceof Error ? error.message : "Decision failed policy validation.");
    }

    await this.getApplication(applicationId);

    const [decision] = await db
      .insert(loanDecisions)
      .values({
        applicationId,
        outcome: input.outcome,
        amountApproved: input.amountApproved?.toFixed(2),
        reviewerType: input.reviewerType,
        reviewerId: input.reviewerId,
        reasons: input.reasons,
        memberMessage: input.memberMessage,
        modelVersion: input.modelVersion
      })
      .returning();

    const nextStatus =
      input.outcome === "approve" ? "approved" : input.outcome === "deny" ? "denied" : "escalated";

    await db
      .update(loanApplications)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(eq(loanApplications.id, applicationId));

    await auditService.record({
      actorType: input.reviewerType,
      actorId: input.reviewerId,
      entityType: "loan_application",
      entityId: applicationId,
      action: "loan_application.decision_recorded",
      metadata: { outcome: input.outcome, reasons: input.reasons }
    });

    return decision;
  }
}

export const loanService = new LoanService();
