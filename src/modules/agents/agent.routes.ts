import { Router } from "express";
import { asyncHandler } from "../../http/async-handler.js";
import { agentController } from "./agent.controller.js";

export const agentRoutes = Router();

agentRoutes.post("/scout/messages", asyncHandler(agentController.scoutMessage.bind(agentController)));
agentRoutes.post(
  "/guardian/triage/:applicationId",
  asyncHandler(agentController.guardianTriage.bind(agentController))
);
agentRoutes.post(
  "/hunter/briefings/:applicationId",
  asyncHandler(agentController.hunterBriefing.bind(agentController))
);
