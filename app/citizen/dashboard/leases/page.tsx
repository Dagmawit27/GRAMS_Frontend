"use client";
import React from "react";
import { useCitizenData } from "@/hooks/useCitizenData";
import { TenantLeaseRequestsView } from "@/app/citizen/dashboard/agreements/TenantLeaseRequestsView";
import { TenantDigitalSigningView } from "@/app/citizen/dashboard/agreements/TenantDigitalSigningView";

/**
 * /citizen/dashboard/leases
 * Always shows the TENANT "My Lease Requests" view.
 * Landlords have /citizen/dashboard/agreements for Rental Agreements.
 */
export default function MyLeasesPage() {
  const { activeAgreementView, selectedLeaseRequest } = useCitizenData();

  // Tenant digital signing sub-view
  if (activeAgreementView === "tenant-signing" && selectedLeaseRequest) {
    return (
      <div className="space-y-6 animate-in fade-in duration-150">
        <TenantDigitalSigningView request={selectedLeaseRequest} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <TenantLeaseRequestsView />
    </div>
  );
}
