import { Suspense } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-10 text-stone-600">Loading…</p>}>
      {children}
    </Suspense>
  );
}