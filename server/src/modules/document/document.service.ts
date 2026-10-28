import { createHash } from "node:crypto";
import { supabase } from "../../config/supabase.js";
import { embedDocuments } from "../../providers/embedding.provider.js";
import { chunkText } from "../../util/chunker.js";
import { extractTextFromUrl } from "../../util/extract.js";
import { AppError } from "../../util/error.js";
import type { CreateDocumentInput } from "./document.schema.js";

export async function createDocument(input: CreateDocumentInput) {
  const { tenantId } = input;
  let title: string | null = input.title ?? null;
  let text: string;

  if (input.sourceType === "url") {
    const page = await extractTextFromUrl(input.url);
    text = page.text;
    title ??= page.title || null;
  } else {
    text = input.content;
  }

  if (text.length < 50) throw new AppError("Not enough text content found", 400);

  const hash = createHash("sha256").update(text).digest("hex");

  const { data: existing } = await supabase
    .from("documents")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("content_hash", hash)
    .maybeSingle();
  if (existing) throw new AppError("This content was already added", 409);

  const { data: doc, error } = await supabase
    .from("documents")
    .insert({
      tenant_id: tenantId,
      source_type: input.sourceType,
      source_url: input.sourceType === "url" ? input.url : null,
      title,
      status: "processing",
      content_hash: hash,
    })
    .select()
    .single();
  if (error) throw new AppError(error.message, 500);

  try {
    const pieces = chunkText(text);
    const embeddings = await embedDocuments(pieces);
    if (embeddings.length !== pieces.length) {
      throw new Error("Embedding count mismatch");
    }

    const rows = pieces.map((content, i) => ({
      document_id: doc.id,
      tenant_id: tenantId,
      chunk_index: i,
      content,
      token_count: Math.ceil(content.length / 4), // rough estimate
      embedding: embeddings[i],
    }));

    const { error: chunkError } = await supabase.from("chunks").insert(rows);
    if (chunkError) throw new Error(chunkError.message);

    await supabase.from("documents").update({ status: "ready" }).eq("id", doc.id);
    return { ...doc, status: "ready", chunkCount: pieces.length };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Processing failed";
    await supabase
      .from("documents")
      .update({ status: "failed", error: message })
      .eq("id", doc.id);
    throw new AppError(`Document processing failed: ${message}`, 500);
  }
}

export async function listDocuments(tenantId: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("id, source_type, source_url, title, status, error, created_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });
  if (error) throw new AppError(error.message, 500);
  return data;
}

export async function deleteDocument(tenantId: string, id: string) {
  // chunks are removed automatically (on delete cascade)
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenantId);
  if (error) throw new AppError(error.message, 500);
}