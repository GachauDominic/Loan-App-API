import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { consents, members } from "../../db/schema.js";
import { AppError } from "../../http/errors.js";
import { auditService } from "../audits/audit.service.js";
import type { CreateConsentInput } from "./consent.validator.js";

export class ConsentService {
  async create(input: CreateConsentInput) {
    const member = await db.query.members.findFirst({
      where: eq(members.id, input.memberId)
    });

    if (!member) {
      throw new AppError(404, "Member not found.");
    }

    await db
      .update(consents)
      .set({ status: "withdrawn", withdrawnAt: new Date() })
      .where(and(eq(consents.memberId, input.memberId), eq(consents.status, "active")));

    const [consent] = await db.insert(consents).values(input).returning();

    await auditService.record({
      actorType: "system",
      entityType: "consent",
      entityId: consent.id,
      action: "consent.created",
      metadata: {
        memberId: input.memberId,
        transactionDataAllowed: input.transactionDataAllowed,
        automatedDecisionAllowed: input.automatedDecisionAllowed
      }
    });

    return consent;
  }

  async getActiveForMember(memberId: string) {
    return db.query.consents.findFirst({
      where: and(eq(consents.memberId, memberId), eq(consents.status, "active")),
      orderBy: desc(consents.createdAt)
    });
  }

  async withdraw(memberId: string) {
    const [consent] = await db
      .update(consents)
      .set({ status: "withdrawn", withdrawnAt: new Date() })
      .where(and(eq(consents.memberId, memberId), eq(consents.status, "active")))
      .returning();

    if (!consent) {
      throw new AppError(404, "Active consent not found.");
    }

    await auditService.record({
      actorType: "system",
      entityType: "consent",
      entityId: consent.id,
      action: "consent.withdrawn",
      metadata: { memberId }
    });

    return consent;
  }
}

export const consentService = new ConsentService();
