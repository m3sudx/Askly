"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Lang = "en" | "am";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const DEMO_KEY = process.env.NEXT_PUBLIC_DEMO_KEY ?? "";

const SNIPPET = `<script
  src="https://YOUR-DOMAIN/widget/askly.js"
  data-key="YOUR_PUBLIC_KEY"
  data-color="#0f766e"
  defer></script>`;

const en = {
  nav: { how: "How it works", install: "Install", features: "Features", login: "Log in", start: "Start free" },
  hero: {
    badge: "AI chat widget · English + Amharic",
    title: "Answers from your own documents, right on your website.",
    text: "Add one line of code. Askly answers your visitors in English or Amharic, cites its sources, and shows you what it could not answer.",
    primary: "Create your assistant",
    secondary: "See how it works",
    demoNote: "Try it now: the chat button in the corner is a real Askly assistant answering questions about Askly.",
  },
  how: {
    eyebrow: "How it works",
    title: "From a page of text to a cited answer in four steps",
    steps: [
      { title: "Add your content", body: "Paste text or link a web page. Askly splits it into small passages and skips content you already added." },
      { title: "Understand meaning", body: "Each passage becomes a vector of numbers, so a question can match text that shares no exact words with it." },
      { title: "Find the best passages", body: "The database ranks passages by cosine similarity and keeps only the ones close enough to the question." },
      { title: "Answer with sources", body: "The model writes a short answer using only those passages and cites them. If nothing fits, it says so." },
    ],
  },
  install: {
    eyebrow: "Install",
    title: "One line, any website",
    text: "Paste the tag before the closing body tag. The widget lives in an isolated shadow box, so your site styles cannot break it, and it cannot break your site.",
    options: [
      { code: "data-lang", text: "English or Amharic interface" },
      { code: "data-color", text: "your brand color" },
      { code: "data-position", text: "left or right corner" },
      { code: "data-title", text: "the name shown in the header" },
    ],
  },
  features: {
    eyebrow: "Features",
    title: "Built to be trusted, and to keep improving",
    items: [
      { title: "Cited answers", body: "Every answer points to the passage it came from, so visitors can check it and owners can trust it." },
      { title: "English and Amharic", body: "Visitors ask in either language and get a reply in the same one, with an Amharic-ready interface." },
      { title: "Knows what it does not know", body: "When your documents do not cover a question, it says so instead of guessing, and points the visitor to you." },
      { title: "Unanswered questions list", body: "See exactly what visitors asked that you have not covered yet, and fix the gap by adding content." },
      { title: "Feedback and analytics", body: "Thumbs ratings, response speed, usage and daily activity, all in a dashboard made for owners." },
      { title: "Safe by design", body: "Allowed-domain checks, rate limits, owner-only dashboards and a prompt that ignores instructions hidden in content." },
    ],
  },
  cta: {
    title: "Put your documents to work.",
    text: "Create an assistant, add a page, and try it in a few minutes.",
    button: "Create your assistant",
  },
  footer: { left: "Askly · Embeddable AI answers for any website" },
};

type Copy = typeof en;

