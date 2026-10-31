import type { RequestHandler } from "express";
import { AppError } from "../../util/error.js";
import type { Tenant } from "../../middleware/widgetAuth.js";
import { feedbackSchema } from "./feedback.schema.js";
import { saveFeedback } from "./feedback.service.js";

export const rate: RequestHandler = async (req, res, next) => {
  try {
    const parsed = feedbackSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
        400
      );
    }
    await saveFeedback(res.locals.tenant as Tenant, parsed.data);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};