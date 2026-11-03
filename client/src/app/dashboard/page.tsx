"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { AppHeader } from "@/components/app-header";
import { PageLoading } from "@/components/spinner";
import type { Tenant } from "@/lib/types";

export default function DashboardPage() {
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api<Tenant[]>("/api/tenants")
      .then((data) => {
        if (!cancelled) setTenants(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load your businesses");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-medium tracking-tight text-stone-900">Your businesses</h1>
            <p className="mt-2 text-stone-600">
              Each business has its own documents, chat widget and analytics.
            </p>
          </div>
          <Link
            href="/dashboard/new"
            className="rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
          >
            + New business
          </Link>
        </div>

        {error && (
          <p role="alert" className="mt-8 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        {!error && tenants === null && <PageLoading />}

        {tenants && tenants.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
            <p className="font-display text-2xl text-stone-900">No businesses yet</p>
            <p className="mx-auto mt-2 max-w-sm text-stone-600">
              Create your first assistant, add a page of text, and try it in minutes.
            </p>
            <Link
              href="/dashboard/new"
              className="mt-6 inline-block rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Create your first business
            </Link>
          </div>
        )}

        {tenants && tenants.length > 0 && (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tenants.map((t) => {
              const isDemo = t.name.toLowerCase().includes("(demo)");
              const title = t.name.replace(/\s*\(demo\)\s*/i, "");
              return (
                <li key={t.id}>
                  <Link
                    href={`/dashboard/${t.id}`}
                    className="group flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-teal-700 hover:shadow-[0_8px_24px_rgba(15,118,110,0.12)]"
                  >
                    <div className="flex items-start justify-between">
                      <span className="flex size-12 items-center justify-center rounded-xl bg-teal-700 text-xl font-semibold text-white">
                        {title[0]?.toUpperCase()}
                      </span>
                      {isDemo && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                          Demo data
                        </span>
                      )}
                    </div>
                    <h2 className="mt-5 text-xl font-semibold text-stone-900">{title}</h2>
                    <p className="mt-1 text-sm text-stone-600">Documents, widget, analytics</p>
                    <span className="mt-6 text-sm font-medium text-teal-700 group-hover:underline">
                      Open dashboard →
                    </span>
                  </Link>
                </li>
              );
            })}

            <li>
              <Link
                href="/dashboard/new"
                className="flex h-full min-h-50 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 p-6 text-stone-600 transition hover:border-teal-700 hover:text-teal-700"
              >
                <span className="text-3xl leading-none">+</span>
                <span className="mt-2 text-sm font-medium">Add another business</span>
              </Link>
            </li>
          </ul>
        )}
      </main>
    </div>
  );
}