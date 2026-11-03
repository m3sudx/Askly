"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/logout-button";

export function AppHeader() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        const user = data.user;
        if (!user) return;
        setEmail(user.email ?? "");
        setName((user.user_metadata?.full_name as string | undefined) ?? "");
      });
  }, []);

  const display = name || email;
  const initial = display ? display[0]!.toUpperCase() : "";

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href="/dashboard" className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-stone-900">
          <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="9" fill="#0f766e" />
            <path
              d="M9 10.5A2.5 2.5 0 0 1 11.5 8h9A2.5 2.5 0 0 1 23 10.5v6a2.5 2.5 0 0 1-2.5 2.5H15l-4 3.5V19h-.5A2.5 2.5 0 0 1 9 16.5z"
              fill="#fff"
            />
          </svg>
          Askly
        </Link>

        <div className="flex items-center gap-4">
          {display && (
            <div className="hidden items-center gap-2.5 sm:flex">
              <span className="flex size-8 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-800">
                {initial}
              </span>
              <span className="max-w-45 truncate text-sm text-stone-700">{display}</span>
            </div>
          )}
          <LogoutButton className="rounded-lg border border-stone-300 px-3.5 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
            Log out
          </LogoutButton>
        </div>
      </div>
    </header>
  );
}