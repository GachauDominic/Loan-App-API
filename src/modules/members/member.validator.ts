import { z } from "zod";

export const createMemberSchema = z.object({
  fullName: z.string().min(2),
  phoneNumber: z.string().min(7),
  nationalIdHash: z.string().optional(),
  county: z.string().min(2),
  subCounty: z.string().optional(),
  preferredLanguage: z.enum(["english", "swahili", "sheng", "luhya"]).default("english"),
  childrenUnderFive: z.number().int().min(0).default(0)
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
