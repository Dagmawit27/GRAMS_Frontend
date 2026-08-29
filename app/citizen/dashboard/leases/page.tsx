"use client";
import React from "react";
import { TenantLeaseRequestsView } from "@/app/citizen/dashboard/agreements/TenantLeaseRequestsView";

/**
 * /citizen/dashboard/leases
 * Always shows the TENANT "My Lease Requests" view.
 * Landlords have /citizen/dashboard/agreements for Rental Agreements.
 */
export default function MyLeasesPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <TenantLeaseRequestsView />
    </div>
  );
}
