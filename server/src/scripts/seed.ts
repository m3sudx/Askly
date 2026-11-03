import { createClient } from "@supabase/supabase-js";
import { createHash, randomUUID } from "node:crypto";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY, SEED_OWNER_EMAIL } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GEMINI_API_KEY || !SEED_OWNER_EMAIL) {
  throw new Error("Need SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY and SEED_OWNER_EMAIL");
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

type Row = Record<string, unknown>;
type Lang = "en" | "am";

// Same numbers every run, so the demo always looks the same
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]!;
}
function between(min: number, max: number) {
  return Math.round(min + rand() * (max - min));
}

// ---------- Knowledge base (a fictional clinic) ----------

const DOCS: Record<string, { title: string; text: string }> = {
  hours: {
    title: "Opening hours",
    text: "Selam Clinic is open Monday to Friday from 8:00 AM to 6:00 PM, and on Saturdays from 8:00 AM to 1:00 PM. We are closed on Sundays and public holidays. For emergencies outside opening hours, please go to the nearest hospital emergency department.",
  },
  services: {
    title: "Services and prices",
    text: "We offer general consultations, child health checkups and vaccinations, laboratory tests, women's health checkups, and follow-up care for diabetes and blood pressure. Prices: general consultation 500 ETB, child checkup 400 ETB, blood test panel from 350 ETB, women's health checkup 800 ETB.",
  },
  location: {
    title: "Location and parking",
    text: "Selam Clinic is in Bole, Addis Ababa, a five-minute walk from Bole Medhanialem church. Free parking is available behind the building. The clinic is wheelchair accessible.",
  },
  appointments: {
    title: "Appointments",
    text: "Book an appointment by calling 0911 000 000 or by using the booking form on our website. Walk-ins are welcome, but patients with appointments are seen first. Please cancel or reschedule at least 24 hours before your appointment.",
  },
  insurance: {
    title: "Insurance and payment",
    text: "We accept most major health insurance providers. Please bring your insurance card and ID. We also accept cash and mobile payments (telebirr and CBE Birr). Laboratory test results are usually ready within 24 hours.",
  },
};

type QA = { doc: string; lang: Lang; q: string; a: string };

const QA_BANK: QA[] = [
  { doc: "hours", lang: "en", q: "What are your opening hours?", a: "We are open Monday to Friday from 8:00 AM to 6:00 PM, and on Saturdays from 8:00 AM to 1:00 PM [1]." },
  { doc: "hours", lang: "en", q: "Are you open on Sundays?", a: "No, we are closed on Sundays and public holidays. For emergencies, please go to the nearest hospital emergency department [1]." },
  { doc: "hours", lang: "en", q: "Do you open on Saturdays?", a: "Yes, we are open on Saturdays from 8:00 AM to 1:00 PM [1]." },
  { doc: "services", lang: "en", q: "What services do you offer?", a: "We offer general consultations, child checkups and vaccinations, laboratory tests, women's health checkups, and diabetes and blood pressure follow-up [1]." },
  { doc: "services", lang: "en", q: "How much is a general consultation?", a: "A general consultation costs 500 ETB [1]." },
  { doc: "services", lang: "en", q: "Do you do vaccinations for children?", a: "Yes, we offer child health checkups and vaccinations. A child checkup costs 400 ETB [1]." },
  { doc: "services", lang: "en", q: "How much is a blood test?", a: "A blood test panel starts from 350 ETB [1]." },
  { doc: "location", lang: "en", q: "Where are you located?", a: "We are in Bole, Addis Ababa, a five-minute walk from Bole Medhanialem church [1]." },
  { doc: "location", lang: "en", q: "Is there parking?", a: "Yes, free parking is available behind the building [1]." },
  { doc: "location", lang: "en", q: "Is the clinic wheelchair accessible?", a: "Yes, the clinic is wheelchair accessible [1]." },
  { doc: "appointments", lang: "en", q: "How do I book an appointment?", a: "You can call 0911 000 000 or use the booking form on our website [1]." },
  { doc: "appointments", lang: "en", q: "Can I walk in without an appointment?", a: "Yes, walk-ins are welcome, but patients with appointments are seen first [1]." },
  { doc: "appointments", lang: "en", q: "Can I cancel my appointment?", a: "Yes. Please cancel or reschedule at least 24 hours before your appointment [1]." },
  { doc: "insurance", lang: "en", q: "Do you accept insurance?", a: "Yes, we accept most major health insurance providers. Please bring your insurance card and ID [1]." },
  { doc: "insurance", lang: "en", q: "Can I pay with telebirr?", a: "Yes, we accept telebirr and CBE Birr, as well as cash [1]." },
  { doc: "insurance", lang: "en", q: "How long do lab results take?", a: "Laboratory test results are usually ready within 24 hours [1]." },
  { doc: "hours", lang: "am", q: "ቅዳሜ ክፍት ናችሁ?", a: "አዎ፣ ቅዳሜ ከጠዋቱ 8:00 እስከ ቀኑ 1:00 ክፍት ነን [1]።" },
  { doc: "appointments", lang: "am", q: "ቀጠሮ እንዴት መያዝ እችላለሁ?", a: "በስልክ 0911 000 000 ወይም በድር ጣቢያችን ላይ ባለው የቀጠሮ ቅጽ ቀጠሮ መያዝ ይችላሉ [1]።" },
  { doc: "services", lang: "am", q: "የአጠቃላይ ምርመራ ዋጋ ስንት ነው?", a: "አጠቃላይ የሐኪም ምርመራ 500 ብር ነው [1]።" },
  { doc: "insurance", lang: "am", q: "ኢንሹራንስ ትቀበላላችሁ?", a: "አዎ፣ አብዛኞቹን ዋና ዋና የጤና መድን ድርጅቶች እንቀበላለን [1]።" },
  { doc: "location", lang: "am", q: "የት ነው የምትገኙት?", a: "ቦሌ፣ አዲስ አበባ ውስጥ ከቦሌ መድኃኔዓለም ቤተ ክርስቲያን በአምስት ደቂቃ የእግር መንገድ ላይ እንገኛለን [1]።" },
];

