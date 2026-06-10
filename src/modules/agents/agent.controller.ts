import type { Request, Response } from "express";
import { agentService } from "./agent.service.js";
import { guardianTriageSchema, scoutMessageSchema } from "./agent.validator.js";

export class AgentController {
  async scoutMessage(request: Request, response: Response) {
    const input = scoutMessageSchema.parse(request.body);
    const result = await agentService.processScoutMessage(input);

    response.json({ data: result });
  }

  async guardianTriage(request: Request, response: Response) {
    const input = guardianTriageSchema.parse(request.body);
    const result = await agentService.guardianTriage(String(request.params.applicationId), input);

    response.json({ data: result });
  }

  async hunterBriefing(request: Request, response: Response) {
    const result = await agentService.hunterBriefing(String(request.params.applicationId));

    response.json({ data: result });
  }
}

export const agentController = new AgentController();
