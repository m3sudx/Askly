"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { LANGUAGE_OPTIONS, POSITION_OPTIONS } from "@/lib/options";
import { Select } from "@/components/select";
import type { Tenant } from "@/lib/types";
import { useTenant } from "../tenant-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const DEFAULT_COLOR = "#0f766e";

// Makes text safe to place inside an HTML attribute value
function escapeAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default function SettingsPage() {
  const { tenant } = useTenant();

  if (!tenant) return <p className="text-stone-600">Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold text-stone-900">Settings and install</h1>
        <p className="mt-1 text-stone-500">Edit your business, then copy the code for your website.</p>
      </div>
      <DetailsForm tenant={tenant} />
      <InstallSection tenant={tenant} />
    </div>
  );
}

function DetailsForm({ tenant }: { tenant: Tenant }) {
  const { setTenant } = useTenant();

  const [name, setName] = useState(tenant.name);
  const [domains, setDomains] = useState(tenant.allowed_domains.join(", "));
  const [language, setLanguage] = useState<Tenant["default_language"]>(tenant.default_language);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);

    const allowedDomains = domains
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    try {
      const updated = await api<Tenant>(`/api/tenants/${tenant.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name, allowedDomains, defaultLanguage: language }),
      });
      setTenant(updated); // updates the sidebar too
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="rounded-xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-stone-900">Business details</h2>

      <label htmlFor="biz-name" className="mt-4 block text-sm font-medium text-stone-700">
        Business name
      </label>
      <input
        id="biz-name"
        required
        minLength={2}
        maxLength={80}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-teal-700"
      />

      <label htmlFor="biz-domains" className="mt-4 block text-sm font-medium text-stone-700">
        Allowed websites
      </label>
      <input
        id="biz-domains"
        value={domains}
        onChange={(e) => setDomains(e.target.value)}
        placeholder="example.com, shop.example.com"
        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-teal-700"
      />
      <p className="mt-1 text-sm text-stone-500">
        Only these websites can show your assistant. Separate with commas, no https://. Use localhost while testing.
      </p>

      <label htmlFor="biz-lang" className="mt-4 block text-sm font-medium text-stone-700">
        Default language
      </label>
      <div className="mt-1">
        <Select
          id="biz-lang"
          value={language}
          onChange={(v) => setLanguage(v as Tenant["default_language"])}
          options={LANGUAGE_OPTIONS}
        />
      </div>
      <p className="mt-1 text-sm text-stone-500">
        Sets the widget interface language below. Answers always follow the language the visitor writes in.
      </p>

      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      {saved && <p role="status" className="mt-4 text-sm text-teal-800">Saved.</p>}

      <button
        type="submit"
        disabled={saving}
        className="mt-5 rounded-lg bg-teal-700 px-5 py-2.5 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

function InstallSection({ tenant }: { tenant: Tenant }) {
  const [title, setTitle] = useState(tenant.name);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [position, setPosition] = useState<"right" | "left">("right");
  const [lang, setLang] = useState<"en" | "am">(tenant.default_language);
  const [copied, setCopied] = useState(false);

  const shownTitle = title.trim() || tenant.name;

  const snippet = [
    "<script",
    `  src="${API_URL}/widget/askly.js"`,
    `  data-key="${tenant.public_key}"`,
    `  data-title="${escapeAttr(shownTitle)}"`,
    `  data-color="${color}"`,
    `  data-position="${position}"`,
    `  data-lang="${lang}"`,
    "  defer></script>",
  ].join("\n");

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked: the user can still select the text by hand
    }
  }

  return (
    <section aria-label="Install" className="rounded-xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-stone-900">Install on your website</h2>
      <p className="mt-1 text-sm text-stone-500">
        Paste this code just before the closing body tag of your page.
      </p>

      {tenant.allowed_domains.length === 0 && (
        <p role="note" className="mt-4 rounded-lg bg-amber-100 px-3 py-2.5 text-sm text-amber-800">
          No allowed websites are set. The widget only works in development until you add your domain above.
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-6">
        <div className="min-w-0 flex-[1_1_260px]">
          <label htmlFor="w-title" className="block text-sm font-medium text-stone-700">
            Widget title
          </label>
          <input
            id="w-title"
            maxLength={60}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-teal-700"
          />

          <label htmlFor="w-color" className="mt-4 block text-sm font-medium text-stone-700">
            Color
          </label>
          <div className="mt-1 flex items-center gap-3">
            <input
              id="w-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-11 w-16 cursor-pointer rounded-lg border border-stone-300 bg-white p-1"
            />
            <code className="text-sm text-stone-600">{color}</code>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <div>
              <label htmlFor="w-pos" className="block text-sm font-medium text-stone-700">
                Position
              </label>
              <div className="mt-1">
                <Select
                  id="w-pos"
                  className="min-w-44"
                  value={position}
                  onChange={(v) => setPosition(v as "right" | "left")}
                  options={POSITION_OPTIONS}
                />
              </div>
            </div>
            <div>
              <label htmlFor="w-lang" className="block text-sm font-medium text-stone-700">
                Interface language
              </label>
              <div className="mt-1">
                <Select
                  id="w-lang"
                  className="min-w-44"
                  value={lang}
                  onChange={(v) => setLang(v as "en" | "am")}
                  options={LANGUAGE_OPTIONS}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="relative h-60 min-w-0 flex-[1_1_300px] overflow-hidden rounded-xl border border-stone-200 bg-stone-100"
        >
          <div
            className={`absolute bottom-4 flex flex-col gap-2 ${
              position === "right" ? "right-4 items-end" : "left-4 items-start"
            }`}
          >
            <div className="w-56 overflow-hidden rounded-xl bg-white shadow-lg">
              <div className="px-3 py-2.5 text-sm font-semibold text-white" style={{ background: color }}>
                {shownTitle}
              </div>
              <div className="p-3 text-sm text-stone-700">
                {lang === "am" ? "ሰላም! ስለ እኛ ማንኛውንም ነገር ይጠይቁ።" : "Hi! Ask me anything about us."}
              </div>
            </div>
            <div
              className="flex size-14 items-center justify-center rounded-full text-white shadow-lg"
              style={{ background: color }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6.5">
                <path
                  fill="currentColor"
                  d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-6 rounded-xl bg-[#0b1f1e] p-5">
        <button
          type="button"
          onClick={copy}
          className="absolute right-3 top-3 rounded-lg border border-teal-800 px-3 py-1.5 text-sm text-teal-100 hover:bg-teal-900"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <pre className="overflow-x-auto pr-20 font-mono text-sm leading-7 text-teal-100">{snippet}</pre>
      </div>

      <p className="mt-3 text-sm text-stone-500">
        The key in this code is public by design. It only lets the widget ask questions from your allowed websites.
      </p>
    </section>
  );
}