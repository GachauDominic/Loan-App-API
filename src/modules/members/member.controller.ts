import type { Request, Response } from "express";
import { createMemberSchema } from "./member.validator.js";
import { memberService } from "./member.service.js";

export class MemberController {
  async create(request: Request, response: Response) {
    const input = createMemberSchema.parse(request.body);
    const member = await memberService.create(input);

    response.status(201).json({ data: member });
  }

  async getById(request: Request, response: Response) {
    const member = await memberService.getById(String(request.params.id));

    response.json({ data: member });
  }
}

export const memberController = new MemberController();
