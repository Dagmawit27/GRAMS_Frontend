"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { getAgreementByRequestCode, getSession, AgreementResponse } from "@/lib/api";
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  ArrowLeft,
  User,
  Building,
  ShieldCheck,
  Award,
  Calendar,
  DollarSign,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ActiveAgreementDetailViewProps {
  backPath: string;
}

export const ActiveAgreementDetailView: React.FC<ActiveAgreementDetailViewProps> = ({
  backPath,
}) => {
  const router = useRouter();
  const params = useParams();
  const requestCode = params.id as string;
  const printRef = useRef<HTMLDivElement>(null);

  const [agreement, setAgreement] = useState<AgreementResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        const session = getSession();
        if (!session?.token) {
          setError("Authentication required.");
          return;
        }
        const data = await getAgreementByRequestCode(session.token, requestCode);
        setAgreement(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load agreement.");
      } finally {
        setIsLoading(false);
      }
    };

    if (requestCode) {
      fetchAgreement();
    }
  }, [requestCode]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !agreement) {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-white border border-slate-200 rounded-xl p-8 text-center shadow-clean">
        <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Agreement Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">
          {error || "The requested active agreement could not be located in the repository."}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(backPath)}
          className="mt-4 gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Active Agreements</span>
        </Button>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-GB");
  const contractDateStr = agreement.contractDate
    ? new Date(agreement.contractDate).toLocaleDateString("en-GB")
    : agreement.createdAt
    ? new Date(agreement.createdAt).toLocaleDateString("en-GB")
    : today;

  const advMonths = agreement.advancePaymentMonths || 2;
  const rentVal = agreement.monthlyRent || 0;
  const advancePaymentBirr = (rentVal * advMonths).toLocaleString();

  return (
    <div className="w-full min-h-screen bg-[#f1f5f9] text-slate-900 pb-16 font-sans">
      {/* Top Header & Toolbar */}
      <div className="print:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(backPath)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  የመኖሪያ ቤት የአከራይ ተከራይ ሞዴል ውል ስምምነት
                </h1>
                <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  ACTIVE & REGISTERED
                </Badge>
                <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-bold">
                  READ ONLY
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                Agreement #{agreement.agreementNumber || `AGR-${agreement.requestCode}`} • Ref: {agreement.requestCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-8 px-3 font-bold cursor-pointer gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Read-only Agreement Form */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div
          ref={printRef}
          className="bg-white text-[#111827] shadow-xl rounded-xl sm:rounded-2xl border border-slate-300/80 p-6 sm:p-10 lg:p-12 relative overflow-hidden print:shadow-none print:border-none print:p-8 print:m-0 print:rounded-none"
        >
          {/* Header with National Seals */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="w-14 h-14 rounded-full border-2 border-slate-800 p-0.5 flex items-center justify-center bg-slate-50 shrink-0">
                <div className="w-full h-full rounded-full border border-slate-400 flex flex-col items-center justify-center text-center p-0.5">
                  <span className="text-[7px] font-bold text-slate-800 leading-none">አ.አ ከተማ</span>
                </div>
              </div>

              <div className="text-center flex-1">
                <h2 className="text-sm sm:text-base md:text-lg font-black text-slate-950">
                  በአዲስ አበባ ከተማ አስተዳደር የቤቶች ልማትና አስተዳደር ቢሮ
                </h2>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                  የመኖሪያ ቤት የአከራይ ተከራይ ሞዴል ውል ስምምነት (Official Registered Lease Form)
                </h3>
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  የውል ቁጥር (Agreement No): <span className="font-bold text-slate-900">{agreement.agreementNumber || agreement.requestCode}</span>
                </p>
              </div>

              <div className="w-14 h-14 rounded-full border-2 border-slate-800 p-0.5 flex items-center justify-center bg-slate-50 shrink-0">
                <Building className="w-6 h-6 text-slate-900" />
              </div>
            </div>
          </div>

          {/* Contract Metadata Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200 mb-6 text-xs">
            <div>
              <span className="text-slate-500 block">የውል ቀን (Date):</span>
              <span className="font-bold text-slate-900">{contractDateStr}</span>
            </div>
            <div>
              <span className="text-slate-500 block">የውል ቆይታ (Duration):</span>
              <span className="font-bold text-slate-900">{agreement.leaseDurationMonths || 12} ወራት (Months)</span>
            </div>
            <div>
              <span className="text-slate-500 block">ወርሃዊ ኪራይ (Rent):</span>
              <span className="font-bold text-emerald-800">{agreement.monthlyRent?.toLocaleString() ?? 0} ETB</span>
            </div>
            <div>
              <span className="text-slate-500 block">የውል ሁኔታ (Status):</span>
              <span className="font-bold text-emerald-700 uppercase">{agreement.status || "ACTIVE"}</span>
            </div>
          </div>

          {/* Section 1: Parties Information */}
          <div className="mb-6">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
              1. የውል ሰጪ እና የውል ተቀባይ መረጃ (Contracting Parties Information)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Landlord Box */}
              <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs mb-2">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>አከራይ (Landlord)</span>
                </div>
                <div><span className="text-slate-500">ስም (Full Name):</span> <span className="font-semibold text-slate-900">{agreement.landlordName || "N/A"}</span></div>
                <div><span className="text-slate-500">ስልክ ቁጥር (Phone):</span> <span className="font-mono font-medium">{agreement.landlordPhone || "N/A"}</span></div>
                <div><span className="text-slate-500">ኢሜይል (Email):</span> <span className="font-mono font-medium">{agreement.landlordEmail || "N/A"}</span></div>
                <div><span className="text-slate-500">ክፍለ ከተማ / ወረዳ:</span> <span className="font-medium">{agreement.landlordSubCity || "አዲስ አበባ"} {agreement.landlordWoreda ? `/ ወረዳ ${agreement.landlordWoreda}` : ""}</span></div>
              </div>

              {/* Tenant Box */}
              <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs mb-2">
                  <User className="w-3.5 h-3.5 text-blue-700" />
                  <span>ተከራይ (Tenant)</span>
                </div>
                <div><span className="text-slate-500">ስም (Full Name):</span> <span className="font-semibold text-slate-900">{agreement.tenantName || "N/A"}</span></div>
                <div><span className="text-slate-500">ስልክ ቁጥር (Phone):</span> <span className="font-mono font-medium">{agreement.tenantPhone || "N/A"}</span></div>
                <div><span className="text-slate-500">ኢሜይል (Email):</span> <span className="font-mono font-medium">{agreement.tenantEmail || "N/A"}</span></div>
                <div><span className="text-slate-500">ክፍለ ከተማ / ወረዳ:</span> <span className="font-medium">{agreement.tenantSubCity || "አዲስ አበባ"} {agreement.tenantWoreda ? `/ ወረዳ ${agreement.tenantWoreda}` : ""}</span></div>
              </div>
            </div>
          </div>

          {/* Section 2: Property Information */}
          <div className="mb-6">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
              2. የኪራይ ቤቱ መረጃ (Rented Property Details)
            </h4>
            <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">የቤቱ ስም / ርዕስ:</span>
                <span className="font-semibold text-slate-900">{agreement.propertyTitle || "Residential Property"}</span>
              </div>
              <div>
                <span className="text-slate-500 block">የቤት መለያ ኮድ:</span>
                <span className="font-mono font-bold text-slate-900">{agreement.propertyCode || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-500 block">ክፍለ ከተማ / ወረዳ:</span>
                <span className="font-medium text-slate-900">
                  {agreement.propertySubCity || "አዲስ አበባ"} {agreement.propertyWoreda ? `/ ወረዳ ${agreement.propertyWoreda}` : ""}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">የክፍል/ቤት ቁጥር (Unit):</span>
                <span className="font-medium text-slate-900">{agreement.unitNumber || agreement.unitCode || "Main Property"}</span>
              </div>
              <div>
                <span className="text-slate-500 block">የቤት ዓይነት (Ownership):</span>
                <span className="font-medium text-slate-900">{agreement.propertyOwnershipType || "የራሱን የቻለ ግቢ"}</span>
              </div>
              <div>
                <span className="text-slate-500 block">የቤቱ ሁኔታ (Condition):</span>
                <span className="font-medium text-slate-900">{agreement.propertyCondition || "ነባር የኪራይ መኖሪያ ቤት"}</span>
              </div>
              <div>
                <span className="text-slate-500 block">መገልገያ ክፍያዎች (Utilities):</span>
                <span className="font-medium text-slate-900">{agreement.utilitiesPaidBy || "ተከራይ"}</span>
              </div>
              <div>
                <span className="text-slate-500 block">ወርሃዊ ክፍያ ቀን (Due Day):</span>
                <span className="font-bold text-slate-900">በየወሩ {agreement.monthlyPaymentDueDay || 5} ኛ ቀን</span>
              </div>
            </div>
          </div>

          {/* Section 3: Financial Terms */}
          <div className="mb-6">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
              3. የክፍያ እና የውል ሁኔታዎች (Financial Terms & Conditions)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
                <span className="text-emerald-700 block font-medium">ወርሃዊ የኪራይ መጠን (Monthly Rent):</span>
                <span className="text-base font-black text-emerald-950 mt-1 block">
                  {rentVal.toLocaleString()} ETB
                </span>
              </div>
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200">
                <span className="text-blue-700 block font-medium">የቅድመ ክፍያ ወራት (Advance Months):</span>
                <span className="text-base font-black text-blue-950 mt-1 block">
                  {advMonths} ወራት ({advancePaymentBirr} ETB)
                </span>
              </div>
              <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200">
                <span className="text-amber-700 block font-medium">ጠቅላላ የቅድመ ክፍያ (Total Advance Rent):</span>
                <span className="text-base font-black text-amber-950 mt-1 block">
                  {advancePaymentBirr} ETB
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Digital Signatures & Government Verification Seals */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
              4. ዲጂታል ፊርማ እና የመንግስት ማረጋገጫ ማህተም (Digital Signatures & Government Seals)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {/* Landlord Signature */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <span className="font-bold text-slate-800 block text-[11px] mb-1">የአከራይ ፊርማ (Landlord)</span>
                <div className="my-2 py-1 bg-white border border-emerald-200 rounded font-serif italic text-emerald-800 font-bold">
                  {agreement.landlordSignature || "DIGITALLY SIGNED"}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  {agreement.landlordSignedAt
                    ? new Date(agreement.landlordSignedAt).toLocaleDateString("en-GB")
                    : contractDateStr}
                </span>
              </div>

              {/* Tenant Signature */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <span className="font-bold text-slate-800 block text-[11px] mb-1">የተከራይ ፊርማ (Tenant)</span>
                <div className="my-2 py-1 bg-white border border-blue-200 rounded font-serif italic text-blue-800 font-bold">
                  {agreement.tenantSignature || "DIGITALLY SIGNED"}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  {agreement.tenantSignedAt
                    ? new Date(agreement.tenantSignedAt).toLocaleDateString("en-GB")
                    : contractDateStr}
                </span>
              </div>

              {/* Officer Verification */}
              <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-200 text-center">
                <span className="font-bold text-blue-900 block text-[11px] mb-1">የወረዳ ባለሙያ ማረጋገጫ</span>
                <div className="my-2 py-1 bg-white border border-blue-300 rounded text-[11px] font-bold text-blue-800 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>VERIFIED</span>
                </div>
                <span className="text-[10px] text-slate-500 block">
                  {agreement.officerVerifiedAt
                    ? new Date(agreement.officerVerifiedAt).toLocaleDateString("en-GB")
                    : contractDateStr}
                </span>
              </div>

              {/* Supervisor Approval & Seal */}
              <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200 text-center">
                <span className="font-bold text-emerald-900 block text-[11px] mb-1">የወረዳ ኃላፊ ማጽደቂያ ማህተም</span>
                <div className="my-2 py-1 bg-white border border-emerald-300 rounded text-[11px] font-bold text-emerald-800 flex items-center justify-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>APPROVED & SEALED</span>
                </div>
                <span className="text-[10px] text-slate-500 block font-mono">
                  {agreement.supervisorApprovedAt
                    ? new Date(agreement.supervisorApprovedAt).toLocaleDateString("en-GB")
                    : contractDateStr}
                </span>
              </div>
            </div>
          </div>

          {/* Legal Compliance Footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-[11px] text-slate-500 leading-relaxed text-center">
            ይህ የኪራይ ውል ስምምነት በአዲስ አበባ ከተማ አስተዳደር ህግ እና የኪራይ ቁጥጥር ደንብ መሰረት የተረጋገጠ እና በብሔራዊ የኪራይ ማከማቻ የተመዘገበ ህጋዊ ሰነድ ነው።
            <br />
            Official Certified Agreement • Registered by Addis Ababa Rental Administration System
          </div>
        </div>
      </main>
    </div>
  );
};
