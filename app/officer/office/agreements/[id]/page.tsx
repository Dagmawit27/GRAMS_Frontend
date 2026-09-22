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
  Building,
  Check,
  Mail,
  Phone,
  FileCheck,
  Calendar,
  Lock,
} from "lucide-react";

export default function OfficerOfficeAgreementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const requestCode = (params.id || params.requestCode) as string;
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
      await verifyLeaseRequest(session.token, requestCode);
      setSuccessMessage("Agreement verified and forwarded to supervisor!");
      setTimeout(() => {
        router.push("/officer/office/agreements");
      }, 1500);
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
      await approveLeaseRequest(session.token, requestCode);
      setSuccessMessage("Agreement approved and officially registered!");
      setTimeout(() => {
        router.push("/officer/supervisor/agreements");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve agreement");
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#00450d] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
        <p className="text-red-800 text-sm font-medium">{error}</p>
        <Link
          href="/officer/office/agreements"
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
          href="/officer/office/agreements"
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
            href="/officer/office/agreements"
            className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-[#00450d] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>RENTAL AGREEMENTS</span>
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
            <ShieldCheck className="w-6 h-6 text-[#00450d]" />
            Agreement Verification & Review
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Statutory Registration Ref: <span className="font-mono font-bold text-slate-800">{leaseRequest.requestCode}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {leaseRequest.status === "UNDER_VERIFICATION" && (
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 font-bold border-amber-300 text-xs px-3 py-1">
              Under Verification
            </Badge>
          )}
          {leaseRequest.status === "PENDING_SUPERVISOR_APPROVAL" && (
            <Badge className="bg-orange-100 text-orange-900 hover:bg-orange-100 font-bold border-orange-300 text-xs px-3 py-1">
              Pending Supervisor Approval
            </Badge>
          )}
          {leaseRequest.status === "SUPERVISOR_APPROVED" && (
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 font-bold border-emerald-300 text-xs px-3 py-1">
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

      {/* Formal Statutory Agreement Document Card (Read-Only Form with Values) */}
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
              {/* 1. Landlord Information */}
              <div className="space-y-1 text-justify">
                <p>
                  <span className="font-bold text-slate-950">1. የአከራይ ስም ከነአያት (Landlord Full Name): </span>
                  <span className="font-bold text-slate-950 border-b border-dotted border-slate-800 px-2 min-w-[160px] inline-block bg-slate-50/70">
                    {leaseRequest.landlordName || "—"}
                  </span>
                  <br />
                  <br />
                  <span className="font-bold">የመኖሪያ አድራሻ፡ ክልል፡ </span>
                  <span className="font-semibold text-slate-900 border-b border-dotted border-slate-800 px-2 min-w-[80px] inline-block bg-slate-50/70">
                    {leaseRequest.landlordCity || "አዲስ አበባ"}
                  </span>
                  <span className="font-bold ml-2">ከተማ፡ </span>
                  <span className="font-semibold text-slate-900 border-b border-dotted border-slate-800 px-2 min-w-[80px] inline-block bg-slate-50/70">
                    {leaseRequest.landlordCity || "አዲስ አበባ"}
                  </span>
                  <span className="font-bold ml-2">ክፍለ ከተማ፡ </span>
                  <span className="font-semibold text-slate-900 border-b border-dotted border-slate-800 px-2 min-w-[80px] inline-block bg-slate-50/70">
                    {leaseRequest.landlordSubCity || "—"}
                  </span>
                  <span className="font-bold ml-2">ወረዳ/ቀበሌ፡ </span>
                  <span className="font-semibold text-slate-900 border-b border-dotted border-slate-800 px-2 min-w-[60px] inline-block bg-slate-50/70">
                    {leaseRequest.landlordWoreda || "—"}
                  </span>
                  <span className="font-bold ml-2">ስልክ ቁጥር፡ </span>
                  <span className="font-semibold text-slate-900 border-b border-dotted border-slate-800 px-2 min-w-[100px] inline-block bg-slate-50/70">
                    {leaseRequest.landlordPhone || "—"}
                  </span>
                  <span className="font-bold ml-2">ኢሜይል፡ </span>
                  <span className="font-semibold text-slate-900 border-b border-dotted border-slate-800 px-2 min-w-[130px] inline-block bg-slate-50/70">
                    {leaseRequest.landlordEmail || "—"}
                  </span>
                </p>
              </div>

              {/* 2. Tenant Information */}
              <div className="space-y-1 text-justify pt-1">
                <p>
                  <span className="font-bold text-slate-950">2. የተከራይ ስም ከነአያት (Tenant Full Name): </span>
                  <span className="font-bold text-slate-950 border-b border-dotted border-slate-800 px-2 min-w-[160px] inline-block bg-slate-50/70">
                    {leaseRequest.applicantName || "—"}
                  </span>
                  <br />
                  <br />
                  <span className="font-bold">የመኖሪያ አድራሻ፡ ክልል፡ </span>
                  <span className="font-semibold text-slate-900 border-b border-dotted border-slate-800 px-2 min-w-[80px] inline-block bg-slate-50/70">
                    {leaseRequest.applicantCity || "አዲስ አበባ"}
                  </span>
                  <span className="font-bold ml-2">ከተማ፡ </span>
                  <span className="font-semibold text-slate-900 border-b border-dotted border-slate-800 px-2 min-w-[80px] inline-block bg-slate-50/70">
                    {leaseRequest.applicantCity || "አዲስ አበባ"}
                  </span>
                  <span className="font-bold ml-2">ክፍለ ከተማ፡ </span>
                  <span className="font-semibold text-slate-900 border-b border-dotted border-slate-800 px-2 min-w-[80px] inline-block bg-slate-50/70">
                    {leaseRequest.applicantSubCity || "—"}
                  </span>
                  <span className="font-bold ml-2">ወረዳ/ቀበሌ፡ </span>
                  <span className="font-semibold text-slate-900 border-b border-dotted border-slate-800 px-2 min-w-[60px] inline-block bg-slate-50/70">
                    {leaseRequest.applicantWoreda || "—"}
                  </span>
                  <span className="font-bold ml-2">ስልክ ቁጥር፡ </span>
                  <span className="font-semibold text-slate-900 border-b border-dotted border-slate-800 px-2 min-w-[100px] inline-block bg-slate-50/70">
                    {leaseRequest.applicantPhone || "—"}
                  </span>
                  <span className="font-bold ml-2">ኢሜይል፡ </span>
                  <span className="font-semibold text-slate-900 border-b border-dotted border-slate-800 px-2 min-w-[130px] inline-block bg-slate-50/70">
                    {leaseRequest.applicantEmail || "—"}
                  </span>
                </p>
              </div>

              {/* 3. Property to Rent */}
              <div className="space-y-1 text-justify pt-1">
                <p>
                  <span className="font-bold text-slate-950">3. የሚከራየው መኖሪያ ቤት አድራሻ (Leased Property Address): </span>
                  <br />
                  <br />
                  <span className="font-bold">የቤቱ ስም/መለያ፡ </span>
                  <span className="font-semibold text-slate-900 border-b border-dotted border-slate-800 px-2 min-w-[140px] inline-block bg-slate-50/70">
                    {leaseRequest.propertyTitle} ({leaseRequest.propertyCode})
                  </span>
                  <span className="font-bold ml-2">ክልል፡ </span>
                  <span className="font-semibold text-slate-900 border-b border-dotted border-slate-800 px-2 min-w-[70px] inline-block bg-slate-50/70">
                    አዲስ አበባ
                  </span>
                  <span className="font-bold ml-2">ክፍለ ከተማ፡ </span>
                  <span className="font-semibold text-slate-900 border-b border-dotted border-slate-800 px-2 min-w-[80px] inline-block bg-slate-50/70">
                    {leaseRequest.propertySubCity || "—"}
                  </span>
                  <span className="font-bold ml-2">ወረዳ፡ </span>
                  <span className="font-semibold text-slate-900 border-b border-dotted border-slate-800 px-2 min-w-[60px] inline-block bg-slate-50/70">
                    {leaseRequest.propertyWoreda || "—"}
                  </span>
                  <span className="font-bold ml-2">የክፍል/ቤት ቁጥር (Unit Code): </span>
                  <span className="font-semibold text-slate-900 border-b border-dotted border-slate-800 px-2 min-w-[60px] inline-block bg-slate-50/70">
                    {leaseRequest.unitCode || "ዋናው ግቢ"}
                  </span>
                  <br />
                  <span className="font-bold">የባለቤትነቱ ይዞታ፡ </span>
                  <span className="font-semibold text-slate-900 border-b border-dotted border-slate-800 px-2 min-w-[120px] inline-block bg-slate-50/70">
                    የግል ይዞታ ለመኖሪያ ቤት አገልግሎት የሚውል
                  </span>
                </p>
              </div>

              {/* 4. Rental Conditions */}
              <div className="space-y-1.5 pt-1 text-justify">
                <p className="font-bold text-slate-950">4. የኪራይ ሁኔታ (Rental Conditions):</p>
                <p className="pl-3">
                  1) የኪራይ ቤቱ ሁኔታ፡{" "}
                  <span className="font-bold text-slate-900 border-b border-dotted border-slate-800 px-2 inline-block bg-slate-50/70">
                    ነባር የኪራይ መኖሪያ ቤት
                  </span>{" "}
                  <span className="text-slate-500 text-[11px]">
                    (በመኖሪያ ቤት ኪራይ ቁጥጥርና አስተዳደር አዋጅ ቁጥር 1320/2016 መሰረት)
                  </span>
                </p>
                <p className="pl-3">
                  2) አከራይ ከላይ የተጠቀሰውን መኖሪያ ቤት በወር ብር{" "}
                  <span className="font-extrabold text-[#00450d] border-b border-dotted border-slate-800 px-2 inline-block bg-slate-50/70 text-sm">
                    {monthlyRentFormatted} ETB
                  </span>{" "}
                  <span className="text-slate-500 text-[11px]">
                    (የመኖሪያ ቤት ኪራይ የውል ዘመን ከሁለት ዓመት ሊያንስ አይችልም)
                  </span>{" "}
                  ለተከራይ ለማከራየት ተከራይም መኖሪያ ቤቱን በዚህ ዋጋ ለመከራየት በመስማማት ይህንን የመኖሪያ ቤት ኪራይ ውል ስምምነት ተዋውለዋል።
                </p>
                <p className="pl-3">
                  3) ይህ የመኖሪያ ቤት ኪራይ ውል የኪራይ ውሉ ዘመን ሲያበቃ በአከራይና ተከራይ ስምምነት በጽሁፍ ሊታደስ ይችላል።
                </p>
                <p className="pl-3">
                  4) የውሃ፣ የስልክ፣ የመብራት፣ የጥበቃ፣ የፅዳት ወይም ሌሎች መሰል አገልግሎቶች ክፍያ የሚከፈለው{" "}
                  <span className="font-bold text-slate-900 border-b border-dotted border-slate-800 px-2 inline-block bg-slate-50/70">
                    በተከራይ
                  </span>{" "}
                  ይሆናል።
                </p>
              </div>

              {/* 5. Landlord Obligations */}
              <div className="space-y-1.5 pt-1 text-justify">
                <p className="font-bold text-slate-950">5. የአከራይ ግዴታዎች (Landlord Statutory Obligations):</p>
                <p className="pl-3">
                  1) አከራይ በውል ስምምነቱ ላይ ከተመለከተው የመኖሪያ ቤቱ ኪራይ ዋጋ ጭማሪ ማድረግ የሚችለው በመኖሪያ ቤት ኪራይ ቁጥጥር እና አስተዳደር አዋጅ ቁጥር 1320/2016 መሰረት ተቆጣጣሪው አካል በየዓመቱ የሚያደርገውን የመኖሪያ ቤት ኪራይ ዋጋ ማሻሻያ መሰረት በማድረግ ብቻ ይሆናል።
                </p>
                <p className="pl-3">
                  2) አከራይ በተቆጣጣሪው አካል የተደረገውን የመኖሪያ ቤት ኪራይ ዋጋ ማሻሻያ መሰረት በማድረግ የውል ዘመኑ ባላለቀ የመኖሪያ ቤት ኪራይ ዋጋ ላይ ጭማሪ ያደረገ እንደሆነ የተደረገውን የመኖሪያ ቤት ኪራይ ዋጋ ማሻሻያ ለተከራይ እና ለተቆጣጣሪው አካል በጽሁፍ ማሳወቅ አለበት።
                </p>
              </div>

              {/* 6. Tenant Obligations */}
              <div className="space-y-1.5 pt-1 text-justify">
                <p className="font-bold text-slate-950">6. የተከራይ ግዴታዎች (Tenant Statutory Obligations):</p>
                <p className="pl-3">
                  1) የመኖሪያ ቤቱን ሲከራይ የሁለት ወር ቅድሚያ ክፍያ ብር{" "}
                  <span className="font-bold text-slate-900 border-b border-dotted border-slate-800 px-2 inline-block bg-slate-50/70">
                    {advanceDepositFormatted} ETB
                  </span>{" "}
                  ለአከራይ ከፍያለሁ። ከዚህ በኋላ ያለው አከፋፈል ቅድሚያ የሚከፈል ሆኖ ወርኃዊ ክፍያ በየወሩ ወር በገባ እስከ{" "}
                  <span className="font-bold text-slate-900 border-b border-dotted border-slate-800 px-2 inline-block bg-slate-50/70">
                    5
                  </span>{" "}
                  ቀን ለመክፈል ተስማምቻለሁ።
                </p>
              </div>
            </div>

            {/* Certified Digital Signatures & Cryptographic Stamps */}
            <div className="pt-6 border-t border-slate-200">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#00450d]" />
                CERTIFIED DIGITAL SIGNATURES & CRYPTOGRAPHIC SEALS
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Landlord Stamp */}
                <div className={`border rounded-xl p-4 space-y-1.5 ${
                  leaseRequest.landlordSigned
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-dashed border-amber-300 bg-amber-50/40"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      LANDLORD SIGNATURE SEAL
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
                      Timestamp: {new Date(leaseRequest.landlordSignedAt).toLocaleString()} • OTP / Pass Verified
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
                      TENANT SIGNATURE SEAL
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
                      Timestamp: {new Date(leaseRequest.tenantSignedAt).toLocaleString()} • OTP / Pass Verified
                    </p>
                  ) : (
                    <p className="text-[10px] text-amber-800 font-medium">
                      Awaiting Tenant Signature
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 bg-white p-4 rounded-xl shadow-2xs">
        <Button
          variant="outline"
          onClick={() => router.push("/officer/office/agreements")}
          className="h-10 text-xs font-semibold"
        >
          Cancel
        </Button>
        {leaseRequest.status === "UNDER_VERIFICATION" && (
          <Button
            onClick={handleVerify}
            disabled={isVerifying || !leaseRequest.landlordSigned || !leaseRequest.tenantSigned}
            className="h-10 text-xs font-semibold bg-[#00450d] hover:bg-[#1b5e20] text-white gap-2 px-5"
          >
            <Check className="w-4 h-4" />
            {isVerifying ? "Verifying..." : "Verify & Forward to Supervisor"}
          </Button>
        )}
        {leaseRequest.status === "PENDING_SUPERVISOR_APPROVAL" && (
          <Button
            onClick={handleApprove}
            disabled={isVerifying}
            className="h-10 text-xs font-semibold bg-[#00450d] hover:bg-[#1b5e20] text-white gap-2 px-5"
          >
            <Check className="w-4 h-4" />
            {isVerifying ? "Approving..." : "Approve Agreement"}
          </Button>
        )}
      </div>
    </div>
  );
}
