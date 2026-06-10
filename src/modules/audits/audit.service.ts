import { desc, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { auditLogs } from "../../db/schema.js";

type AuditInput = {
  actorType: "ai" | "human" | "system";
  actorId?: string;
  entityType: string;
  entityId: string;
  action: string;
  metadata?: Record<string, unknown>;
};

export class AuditService {
  async record(input: AuditInput) {
    const [auditLog] = await db
      .insert(auditLogs)
      .values({
        actorType: input.actorType,
        actorId: input.actorId,
        entityType: input.entityType,
        entityId: input.entityId,
        action: input.action,
        metadata: input.metadata ?? {}
      })
      .returning();

    return auditLog;
  }

  async list(entityType?: string, entityId?: string) {
    if (entityType && entityId) {
      return db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.entityId, entityId))
        .orderBy(desc(auditLogs.createdAt));
    }

    return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100);
  }
}

export const auditService = new AuditService();
