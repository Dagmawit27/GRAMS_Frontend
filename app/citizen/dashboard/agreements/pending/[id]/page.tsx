"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCitizenData } from "@/hooks/useCitizenData";
import { LeaseRequestResponse, getLeaseRequestById, getSession } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building, User, Calendar, DollarSign, FileText, Clock, CheckCircle2 } from "lucide-react";

/**
 * /citizen/dashboard/agreements/pending/[requestCode]
 * Shows detail view for an approved lease request with property/tenant info and generate agreement button
 */
export default function PendingAgreementDetailPage() {
  const { userRole } = useCitizenData();
  const router = useRouter();
  const params = useParams();
  const requestCode = params.id as string;

  const [leaseRequest, setLeaseRequest] = useState<LeaseRequestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAgreementGenerated, setIsAgreementGenerated] = useState(false);

  useEffect(() => {
    const fetchLeaseRequest = async () => {
      try {
        const session = getSession();
        if (!session?.token) {
          setError("No authentication token found");
          return;
        }
        const data = await getLeaseRequestById(session.token, requestCode);
        setLeaseRequest(data);
        
        // Check if agreement is already generated
        setIsAgreementGenerated(data.agreementGenerated || false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load lease request");
      } finally {
        setIsLoading(false);
      }
    };

    if (requestCode) {
      fetchLeaseRequest();
    }
  }, [requestCode]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !leaseRequest) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 text-sm">{error || "Lease request not found"}</p>
      </div>
    );
  }

  // If agreement is already generated, redirect to form page
  if (isAgreementGenerated) {
    router.push(`/citizen/dashboard/agreements/pending/${requestCode}/form`);
    return null;
  }

  const handleGenerateAgreement = () => {
    router.push(`/citizen/dashboard/agreements/pending/${requestCode}/form`);
  };

  const handleBack = () => {
    router.push("/citizen/dashboard/agreements/pending");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors mb-2 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Pending Agreements</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 pb-4 border-b border-slate-200/70">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Agreement {leaseRequest.requestCode}
              </h2>
              <Badge className="bg-amber-100 text-amber-800 border border-amber-200 text-xs px-2.5 py-0.5 uppercase tracking-wider font-semibold">
                <Clock className="w-3 h-3 mr-1" />
                Awaiting Verification
              </Badge>
            </div>
          </div>

          <Button
            onClick={handleGenerateAgreement}
            className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs font-semibold h-9 px-5 gap-1.5 shadow-xs"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Agreement</span>
          </Button>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Property Information Card */}
        <Card className="bg-white border-slate-200 shadow-clean overflow-hidden">
          <CardHeader className="p-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-700" />
              <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Property Information
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Property Title
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {leaseRequest.propertyTitle}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Property Code
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {leaseRequest.propertyCode}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Unit Number
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {leaseRequest.unitCode || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Location
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {leaseRequest.propertyLocation || "Addis Ababa"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tenant Information Card */}
        <Card className="bg-white border-slate-200 shadow-clean overflow-hidden">
          <CardHeader className="p-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-700" />
              <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Tenant Information
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Tenant Name
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {leaseRequest.applicantName}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Email
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {leaseRequest.applicantEmail || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Phone
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {leaseRequest.applicantPhone || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Status
                </span>
                <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs px-2 py-0.5">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Approved
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lease Terms Card */}
        <Card className="bg-white border-slate-200 shadow-clean overflow-hidden">
          <CardHeader className="p-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Lease Terms
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Monthly Rent
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {leaseRequest.proposedRent.toLocaleString()} ETB
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Security Deposit
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {(leaseRequest.securityDeposit || leaseRequest.proposedRent * 2).toLocaleString()} ETB
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Lease Duration
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {leaseRequest.leaseDuration || "12 Months"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Start Date
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {leaseRequest.startDate || "To be determined"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
}
