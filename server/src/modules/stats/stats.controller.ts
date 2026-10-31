import type { RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "../../util/error.js";
import { getStats } from "./stats.service.js";

const querySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});

export const overview: RequestHandler = async (req, res, next) => {
  try {
    const q = querySchema.safeParse(req.query);
    if (!q.success) throw new AppError("days must be a number from 1 to 365", 400);

    const tenantId = res.locals.tenantId as string; // set by requireTenantOwner
    res.json({ success: true, data: await getStats(tenantId, q.data.days) });
  } catch (err) {
    next(err);
  }
};