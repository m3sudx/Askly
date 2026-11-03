"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { AppHeader } from "@/components/app-header";
import { Select } from "@/components/select";
import { Spinner } from "@/components/spinner";
import { LANGUAGE_OPTIONS } from "@/lib/options";
import type { Tenant } from "@/lib/types";

export default function NewBusinessPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [domains, setDomains] = useState("");
  const [language, setLanguage] = useState<"en" | "am">("en");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const allowedDomains = domains
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    try {
      await api<Tenant>("/api/tenants", {
        method: "POST",
        body: JSON.stringify({ name, allowedDomains, defaultLanguage: language }),
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <AppHeader />

      <main className="mx-auto max-w-xl px-6 py-10">
        <Link href="/dashboard" className="text-sm text-teal-700 hover:underline">
          ← Back to businesses
        </Link>
        <h1 className="font-display mt-4 text-4xl font-medium tracking-tight text-stone-900">New business</h1>
        <p className="mt-2 text-stone-600">
          Each business gets its own assistant, documents and install snippet.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-stone-200 bg-white p-8">
          <label htmlFor="name" className="block text-sm font-medium text-stone-700">
            Business name
          </label>
          <input
            id="name"
            required
            minLength={2}
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Selam Clinic"
            className="mt-1.5 w-full rounded-lg border border-stone-300 px-3.5 py-3 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
          />

          <label htmlFor="domains" className="mt-5 block text-sm font-medium text-stone-700">
            Allowed websites
          </label>
          <input
            id="domains"
            value={domains}
            onChange={(e) => setDomains(e.target.value)}
            placeholder="example.com, shop.example.com"
            className="mt-1.5 w-full rounded-lg border border-stone-300 px-3.5 py-3 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
          />
          <p className="mt-1.5 text-sm text-stone-500">
            Only these sites can use the chat widget. Separate with commas, no https://.
          </p>

          <label htmlFor="language" className="mt-5 block text-sm font-medium text-stone-700">
            Default language
          </label>
          <div className="mt-1.5">
            <Select
              id="language"
              value={language}
              onChange={(v) => setLanguage(v as "en" | "am")}
              options={LANGUAGE_OPTIONS}
            />
          </div>

          {error && (
            <p role="alert" className="mt-5 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-800">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 py-3.5 font-semibold text-white hover:bg-teal-800 disabled:opacity-70"
          >
            {loading && <Spinner size={18} className="text-white" />}
            {loading ? "Creating…" : "Create business"}
          </button>
        </form>
      </main>
    </div>
  );
}