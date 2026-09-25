"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { LeaseRequestResponse, getLeaseRequestById, approveLeaseRequest, getSession } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  Building,
  Check,
  Mail,
  Phone,
  FileCheck,
  Calendar,
  Lock,
} from "lucide-react";

export default function SupervisorAgreementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const requestCode = (params.id || params.requestCode) as string;
  const [leaseRequest, setLeaseRequest] = useState<LeaseRequestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchLeaseRequest = async () => {
    try {
      const session = getSession();
      if (!session?.token) {
        setError("Authentication required. Please log in.");
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

  useEffect(() => {
    if (requestCode) {
      fetchLeaseRequest();
    }
  }, [requestCode]);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const session = getSession();
      if (!session?.token) {
        setError("Authentication required");
        return;
      }
      await approveLeaseRequest(session.token, requestCode);
      setSuccessMessage("Agreement successfully approved and officially registered in municipal records!");
      // Refresh details to show updated approved status
      await fetchLeaseRequest();
      setTimeout(() => {
        router.push("/officer/supervisor/agreements");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve agreement");
    } finally {
      setIsApproving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-100">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Card className="bg-white border-slate-200 shadow-2xs overflow-hidden">
          <CardHeader className="border-b border-slate-100 p-6 space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 p-4 border border-slate-100 rounded-xl">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="space-y-3 p-4 border border-slate-100 rounded-xl">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-5 w-36" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((k) => (
                  <Skeleton key={k} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
        <p className="text-red-800 text-sm font-medium">{error}</p>
        <Link
          href="/officer/supervisor/agreements"
          className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-[#00450d] transition-colors text-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>BACK TO AGREEMENTS</span>
        </Link>
      </div>
    );
  }

  if (!leaseRequest) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-3">
        <p className="text-slate-500 text-sm">Lease request not found</p>
        <Link
          href="/officer/supervisor/agreements"
          className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-[#00450d] transition-colors text-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>BACK TO AGREEMENTS</span>
        </Link>
      </div>
    );
  }

  const contractDate = leaseRequest.createdAt
    ? new Date(leaseRequest.createdAt).toLocaleDateString("en-GB")
    : new Date().toLocaleDateString("en-GB");
  const monthlyRentFormatted = (leaseRequest.proposedRent || 0).toLocaleString();
  const advanceDepositFormatted = ((leaseRequest.proposedRent || 0) * 2).toLocaleString();

  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-5xl mx-auto pb-12">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/officer/supervisor/agreements"
            className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-[#00450d] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>SUPERVISOR AGREEMENTS</span>
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-600" />
            Supervisor Agreement Final Review & Approval
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registration Ref: <span className="font-mono font-bold text-slate-800">{leaseRequest.requestCode}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {leaseRequest.status === "UNDER_VERIFICATION" && (
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 font-bold border-amber-300 text-xs px-3 py-1">
              Under Verification
            </Badge>
          )}
          {leaseRequest.status === "PENDING_SUPERVISOR_APPROVAL" && (
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 font-bold border-blue-300 text-xs px-3 py-1">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Verified (Awaiting Supervisor Approval)
            </Badge>
          )}
          {(leaseRequest.status === "SUPERVISOR_APPROVED" || leaseRequest.status === "APPROVED") && (
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 font-bold border-emerald-300 text-xs px-3 py-1">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Officially Approved & Active
            </Badge>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-sm font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              Property
            </div>
            <p className="text-sm font-bold text-slate-900 truncate">{leaseRequest.propertyTitle}</p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{leaseRequest.propertyCode}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Contracting Parties
            </div>
            <p className="text-xs text-slate-800"><span className="text-slate-400">Landlord:</span> <span className="font-semibold">{leaseRequest.landlordName}</span></p>
            <p className="text-xs text-slate-800 mt-0.5"><span className="text-slate-400">Tenant:</span> <span className="font-semibold">{leaseRequest.applicantName}</span></p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Monthly Rate
            </div>
            <p className="text-base font-extrabold text-[#00450d]">{monthlyRentFormatted} ETB</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Location: {leaseRequest.propertySubCity}, Woreda {leaseRequest.propertyWoreda}</p>
          </CardContent>
        </Card>
      </div>

      {/* Statutory Agreement Document Card (Non-Editable Form with DB Values) */}
      <Card className="bg-white border-slate-200 shadow-clean overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#00450d]" />
            <CardTitle className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
              Statutory Lease Agreement Document (መደበኛ የመኖሪያ ቤት ኪራይ ውል)
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-600 bg-white border-slate-300 gap-1">
            <Lock className="w-3 h-3 text-slate-500" />
            Official Certified Record (Non-Editable)
          </Badge>
        </CardHeader>
        <CardContent className="p-5 sm:p-8 bg-slate-50/30">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10 max-w-4xl mx-auto shadow-xs space-y-6 text-xs text-slate-800 leading-relaxed font-sans">
            {/* Header & Emblem */}
            <div className="text-center pb-4 border-b border-slate-200 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA
              </p>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                GOVERNMENT RENTAL ADMINISTRATION & MONITORING SYSTEM (GRAMS)
              </h3>
              <p className="text-xs font-semibold text-[#00450d]">
                STATUTORY DIGITAL LEASE CONTRACT — REGISTRATION REF: #{leaseRequest.requestCode}
              </p>
              <p className="text-[10px] text-slate-400">
                Created on: {contractDate} • Status: {leaseRequest.status}
              </p>
            </div>

            {/* Terms and conditions text */}
            <div className="space-y-4 text-xs text-slate-700">
              <p className="font-semibold text-slate-900">
                በተሻሻለው የኢትዮጵያ ፌዴራላዊ ዴሞክራሲያዊ ሪፐብሊክ የፍትሐብሔር ሕግ እና የመኖሪያ ቤት ኪራይ ቁጥጥር ደንብ መሠረት የተደረገ የመኖሪያ ቤት ኪራይ ውል።
              </p>

              {/* 1. Landlord */}
              <div className="space-y-1 pt-2">
                <p className="font-bold text-slate-950">1. አከራይ (Landlord):</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p><span className="text-slate-500">ስም:</span> <strong className="text-slate-900">{leaseRequest.landlordName || "—"}</strong></p>
                  <p><span className="text-slate-500">ስልክ ቁጥር:</span> <strong className="text-slate-900">{leaseRequest.landlordPhone || "—"}</strong></p>
                  <p><span className="text-slate-500">ክፍለ ከተማ:</span> <strong className="text-slate-900">{leaseRequest.landlordSubCity || leaseRequest.propertySubCity || "—"}</strong></p>
                  <p><span className="text-slate-500">ወረዳ:</span> <strong className="text-slate-900">{leaseRequest.landlordWoreda || leaseRequest.propertyWoreda || "—"}</strong></p>
                  <p><span className="text-slate-500">ከተማ / ክልል:</span> <strong className="text-slate-900">{leaseRequest.landlordCity || "አዲስ አበባ"}</strong></p>
                </div>
              </div>

              {/* 2. Tenant */}
              <div className="space-y-1 pt-2">
                <p className="font-bold text-slate-950">2. ተከራይ (Tenant):</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p><span className="text-slate-500">ስም:</span> <strong className="text-slate-900">{leaseRequest.applicantName || "—"}</strong></p>
                  <p><span className="text-slate-500">ስልክ ቁጥር:</span> <strong className="text-slate-900">{leaseRequest.applicantPhone || "—"}</strong></p>
                  <p><span className="text-slate-500">ክፍለ ከተማ:</span> <strong className="text-slate-900">{leaseRequest.applicantSubCity || "—"}</strong></p>
                  <p><span className="text-slate-500">ወረዳ:</span> <strong className="text-slate-900">{leaseRequest.applicantWoreda || "—"}</strong></p>
                  <p><span className="text-slate-500">ኢሜይል:</span> <strong className="text-slate-900">{leaseRequest.applicantEmail || "—"}</strong></p>
                </div>
              </div>

              {/* 3. Property to Rent */}
              <div className="space-y-1 pt-2">
                <p className="font-bold text-slate-950">3. የሚከራየው ቤት አድራሻ (Leased Property Address):</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p><span className="text-slate-500">የቤት መለያ ኮድ:</span> <strong className="text-slate-900 font-mono">{leaseRequest.propertyCode || "—"}</strong></p>
                  <p><span className="text-slate-500">የቤት መጠሪያ:</span> <strong className="text-slate-900">{leaseRequest.propertyTitle || "—"}</strong></p>
                  <p><span className="text-slate-500">ክፍለ ከተማ:</span> <strong className="text-slate-900">{leaseRequest.propertySubCity || "—"}</strong></p>
                  <p><span className="text-slate-500">ወረዳ:</span> <strong className="text-slate-900">{leaseRequest.propertyWoreda || "—"}</strong></p>
                  <p><span className="text-slate-500">የክፍል / ዩኒት ቁጥር:</span> <strong className="text-slate-900">{leaseRequest.unitCode || "ዋና ግቢ / ክፍል"}</strong></p>
                  <p><span className="text-slate-500">የይዞታ ዓይነት:</span> <strong className="text-slate-900">የራሱን የቻለ የመኖሪያ ቤት</strong></p>
                </div>
              </div>

              {/* 4. Rental Conditions & Payment */}
              <div className="space-y-1 pt-2">
                <p className="font-bold text-slate-950">4. የኪራይ ሁኔታ እና የክፍያ መጠን (Rental Terms & Rates):</p>
                <div className="pl-3 space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p>
                    ተከራይ በየወሩ የቤቱን ኪራይ ብር <strong className="text-[#00450d] text-sm">{monthlyRentFormatted}</strong> (በፊደል: {monthlyRentFormatted} የኢትዮጵያ ብር) 
                    በየወሩ ወር በገባ እስከ 5ኛው ቀን ድረስ ለአከራይ በሕጋዊ መንገድ ለመክፈል ተስማምቷል።
                  </p>
                  <p>
                    የውሉ መጀመሪያ ቀን፡ <strong>{leaseRequest.startDate ? new Date(leaseRequest.startDate).toLocaleDateString("en-GB") : contractDate}</strong> እስከ 
                    <strong> {leaseRequest.endDate ? new Date(leaseRequest.endDate).toLocaleDateString("en-GB") : "አንድ ዓመት"}</strong> ድረስ ጸንቶ ይቆያል።
                  </p>
                  <p>
                    የቅድሚያ ክፍያ / ማስያዣ መጠን፡ <strong>{advanceDepositFormatted} ETB</strong> ተከፍሎ በስምምነት ተመዝግቧል።
                  </p>
                </div>
              </div>

              {/* 5. General Obligations */}
              <div className="space-y-1 pt-2">
                <p className="font-bold text-slate-950">5. አጠቃላይ ግዴታዎች (General Statutory Obligations):</p>
                <div className="pl-3 space-y-1 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p>1) አከራዩ ቤቱን ለተከራይ ለመኖሪያ አመቺ እና ንጹህ አድርጎ የማስረከብ ግዴታ አለበት።</p>
                  <p>2) ተከራይ ቤቱን በጥንቃቄ የመያዝ እና ለሌላ ሶስተኛ ወገን ያለ አከራይ ፈቃድ አሳልፎ ያለመስጠት ግዴታ አለበት።</p>
                  <p>3) የውሃ፣ መብራት እና ተዛማጅ የፍጆታ ሂሳቦች በስምምነቱ መሠረት በወቅቱ ይከፈላሉ።</p>
                </div>
              </div>
            </div>

            {/* Certified Digital Signatures Box */}
            <div className="pt-6 border-t border-slate-200">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-3">
                CERTIFIED DIGITAL SIGNATURES & VERIFICATION RECORD
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Landlord Stamp */}
                <div className={`border rounded-xl p-4 space-y-1.5 ${
                  leaseRequest.landlordSigned
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-dashed border-amber-300 bg-amber-50/40"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      LANDLORD SIGNATURE
                    </span>
                    <span className={`font-bold text-[9px] px-2 py-0.5 rounded ${
                      leaseRequest.landlordSigned
                        ? "bg-emerald-200/80 text-emerald-900"
                        : "bg-amber-200 text-amber-900"
                    }`}>
                      {leaseRequest.landlordSigned ? "SEALED / SIGNED" : "PENDING"}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-xs">
                    {leaseRequest.landlordName}
                  </p>
                  {leaseRequest.landlordSignedAt ? (
                    <p className="text-[10px] text-slate-500 font-mono">
                      Timestamp: {new Date(leaseRequest.landlordSignedAt).toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-[10px] text-amber-800 font-medium">
                      Awaiting Landlord Signature
                    </p>
                  )}
                </div>

                {/* Tenant Stamp */}
                <div className={`border rounded-xl p-4 space-y-1.5 ${
                  leaseRequest.tenantSigned
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-dashed border-amber-300 bg-amber-50/40"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      TENANT SIGNATURE
                    </span>
                    <span className={`font-bold text-[9px] px-2 py-0.5 rounded ${
                      leaseRequest.tenantSigned
                        ? "bg-emerald-200/80 text-emerald-900"
                        : "bg-amber-200 text-amber-900"
                    }`}>
                      {leaseRequest.tenantSigned ? "SEALED / SIGNED" : "PENDING"}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-xs">
                    {leaseRequest.applicantName}
                  </p>
                  {leaseRequest.tenantSignedAt ? (
                    <p className="text-[10px] text-slate-500 font-mono">
                      Timestamp: {new Date(leaseRequest.tenantSignedAt).toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-[10px] text-amber-800 font-medium">
                      Awaiting Tenant Signature
                    </p>
                  )}
                </div>

                {/* Officer Verification Stamp */}
                <div className={`border rounded-xl p-4 space-y-1.5 ${
                  (leaseRequest.status === "PENDING_SUPERVISOR_APPROVAL" || leaseRequest.status === "SUPERVISOR_APPROVED" || leaseRequest.status === "APPROVED")
                    ? "border-blue-200 bg-blue-50/50"
                    : "border-dashed border-slate-300 bg-slate-50/40"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900">
                      OFFICER VERIFICATION
                    </span>
                    <span className={`font-bold text-[9px] px-2 py-0.5 rounded ${
                      (leaseRequest.status === "PENDING_SUPERVISOR_APPROVAL" || leaseRequest.status === "SUPERVISOR_APPROVED" || leaseRequest.status === "APPROVED")
                        ? "bg-blue-200/80 text-blue-950"
                        : "bg-slate-200 text-slate-700"
                    }`}>
                      {(leaseRequest.status === "PENDING_SUPERVISOR_APPROVAL" || leaseRequest.status === "SUPERVISOR_APPROVED" || leaseRequest.status === "APPROVED")
                        ? "VERIFIED"
                        : "PENDING"}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-xs">
                    Woreda Housing Officer
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {leaseRequest.reviewedAt
                      ? `Verified: ${new Date(leaseRequest.reviewedAt).toLocaleString()}`
                      : "Verified & Forwarded to Supervisor"}
                  </p>
                </div>
              </div>

              {/* Supervisor Seal Section */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className={`border rounded-xl p-4 space-y-2 ${
                  (leaseRequest.status === "SUPERVISOR_APPROVED" || leaseRequest.status === "APPROVED")
                    ? "border-emerald-300 bg-emerald-50/60"
                    : "border-dashed border-orange-300 bg-orange-50/30"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      MUNICIPAL SUPERVISOR FINAL APPROVAL SEAL
                    </span>
                    <Badge className={
                      (leaseRequest.status === "SUPERVISOR_APPROVED" || leaseRequest.status === "APPROVED")
                        ? "bg-emerald-600 text-white font-bold"
                        : "bg-orange-100 text-orange-900 border-orange-300 font-bold"
                    }>
                      {(leaseRequest.status === "SUPERVISOR_APPROVED" || leaseRequest.status === "APPROVED")
                        ? "OFFICIALLY REGISTERED & APPROVED"
                        : "AWAITING SUPERVISOR SEAL"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-700">
                    {(leaseRequest.status === "SUPERVISOR_APPROVED" || leaseRequest.status === "APPROVED")
                      ? `Approved by Woreda Supervisor on ${leaseRequest.supervisorSignedAt ? new Date(leaseRequest.supervisorSignedAt).toLocaleString() : new Date().toLocaleDateString()}. This agreement constitutes a binding public instrument enforceable under law.`
                      : "This agreement has been verified by the Woreda Officer and awaits final supervisor confirmation to activate legally."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 bg-white p-4 rounded-xl shadow-2xs">
        <Link
          href="/officer/supervisor/agreements"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#00450d] transition-colors py-2 px-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Agreements</span>
        </Link>

        <div className="flex items-center gap-3">
          {leaseRequest.status === "PENDING_SUPERVISOR_APPROVAL" && (
            <Button
              onClick={handleApprove}
              disabled={isApproving}
              className="h-10 text-xs font-semibold bg-[#00450d] hover:bg-[#1b5e20] text-white gap-2 px-6 shadow-sm"
            >
              <Check className="w-4 h-4" />
              {isApproving ? "Approving & Registering..." : "Approve & Register Agreement"}
            </Button>
          )}
          {(leaseRequest.status === "SUPERVISOR_APPROVED" || leaseRequest.status === "APPROVED") && (
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Agreement Approved & Enacted
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
