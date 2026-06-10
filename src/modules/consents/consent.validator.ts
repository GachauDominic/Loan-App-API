import { z } from "zod";

export const createConsentSchema = z.object({
  memberId: z.string().uuid(),
  transactionDataAllowed: z.boolean().default(false),
  automatedDecisionAllowed: z.boolean().default(false),
  thirdPartySharingAllowed: z.boolean().default(false),
  consentTextVersion: z.string().min(1)
});

export const withdrawConsentSchema = z.object({
  memberId: z.string().uuid()
});

export type CreateConsentInput = z.infer<typeof createConsentSchema>;
