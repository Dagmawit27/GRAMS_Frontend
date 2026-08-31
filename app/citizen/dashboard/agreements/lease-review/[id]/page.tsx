"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LeaseRequestResponse, getLeaseRequestById, getSession } from "@/lib/api";
import { LandlordReviewDetailsView } from "../../LandlordReviewDetailsView";
import { useCitizenData } from "@/hooks/useCitizenData";

export default function LeaseReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { userRole } = useCitizenData();
  const requestCode = params.id as string;

  const [leaseRequest, setLeaseRequest] = useState<LeaseRequestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect tenants to their lease page
  useEffect(() => {
    if (userRole === "tenant" || userRole === "citizen") {
      setIsRedirecting(true);
      router.push("/citizen/dashboard/leases");
    }
  }, [userRole, router]);

  useEffect(() => {
    const fetchLeaseRequest = async () => {
      if (!requestCode) {
        setError("Lease request code not provided");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const session = getSession();
        if (!session?.token) {
          setError("No authentication token found");
          return;
        }

        const data = await getLeaseRequestById(session.token, requestCode);
        setLeaseRequest(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load lease request");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaseRequest();
  }, [requestCode]);

  // Show access denied for non-landlord users
  if (isRedirecting || (userRole === "tenant" || userRole === "citizen")) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 text-sm font-medium">Access Denied: This page is for landlords only</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    );
  }

  if (!leaseRequest) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
        <p className="text-slate-600 text-sm">Lease request not found</p>
      </div>
    );
  }

  // Convert LeaseRequestResponse to LeaseRequest format expected by LandlordReviewDetailsView
  const convertedRequest = {
    id: leaseRequest.id,
    requestCode: leaseRequest.id,
    propertyTitle: leaseRequest.propertyTitle,
    propertyLocation: leaseRequest.propertyLocation,
    propertyImage: leaseRequest.propertyImage,
    propertyType: leaseRequest.propertyType,
    unitNumber: leaseRequest.unitNumber || leaseRequest.unitCode || "N/A",
    area: leaseRequest.area || 0,
    counterpartyName: leaseRequest.applicantName,
    counterpartyInitials: leaseRequest.applicantName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    tenantNationalId: leaseRequest.applicantNationalId || "N/A",
    tenantPhone: leaseRequest.applicantPhone || "N/A",
    tenantEmail: leaseRequest.applicantEmail,
    tenantEmployment: leaseRequest.applicantEmployment || "N/A",
    proposedRent: leaseRequest.proposedRent,
    securityDeposit: leaseRequest.securityDeposit,
    leaseDuration: `${leaseRequest.leaseDurationMonths} Months`,
    startDate: leaseRequest.startDate,
    endDate: leaseRequest.endDate,
    dateSubmitted: new Date(leaseRequest.createdAt).toLocaleDateString(),
    status: leaseRequest.status,
    notes: leaseRequest.applicantNotes,
    landlordRemarks: leaseRequest.landlordRemarks,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <LandlordReviewDetailsView request={convertedRequest as any} />
    </div>
  );
}
