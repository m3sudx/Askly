"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/spinner";

type Mode = "login" | "signup";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3.5 py-3 text-stone-900 outline-none placeholder:text-stone-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15";

function Logo({ light }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2.5 text-[22px] font-semibold tracking-tight ${light ? "text-[#f4f1ec]" : "text-stone-900"}`}
    >
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="#2dd4bf" />
        <path
          d="M9 10.5A2.5 2.5 0 0 1 11.5 8h9A2.5 2.5 0 0 1 23 10.5v6a2.5 2.5 0 0 1-2.5 2.5H15l-4 3.5V19h-.5A2.5 2.5 0 0 1 9 16.5z"
          fill="#0b1f1e"
        />
      </svg>
      Askly
    </Link>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setNotice("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    const supabase = createClient();

    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName.trim() } },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (data.session) {
        router.push("/dashboard");
        return;
      }
      // Email confirmation is on: no session until the person clicks the link
      setNotice("Account created. Check your email to confirm it, then log in.");
      setMode("login");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel (wide screens only) */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0b1f1e] p-12 text-[#f4f1ec] lg:flex">
        <Logo light />

        <div>
          <h2 className="font-display max-w-md text-[40px] font-medium leading-[1.15] tracking-tight">
            Your documents, answering your visitors’ questions.
          </h2>
          <ul className="mt-8 flex max-w-md flex-col gap-4 text-[17px] text-[#b6cdc9]">
            {[
              "Answers in English and Amharic, with sources",
              "One line of code to add it to any website",
              "See what visitors asked that you haven’t covered",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-0.5 shrink-0">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                {item}
              </li>
            ))}
          </ul>

          <div aria-hidden="true" className="mt-10 max-w-sm rounded-2xl bg-white p-4 text-sm text-stone-900 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
            <div className="ml-auto w-fit rounded-xl rounded-br bg-teal-700 px-3 py-2 text-white">Do you open on Saturdays?</div>
            <div className="mt-2.5 w-fit max-w-[90%] rounded-xl rounded-bl border border-stone-200 bg-stone-50 px-3 py-2">
              Yes, we are open on Saturdays from 8am to 1pm <sup className="font-semibold text-teal-700">1</sup>.
              <div className="mt-1.5 border-t border-stone-200 pt-1.5 text-xs text-stone-500">Sources: [1] Opening hours</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Form */}
      <main className="flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <div className="lg:invisible">
            <Logo />
          </div>
          <Link href="/" className="text-sm text-stone-600 hover:text-teal-700">
            ← Back to home
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="font-display text-4xl font-medium tracking-tight text-stone-900">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-stone-600">
            {isSignup ? "Set up your first AI assistant in a few minutes." : "Log in to manage your assistants."}
          </p>

          <div role="tablist" aria-label="Log in or create account" className="mt-8 grid grid-cols-2 rounded-xl bg-stone-200/70 p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => switchMode(m)}
                className={`rounded-lg py-2.5 text-sm font-semibold transition ${
                  mode === m ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {m === "login" ? "Log in" : "Create account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6">
            {isSignup && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-stone-700">
                  Full name
                </label>
                <input
                  id="fullName"
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className={inputClass}
                />
              </div>
            )}

            <div className={isSignup ? "mt-5" : ""}>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            <div className="mt-5">
              <label htmlFor="password" className="block text-sm font-medium text-stone-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  // minLength={8}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignup ? "At least 8 characters" : "Your password"}
                  className={`${inputClass} pr-16`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 mt-0.75 -translate-y-1/2 rounded px-1.5 py-1 text-sm font-medium text-teal-700 hover:underline"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-800">
                {error}
              </p>
            )}
            {notice && (
              <p role="status" className="mt-4 rounded-lg bg-teal-50 px-3.5 py-2.5 text-sm text-teal-900">
                {notice}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 py-3.5 font-semibold text-white hover:bg-teal-800 disabled:opacity-70"
            >
              {loading && <Spinner size={18} className="text-white" />}
              {loading ? (isSignup ? "Creating account…" : "Logging in…") : isSignup ? "Create account" : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-600">
            {isSignup ? "Already have an account?" : "New to Askly?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(isSignup ? "login" : "signup")}
              className="font-semibold text-teal-700 hover:underline"
            >
              {isSignup ? "Log in" : "Create an account"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}