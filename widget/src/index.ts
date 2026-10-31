type Lang = "en" | "am";

type Source = { index: number; title: string | null; url: string | null; snippet: string };
type ChatData = {
  conversationId: string;
  messageId: string;
  answer: string;
  answered: boolean;
  sources: Source[];
};

const STRINGS = {
  en: {
    title: "Ask us",
    welcome: "Hi! Ask me anything about us.",
    placeholder: "Type your question…",
    send: "Send",
    open: "Open chat",
    close: "Close chat",
    sources: "Sources",
    untitled: "Untitled",
    helpful: "Helpful",
    notHelpful: "Not helpful",
    error: "Sorry, something went wrong. Please try again.",
    busy: "Too many requests right now. Please try again in a moment.",
  },
  am: {
    title: "ጠይቁን",
    welcome: "ሰላም! ስለ እኛ ማንኛውንም ነገር ይጠይቁ።",
    placeholder: "ጥያቄዎን ይጻፉ…",
    send: "ላክ",
    open: "ውይይት ክፈት",
    close: "ዝጋ",
    sources: "ምንጮች",
    untitled: "ርዕስ የሌለው",
    helpful: "ጠቃሚ",
    notHelpful: "ጠቃሚ አይደለም",
    error: "ይቅርታ፣ ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።",
    busy: "አሁን ብዙ ጥያቄዎች አሉ። እባክዎ ትንሽ ቆይተው ይሞክሩ።",
  },
} as const;

const DEFAULT_COLOR = "#0f766e";
const REQUEST_TIMEOUT_MS = 30_000;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function getVisitorId(): string {
  const key = "askly_visitor_id";
  try {
    const saved = localStorage.getItem(key);
    if (saved && saved.length >= 8) return saved;
  } catch {
    /* storage blocked: fall through */
  }
  const id = newId();
  try {
    localStorage.setItem(key, id);
  } catch {
    /* ignore */
  }
  return id;
}

function resolveApiBase(script: HTMLScriptElement): string {
  const custom = script.dataset.api?.trim();
  if (custom) return custom.replace(/\/+$/, "");
  try {
    return new URL(script.src).origin;
  } catch {
    return "";
  }
}

function buildCss(color: string, side: "left" | "right"): string {
  return `
:host { all: initial; }
.root {
  --accent: ${color};
  position: fixed; bottom: 20px; ${side}: 20px; z-index: 2147483000;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans Ethiopic", sans-serif;
  font-size: 14px; color: #1a1a1a;
}
.launcher {
  width: 56px; height: 56px; border-radius: 50%; border: 0; cursor: pointer;
  background: var(--accent); color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,.25);
  display: flex; align-items: center; justify-content: center;
}
.launcher svg { width: 26px; height: 26px; }
.panel {
  position: absolute; bottom: 68px; ${side}: 0;
  width: min(380px, calc(100vw - 32px)); height: min(540px, calc(100vh - 110px));
  background: #fff; border-radius: 14px; box-shadow: 0 10px 40px rgba(0,0,0,.25);
  display: none; flex-direction: column; overflow: hidden;
}
.panel.open { display: flex; }
.header {
  background: var(--accent); color: #fff; padding: 14px 16px; font-weight: 600; font-size: 15px;
  display: flex; align-items: center; justify-content: space-between;
}
.close { background: none; border: 0; color: inherit; font-size: 22px; line-height: 1; cursor: pointer; padding: 0 4px; }
.messages {
  flex: 1; overflow-y: auto; padding: 14px; background: #f6f7f8;
  display: flex; flex-direction: column; gap: 10px;
}
.msg { max-width: 85%; padding: 9px 12px; border-radius: 12px; line-height: 1.45; overflow-wrap: anywhere; }
.text { white-space: pre-wrap; }
.user { align-self: flex-end; background: var(--accent); color: #fff; border-bottom-right-radius: 4px; }
.bot { align-self: flex-start; background: #fff; border: 1px solid #e3e5e8; border-bottom-left-radius: 4px; }
.bot sup { color: var(--accent); font-weight: 600; padding: 0 1px; }
.sources { margin-top: 8px; padding-top: 6px; border-top: 1px solid #eee; font-size: 12px; color: #555; }
.sources a { color: var(--accent); }
.rate { margin-top: 6px; display: flex; gap: 6px; }
.rate button { border: 1px solid #d5d8dc; background: #fff; border-radius: 8px; padding: 2px 8px; cursor: pointer; font-size: 13px; }
.rate button[disabled] { cursor: default; opacity: .45; }
.rate button.picked { opacity: 1; border-color: var(--accent); }
.typing { align-self: flex-start; color: #777; padding: 4px 8px; }
.form { display: flex; gap: 8px; padding: 10px; border-top: 1px solid #e3e5e8; background: #fff; }
.input { flex: 1; min-width: 0; border: 1px solid #d5d8dc; border-radius: 8px; padding: 9px 10px; font: inherit; }
.send { border: 0; border-radius: 8px; background: var(--accent); color: #fff; padding: 0 14px; font: inherit; cursor: pointer; }
.send[disabled], .input[disabled] { opacity: .6; cursor: default; }
`;
}

