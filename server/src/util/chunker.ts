export function chunkText(text: string, maxChars = 1200, overlap = 150): string[] {
  const clean = text.replace(/\r/g, "").replace(/[ \t]+/g, " ").trim();
  const sentences = clean
    .split(/\n{2,}|(?<=[.!?።])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  for (const s of sentences) {
    if (current && current.length + s.length + 1 > maxChars) {
      chunks.push(current);
      let tail = current.slice(-overlap);
      tail = tail.slice(tail.indexOf(" ") + 1); // start at a word boundary
      current = `${tail} ${s}`;
    } else {
      current = current ? `${current} ${s}` : s;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}