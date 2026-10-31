import { supabase } from "../../config/supabase.js";
import { AppError } from "../../util/error.js";

export async function getOrCreateConversation(
  tenantId: string,
  visitorId: string,
  conversationId?: string
): Promise<string> {
  if (conversationId) {
    const { data } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("tenant_id", tenantId)
      .eq("visitor_id", visitorId)
      .maybeSingle();
    if (data) return data.id as string;
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({ tenant_id: tenantId, visitor_id: visitorId })
    .select("id")
    .single();
  if (error) throw new AppError(error.message, 500);
  return data.id as string;
}

export async function getRecentMessages(conversationId: string, limit = 6) {
  const { data, error } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new AppError(error.message, 500);
  return (data ?? []).reverse() as { role: "user" | "assistant"; content: string }[];
}

type NewMessage = {
  conversationId: string;
  tenantId: string;
  role: "user" | "assistant";
  content: string;
  answered?: boolean;
  model?: string;
  promptTokens?: number | null;
  completionTokens?: number | null;
  latencyMs?: number | null;
  failed?: boolean;
};

export async function saveMessage(m: NewMessage): Promise<string> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: m.conversationId,
      tenant_id: m.tenantId,
      role: m.role,
      content: m.content,
      answered: m.answered ?? null,
      model: m.model ?? null,
      prompt_tokens: m.promptTokens ?? null,
      completion_tokens: m.completionTokens ?? null,
      latency_ms: m.latencyMs ?? null,
    })
    .select("id")
    .single();
  if (error) throw new AppError(error.message, 500);
  return data.id as string;
}