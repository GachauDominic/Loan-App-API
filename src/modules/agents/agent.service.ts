import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { agentHandoffs } from "../../db/schema.js";
import { AppError } from "../../http/errors.js";
import { auditService } from "../audits/audit.service.js";
import { loanService } from "../loans/loan.service.js";
import type { GuardianTriageInput, ScoutMessageInput } from "./agent.validator.js";

const stressKeywords = ["loan shark", "debt collector", "school fees", "no money", "food", "eviction"];

export class AgentService {
  async processScoutMessage(input: ScoutMessageInput) {
    const lowerMessage = input.message.toLowerCase();
    const matchedSignal = stressKeywords.find((keyword) => lowerMessage.includes(keyword));

    if (!matchedSignal) {
      await auditService.record({
        actorType: "ai",
        actorId: "scout-agent",
        entityType: "member",
        entityId: input.memberId,
        action: "scout.message_processed",
        metadata: { handoffCreated: false }
      });

      return {
        reply:
          "Thanks for sharing. Keep saving what you can, and we can help you plan around stronger income weeks.",
        handoff: null
      };
    }

    const [handoff] = await db
      .insert(agentHandoffs)
      .values({
        fromAgent: "scout",
        toAgent: "guardian",
        trigger: matchedSignal,
        context: {
          memberId: input.memberId,
          message: input.message,
          ...input.context
        }
      })
      .returning();

    await auditService.record({
      actorType: "ai",
      actorId: "scout-agent",
      entityType: "agent_handoff",
      entityId: handoff.id,
      action: "scout.handoff_created",
      metadata: { trigger: matchedSignal }
    });

    return {
      reply:
        "I hear you. I am sending this for careful review so a person can consider the timing and pressure you are facing.",
      handoff
    };
  }

  async guardianTriage(applicationId: string, input: GuardianTriageInput) {
    const result = await loanService.triageApplication(applicationId, input);

    if (result.triage.outcome === "escalate") {
      await db.insert(agentHandoffs).values({
        applicationId,
        fromAgent: "guardian",
        toAgent: "hunter",
        trigger: "triage escalation",
        context: {
          riskScore: result.triage.riskScore,
          riskFlags: result.triage.riskFlags,
          repaymentCapacityMonthly: result.triage.repaymentCapacityMonthly
        }
      });
    }

    return result;
  }

  async hunterBriefing(applicationId: string) {
    const application = await loanService.getApplication(applicationId);

    if (!application) {
      throw new AppError(404, "Loan application not found.");
    }

    const latestDecision = application.decisions.at(-1);
    const briefing = {
      applicant: application.member.fullName,
      county: application.county,
      request: Number(application.requestedAmount),
      purpose: application.purpose,
      occupation: application.occupationRaw,
      riskScore: application.riskScore,
      repaymentCapacityMonthly: application.repaymentCapacityMonthly
        ? Number(application.repaymentCapacityMonthly)
        : null,
      householdPausePoint: application.member.childrenUnderFive > 0,
      riskFlags: Array.isArray(application.affordabilityEvidence.riskFlags)
        ? application.affordabilityEvidence.riskFlags
        : [],
      biasChecks: application.biasChecks,
      latestRecommendation: latestDecision?.outcome,
      officerInstructions: [
        "Validate affordability evidence with the member.",
        "Do not use occupation as a sole reason.",
        "Offer a review path and dignity-preserving explanation.",
        "Check whether school-fee or harvest timing changes repayment fit."
      ]
    };

    const [handoff] = await db
      .insert(agentHandoffs)
      .values({
        applicationId,
        fromAgent: "hunter",
        toAgent: "hunter",
        trigger: "human briefing prepared",
        context: briefing,
        status: "closed"
      })
      .returning();

    await auditService.record({
      actorType: "ai",
      actorId: "hunter-agent",
      entityType: "loan_application",
      entityId: applicationId,
      action: "hunter.briefing_prepared",
      metadata: { handoffId: handoff.id }
    });

    return { briefing, handoff };
  }
}

export const agentService = new AgentService();
