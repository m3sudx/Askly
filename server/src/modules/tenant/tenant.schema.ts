import { z } from "zod";

const domain = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^(localhost|[a-z0-9-]+(\.[a-z0-9-]+)+)$/,
    "Use a hostname like example.com (no https:// or paths)"
  );
export const createTenantSchema = z.object({
  name: z.string().trim().min(2).max(80),
  allowedDomains: z.array(domain).max(10).default([]),
  defaultLanguage: z.enum(["en", "am"]).default("en"),
});

export const updateTenantSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  allowedDomains: z.array(domain).max(10).optional(),
  defaultLanguage: z.enum(["en", "am"]).optional(),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;