import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { members } from "../../db/schema.js";
import { AppError } from "../../http/errors.js";
import { auditService } from "../audits/audit.service.js";
import type { CreateMemberInput } from "./member.validator.js";

export class MemberService {
  async create(input: CreateMemberInput) {
    const existing = await db.query.members.findFirst({
      where: eq(members.phoneNumber, input.phoneNumber)
    });

    if (existing) {
      throw new AppError(409, "A member with this phone number already exists.");
    }

    const [member] = await db.insert(members).values(input).returning();

    await auditService.record({
      actorType: "system",
      entityType: "member",
      entityId: member.id,
      action: "member.created",
      metadata: { county: member.county, preferredLanguage: member.preferredLanguage }
    });

    return member;
  }

  async getById(id: string) {
    const member = await db.query.members.findFirst({
      where: eq(members.id, id),
      with: {
        consents: true,
        loanApplications: true
      }
    });

    if (!member) {
      throw new AppError(404, "Member not found.");
    }

    return member;
  }
}

export const memberService = new MemberService();
