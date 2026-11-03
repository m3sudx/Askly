"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/spinner";

export function LogoutButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  async function confirmLogout() {
    setLoggingOut(true);
    await createClient().auth.signOut();
    router.push("/login");
  }

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()} className={className}>
        {children}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="logout-title"
        onClick={(e) => {
          if (e.target === dialogRef.current && !loggingOut) dialogRef.current?.close();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-white p-0 text-stone-900 shadow-[0_24px_60px_rgba(0,0,0,0.25)] backdrop:bg-stone-900/50"
      >
        <div className="p-6">
          <h2 id="logout-title" className="font-display text-2xl font-medium tracking-tight">
            Log out of Askly?
          </h2>
          <p className="mt-2 text-sm text-stone-600">You will need to log in again to manage your businesses.</p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              autoFocus
              disabled={loggingOut}
              onClick={() => dialogRef.current?.close()}
              className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loggingOut}
              onClick={confirmLogout}
              className="flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-70"
            >
              {loggingOut && <Spinner size={16} className="text-white" />}
              {loggingOut ? "Logging out…" : "Log out"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}