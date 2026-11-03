"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
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
    <main className="mx-auto max-w-lg px-6 py-10">
      <Link href="/dashboard" className="text-sm text-teal-700 hover:underline">
        ← Back to businesses
      </Link>
      <h1 className="mt-4 text-3xl font-semibold text-stone-900">New business</h1>

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
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-teal-700"
        />

        <label htmlFor="domains" className="mt-5 block text-sm font-medium text-stone-700">
          Allowed websites
        </label>
        <input
          id="domains"
          value={domains}
          onChange={(e) => setDomains(e.target.value)}
          placeholder="example.com, shop.example.com"
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-teal-700"
        />
        <p className="mt-1 text-sm text-stone-500">
          Separate with commas, no https://. Use localhost while testing.
        </p>

        <label htmlFor="language" className="mt-5 block text-sm font-medium text-stone-700">
          Default language
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value as "en" | "am")}
          className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 outline-none focus:border-teal-700"
        >
          <option value="en">English</option>
          <option value="am">Amharic</option>
        </select>

        {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-teal-700 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create business"}
        </button>
      </form>
    </main>
  );
}