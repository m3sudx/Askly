"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Spinner } from "@/components/spinner";
import { LogoutButton } from "@/components/logout-button";
import { NavIcon } from "@/components/nav-icons";
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
    { label: "Overview", href: `/dashboard/${id}`, icon: "overview" as const },
    { label: "Documents", href: `/dashboard/${id}/documents`, icon: "documents" as const },
    { label: "Settings and install", href: `/dashboard/${id}/settings`, icon: "settings" as const },
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

  return (
    <div className="flex min-h-screen flex-wrap bg-[#faf8f5]">
      <aside className="flex flex-[1_1_240px] flex-col gap-6 border-r border-stone-200 bg-white p-5">
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

        <div className="rounded-lg border border-stone-200 bg-[#faf8f5] px-3 py-2.5">
          <p className="text-xs text-stone-500">Business</p>
          {tenant ? (
            <p className="font-medium text-stone-900">{tenant.name}</p>
          ) : (
            <p className="mt-0.5 flex items-center gap-2 text-sm text-stone-500">
              <Spinner size={14} /> Loading…
            </p>
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
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] ${
                      active
                        ? "bg-teal-50 font-semibold text-teal-800"
                        : "text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    <NavIcon name={item.icon} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-stone-200 pt-4 text-sm">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-teal-700 hover:bg-teal-50">
            <NavIcon name="back" size={18} />
            All businesses
          </Link>
          <LogoutButton className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-stone-600 hover:bg-stone-50">
            <NavIcon name="logout" size={18} />
            Log out
          </LogoutButton>
        </div>
      </aside>

      <div className="min-w-0 flex-[999_1_560px] p-6 sm:p-8">
        {error ? (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        ) : (
          <TenantContext.Provider value={{ tenant, setTenant }}>{children}</TenantContext.Provider>
        )}
      </div>
    </div>
  );
}