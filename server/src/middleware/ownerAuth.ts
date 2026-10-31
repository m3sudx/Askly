import type { RequestHandler } from "express";
import { z } from "zod";
import { supabase } from "../config/supabase.js";
import { AppError } from "../util/error.js";

export type AuthUser = { id: string; email: string | null };

const uuid = z.string().uuid();

// Checks the Supabase login token sent as "Authorization: Bearer <token>"
export const requireUser: RequestHandler = async (req, res, next) => {
  try {
    const header = req.get("authorization") ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (!token) throw new AppError("Login required", 401);

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) throw new AppError("Invalid or expired login", 401);

    const user: AuthUser = { id: data.user.id, email: data.user.email ?? null };
    res.locals.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// Checks that the tenantId in the request belongs to the logged-in user
export const requireTenantOwner: RequestHandler = async (req, res, next) => {
  try {
    const user = res.locals.user as AuthUser | undefined;
    if (!user) throw new AppError("Login required", 401);

    const parsed = uuid.safeParse(req.query.tenantId ?? req.body?.tenantId);
    if (!parsed.success) throw new AppError("tenantId (uuid) is required", 400);

    const { data, error } = await supabase
      .from("tenants")
      .select("id")
      .eq("id", parsed.data)
      .eq("owner_id", user.id)
      .maybeSingle();
    if (error) throw new AppError(error.message, 500);
    if (!data) throw new AppError("You do not have access to this business", 403);

    res.locals.tenantId = data.id;
    next();
  } catch (err) {
    next(err);
  }
};