// Questions the documents do not cover: these feed the "unanswered" list
const UNANSWERED: Record<Lang, string[]> = {
  en: [
    "Do you offer dental services?",
    "Can I get a COVID-19 vaccine?",
    "Do you have a pharmacy inside?",
    "Are there any doctors who speak Oromiffa?",
    "Do you offer home visits?",
  ],
  am: ["የጥርስ ህክምና ትሰጣላችሁ?", "ፋርማሲ አላችሁ?"],
};

const FALLBACK: Record<Lang, string> = {
  en: "I could not find that in the information I have. Please contact the clinic directly.",
  am: "ይህንን በያዝኩት መረጃ ውስጥ አላገኘሁትም። እባክዎ ክሊኒኩን በቀጥታ ያግኙ።",
};
const ERROR_TEXT = "Something went wrong on our side. Please try again.";

// ---------- Helpers ----------

async function embed(text: string): Promise<number[]> {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY! },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        taskType: "RETRIEVAL_DOCUMENT",
        outputDimensionality: 768,
      }),
    },
  );
  if (!res.ok) throw new Error(`Embedding failed (${res.status}): ${await res.text()}`);
  const data = (await res.json()) as { embedding: { values: number[] } };
  return data.embedding.values;
}

async function insertAll(table: string, rows: Row[], size = 500) {
  for (let i = 0; i < rows.length; i += size) {
    const { error } = await db.from(table).insert(rows.slice(i, i + size));
    if (error) throw new Error(`Insert into ${table} failed: ${error.message}`);
  }
}

const iso = (ms: number) => new Date(ms).toISOString();

// ---------- Seed ----------

