import { supabase } from "../../config/supabase.js";
import { AppError } from "../../util/error.js";
import type { CreateTenantInput, UpdateTenantInput } from "./tenant.schema.js";

const MAX_TENANTS_PER_USER = 5;
const COLUMNS = "id, name, public_key, allowed_domains, default_language, created_at";

export async function listTenants(userId: string) {
  const { data, error } = await supabase
    .from("tenants")
    .select(COLUMNS)
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new AppError(error.message, 500);
  return data;
}

export async function createTenant(userId: string, input: CreateTenantInput) {
  const { count, error: countError } = await supabase
    .from("tenants")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", userId);
  if (countError) throw new AppError(countError.message, 500);
  if ((count ?? 0) >= MAX_TENANTS_PER_USER) {
    throw new AppError(`You can create up to ${MAX_TENANTS_PER_USER} businesses`, 403);
  }

  const { data, error } = await supabase
    .from("tenants")
    .insert({
      owner_id: userId,
      name: input.name,
      allowed_domains: input.allowedDomains,
      default_language: input.defaultLanguage,
    })
    .select(COLUMNS)
    .single();
  if (error) throw new AppError(error.message, 500);
  return data;
}

export async function updateTenant(userId: string, id: string, input: UpdateTenantInput) {
  const changes: Record<string, unknown> = {};
  if (input.name !== undefined) changes.name = input.name;
  if (input.allowedDomains !== undefined) changes.allowed_domains = input.allowedDomains;
  if (input.defaultLanguage !== undefined) changes.default_language = input.defaultLanguage;
  if (Object.keys(changes).length === 0) throw new AppError("Nothing to update", 400);

  const { data, error } = await supabase
    .from("tenants")
    .update(changes)
    .eq("id", id)
    .eq("owner_id", userId)
    .select(COLUMNS)
    .maybeSingle();
  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError("Business not found", 404);
  return data;
}