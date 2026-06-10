import { z } from "zod";

export const createLoanApplicationSchema = z.object({
  memberId: z.string().uuid(),
  requestedAmount: z.coerce.number().positive(),
  requestedTermMonths: z.number().int().positive().max(36),
  purpose: z.string().min(3),
  occupationRaw: z.string().min(2),
  occupationCategory: z.enum([
    "formal_employee",
    "market_vendor",
    "smallholder_farmer",
    "cross_border_trader",
    "boda_operator",
    "chama_backed_enterprise",
    "other"
  ]),
  county: z.string().min(2),
  subCounty: z.string().optional()
});

export const triageLoanApplicationSchema = z.object({
  averageMonthlyIncome: z.coerce.number().nonnegative(),
  averageMonthlyObligations: z.coerce.number().nonnegative().default(0),
  currentSavingsBalance: z.coerce.number().nonnegative().default(0),
  creditScore: z.number().int().min(0).max(100).optional(),
  transactionSummaryProvided: z.boolean().default(false),
  seasonalEvidence: z
    .object({
      crop: z.string().optional(),
      verifiedSource: z.string().optional(),
      peakMonths: z.array(z.string()).default([])
    })
    .optional(),
  schoolFeePressureMonths: z.array(z.string()).default([]),
  notes: z.string().optional()
});

export const recordLoanDecisionSchema = z.object({
  outcome: z.enum(["approve", "deny", "revise", "escalate"]),
  amountApproved: z.coerce.number().positive().optional(),
  reviewerType: z.enum(["ai", "human", "system"]),
  reviewerId: z.string().optional(),
  reasons: z.array(z.string().min(3)).min(1),
  memberMessage: z.string().min(10),
  modelVersion: z.string().optional()
});

export type CreateLoanApplicationInput = z.infer<typeof createLoanApplicationSchema>;
export type TriageLoanApplicationInput = z.infer<typeof triageLoanApplicationSchema>;
export type RecordLoanDecisionInput = z.infer<typeof recordLoanDecisionSchema>;
