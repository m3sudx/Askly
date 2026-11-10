import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export const CHAT_MODEL = env.GEMINI_CHAT_MODEL;

// Optional second model used when the main one is overloaded.

const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL?.trim() || "";

type Turn = { role: "user" | "model"; parts: { text: string }[] };

// 429 = rate limit, 5xx = Google is overloaded or having a problem.
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const ATTEMPTS_PER_MODEL = 2;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isRetryable(err: unknown): boolean {
  const status = (err as { status?: number } | null)?.status;
  return typeof status === "number" && RETRYABLE_STATUS.has(status);
}

async function callModel(model: string, system: string, contents: Turn[]) {
  const res = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: system,
      temperature: 0.2,
      maxOutputTokens: 4096,
    },
  });

  if (res.candidates?.[0]?.finishReason === "MAX_TOKENS") {
    console.warn("[gemini] answer was cut off (MAX_TOKENS)");
  }

  return {
    text: (res.text ?? "").trim(),
    promptTokens: res.usageMetadata?.promptTokenCount ?? null,
    completionTokens: res.usageMetadata?.candidatesTokenCount ?? null,
    model,
  };
}

export async function generateAnswer(system: string, contents: Turn[]) {
  const models = [CHAT_MODEL];
  if (FALLBACK_MODEL && FALLBACK_MODEL !== CHAT_MODEL) models.push(FALLBACK_MODEL);

  let lastError: unknown;

  for (const model of models) {
    for (let attempt = 1; attempt <= ATTEMPTS_PER_MODEL; attempt++) {
      try {
        return await callModel(model, system, contents);
      } catch (err) {
        lastError = err;

        // Bad request, bad key, etc.: retrying will not help.
        if (!isRetryable(err)) throw err;

        const status = (err as { status?: number }).status;
        console.warn(
          `[gemini] ${model} failed (status ${status}), attempt ${attempt}/${ATTEMPTS_PER_MODEL}`,
        );

        if (attempt < ATTEMPTS_PER_MODEL) {
          // Wait about 1s, with a little randomness, before trying again.
          await sleep(1000 * attempt + Math.random() * 300);
        }
      }
    }
  }

  throw lastError;
}