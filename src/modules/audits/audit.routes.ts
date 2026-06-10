import { Router } from "express";
import { asyncHandler } from "../../http/async-handler.js";
import { auditController } from "./audit.controller.js";

export const auditRoutes = Router();

auditRoutes.get("/", asyncHandler(auditController.list.bind(auditController)));
