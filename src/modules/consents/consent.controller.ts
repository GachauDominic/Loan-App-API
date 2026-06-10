import type { Request, Response } from "express";
import { consentService } from "./consent.service.js";
import { createConsentSchema, withdrawConsentSchema } from "./consent.validator.js";

export class ConsentController {
  async create(request: Request, response: Response) {
    const input = createConsentSchema.parse(request.body);
    const consent = await consentService.create(input);

    response.status(201).json({ data: consent });
  }

  async withdraw(request: Request, response: Response) {
    const input = withdrawConsentSchema.parse(request.body);
    const consent = await consentService.withdraw(input.memberId);

    response.json({ data: consent });
  }
}

export const consentController = new ConsentController();
