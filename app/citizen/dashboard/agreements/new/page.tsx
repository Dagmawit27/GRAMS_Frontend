"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useCitizenData } from "@/hooks/useCitizenData";
import { LandlordAgreementsView } from "../LandlordAgreementsView";

/**
 * /citizen/dashboard/agreements/new
 * Shows new lease requests (PENDING status) for landlords
 */
export default function NewRequestsPage() {
  const { userRole } = useCitizenData();
  const router = useRouter();

  // Redirect tenants to their lease page
  React.useEffect(() => {
    if (userRole === "tenant") {
      router.push("/citizen/dashboard/leases");
    }
  }, [userRole, router]);

  // Show access denied for non-landlord users
  if (userRole === "tenant") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 text-sm font-medium">Access Denied: This page is for landlords only</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      
      <LandlordAgreementsView />
    </div>
  );
}
