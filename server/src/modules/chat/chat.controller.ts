import type { RequestHandler } from "express";
import { AppError } from "../../util/error.js";
import type { Tenant } from "../../middleware/widgetAuth.js";
import { chatSchema } from "./chat.schema.js";
import { answerQuestion } from "./chat.service.js";

export const ask: RequestHandler = async (req, res, next) => {
  try {
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
        400
      );
    }

    const tenant = res.locals.tenant as Tenant;
    const data = await answerQuestion(tenant, parsed.data);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};