const am: Copy = {
  nav: { how: "እንዴት ይሰራል", install: "መጫን", features: "ባህሪያት", login: "ግባ", start: "በነጻ ጀምር" },
  hero: {
    badge: "AI ውይይት · አማርኛ + እንግሊዝኛ",
    title: "ከራስዎ ሰነዶች የሚመነጩ መልሶች በድረ ገጽዎ ላይ",
    text: "አንድ መስመር ኮድ ብቻ ይጨምሩ። Askly ጎብኚዎችዎን በአማርኛ ወይም በእንግሊዝኛ ይመልሳል፣ ምንጮቹን ይጠቅሳል፣ ያልመለሰውንም ያሳዎታል።",
    primary: "ረዳትዎን ይፍጠሩ",
    secondary: "እንዴት እንደሚሰራ ይመልከቱ",
    demoNote: "አሁኑኑ ይሞክሩ፦ በማዕዘኑ ያለው የውይይት ቁልፍ ስለ Askly የሚመልስ እውነተኛ የ Askly ረዳት ነው።",
  },
  how: {
    eyebrow: "እንዴት ይሰራል",
    title: "ከጽሑፍ ወደ ምንጭ ያለው መልስ በአራት ደረጃዎች",
    steps: [
      { title: "ይዘትዎን ያክሉ", body: "ጽሑፍ ይለጥፉ ወይም የድር ገጽ ያያይዙ። Askly ወደ ትናንሽ ክፍሎች ይከፍለዋል፤ ቀድሞ የጨመሩትንም ይዘላል።" },
      { title: "ትርጉሙን ይረዳል", body: "እያንዳንዱ ክፍል ወደ ቁጥሮች ይቀየራል፤ ስለዚህ ጥያቄ ተመሳሳይ ቃላት ከሌሉት ጽሑፍ ጋርም ሊገናኝ ይችላል።" },
      { title: "ተስማሚ ክፍሎችን ያገኛል", body: "ዳታቤዙ ክፍሎቹን ከጥያቄው ጋር በሚኖራቸው ተመሳሳይነት ይደረድራል፤ በቂ የቀረቡትን ብቻ ይይዛል።" },
      { title: "ከምንጭ ጋር ይመልሳል", body: "ሞዴሉ እነዚያን ክፍሎች ብቻ ተጠቅሞ አጭር መልስ ይጽፋል፣ ምንጮቹንም ይጠቅሳል። የሚስማማ ከሌለ ያንኑ ይናገራል።" },
    ],
  },
  install: {
    eyebrow: "መጫን",
    title: "አንድ መስመር፣ ለማንኛውም ድረ ገጽ",
    text: "ኮዱን ከመዝጊያው body tag በፊት ይለጥፉት። መሣሪያው ራሱን በቻለ ሳጥን ውስጥ ስለሚሰራ የጣቢያዎ ስታይል አይሰብረውም፤ እሱም ጣቢያዎን አይሰብርም።",
    options: [
      { code: "data-lang", text: "የመስኮቱ ቋንቋ፡ አማርኛ ወይም እንግሊዝኛ" },
      { code: "data-color", text: "የድርጅትዎ ቀለም" },
      { code: "data-position", text: "ግራ ወይም ቀኝ ጥግ" },
      { code: "data-title", text: "በራስጌው ላይ የሚታየው ስም" },
    ],
  },
  features: {
    eyebrow: "ባህሪያት",
    title: "ለመታመን እና ለመሻሻል የተገነባ",
    items: [
      { title: "ምንጭ ያላቸው መልሶች", body: "እያንዳንዱ መልስ የመጣበትን ክፍል ይጠቁማል፤ ጎብኚዎች ማረጋገጥ ይችላሉ፣ ባለቤቶችም ሊተማመኑበት።" },
      { title: "አማርኛ እና እንግሊዝኛ", body: "ጎብኚዎች በየትኛውም ቋንቋ ይጠይቃሉ፣ በዚያው ቋንቋ ይመለስላቸዋል።" },
      { title: "የማያውቀውን ያውቃል", body: "ሰነዶችዎ ጥያቄውን ካልሸፈኑ ከመገመት ይልቅ ይህንኑ ይናገራል፣ ጎብኚውንም ወደ እርስዎ ይመራል።" },
      { title: "ያልተመለሱ ጥያቄዎች ዝርዝር", body: "ጎብኚዎች የጠየቁትን ግን ገና ያላካተቱትን በትክክል ይመልከቱ፤ ይዘት በመጨመር ክፍተቱን ይሙሉ።" },
      { title: "አስተያየት እና ትንተና", body: "የአውራ ጣት ደረጃ፣ የምላሽ ፍጥነት፣ አጠቃቀም እና የቀን እንቅስቃሴ፣ ሁሉም ለባለቤቶች በተሰራ ዳሽቦርድ ውስጥ።" },
      { title: "ደህንነቱ የተጠበቀ", body: "የተፈቀዱ ድረ ገጽዎች ፍተሻ፣ የጥያቄ ገደብ፣ ለባለቤት ብቻ የሆነ ዳሽቦርድ፣ እና በይዘት ውስጥ የተደበቁ ትዕዛዞችን የማይከተል መመሪያ።" },
    ],
  },
  cta: {
    title: "ሰነዶችዎን ወደ ሥራ ያስገቡ።",
    text: "ረዳት ይፍጠሩ፣ አንድ ገጽ ያክሉ፣ እና በደቂቃዎች ውስጥ ይሞክሩት።",
    button: "ረዳትዎን ይፍጠሩ",
  },
  footer: { left: "Askly · ለማንኛውም ድረ ገጽ የሚሆን ሊጫን የሚችል AI መልስ"},
};

