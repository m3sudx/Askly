"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { PageLoading } from "@/components/spinner";
import { createClient } from "@/lib/supabase/client";
import type { Tenant } from "@/lib/types";
import { TenantContext } from "./tenant-context";

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [error, setError] = useState("");

const nav = [
  { label: "Overview", href: `/dashboard/${id}` },
  { label: "Documents", href: `/dashboard/${id}/documents` },
  { label: "Settings and install", href: `/dashboard/${id}/settings` },
];
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/login");
        return;
      }
      api<Tenant[]>("/api/tenants")
        .then((list) => {
          const found = list.find((t) => t.id === id);
          if (found) setTenant(found);
          else setError("Business not found");
        })
        .catch((e: Error) => setError(e.message));
    });
  }, [id, router, supabase]);

  async function logOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen flex-wrap bg-[#faf8f5]">
      <aside className="flex flex-[1_1_240px] flex-col gap-6 border-r border-stone-200 bg-white p-5">
        <Link href="/dashboard" className="text-xl font-semibold text-teal-800">
          Askly
        </Link>

        <div className="rounded-lg border border-stone-200 bg-[#faf8f5] px-3 py-2.5">
          <p className="text-xs text-stone-500">Business</p>
          {tenant ? (
            <p className="font-medium text-stone-900">{tenant.name}</p>
          ) : (
            <PageLoading />
          )}
        </div>

        <nav aria-label="Business">
          <ul className="flex flex-col gap-1">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-lg px-3 py-2.5 text-[15px] ${
                      active
                        ? "bg-teal-50 font-semibold text-teal-800"
                        : "text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-stone-200 pt-4 text-sm">
          <Link href="/dashboard" className="py-2 text-teal-700 hover:underline">
            ← All businesses
          </Link>
          <button onClick={logOut} className="py-2 text-left text-stone-600 hover:underline">
            Log out
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-[999_1_560px] p-6 sm:p-8">
        {error ? (
  <p role="alert" className="text-red-700">{error}</p>
) : (
  <TenantContext.Provider value={{ tenant, setTenant }}>{children}</TenantContext.Provider>
)}
      </div>
    </div>
  );
}