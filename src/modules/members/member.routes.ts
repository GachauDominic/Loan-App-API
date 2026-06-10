import { Router } from "express";
import { asyncHandler } from "../../http/async-handler.js";
import { memberController } from "./member.controller.js";

export const memberRoutes = Router();

memberRoutes.post("/", asyncHandler(memberController.create.bind(memberController)));
memberRoutes.get("/:id", asyncHandler(memberController.getById.bind(memberController)));
