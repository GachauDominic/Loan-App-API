import { Router } from "express";
import { asyncHandler } from "../../http/async-handler.js";
import { consentController } from "./consent.controller.js";

export const consentRoutes = Router();

consentRoutes.post("/", asyncHandler(consentController.create.bind(consentController)));
consentRoutes.post("/withdraw", asyncHandler(consentController.withdraw.bind(consentController)));
