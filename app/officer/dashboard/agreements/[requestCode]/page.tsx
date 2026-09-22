"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { LeaseRequestResponse, getLeaseRequestById, verifyLeaseRequest, approveLeaseRequest, getSession } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  User,
  Calendar,
  DollarSign,
  Building,
  Check,
  X,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

export default function OfficerAgreementDetailPage() {
  const router = useRouter();
  const { requestCode } = useParams();
  const [leaseRequest, setLeaseRequest] = useState<LeaseRequestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaseRequest = async () => {
      try {
        const session = getSession();
        if (!session?.token) {
          setError("Authentication required");
          return;
        }
        const data = await getLeaseRequestById(session.token, requestCode as string);
        setLeaseRequest(data);
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

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const session = getSession();
      if (!session?.token) {
        setError("Authentication required");
        return;
      }
      await verifyLeaseRequest(session.token, requestCode as string);
      setSuccessMessage("Agreement verified and forwarded to supervisor!");
      setTimeout(() => {
        router.push("/officer/office/agreements");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify agreement");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleApprove = async () => {
    setIsVerifying(true);
    try {
      const session = getSession();
      if (!session?.token) {
        setError("Authentication required");
        return;
      }
      await approveLeaseRequest(session.token, requestCode as string);
      setSuccessMessage("Agreement approved and officially registered!");
      setTimeout(() => {
        router.push("/officer/supervisor/agreements");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve agreement");
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 text-sm font-medium">{error}</p>
      </div>
    );
  }

  if (!leaseRequest) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
        <p className="text-slate-500 text-sm">Lease request not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/officer/dashboard/agreements/list"
            className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-[#00450d] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>AGREEMENTS</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-mono font-bold text-slate-800">
            {leaseRequest.requestCode}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Agreement Verification
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Request Code: <span className="font-mono font-bold text-slate-700">{leaseRequest.requestCode}</span>
          </p>
        </div>
        {leaseRequest.status === "UNDER_VERIFICATION" && (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 font-bold border-amber-300 text-xs">
            Under Verification
          </Badge>
        )}
        {leaseRequest.status === "PENDING_SUPERVISOR_APPROVAL" && (
          <Badge className="bg-orange-100 text-orange-900 hover:bg-orange-100 font-bold border-orange-300 text-xs">
            Pending Supervisor Approval
          </Badge>
        )}
        {leaseRequest.status === "SUPERVISOR_APPROVED" && (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 font-bold border-emerald-300 text-xs">
            Officially Approved & Active
          </Badge>
        )}
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Property Information */}
      <Card className="border-slate-200 shadow-clean">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-600" />
            Property Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Property Code</p>
              <p className="text-sm text-slate-900 font-medium mt-0.5">{leaseRequest.propertyCode}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Property Title</p>
              <p className="text-sm text-slate-900 font-medium mt-0.5">{leaseRequest.propertyTitle}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Sub-City</p>
              <p className="text-sm text-slate-900 font-medium mt-0.5">{leaseRequest.propertySubCity}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Woreda</p>
              <p className="text-sm text-slate-900 font-medium mt-0.5">{leaseRequest.propertyWoreda}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Monthly Rent</p>
              <p className="text-sm text-slate-900 font-medium mt-0.5">
                {leaseRequest.proposedRent?.toLocaleString()} ETB
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Unit Code</p>
              <p className="text-sm text-slate-900 font-medium mt-0.5">{leaseRequest.unitCode}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tenant Information */}
      <Card className="border-slate-200 shadow-clean">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <User className="w-4 h-4 text-slate-600" />
            Tenant Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Name</p>
              <p className="text-sm text-slate-900 font-medium mt-0.5">{leaseRequest.applicantName}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Email</p>
              <p className="text-sm text-slate-900 font-medium mt-0.5 flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                {leaseRequest.applicantEmail}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Phone</p>
              <p className="text-sm text-slate-900 font-medium mt-0.5 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                {leaseRequest.applicantPhone}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">City</p>
              <p className="text-sm text-slate-900 font-medium mt-0.5">{leaseRequest.applicantCity}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Sub-City</p>
              <p className="text-sm text-slate-900 font-medium mt-0.5">{leaseRequest.applicantSubCity}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Woreda</p>
              <p className="text-sm text-slate-900 font-medium mt-0.5">{leaseRequest.applicantWoreda}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Landlord Information */}
      <Card className="border-slate-200 shadow-clean">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <User className="w-4 h-4 text-slate-600" />
            Landlord Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Name</p>
              <p className="text-sm text-slate-900 font-medium mt-0.5">{leaseRequest.landlordName}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Email</p>
              <p className="text-sm text-slate-900 font-medium mt-0.5 flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                {leaseRequest.landlordEmail}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Phone</p>
              <p className="text-sm text-slate-900 font-medium mt-0.5 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                {leaseRequest.landlordPhone}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">City</p>
              <p className="text-sm text-slate-900 font-medium mt-0.5">{leaseRequest.landlordCity}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Sub-City</p>
              <p className="text-sm text-slate-900 font-medium mt-0.5">{leaseRequest.landlordSubCity}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Woreda</p>
              <p className="text-sm text-slate-900 font-medium mt-0.5">{leaseRequest.landlordWoreda}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signing Status */}
      <Card className="border-slate-200 shadow-clean">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            Agreement Signing Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className={`border rounded-xl p-4 space-y-2 ${
              leaseRequest.landlordSigned
                ? "border-emerald-200 bg-emerald-50/50"
                : "border-dashed border-amber-300 bg-amber-50/40"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Landlord Signature
                </span>
                <span className={`font-bold text-[10px] px-2 py-0.5 rounded ${
                  leaseRequest.landlordSigned
                    ? "bg-emerald-200/80 text-emerald-900"
                    : "bg-amber-200 text-amber-900"
                }`}>
                  {leaseRequest.landlordSigned ? "SIGNED" : "PENDING"}
                </span>
              </div>
              <p className="font-bold text-slate-900 text-sm">
                {leaseRequest.landlordName}
              </p>
              {leaseRequest.landlordSignedAt && (
                <p className="text-[10px] text-slate-500">
                  Signed on {new Date(leaseRequest.landlordSignedAt).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className={`border rounded-xl p-4 space-y-2 ${
              leaseRequest.tenantSigned
                ? "border-emerald-200 bg-emerald-50/50"
                : "border-dashed border-amber-300 bg-amber-50/40"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Tenant Signature
                </span>
                <span className={`font-bold text-[10px] px-2 py-0.5 rounded ${
                  leaseRequest.tenantSigned
                    ? "bg-emerald-200/80 text-emerald-900"
                    : "bg-amber-200 text-amber-900"
                }`}>
                  {leaseRequest.tenantSigned ? "SIGNED" : "PENDING"}
                </span>
              </div>
              <p className="font-bold text-slate-900 text-sm">
                {leaseRequest.applicantName}
              </p>
              {leaseRequest.tenantSignedAt && (
                <p className="text-[10px] text-slate-500">
                  Signed on {new Date(leaseRequest.tenantSignedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="h-10 text-sm font-medium"
        >
          Back
        </Button>
        {leaseRequest.status === "UNDER_VERIFICATION" && (
          <Button
            onClick={handleVerify}
            disabled={isVerifying || !leaseRequest.landlordSigned || !leaseRequest.tenantSigned}
            className="h-10 text-sm font-semibold bg-[#00450d] hover:bg-[#1b5e20] text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            {isVerifying ? "Verifying..." : "Verify & Forward to Supervisor"}
          </Button>
        )}
        {leaseRequest.status === "PENDING_SUPERVISOR_APPROVAL" && (
          <Button
            onClick={handleApprove}
            disabled={isVerifying}
            className="h-10 text-sm font-semibold bg-[#00450d] hover:bg-[#1b5e20] text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            {isVerifying ? "Approving..." : "Approve Agreement"}
          </Button>
        )}
      </div>
    </div>
  );
}
