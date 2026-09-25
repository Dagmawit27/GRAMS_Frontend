"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getSession } from "@/lib/api";
import { UnauthorizedAccess } from "@/components/UnauthorizedAccess";

interface CitizenRoleGuardProps {
  children: React.ReactNode;
}

export function getResolvedCitizenRole(): "landlord" | "tenant" | "both" {
  if (typeof window === "undefined") return "tenant";

  const session = getSession();
  if (session?.user?.roles && session.user.roles.length > 0) {
    const roles = session.user.roles.map((r: string) => r.toLowerCase().replace("role_", ""));
    const isLandlord = roles.includes("landlord");
    const isTenant = roles.includes("tenant");
    if (roles.includes("both") || (isLandlord && isTenant)) return "both";
    if (isLandlord) return "landlord";
    if (isTenant) return "tenant";

    const pref = ((session.user as any).rolePreference || "").toLowerCase();
    if (pref === "both") return "both";
    if (pref === "landlord") return "landlord";
    if (pref === "tenant") return "tenant";
  }

  const stored = localStorage.getItem("userRole")?.toLowerCase();
  if (stored === "both") return "both";
  if (stored === "landlord") return "landlord";
  if (stored === "tenant") return "tenant";

  return "tenant";
}

export const CitizenRoleGuard: React.FC<CitizenRoleGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const [role, setRole] = useState<"landlord" | "tenant" | "both">("tenant");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setRole(getResolvedCitizenRole());
    setMounted(true);
  }, [pathname]);

  if (!mounted) {
    return <>{children}</>;
  }

  // 1. Tenant-only routes (Tenant & Both permitted; Landlord blocked)
  const isTenantRoute =
    pathname.startsWith("/citizen/dashboard/search") ||
    pathname.startsWith("/citizen/dashboard/leases");

  if (isTenantRoute && role === "landlord") {
    return (
      <UnauthorizedAccess
        requiredRole="tenant"
        currentRole={role}
        path={pathname}
      />
    );
  }

  // 2. Landlord-only routes (Landlord & Both permitted; Tenant blocked)
  const isLandlordRoute =
    pathname.startsWith("/citizen/dashboard/properties") ||
    pathname.startsWith("/citizen/dashboard/agreements") ||
    pathname.startsWith("/citizen/dashboard/tax");

  if (isLandlordRoute && role === "tenant") {
    return (
      <UnauthorizedAccess
        requiredRole="landlord"
        currentRole={role}
        path={pathname}
      />
    );
  }

  // 3. Dual (Both) accounts or non-restricted routes (e.g. /dashboard, /payments, /bills, /profile)
  return <>{children}</>;
};

export default CitizenRoleGuard;