const COPY: Record<Lang, Copy> = { en, am };

function FeatureIcon({ index }: { index: number }) {
  const stroke = index === 3 ? "#d97706" : "#0f766e";
  const props = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (index) {
    case 0:
      return (
        <svg {...props}>
          <path d="M4 6h16" />
          <path d="M4 12h10" />
          <path d="M4 18h7" />
        </svg>
      );
    case 1:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3c3 3 3 15 0 18" />
          <path d="M12 3c-3 3-3 15 0 18" />
        </svg>
      );
    case 2:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7" />
          <path d="M12 17h.01" />
        </svg>
      );
    case 3:
      return (
        <svg {...props}>
          <path d="M12 4l9 16H3z" />
          <path d="M12 10v4" />
          <path d="M12 17h.01" />
        </svg>
      );
    case 4:
      return (
        <svg {...props}>
          <path d="M3 20h18" />
          <path d="M6 16v-4" />
          <path d="M11 16V8" />
          <path d="M16 16v-6" />
          <path d="M20 16V5" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
        </svg>
      );
  }
}

export function Landing() {
  const [lang, setLang] = useState<Lang>("en");
  const t = COPY[lang];

  // Optional: load a real Askly widget on this page, if a demo key is configured
  useEffect(() => {
    if (!DEMO_KEY) return;
    const script = document.createElement("script");
    script.src = `${API_URL}/widget/askly.js`;
    script.dataset.key = DEMO_KEY;
    script.dataset.title = "Ask Askly";
    script.defer = true;
    document.body.append(script);
    return () => {
      script.remove();
      document.getElementById("askly-widget")?.remove(); // do not leave the widget on other pages
    };
  }, []);

  return (
    <div lang={lang} className="bg-[#faf8f5] leading-normal text-stone-900">
      {/* HERO */}
      <div className="bg-[#0b1f1e] text-[#f4f1ec]">
        <header className="mx-auto flex max-w-300 flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 text-[22px] font-semibold tracking-tight text-[#f4f1ec]">
            <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
              <rect width="32" height="32" rx="9" fill="#2dd4bf" />
              <path
                d="M9 10.5A2.5 2.5 0 0 1 11.5 8h9A2.5 2.5 0 0 1 23 10.5v6a2.5 2.5 0 0 1-2.5 2.5H15l-4 3.5V19h-.5A2.5 2.5 0 0 1 9 16.5z"
                fill="#0b1f1e"
              />
            </svg>
            Askly
          </Link>
          <nav aria-label="Main" className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <a href="#how" className="px-1 py-2.5 text-[15px] text-[#cfe3df] hover:text-white">{t.nav.how}</a>
            <a href="#install" className="px-1 py-2.5 text-[15px] text-[#cfe3df] hover:text-white">{t.nav.install}</a>
            <a href="#features" className="px-1 py-2.5 text-[15px] text-[#cfe3df] hover:text-white">{t.nav.features}</a>
            <div role="group" aria-label="Language" className="flex overflow-hidden rounded-[10px] border border-[#2c4a47]">
              <button
                type="button"
                aria-pressed={lang === "en"}
                onClick={() => setLang("en")}
                className={`px-3.5 py-2.5 text-sm ${lang === "en" ? "bg-[#2dd4bf] font-semibold text-[#0b1f1e]" : "text-[#cfe3df]"}`}
              >
                EN
              </button>
              <button
                type="button"
                aria-pressed={lang === "am"}
                onClick={() => setLang("am")}
                className={`px-3.5 py-2.5 text-sm ${lang === "am" ? "bg-[#2dd4bf] font-semibold text-[#0b1f1e]" : "text-[#cfe3df]"}`}
              >
                አማርኛ
              </button>
            </div>
            <Link href="/login" className="px-2 py-2.5 text-[15px] font-medium text-[#f4f1ec]">{t.nav.login}</Link>
            <Link href="/login" className="rounded-[10px] bg-[#2dd4bf] px-4.5 py-2.75 text-[15px] font-semibold text-[#0b1f1e]">
              {t.nav.start}
            </Link>
          </nav>
        </header>

        <div className="mx-auto flex max-w-300 flex-wrap items-center gap-12 px-6 pb-22 pt-14">
          <div className="min-w-0 flex-[1_1_460px]">
            <span className="inline-block rounded-full border border-[#2c4a47] px-3 py-1.5 text-[13px] tracking-wide text-[#2dd4bf]">
              {t.hero.badge}
            </span>
            <h1 className="font-display mt-5 text-[40px] font-medium leading-[1.12] tracking-tight sm:text-[56px]">
              {t.hero.title}
            </h1>
            <p className="mt-5 max-w-130 text-[19px] leading-relaxed text-[#b6cdc9]">{t.hero.text}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="rounded-[10px] bg-[#2dd4bf] px-6 py-3.5 font-semibold text-[#0b1f1e]">
                {t.hero.primary}
              </Link>
              <a href="#how" className="rounded-[10px] border border-[#3d5e5a] px-6 py-3.5 font-medium text-[#f4f1ec]">
                {t.hero.secondary}
              </a>
            </div>
            {DEMO_KEY && <p className="mt-5 max-w-130 text-sm text-[#8fb0aa]">{t.hero.demoNote}</p>}
          </div>

          <div className="flex min-w-0 flex-[1_1_380px] justify-center">
            <div
              role="img"
              aria-label="Example chat: a visitor asks if the clinic opens on Saturdays in English and in Amharic and gets cited answers"
              className="w-full max-w-100 overflow-hidden rounded-2xl bg-white text-stone-900 shadow-[0_24px_60px_rgba(0,0,0,0.4)]"
            >
              <div className="flex items-center justify-between bg-teal-700 px-4.5 py-3.5 font-semibold text-white">
                <span>Selam Clinic</span>
                <span aria-hidden="true" className="text-xl leading-none">×</span>
              </div>
              <div className="flex min-h-70 flex-col gap-2.5 bg-[#f6f7f8] p-4 text-sm">
                <div className="self-start rounded-xl rounded-bl bg-white px-3 py-2 border border-[#e3e5e8]">Hi! Ask me anything about us.</div>
                <div className="self-end rounded-xl rounded-br bg-teal-700 px-3 py-2 text-white">Do you open on Saturdays?</div>
                <div className="max-w-[88%] self-start rounded-xl rounded-bl border border-[#e3e5e8] bg-white px-3 py-2">
                  <div>
                    Yes, we are open on Saturdays from 8am to 1pm <sup className="font-semibold text-teal-700">1</sup>.
                  </div>
                  <div className="mt-2 border-t border-stone-100 pt-1.5 text-xs text-stone-600">Sources: [1] Clinic information</div>
                </div>
                <div lang="am" className="self-end rounded-xl rounded-br bg-teal-700 px-3 py-2 text-white">ቅዳሜ ክፍት ናችሁ?</div>
                <div lang="am" className="max-w-[88%] self-start rounded-xl rounded-bl border border-[#e3e5e8] bg-white px-3 py-2">
                  <div>
                    አዎ፣ ቅዳሜ ከ8:00 AM እስከ 1:00 PM ክፍት ነን <sup className="font-semibold text-teal-700">1</sup>።
                  </div>
                </div>
              </div>
              <div className="flex gap-2 border-t border-[#e3e5e8] bg-white p-2.5 text-sm">
                <div className="flex-1 rounded-lg border border-[#d5d8dc] px-2.5 py-2 text-stone-500">Type your question…</div>
                <div className="rounded-lg bg-teal-700 px-3.5 py-2 text-white">Send</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-300 px-6 pb-10 pt-22">
        <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-teal-700">{t.how.eyebrow}</p>
        <h2 className="font-display mt-2.5 max-w-160 text-[32px] font-medium leading-tight tracking-tight sm:text-[40px]">
          {t.how.title}
        </h2>
        <div className="mt-10 flex flex-wrap gap-5">
          {t.how.steps.map((s, i) => (
            <div key={s.title} className="flex-[1_1_240px] rounded-[14px] border border-stone-200 bg-white p-6">
              <div className="flex size-9 items-center justify-center rounded-full bg-teal-700 font-semibold text-white">{i + 1}</div>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-[15px] text-stone-600">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* INSTALL */}
      <section id="install" className="mx-auto flex max-w-300 flex-wrap items-center gap-12 px-6 pb-10 pt-18">
        <div className="min-w-0 flex-[1_1_400px]">
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-teal-700">{t.install.eyebrow}</p>
          <h2 className="font-display mt-2.5 text-[32px] font-medium leading-tight tracking-tight sm:text-[40px]">{t.install.title}</h2>
          <p className="mt-4 text-[17px] text-stone-600">{t.install.text}</p>
          <ul className="mt-6 flex flex-col gap-2.5 text-[15px]">
            {t.install.options.map((o) => (
              <li key={o.code}>
                <code className="rounded-md bg-teal-50 px-1.5 py-0.5 font-mono text-teal-900">{o.code}</code> {o.text}
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0 flex-[1_1_440px] rounded-[14px] bg-[#0b1f1e] p-6 shadow-[0_12px_32px_rgba(11,31,30,0.18)]">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="inline-block size-2.75 rounded-full bg-[#3d5e5a]" />
            <span className="inline-block size-2.75 rounded-full bg-[#3d5e5a]" />
            <span className="inline-block size-2.75 rounded-full bg-[#3d5e5a]" />
          </div>
          <pre className="mt-4.5 overflow-x-auto whitespace-pre-wrap wrap-break-word font-mono text-sm leading-[1.7] text-[#d6f5f0]">
            {SNIPPET}
          </pre>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-300 px-6 pb-10 pt-18">
        <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-teal-700">{t.features.eyebrow}</p>
        <h2 className="font-display mt-2.5 max-w-160 text-[32px] font-medium leading-tight tracking-tight sm:text-[40px]">
          {t.features.title}
        </h2>
        <div className="mt-10 flex flex-wrap gap-5">
          {t.features.items.map((f, i) => (
            <div key={f.title} className="flex-[1_1_320px] rounded-[14px] border border-stone-200 bg-white p-6">
              <FeatureIcon index={i} />
              <h3 className="mt-3.5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-[15px] text-stone-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-18 max-w-300 px-6">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[20px] bg-teal-700 px-10 py-14 text-white">
          <div className="min-w-0 flex-[1_1_360px]">
            <h2 className="font-display text-[30px] font-medium leading-tight tracking-tight sm:text-4xl">{t.cta.title}</h2>
            <p className="mt-3 text-[17px] text-teal-100">{t.cta.text}</p>
          </div>
          <Link href="/login" className="rounded-[10px] bg-white px-6.5 py-3.5 font-semibold text-[#0b1f1e]">
            {t.cta.button}
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-18 bg-[#0b1f1e] text-[#a9c4c0]">
        <div className="mx-auto flex max-w-300 flex-wrap justify-between gap-3 px-6 py-8 text-sm">
          <span>{t.footer.left}</span>
        </div>
      </footer>
    </div>
  );
}