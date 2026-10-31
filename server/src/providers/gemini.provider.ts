import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export const CHAT_MODEL = env.GEMINI_CHAT_MODEL;

type Turn = { role: "user" | "model"; parts: { text: string }[] };

export async function generateAnswer(system: string, contents: Turn[]) {
  const res = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents,
    config: {
      systemInstruction: system,
      temperature: 0.2,
      maxOutputTokens: 1024,
    },
  });

  return {
    text: (res.text ?? "").trim(),
    promptTokens: res.usageMetadata?.promptTokenCount ?? null,
    completionTokens: res.usageMetadata?.candidatesTokenCount ?? null,
  };
}