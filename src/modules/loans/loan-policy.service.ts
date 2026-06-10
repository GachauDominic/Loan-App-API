import type { RecordLoanDecisionInput, TriageLoanApplicationInput } from "./loan.validator.js";

const deniedLanguage = ["unreliable", "risky", "bad borrower", "blacklisted", "poor woman", "you failed"];

export type TriageResult = {
  riskScore: number;
  repaymentCapacityMonthly: number;
  outcome: "approve" | "revise" | "escalate";
  riskFlags: string[];
  biasChecks: Record<string, unknown>;
  memberMessage: string;
};

export class LoanPolicyService {
  calculateTriage(input: TriageLoanApplicationInput, application: { requestedAmount: string; requestedTermMonths: number; occupationCategory: string }, member: { childrenUnderFive: number }): TriageResult {
    const requestedAmount = Number(application.requestedAmount);
    const monthlyPrincipal = requestedAmount / application.requestedTermMonths;
    const disposableIncome = Math.max(input.averageMonthlyIncome - input.averageMonthlyObligations, 0);
    const repaymentCapacityMonthly = Math.round(disposableIncome * 0.35);
    const riskFlags: string[] = [];

    if (repaymentCapacityMonthly < monthlyPrincipal) {
      riskFlags.push("repayment capacity below estimated monthly principal");
    }

    if (input.currentSavingsBalance < monthlyPrincipal) {
      riskFlags.push("cash buffer below one estimated instalment");
    }

    if (requestedAmount > 15000) {
      riskFlags.push("amount above automated triage threshold");
    }

    if (member.childrenUnderFive > 0) {
      riskFlags.push("vulnerable-household pause point");
    }

    if (application.occupationCategory !== "formal_employee" && !input.seasonalEvidence?.verifiedSource) {
      riskFlags.push("non-salary income requires local evidence verification");
    }

    const affordabilityRatio = monthlyPrincipal === 0 ? 0 : repaymentCapacityMonthly / monthlyPrincipal;
    const riskScore = Math.max(0, Math.min(100, Math.round(55 + affordabilityRatio * 20)));
    const mustEscalate = riskFlags.includes("amount above automated triage threshold") || riskFlags.includes("vulnerable-household pause point");
    const outcome = mustEscalate ? "escalate" : riskScore >= 80 ? "approve" : riskScore >= 65 ? "revise" : "escalate";

    return {
      riskScore,
      repaymentCapacityMonthly,
      outcome,
      riskFlags,
      biasChecks: {
        occupationOnlyDecision: false,
        creditScoreSoleReason: false,
        counterfactualRequired: application.occupationCategory !== "formal_employee",
        dignityFilterRequired: true
      },
      memberMessage: this.buildMemberMessage(outcome)
    };
  }

  validateDecision(input: RecordLoanDecisionInput) {
    if (input.outcome === "deny" && input.reviewerType !== "human") {
      throw new Error("Only a human reviewer can record a final denial.");
    }

    if (input.outcome === "deny" && input.reasons.length < 3) {
      throw new Error("A denial requires at least 3 verified risk reasons.");
    }

    const lowerReasons = input.reasons.map((reason) => reason.toLowerCase());
    const occupationOnly = lowerReasons.length === 1 && lowerReasons[0]?.includes("occupation");

    if (occupationOnly) {
      throw new Error("Occupation cannot be the sole reason for a loan decision.");
    }

    const lowerMessage = input.memberMessage.toLowerCase();
    const bannedTerm = deniedLanguage.find((term) => lowerMessage.includes(term));

    if (bannedTerm) {
      throw new Error(`Member message failed dignity filter: "${bannedTerm}" is not allowed.`);
    }
  }

  private buildMemberMessage(outcome: TriageResult["outcome"]) {
    if (outcome === "approve") {
      return "Your application looks affordable from the information provided. A loan officer will confirm the final terms before release.";
    }

    if (outcome === "revise") {
      return "Your cash flow may support a smaller or better-timed loan. We can adjust the amount or align repayments with stronger income months.";
    }

    return "Your application needs human review so we can consider your full situation, including household needs and income timing.";
  }
}

export const loanPolicyService = new LoanPolicyService();
