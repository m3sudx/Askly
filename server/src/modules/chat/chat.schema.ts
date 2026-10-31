import { z } from "zod";

export const chatSchema = z.object({
  publicKey: z.string().min(1),
  message: z.string().trim().min(1).max(1000),
  visitorId: z.string().min(8).max(100),
  conversationId: z.string().uuid().optional(),
});

export type ChatInput = z.infer<typeof chatSchema>;