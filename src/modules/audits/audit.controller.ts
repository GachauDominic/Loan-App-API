import type { Request, Response } from "express";
import { auditService } from "./audit.service.js";

export class AuditController {
  async list(request: Request, response: Response) {
    const entityType = typeof request.query.entityType === "string" ? request.query.entityType : undefined;
    const entityId = typeof request.query.entityId === "string" ? request.query.entityId : undefined;
    const logs = await auditService.list(entityType, entityId);

    response.json({ data: logs });
  }
}

export const auditController = new AuditController();
