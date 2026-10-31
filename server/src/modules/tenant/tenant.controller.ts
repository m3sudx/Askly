import type { RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "../../util/error.js";
import type { AuthUser } from "../../middleware/ownerAuth.js";
import { createTenantSchema, updateTenantSchema } from "./tenant.schema.js";
import { createTenant, listTenants, updateTenant } from "./tenant.service.js";

const fail = (issues: z.ZodIssue[]) =>
  new AppError(issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "), 400);

export const list: RequestHandler = async (_req, res, next) => {
  try {
    const user = res.locals.user as AuthUser;
    res.json({ success: true, data: await listTenants(user.id) });
  } catch (err) {
    next(err);
  }
};

export const create: RequestHandler = async (req, res, next) => {
  try {
    const parsed = createTenantSchema.safeParse(req.body);
    if (!parsed.success) throw fail(parsed.error.issues);
    const user = res.locals.user as AuthUser;
    res.status(201).json({ success: true, data: await createTenant(user.id, parsed.data) });
  } catch (err) {
    next(err);
  }
};

export const update: RequestHandler = async (req, res, next) => {
  try {
    const id = z.string().uuid().safeParse(req.params.id);
    if (!id.success) throw new AppError("Invalid business id", 400);
    const parsed = updateTenantSchema.safeParse(req.body);
    if (!parsed.success) throw fail(parsed.error.issues);
    const user = res.locals.user as AuthUser;
    res.json({ success: true, data: await updateTenant(user.id, id.data, parsed.data) });
  } catch (err) {
    next(err);
  }
};