import type { RequestHandler } from "express";
import { supabase } from "../config/supabase.js";
import { env } from "../config/env.js";
import { AppError } from "../util/error.js";

export type Tenant = {
  id: string;
  name: string;
  allowed_domains: string[];
  default_language: string;
};

function originAllowed(origin: string | undefined, allowed: string[]) {
  // No domains configured: only allow this in development
  if (allowed.length === 0) return env.NODE_ENV !== "production";
  if (!origin) return false;
  try {
    const host = new URL(origin).hostname;
    return allowed.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

const widgetAuth: RequestHandler = async (req, res, next) => {
  try {
    const key = req.body?.publicKey;
    if (typeof key !== "string" || !key) {
      throw new AppError("publicKey is required", 401);
    }

    const { data, error } = await supabase
      .from("tenants")
      .select("id, name, allowed_domains, default_language")
      .eq("public_key", key)
      .maybeSingle();
    if (error) throw new AppError(error.message, 500);
    if (!data) throw new AppError("Invalid publicKey", 401);

    if (!originAllowed(req.get("origin"), data.allowed_domains)) {
      throw new AppError("This domain is not allowed", 403);
    }

    res.locals.tenant = data;
    next();
  } catch (err) {
    next(err);
  }
};

export default widgetAuth;