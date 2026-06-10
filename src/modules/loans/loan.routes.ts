import { Router } from "express";
import { asyncHandler } from "../../http/async-handler.js";
import { loanController } from "./loan.controller.js";

export const loanRoutes = Router();

loanRoutes.post("/applications", asyncHandler(loanController.createApplication.bind(loanController)));
loanRoutes.get("/applications/:id", asyncHandler(loanController.getApplication.bind(loanController)));
loanRoutes.post("/applications/:id/triage", asyncHandler(loanController.triageApplication.bind(loanController)));
loanRoutes.post("/applications/:id/decision", asyncHandler(loanController.recordDecision.bind(loanController)));
