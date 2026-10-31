import { z } from "zod";

export const feedbackSchema = z.object({
  publicKey: z.string().min(1),
  visitorId: z.string().min(8).max(100),
  messageId: z.string().uuid(),
  rating: z.union([z.literal(1), z.literal(-1)]),
  comment: z.string().trim().max(500).optional(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;