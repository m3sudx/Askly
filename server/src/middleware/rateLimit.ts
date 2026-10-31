import rateLimit from "express-rate-limit";
import { AppError } from "../util/error.js";
import type { Tenant } from "./widgetAuth.js";

const tooMany = (message: string) => (_req: unknown, _res: unknown, next: (err?: unknown) => void) =>
  next(new AppError(message, 429));

// Runs before widgetAuth: limits by IP address
export const chatIpLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20, // 20 requests per minute per IP
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: tooMany("Too many requests. Please slow down and try again shortly."),
});

// Runs after widgetAuth: limits by business, so one site can't run up your bill
export const chatTenantLimiter = rateLimit({
  windowMs: 60_000,
  limit: 300, // 300 requests per minute per business
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (_req, res) => (res.locals.tenant as Tenant).id,
  handler: tooMany("This assistant is receiving too many requests. Please try again shortly."),
});

export const feedbackIpLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: tooMany("Too many requests. Please slow down and try again shortly."),
});