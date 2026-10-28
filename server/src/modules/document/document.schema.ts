import { z } from "zod";

export const createDocumentSchema = z.discriminatedUnion("sourceType", [
  z.object({
    tenantId: z.string().uuid(),
    sourceType: z.literal("url"),
    url: z.string().url(),
    title: z.string().optional(),
  }),
  z.object({
    tenantId: z.string().uuid(),
    sourceType: z.literal("text"),
    content: z.string().min(1),
    title: z.string().optional(),
  }),
]);

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;