async function main() {
  // 1. Find the owner account
  const { data: users, error: usersError } = await db.auth.admin.listUsers({ perPage: 200 });
  if (usersError) throw usersError;
  const owner = users.users.find((u) => u.email?.toLowerCase() === SEED_OWNER_EMAIL!.toLowerCase());
  if (!owner) throw new Error(`No account found with email ${SEED_OWNER_EMAIL}`);

  // 2. Remove an earlier demo tenant (cascade deletes everything under it)
  const NAME = "Selam Clinic (demo)";
  await db.from("tenants").delete().eq("owner_id", owner.id).eq("name", NAME);

  // 3. Tenant
  const { data: tenant, error: tenantError } = await db
    .from("tenants")
    .insert({ owner_id: owner.id, name: NAME, allowed_domains: ["localhost"], default_language: "en" })
    .select("id, public_key")
    .single();
  if (tenantError || !tenant) throw new Error(`Tenant insert failed: ${tenantError?.message}`);
  const tenantId = tenant.id as string;

  // 4. Documents + one embedded chunk each
  const chunkIdByDoc: Record<string, string> = {};
  const docRows: Row[] = [];
  const chunkRows: Row[] = [];
  for (const [key, doc] of Object.entries(DOCS)) {
    const docId = randomUUID();
    const chunkId = randomUUID();
    chunkIdByDoc[key] = chunkId;
    docRows.push({
      id: docId,
      tenant_id: tenantId,
      source_type: "text",
      title: doc.title,
      status: "ready",
      content_hash: createHash("sha256").update(doc.text).digest("hex"),
    });
    const values = await embed(doc.text);
    chunkRows.push({
      id: chunkId,
      document_id: docId,
      tenant_id: tenantId,
      chunk_index: 0,
      content: doc.text,
      language: "en",
      token_count: Math.ceil(doc.text.length / 4),
      embedding: JSON.stringify(values),
    });
    console.log(`Embedded: ${doc.title}`);
  }
  await insertAll("documents", docRows);
  await insertAll("chunks", chunkRows);

  // 5. Three weeks of conversations
  const DAYS = 21;
  const now = Date.now();
  const convRows: Row[] = [];
  const msgRows: Row[] = [];
  const sourceRows: Row[] = [];
  const feedbackRows: Row[] = [];

  for (let d = DAYS - 1; d >= 0; d--) {
    const day = new Date(now - d * 86_400_000);
    const weekday = day.getUTCDay();
    const weekend = weekday === 0 || weekday === 6;
    const growth = 4 + (DAYS - 1 - d) * 0.45; // usage grows over time
    const count = Math.max(1, Math.round(growth * (weekend ? 0.5 : 1) * (0.8 + rand() * 0.4)));

    for (let c = 0; c < count; c++) {
      const lang: Lang = rand() < 0.3 ? "am" : "en";
      let t = Math.min(
        Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), between(5, 19), between(0, 59), between(0, 59)),
        now - 120_000,
      );
      const convId = randomUUID();
      convRows.push({
        id: convId,
        tenant_id: tenantId,
        visitor_id: `demo-${randomUUID().slice(0, 8)}`,
        language: lang,
        started_at: iso(t),
      });

      const exchanges = between(1, 3);
      for (let e = 0; e < exchanges; e++) {
        const roll = rand();
        const failed = roll < 0.02;
        const unanswered = !failed && roll < 0.17;
        const qa = pick(QA_BANK.filter((x) => x.lang === lang));
        const question = unanswered ? pick(UNANSWERED[lang]) : qa.q;
        const answer = failed ? ERROR_TEXT : unanswered ? FALLBACK[lang] : qa.a;
        const latency = failed ? between(4000, 9000) : between(900, 3200);
        const promptTokens = between(600, 1400);
        const completionTokens = between(40, 140);

        t = Math.min(t, now - 1000);
        const userMsgId = randomUUID();
        const botMsgId = randomUUID();

        msgRows.push({
          id: userMsgId,
          conversation_id: convId,
          tenant_id: tenantId,
          role: "user",
          content: question,
          answered: null,
          failed: false,
          created_at: iso(t),
        });
        msgRows.push({
          id: botMsgId,
          conversation_id: convId,
          tenant_id: tenantId,
          role: "assistant",
          content: answer,
          answered: !failed && !unanswered,
          failed,
          model: "gemini-3.5-flash",
          prompt_tokens: failed ? null : promptTokens,
          completion_tokens: failed ? null : completionTokens,
          latency_ms: latency,
          cost_usd: failed ? null : Number((promptTokens * 0.0000003 + completionTokens * 0.0000025).toFixed(6)),
          created_at: iso(t + latency),
        });

        if (!failed && !unanswered) {
          sourceRows.push({
            message_id: botMsgId,
            chunk_id: chunkIdByDoc[qa.doc],
            rank: 1,
            score: Number((0.72 + rand() * 0.2).toFixed(3)),
          });
          if (rand() < 0.25) {
            feedbackRows.push({
              message_id: botMsgId,
              tenant_id: tenantId,
              rating: rand() < 0.85 ? 1 : -1,
              created_at: iso(t + latency + 20_000),
            });
          }
        }
        t += latency + between(20_000, 90_000);
      }
    }
  }

  await insertAll("conversations", convRows);
  await insertAll("messages", msgRows);
  await insertAll("message_sources", sourceRows);
  await insertAll("feedback", feedbackRows);

  const answered = msgRows.filter((m) => m.role === "assistant" && m.answered === true).length;
  const total = msgRows.filter((m) => m.role === "assistant").length;
  console.log("\nSeed finished.");
  console.log(`  Conversations: ${convRows.length}`);
  console.log(`  Questions:     ${total} (${answered} answered)`);
  console.log(`  Ratings:       ${feedbackRows.length}`);
  console.log(`  Public key:    ${tenant.public_key}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});