function main(): void {
  const script =
    document.currentScript instanceof HTMLScriptElement
      ? document.currentScript
      : document.querySelector<HTMLScriptElement>("script[data-key]");
  const publicKey = script?.dataset.key?.trim();

  if (!script || !publicKey) {
    console.error("[Askly] Missing data-key on the script tag.");
    return;
  }
  const apiBase = resolveApiBase(script);
  if (!apiBase) {
    console.error("[Askly] Could not work out the API address. Add data-api to the script tag.");
    return;
  }

  const lang: Lang = script.dataset.lang === "am" ? "am" : "en";
  const t = STRINGS[lang];
  const rawColor = script.dataset.color ?? "";
  const color = /^#[0-9a-fA-F]{3,8}$/.test(rawColor) ? rawColor : DEFAULT_COLOR; // validated: goes into CSS
  const side: "left" | "right" = script.dataset.position === "left" ? "left" : "right";
  const title = script.dataset.title?.trim().slice(0, 60) || t.title;

  const visitorId = getVisitorId();
  let conversationId: string | undefined;
  let isOpen = false;
  let busy = false;

  async function post<T>(path: string, body: unknown): Promise<{ ok: boolean; status: number; data?: T }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(`${apiBase}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      let json: { data?: T } | null = null;
      try {
        json = (await res.json()) as { data?: T };
      } catch {
        /* non-JSON reply */
      }
      return { ok: res.ok, status: res.status, data: json?.data };
    } finally {
      clearTimeout(timer);
    }
  }

  // ----- build the UI inside a shadow root -----
  const host = document.createElement("div");
  host.id = "askly-widget";
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = buildCss(color, side);

  const root = el("div", "root");
  const panel = el("div", "panel");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", title);

  const header = el("div", "header");
  header.append(el("span", undefined, title));
  const closeBtn = el("button", "close", "×");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", t.close);
  header.append(closeBtn);

  const messages = el("div", "messages");
  messages.setAttribute("role", "log");
  messages.setAttribute("aria-live", "polite");

  const form = el("form", "form");
  const input = el("input", "input");
  input.type = "text";
  input.maxLength = 1000;
  input.autocomplete = "off";
  input.placeholder = t.placeholder;
  input.setAttribute("aria-label", t.placeholder);
  const sendBtn = el("button", "send", t.send);
  sendBtn.type = "submit";
  form.append(input, sendBtn);

  panel.append(header, messages, form);

  const launcher = el("button", "launcher");
  launcher.type = "button";
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-label", t.open);
  launcher.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>';

  root.append(panel, launcher);
  shadow.append(style, root);

  // ----- helpers that draw messages -----
  const scrollDown = () => {
    messages.scrollTop = messages.scrollHeight;
  };

  function renderAnswer(container: HTMLElement, text: string): void {
    for (const part of text.split(/(\[\d+\])/)) {
      const match = /^\[(\d+)\]$/.exec(part);
      if (match) container.append(el("sup", undefined, match[1]));
      else if (part) container.append(document.createTextNode(part));
    }
  }

  function addUser(text: string): void {
    messages.append(el("div", "msg user", text));
    scrollDown();
  }

  function addRateButtons(messageId: string): HTMLElement {
    const row = el("div", "rate");
    const up = el("button", undefined, "👍");
    const down = el("button", undefined, "👎");
    up.type = down.type = "button";
    up.title = t.helpful;
    up.setAttribute("aria-label", t.helpful);
    down.title = t.notHelpful;
    down.setAttribute("aria-label", t.notHelpful);

    const rate = (rating: 1 | -1, chosen: HTMLButtonElement) => {
      up.disabled = down.disabled = true;
      chosen.classList.add("picked");
      post("/api/feedback", { publicKey, visitorId, messageId, rating }).catch(() => undefined);
    };
    up.addEventListener("click", () => rate(1, up));
    down.addEventListener("click", () => rate(-1, down));

    row.append(up, down);
    return row;
  }

  function addBot(text: string, data?: ChatData): void {
    const bubble = el("div", "msg bot");
    const body = el("div", "text");
    renderAnswer(body, text);
    bubble.append(body);

    if (data && data.answered && data.sources.length > 0) {
      const box = el("div", "sources");
      box.append(document.createTextNode(`${t.sources}: `));
      data.sources.forEach((s, i) => {
        if (i > 0) box.append(document.createTextNode(" · "));
        const label = `[${s.index}] ${s.title ?? t.untitled}`;
        if (s.url && isHttpUrl(s.url)) {
          const a = el("a", undefined, label);
          a.href = s.url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          box.append(a);
        } else {
          box.append(document.createTextNode(label));
        }
      });
      bubble.append(box);
    }

    if (data?.messageId) bubble.append(addRateButtons(data.messageId));

    messages.append(bubble);
    scrollDown();
  }

  function setBusy(value: boolean): void {
    busy = value;
    sendBtn.disabled = value;
    input.disabled = value;
  }

  async function send(): Promise<void> {
    const text = input.value.trim();
    if (!text || busy) return;

    input.value = "";
    addUser(text);
    setBusy(true);

    const typing = el("div", "typing", "…");
    messages.append(typing);
    scrollDown();

    try {
      const res = await post<ChatData>("/api/chat", { publicKey, visitorId, message: text, conversationId });
      if (res.ok && res.data) {
        conversationId = res.data.conversationId;
        addBot(res.data.answer, res.data);
      } else {
        addBot(res.status === 429 ? t.busy : t.error);
      }
    } catch {
      addBot(t.error);
    } finally {
      typing.remove();
      setBusy(false);
      input.focus();
    }
  }

  function toggle(force?: boolean): void {
    isOpen = force ?? !isOpen;
    panel.classList.toggle("open", isOpen);
    launcher.setAttribute("aria-expanded", String(isOpen));
    launcher.setAttribute("aria-label", isOpen ? t.close : t.open);
    if (isOpen) input.focus();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    void send();
  });
  launcher.addEventListener("click", () => toggle());
  closeBtn.addEventListener("click", () => {
    toggle(false);
    launcher.focus();
  });
  panel.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      toggle(false);
      launcher.focus();
    }
  });

  addBot(t.welcome);

  const mount = () => {
    if (document.getElementById("askly-widget")) return; // already loaded
    document.body.append(host);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
}

main();