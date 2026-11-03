"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push("/dashboard");
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else if (data.session) router.push("/dashboard");
      else setNotice("Check your email to confirm your account, then log in.");
    }

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8"
      >
        <h1 className="text-2xl font-semibold text-stone-900">
          {mode === "login" ? "Log in to Askly" : "Create your account"}
        </h1>

        <label htmlFor="email" className="mt-6 block text-sm font-medium text-stone-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-teal-700"
        />

        <label htmlFor="password" className="mt-4 block text-sm font-medium text-stone-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-teal-700"
        />

        {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
        {notice && <p className="mt-4 text-sm text-teal-800">{notice}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-teal-700 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {loading ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-4 w-full py-2 text-sm text-teal-700 hover:underline"
        >
          {mode === "login" ? "No account? Sign up" : "Have an account? Log in"}
        </button>
      </form>
    </main>
  );
}