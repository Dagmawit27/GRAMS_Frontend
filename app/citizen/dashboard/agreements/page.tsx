"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCitizenData } from "@/hooks/useCitizenData";
import { LandlordReviewDetailsView } from "./LandlordReviewDetailsView";
import { LandlordAgreementsView } from "./LandlordAgreementsView";
import { UnauthorizedAccess } from "@/components/UnauthorizedAccess";

/**
 * /citizen/dashboard/agreements
 * Always shows the LANDLORD "Rental Agreements" view.
 * Tenants have a separate /citizen/dashboard/leases page.
 */
export const RentalAgreementsPage: React.FC = () => {
  const { activeAgreementView, selectedLeaseRequest, userRole } = useCitizenData();
  const router = useRouter();

  // If tenant user reaches here, show UnauthorizedAccess
  if (userRole === "tenant") {
    return <UnauthorizedAccess requiredRole="landlord" currentRole="tenant" path="/citizen/dashboard/agreements" />;
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
