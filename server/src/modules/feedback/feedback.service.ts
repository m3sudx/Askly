import { supabase } from "../../config/supabase.js";
import { AppError } from "../../util/error.js";
import type { Tenant } from "../../middleware/widgetAuth.js";
import type { FeedbackInput } from "./feedback.schema.js";

export async function saveFeedback(tenant: Tenant, input: FeedbackInput) {
  // The message must belong to this business and be one of the bot's answers
  const { data: message, error } = await supabase
    .from("messages")
    .select("id, conversation_id, role")
    .eq("id", input.messageId)
    .eq("tenant_id", tenant.id)
    .maybeSingle();
  if (error) throw new AppError(error.message, 500);
  if (!message || message.role !== "assistant") throw new AppError("Message not found", 404);

  // ...and the visitor must be the one who had that conversation
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", message.conversation_id)
    .eq("visitor_id", input.visitorId)
    .maybeSingle();
  if (convError) throw new AppError(convError.message, 500);
  if (!conversation) throw new AppError("Message not found", 404);

  // One rating per message: rating again replaces the old one
  const { error: saveError } = await supabase.from("feedback").upsert(
    {
      message_id: input.messageId,
      tenant_id: tenant.id,
      rating: input.rating,
      comment: input.comment ?? null,
    },
    { onConflict: "message_id" }
  );
  if (saveError) throw new AppError(saveError.message, 500);
}