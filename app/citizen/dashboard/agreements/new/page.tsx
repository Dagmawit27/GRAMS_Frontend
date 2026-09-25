"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useCitizenData } from "@/hooks/useCitizenData";
import { LandlordAgreementsView } from "../LandlordAgreementsView";
import { getSession } from "@/lib/api";

import { UnauthorizedAccess } from "@/components/UnauthorizedAccess";

/**
 * /citizen/dashboard/agreements/new
 * Shows new lease requests (PENDING status) for landlords
 */
export default function NewRequestsPage() {
  const { userRole } = useCitizenData();
  const router = useRouter();

  // If tenant reaches here, show UnauthorizedAccess
  if (userRole === "tenant") {
    return <UnauthorizedAccess requiredRole="landlord" currentRole="tenant" path="/citizen/dashboard/agreements/new" />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <LandlordAgreementsView />
    </div>
  );
}
