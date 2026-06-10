import { Router } from "express";
import { agentRoutes } from "./modules/agents/agent.routes.js";
import { auditRoutes } from "./modules/audits/audit.routes.js";
import { consentRoutes } from "./modules/consents/consent.routes.js";
import { loanRoutes } from "./modules/loans/loan.routes.js";
import { memberRoutes } from "./modules/members/member.routes.js";

export const routes = Router();

routes.use("/members", memberRoutes);
routes.use("/consents", consentRoutes);
routes.use("/loans", loanRoutes);
routes.use("/audits", auditRoutes);
routes.use("/agents", agentRoutes);
