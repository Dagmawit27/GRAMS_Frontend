"use client";
import React from "react";
import { useCitizenData } from "@/hooks/useCitizenData";
import { RoleSwitcherBanner } from "./RoleSwitcherBanner";
import { LandlordAgreementsView } from "./LandlordAgreementsView";
import { LandlordReviewDetailsView } from "./LandlordReviewDetailsView";
import { TenantLeaseRequestsView } from "./TenantLeaseRequestsView";
import { TenantDigitalSigningView } from "./TenantDigitalSigningView";

export const RentalAgreementsPage: React.FC = () => {
  const {
    userRole,
    activeAgreementView,
    selectedLeaseRequest,
  } = useCitizenData();

  // If currently in landlord detail review view
  if (activeAgreementView === "landlord-review" && selectedLeaseRequest) {
    return (
      <div className="space-y-6 animate-in fade-in duration-150">
        
        <LandlordReviewDetailsView request={selectedLeaseRequest} />
      </div>
    );
  }

  // If currently in tenant digital signing view
  if (activeAgreementView === "tenant-signing" && selectedLeaseRequest) {
    return (
      <div className="space-y-6 animate-in fade-in duration-150">
        
        <TenantDigitalSigningView request={selectedLeaseRequest} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
     

      {/* Render matching role view */}
      {userRole === "landlord" ? (
        <LandlordAgreementsView />
      ) : (
        <TenantLeaseRequestsView />
      )}
    </div>
  );
};

export default RentalAgreementsPage;
