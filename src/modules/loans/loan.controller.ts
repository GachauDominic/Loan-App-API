import type { Request, Response } from "express";
import { loanService } from "./loan.service.js";
import {
  createLoanApplicationSchema,
  recordLoanDecisionSchema,
  triageLoanApplicationSchema
} from "./loan.validator.js";

export class LoanController {
  async createApplication(request: Request, response: Response) {
    const input = createLoanApplicationSchema.parse(request.body);
    const application = await loanService.createApplication(input);

    response.status(201).json({ data: application });
  }

  async getApplication(request: Request, response: Response) {
    const application = await loanService.getApplication(String(request.params.id));

    response.json({ data: application });
  }

  async triageApplication(request: Request, response: Response) {
    const input = triageLoanApplicationSchema.parse(request.body);
    const result = await loanService.triageApplication(String(request.params.id), input);

    response.json({ data: result });
  }

  async recordDecision(request: Request, response: Response) {
    const input = recordLoanDecisionSchema.parse(request.body);
    const decision = await loanService.recordDecision(String(request.params.id), input);

    response.status(201).json({ data: decision });
  }
}

export const loanController = new LoanController();
