"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCitizenData } from "@/hooks/useCitizenData";
import { LandlordReviewDetailsView } from "./LandlordReviewDetailsView";
import { LandlordAgreementsView } from "./LandlordAgreementsView";

/**
 * /citizen/dashboard/agreements
 * Always shows the LANDLORD "Rental Agreements" view.
 * Tenants have a separate /citizen/dashboard/leases page.
 */
export const RentalAgreementsPage: React.FC = () => {
  const { activeAgreementView, selectedLeaseRequest, userRole } = useCitizenData();
  const router = useRouter();

  // Redirect tenants to their lease page
  useEffect(() => {
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

  // Landlord detail sub-view (review a pending lease request)
  if (activeAgreementView === "landlord-review" && selectedLeaseRequest) {
    return (
      <div className="space-y-6 animate-in fade-in duration-150">
        <LandlordReviewDetailsView request={selectedLeaseRequest} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <LandlordAgreementsView />
    </div>
  );
};

export default RentalAgreementsPage;
