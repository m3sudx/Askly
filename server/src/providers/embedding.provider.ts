import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
const MODEL = "gemini-embedding-001";
const DIMENSIONS = 768;
const BATCH_SIZE = 50;

type TaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

async function embed(texts: string[], taskType: TaskType): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const res = await ai.models.embedContent({
      model: MODEL,
      contents: batch,
      config: { taskType, outputDimensionality: DIMENSIONS },
    });
    for (const e of res.embeddings ?? []) out.push(e.values ?? []);
  }
  return out;
}

export const embedDocuments = (texts: string[]) =>
  embed(texts, "RETRIEVAL_DOCUMENT");

export const embedQuery = async (query: string) =>
  (await embed([query], "RETRIEVAL_QUERY"))[0];