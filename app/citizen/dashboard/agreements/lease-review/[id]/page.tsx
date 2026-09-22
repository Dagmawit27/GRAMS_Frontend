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
    if (userRole === "tenant") {
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
        console.log("LeaseReviewPage: Received data:", data);
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
  if (isRedirecting || (userRole === "tenant")) {
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

  // Convert LeaseRequestResponse to format expected by LandlordReviewDetailsView
  const convertedRequest = {
    ...leaseRequest,
    propertyLocation: `${leaseRequest.propertySubCity || ""}, ${leaseRequest.propertyWoreda || ""}`,
    unitNumber: leaseRequest.unitNumber || leaseRequest.unitCode || "N/A",
    leaseDuration: `${leaseRequest.leaseDurationMonths} Months`,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <LandlordReviewDetailsView request={convertedRequest as any} />
    </div>
  );
}
