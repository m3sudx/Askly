"use client";

import { createContext, useContext } from "react";
import type { Tenant } from "@/lib/types";

type TenantValue = {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant) => void;
};

export const TenantContext = createContext<TenantValue | null>(null);

export function useTenant() {
  const value = useContext(TenantContext);
  if (!value) throw new Error("useTenant must be used inside the business layout");
  return value;
}