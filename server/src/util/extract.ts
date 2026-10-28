import * as cheerio from "cheerio";
import { AppError } from "./error.js";

export async function extractTextFromUrl(url: string) {
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new AppError("Only http(s) URLs are allowed", 400);
  }

  const res = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: { "User-Agent": "AsklyBot/1.0" },
  });
  if (!res.ok) throw new AppError(`Could not fetch URL (${res.status})`, 400);

  const $ = cheerio.load(await res.text());
  $("script, style, noscript, nav, footer, header, svg, iframe").remove();

  const title = $("title").first().text().trim();
  const blocks = $("h1, h2, h3, h4, p, li, td")
    .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
    .get()
    .filter(Boolean);

  const text = blocks.length
    ? blocks.join("\n\n")
    : $("body").text().replace(/\s+/g, " ").trim();

  return { title, text };
}