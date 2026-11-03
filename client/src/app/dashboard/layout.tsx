import { Suspense } from "react";
import { PageLoading } from "@/components/spinner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageLoading className="p-10" />}>
      {children}
    </Suspense>
  );
}