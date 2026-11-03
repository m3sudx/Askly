"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
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
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold text-stone-900">Your businesses</h1>
        <Link
          href="/dashboard/new"
          className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          New business
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-6 text-sm text-red-700">
          {error}
        </p>
      )}

      {!error && tenants === null && <PageLoading />}

      {tenants && tenants.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
          <p className="text-stone-700">You have no businesses yet.</p>
          <Link href="/dashboard/new" className="mt-3 inline-block text-sm font-medium text-teal-700 hover:underline">
            Create your first one
          </Link>
        </div>
      )}

      {tenants && tenants.length > 0 && (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {tenants.map((t) => (
            <li key={t.id}>
              <Link
                href={`/dashboard/${t.id}`}
                className="block rounded-2xl border border-stone-200 bg-white p-6 hover:border-teal-700"
              >
                <h2 className="text-lg font-semibold text-stone-900">{t.name}</h2>
                <p className="mt-1 text-sm text-teal-700">Open dashboard →</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}