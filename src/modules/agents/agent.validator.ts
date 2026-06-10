import { z } from "zod";

export const scoutMessageSchema = z.object({
  memberId: z.string().uuid(),
  message: z.string().min(1),
  context: z.record(z.unknown()).default({})
});

export const guardianTriageSchema = z.object({
  averageMonthlyIncome: z.coerce.number().nonnegative(),
  averageMonthlyObligations: z.coerce.number().nonnegative().default(0),
  currentSavingsBalance: z.coerce.number().nonnegative().default(0),
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

export type ScoutMessageInput = z.infer<typeof scoutMessageSchema>;
export type GuardianTriageInput = z.infer<typeof guardianTriageSchema>;
