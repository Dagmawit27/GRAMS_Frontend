"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { LeaseRequestResponse, getLeaseRequestById, getSession, signAgreementWithOtp, signAgreementWithPassword } from "@/lib/api";
import { useCitizenData } from "@/hooks/useCitizenData";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FileCheck,
  PenTool,
} from "lucide-react";


interface ContractFormData {
  contractDate: string;
  contractNumber: string;
  // 1. Landlord
  landlordName: string;
  landlordSubCity: string;
  landlordWoreda: string;
  landlordHouseNo: string;
  landlordPhone: string;
  landlordRegion: string;
  landlordCity: string;
  landlordSpecificPlace: string;

  // 2. Tenant
  tenantName: string;
  tenantSubCity: string;
  tenantWoreda: string;
  tenantHouseNo: string;
  tenantPhone: string;
  tenantRegion: string;
  tenantCity: string;
  tenantSpecificPlace: string;

  // 3. Property to Rent
  propertyRegion: string;
  propertyCity: string;
  propertySubCity: string;
  propertyWoreda: string;
  propertySpecificPlace: string;
  propertyHouseNo: string;
  propertyOwnershipType: "የራሱን የቻለ ግቢ" | "ክፍለ ቤት" | "ኮንዶሚኒየም" | "አፓርትመንት";

  // 4. Rental Conditions
  propertyCondition: "ነባር የኪራይ መኖሪያ ቤት" | "አዲስ የተገነባ የኪራይ መኖሪያ ቤት" | "ነባር ተከራይቶ የማያውቅ የኪራይ መኖሪያ ቤት";
  monthlyRentInBirr: string;
  utilitiesPaidBy: "ተከራይ" | "አከራይ" | "አከራይና ተከራይ በጋራ";

  // 5 & 6. Payment & Obligations
  advancePaymentMonths: string;
  advancePaymentBirr: string;
  advancePaymentWords: string;
  monthlyPaymentDueDay: string;

  // Signatures
  landlordSignature: string;
  landlordSignDate: string;
  tenantSignature: string;
  tenantSignDate: string;
  officerName: string;
  officerSignature: string;
  officerSignDate: string;
}

export default function TenantSigningPage() {
  const router = useRouter();
  const params = useParams();
  const requestCode = params.id as string;
  const { userRole, userEmail } = useCitizenData();

  const [leaseRequest, setLeaseRequest] = useState<LeaseRequestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [signInput, setSignInput] = useState("");
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signMethod, setSignMethod] = useState<"password" | "otp">("password");
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSigningLoading, setIsSigningLoading] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [formData, setFormData] = useState<ContractFormData>();

  // Determine if current user is landlord or tenant
  const isLandlord = userRole === "landlord" || (userRole === "citizen" && userEmail === leaseRequest?.landlordEmail);
  const isTenant = userRole === "tenant" || (userRole === "citizen" && userEmail === leaseRequest?.applicantEmail);

  // Redirect landlord to pending page (including citizens who are landlords)
  useEffect(() => {
    if (leaseRequest && isLandlord && !isTenant) {
      router.push(`/citizen/dashboard/agreements/pending/${requestCode}`);
    }
  }, [leaseRequest, isLandlord, isTenant, requestCode, router]);

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

         
        // Populate form with dynamic data
        const today = new Date().toLocaleDateString("en-GB");
        setFormData({
          contractDate: today,
          contractNumber: data.requestCode,
          landlordName: data.landlordName || "",
          landlordSubCity: data.landlordSubCity || "", // Will be filled from landlord profile if available
          landlordWoreda: data.landlordWoreda || "",
          landlordHouseNo: "",
          landlordPhone: data.landlordPhone || "",
          landlordRegion: " አበባ",
          landlordCity: data.landlordCity || "",
          landlordSpecificPlace: "",
          
          tenantName: data.applicantName || "",
          tenantSubCity: data.applicantSubCity || "",
          tenantWoreda: data.applicantWoreda || "",
          tenantHouseNo: "",
          tenantPhone: data.applicantPhone || "",
          tenantRegion: "አዲስ አበባ",
          tenantCity: data.applicantCity || "",
          tenantSpecificPlace: "",
          
          propertyRegion: "አዲስ አበባ",
          propertyCity: "አዲስ አበባ",
          propertySubCity: data.propertySubCity || "", // Will be filled from property location
          propertyWoreda: data.propertyWoreda || "",
          propertySpecificPlace: "",
          propertyHouseNo: data.unitCode || "",
          propertyOwnershipType: "የራሱን የቻለ ግቢ",
          
          propertyCondition: "ነባር የኪራይ መኖሪያ ቤት",
          monthlyRentInBirr: data.proposedRent.toLocaleString(),
          utilitiesPaidBy: "ተከራይ",
          
          advancePaymentMonths: "ሁለት",
          advancePaymentBirr: (data.proposedRent * 2).toLocaleString(),
          advancePaymentWords: "",
          monthlyPaymentDueDay: "5",
          
          landlordSignature: data.landlordSigned ? "Signed" : "",
          landlordSignDate: data.landlordSignedAt ? new Date(data.landlordSignedAt).toLocaleDateString("en-GB") : today,
          tenantSignature: data.tenantSigned ? "Signed" : "",
          tenantSignDate: data.tenantSignedAt ? new Date(data.tenantSignedAt).toLocaleDateString("en-GB") : today,
          officerName: "",
          officerSignature: data.supervisorSigned ? "Signed" : "",
          officerSignDate: data.supervisorSignedAt ? new Date(data.supervisorSignedAt).toLocaleDateString("en-GB") : today
        });
        setHasSigned(data.tenantSigned || false);
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

  // SSE listener for real-time updates when agreement is signed
  useEffect(() => {
    const session = getSession();
    if (!session?.token || !userEmail) return;

    const userId = userEmail;
    console.log("Lease-signing page: Using global SSE manager for userId:", userId);

    // Use global SSE manager
    const { sseManager } = require('@/lib/sseManager');
    sseManager.connect(userId);

    // Listen for notifications
    const unsubscribe = sseManager.onNotification((notification: any) => {
      console.log("Lease-signing page: Received SSE notification:", notification);
      console.log("Lease-signing page: Notification type:", notification.type);
      
      // If notification is about lease signing, reload
      if (notification.type === 'LEASE_REQUEST_SIGNED' || notification.type === 'AGREEMENT_SIGNED') {
        console.log("Lease-signing page: Agreement signed, reloading lease request...");
        setTimeout(() => {
          const session = getSession();
          if (session?.token) {
            getLeaseRequestById(session.token, requestCode)
              .then((data) => {
                console.log("Lease-signing page: Reloaded lease request data:", data);
                console.log("Lease-signing page: Landlord signed:", data.landlordSigned);
                console.log("Lease-signing page: Tenant signed:", data.tenantSigned);
                setLeaseRequest(data);
                // Update form data with new signing status
                const today = new Date().toLocaleDateString("en-GB");
                setFormData(prev => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    landlordSignature: data.landlordSigned ? "Signed" : "",
                    landlordSignDate: data.landlordSignedAt ? new Date(data.landlordSignedAt).toLocaleDateString("en-GB") : today,
                    tenantSignature: data.tenantSigned ? "Signed" : "",
                    tenantSignDate: data.tenantSignedAt ? new Date(data.tenantSignedAt).toLocaleDateString("en-GB") : today,
                    officerSignature: data.supervisorSigned ? "Signed" : "",
                    officerSignDate: data.supervisorSignedAt ? new Date(data.supervisorSignedAt).toLocaleDateString("en-GB") : today
                  };
                });
                setHasSigned(data.tenantSigned || false);
                console.log("Lease-signing page: Updated hasSigned:", data.tenantSigned);
              })
              .catch((err) => {
                console.error("Failed to reload lease request:", err);
              });
          }
        }, 500);
      }
    });

    return () => {
      console.log("Lease-signing page: Cleaning up SSE listener");
      unsubscribe();
    };
  }, [requestCode, userEmail]);

  
  const showToast = (type: 'success' | 'error', msg: string) => {
    setToastMessage({ type, message: msg });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBack = () => {
    router.push("/citizen/dashboard/leases");
  };

  const handleExecuteSign = async () => {
    if (!agreeTerms || signInput.length < 4) return;
    setIsSigningLoading(true);

    try {
      const session = getSession();
      if (!session?.token) {
        showToast("error", "Authentication required");
        return;
      }

      if (signMethod === "password") {
        await signAgreementWithPassword(session.token, requestCode, signInput);
      } else {
        await signAgreementWithOtp(session.token, requestCode, signInput);
      }
      setIsSigningLoading(false);
      setHasSigned(true);
      setIsSignModalOpen(false);
      showToast("success", "Agreement signed successfully!");
      
      // Reload lease request to get updated status
      const data = await getLeaseRequestById(session.token, requestCode);
      setLeaseRequest(data);
    } catch (error) {
      setIsSigningLoading(false);
      showToast("error", error instanceof Error ? error.message : "Failed to sign agreement");
    }
  };

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
        <Button
          variant="outline"
          onClick={handleBack}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }

  const canViewAgreement =
    leaseRequest.status === "LANDLORD_APPROVED" ||
    leaseRequest.status === "UNDER_VERIFICATION" ||
    leaseRequest.status === "PENDING_SUPERVISOR_APPROVAL" ||
    leaseRequest.status === "SUPERVISOR_APPROVED";

  if (!canViewAgreement) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
        <p className="text-amber-800 text-sm">This lease request is not yet approved for signing.</p>
        <Button
          variant="outline"
          onClick={handleBack}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && toastMessage.type === "success" && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-right duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}

      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/citizen/dashboard/leases"
            className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-[#00450d] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>MY LEASES</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-mono font-bold text-slate-800">
            {formData?.contractNumber || leaseRequest?.requestCode || "DIGITAL SIGNING"}
          </span>
        </div>
      </div>

      

      {/* Formal Agreement Document Card */}
      <Card className="bg-white border-slate-200 shadow-clean overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-700" />
            <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Digital Signature Required
            </CardTitle>
              <Badge
                variant={hasSigned ? "verified" : "pending"}
                className="text-xs px-2.5 py-0.5 uppercase tracking-wider font-semibold"
              >
                {hasSigned ? "Agreement Signed" : "Pending Signature"}
              </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/citizen/dashboard/agreements/lease-signing/${leaseRequest.requestCode}/property-detail`)}
            className="text-xs h-8 gap-1.5 text-slate-700 hover:text-[#00450d] hover:bg-slate-50 transition-colors"
          >
            <span>Property details</span>
          </Button>
        </CardHeader>

        <CardContent className="p-5 sm:p-8 bg-slate-50/50">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 max-w-4xl mx-auto shadow-xs space-y-6 text-xs text-slate-800 leading-relaxed font-sans">
            {/* Header & Seal */}
            <div className="text-center pb-4 border-b border-slate-200 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA
              </p>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                GOVERNMENT RENTAL ADMINISTRATION & MONITORING SYSTEM (GRAMS)
              </h3>
              <p className="text-xs font-semibold text-emerald-800">
                STATUTORY DIGITAL LEASE CONTRACT — REGISTRATION REF: #{leaseRequest.requestCode}
              </p>
            </div>

           

            {/* Terms and conditions text */}
            <div className="space-y-3.5 text-xs text-slate-700">
              {/* 1. Landlord */}
              <div className="space-y-1 text-justify">
                <p>
                  <span className="font-bold text-slate-950">1. የአከራይ ስም ከነአያት፡ </span>
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[140px] inline-block">
                    {formData?.landlordName}
                  </span>
                  <br />
                  <br />
                  <span className="font-bold">የመኖሪያ አድራሻ፡ ክልል፡ </span>
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[70px] inline-block">
                    {formData?.landlordCity}
                  </span>
                  <span className="font-bold ml-2">ከተማ፡ </span>
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[70px] inline-block">
                    {formData?.landlordSubCity}
                  </span>
                  <span className="font-bold ml-2">ወረዳ/ቀበሌ፡ </span>
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[60px] inline-block">
                    {formData?.landlordWoreda}
                  </span>
                  <span className="font-bold ml-2">ልዩ ቦታ፡ </span>
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[120px] inline-block">
                    {formData?.landlordSpecificPlace}
                  </span>
                  <span className="font-bold ml-2">የቤት ቁጥር፡ </span>
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[60px] inline-block">
                    {formData?.landlordHouseNo}
                  </span>
                  <span className="font-bold ml-2">ስልክ ቁጥር፡ </span>
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[100px] inline-block">
                    {formData?.landlordPhone}
                  </span>
                </p>
              </div>

              {/* 2. Tenant */}
              <div className="space-y-1 text-justify pt-1">
                <p>
                  <span className="font-bold text-slate-950">2. የተከራይ ስም ከነአያት፡ </span>
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[140px] inline-block">
                    {formData?.tenantName}
                  </span>
                  <br />
                  <br />
                  <span className="font-bold">የመኖሪያ አድራሻ፡ ክልል፡ </span>
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[70px] inline-block">
                    {formData?.tenantCity}
                  </span>
                  <span className="font-bold ml-2">ከተማ፡ </span>
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[70px] inline-block">
                    {formData?.tenantSubCity}
                  </span>
                  <span className="font-bold ml-2">ወረዳ/ቀበሌ፡ </span>
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[60px] inline-block">
                    {formData?.tenantWoreda}
                  </span>
                  <span className="font-bold ml-2">ልዩ ቦታ፡ </span>
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[120px] inline-block">
                    {formData?.tenantSpecificPlace}
                  </span>
                  <span className="font-bold ml-2">የቤት ቁጥር፡ </span>
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[60px] inline-block">
                    {formData?.tenantHouseNo}
                  </span>
                  <span className="font-bold ml-2">ስልክ ቁጥር፡ </span>
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[100px] inline-block">
                    {formData?.tenantPhone}
                  </span>
                </p>
              </div>

              {/* 3. Property to Rent */}
              <div className="space-y-1 text-justify pt-1">
                <p>
                  <span className="font-bold text-slate-950">3. የሚከራየው መኖሪያ ቤት አድራሻ፡ </span>
                  <br />
                  <br />
                  <span className="font-bold">ክልል፡ </span>
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[70px] inline-block">
                    {formData?.propertyCity}
                  </span>
                  <span className="font-bold ml-2">ከተማ፡ </span>
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[70px] inline-block">
                    {formData?.propertyCity}
                  </span>
                  <span className="font-bold ml-2">ክፍለ ከተማ፡ </span>
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[70px] inline-block">
                    {formData?.propertySubCity}
                  </span>
                  <span className="font-bold ml-2">ወረዳ/ቀበሌ፡ </span>
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[60px] inline-block">
                    {formData?.propertyWoreda}
                  </span>
                  <br />
                  <span className="font-bold">ልዩ ቦታ፡ </span>
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[140px] inline-block">
                    {formData?.propertySpecificPlace}
                  </span>
                  <span className="font-bold ml-2">የቤት ቁጥር፡ </span>
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[60px] inline-block">
                    {formData?.propertyHouseNo}
                  </span>
                  <span className="font-bold ml-2">የባለቤትነቱ የ</span>
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[120px] inline-block">
                    {formData?.propertyOwnershipType}
                  </span>
                  <span className="text-slate-700"> (የራሱን የቻለ ግቢ/ ክፍለ ቤት) </span>
                  <span>የሆነ ለመኖሪያ ቤት አገልግሎት የሚውል</span>
                </p>
              </div>

              {/* 4. Rental Conditions */}
              <div className="space-y-1.5 pt-1 text-justify">
                <p className="font-bold text-slate-950">4. የኪራይ ሁኔታ፡</p>
                <p className="pl-3">
                  1) የኪራይ ቤቱ ሁኔታ፡{" "}
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 inline-block">
                    {formData?.propertyCondition}
                  </span>{" "}
                  <span className="text-slate-700">
                    (ነባር የኪራይ መኖሪያ ቤት/ አዲስ የተገነባ የኪራይ መኖሪያ ቤት/ ነባር ተከራይቶ የማያውቅ የኪራይ መኖሪያ ቤት)
                  </span>
                </p>
                <p className="pl-3">
                  2) አከራይ ከላይ የተጠቀሰውን መኖሪያ ቤት በብር{" "}
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 inline-block">
                    {formData?.monthlyRentInBirr} 
                  </span>{" "}
                  <span className="text-slate-700">
                    (የመኖሪያ ቤት ኪራይ የውል ዘመን ከሁለት ዓመት ሊያንስ አይችልም)
                  </span>{" "}
                  ለተከራይ ለማከራየት ተከራይም መኖሪያ ቤቱን በዚህ ዋጋ ለመከራየት በመስማማት ይህንን የመኖሪያ ቤት ኪራይ ውል ስምምነት ተዋውለዋል።
                </p>
                <p className="pl-3">
                  3) ይህ የመኖሪያ ቤት ኪራይ ውል የኪራይ ውሉ ዘመን ሲያበቃ በአከራይና ተከራይ ስምምነት በጽሁፍ ሊታደስ ይችላል።
                </p>
                <p className="pl-3">
                  4) የውሃ፣ የስልክ፣ የመብራት፣ የጥበቃ፣ የፅዳት ወይም ሌሎች መሰል አገልግሎቶች ክፍያ የሚከፈለው{" "}
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 inline-block">
                    በ{formData?.utilitiesPaidBy} 
                    
                  </span>{" "}
                  ይሆናል (ተከራይ ወይም አከራይ ወይም አከራይና ተከራይ በጋራ)።
                </p>
              </div>

              {/* 5. Landlord Obligations */}
              <div className="space-y-1.5 pt-1 text-justify">
                <p className="font-bold text-slate-950">5. የአከራይ ግዴታዎች፡</p>
                <p className="pl-3">
                  1) አከራይ በውል ስምምነቱ ላይ ከተመለከተው የመኖሪያ ቤቱ ኪራይ ዋጋ ጭማሪ ማድረግ የሚችለው بالمኖሪያ ቤት ኪራይ ቁጥጥር እና አስተዳደር አዋጅ ቁጥር 1320/2016 መሰረት ተቆጣጣሪው አካል በየዓመቱ የሚያደርገውን የመኖሪያ ቤት ኪራይ ዋጋ ማሻሻያ መሰረት በማድረግ ብቻ ይሆናል።
                </p>
                <p className="pl-3">
                  2) አከራይ በተቆጣጣሪው አካል የተደረገውን የመኖሪያ ቤት ኪራይ ዋጋ ማሻሻያ መሰረት በማድረግ የውል ዘመኑ ባላለቀ የመኖሪያ ቤት ኪራይ ዋጋ ላይ ጭማሪ ያደረገ እንደሆነ የተደረገውን የመኖሪያ ቤት ኪራይ ዋጋ ማሻሻያ ለተከራይ እና ለተቆጣጣሪው አካል በጽሁፍ ማሳወቅ አለበት።
                </p>
              </div>

              {/* 6. Tenant Obligations (Begins on Page 1) */}
              <div className="space-y-1.5 pt-1 text-justify">
                <p className="font-bold text-slate-950">6. የተከራይ ግዴታዎች፡</p>
                <p className="pl-3">
                  1) የመኖሪያ ቤቱን ሲከራይ ቅድሚያ ክፍያ{" "}
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 inline-block">
                    {formData?.advancePaymentMonths}
                  </span>{" "}
                  ወር (የአንድ ወር / የሁለት ወር) የመኖሪያ ቤቱ ኪራይ ብር (
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 inline-block">
                    {formData?.advancePaymentBirr} - {formData?.advancePaymentWords}
                  </span>
                  ) በዛሬው ዕለት ለአከራይ ከፍያለሁ። ከዚህ በኋላ ያለው አከፋፈል ቅድሚያ የሚከፈል ሆኖ ወርኃዊ ክፍያ በየወሩ ወር በገባ እስከ{" "}
                  <span className="font-bold border-b border-dotted border-slate-800 px-2 inline-block">
                    {formData?.monthlyPaymentDueDay}
                  </span>{" "}
                  ቀን ለመክፈል ተስማምቻለሁ።
                </p>
              </div>
            </div>

            {/* Digital Signatures Box */}
            <div className="pt-6 border-t border-slate-200">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-3">
                CERTIFIED DIGITAL SIGNATURES & CRYPTOGRAPHIC SEALS
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Landlord Stamp */}
                <div className={`border rounded-xl p-3.5 space-y-1.5 transition-all ${
                  (leaseRequest.landlordSigned || (isLandlord && hasSigned))
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-dashed border-amber-300 bg-amber-50/40"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      LANDLORD SIGNATURE
                    </span>
                    <span className={`font-bold text-[9px] px-1.5 py-0.5 rounded ${
                      (leaseRequest.landlordSigned || (isLandlord && hasSigned))
                        ? "bg-emerald-200/80 text-emerald-900"
                        : "bg-amber-200 text-amber-900"
                    }`}>
                      {(leaseRequest.landlordSigned || (isLandlord && hasSigned)) ? "SEALED" : "PENDING"}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-xs">
                    {leaseRequest.landlordName}
                  </p>
                  {(leaseRequest.landlordSigned || (isLandlord && hasSigned)) ? (
                    <p className="text-[10px] text-slate-400">
                      OTP / Password Verified • Signed
                    </p>
                  ) : (
                    <p className="text-[10px] text-amber-800 font-medium">
                      Awaiting landlord signature to finalize the contract.
                    </p>
                  )}
                </div>

                {/* Tenant Stamp */}
                <div className={`border rounded-xl p-3.5 space-y-1.5 transition-all ${
                  (leaseRequest.tenantSigned || (isTenant && hasSigned))
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-dashed border-amber-300 bg-amber-50/40"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      TENANT SIGNATURE
                    </span>
                    <span className={`font-bold text-[9px] px-1.5 py-0.5 rounded ${
                      (leaseRequest.tenantSigned || (isTenant && hasSigned))
                        ? "bg-emerald-200/80 text-emerald-900"
                        : "bg-amber-200 text-amber-900"
                    }`}>
                      {(leaseRequest.tenantSigned || (isTenant && hasSigned)) ? "SEALED" : "PENDING"}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-xs">
                    {leaseRequest.applicantName}
                  </p>
                  {(leaseRequest.tenantSigned || (isTenant && hasSigned)) ? (
                    <p className="text-[10px] text-slate-400">
                      OTP / Password Verified • Signed
                    </p>
                  ) : (
                    <p className="text-[10px] text-amber-800 font-medium">
                      Awaiting your digital confirmation to finalize the contract.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sign Button - Only show if current user hasn't signed AND both parties haven't signed AND in signing stage */}
      {!(isTenant ? (leaseRequest.tenantSigned || hasSigned) : isLandlord ? (leaseRequest.landlordSigned || hasSigned) : hasSigned) && (leaseRequest.status === "LANDLORD_APPROVED" || leaseRequest.status === "UNDER_VERIFICATION") && !(leaseRequest.landlordSigned && leaseRequest.tenantSigned) && (
        <div className="flex justify-center">
          <Button
            onClick={() => setIsSignModalOpen(true)}
            className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs font-semibold h-10 px-6 gap-2 shadow-xs"
          >
            <PenTool className="w-4 h-4" />
            <span>Sign Agreement</span>
          </Button>
        </div>
      )}

      {/* Signature Modal */}
      {isSignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Sign Method Toggle */}
              <div className="flex gap-2 py-1.5 border-b border-slate-200">
                <Button
                  variant={signMethod === "password" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSignMethod("password")}
                  className="text-xs flex-1"
                >
                  Password
                </Button>
                <Button
                  variant={signMethod === "otp" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSignMethod("otp")}
                  className="text-xs flex-1"
                >
                  OTP
                </Button>
              </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              

              {toastMessage && toastMessage.type === "error" && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] p-2 rounded">
                  {toastMessage.message}
                </div>
              )}

             <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Enter {signMethod === "password" ? "Password" : "OTP Code"}
                </label>
                <Input
                  type={signMethod === "password" ? "password" : "text"}
                  maxLength={signMethod === "password" ? 50 : 6}
                  value={signInput}
                  onChange={(e) => setSignInput(e.target.value)}
                  placeholder={signMethod === "password" ? "Enter your password" : "Enter 6-digit OTP"}
                  className="h-10 text-center tracking-widest font-mono text-base"
                />
              </div>

              <label className="flex items-start gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-600">
                  I hereby confirm that I have read and agree to all terms in this digital tenancy agreement under Ethiopian law.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSignModalOpen(false)}
                className="text-xs h-9 text-slate-700"
              >
                Cancel
              </Button>
              <Button
                disabled={!agreeTerms || signInput.length < (signMethod === "otp" ? 4 : 1) || isSigningLoading}
                onClick={handleExecuteSign}
                className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-9 px-5 font-semibold gap-1.5"
              >
                {isSigningLoading ? (
                  <span>Verifying & Signing...</span>
                ) : (
                  <>
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Sign Agreement</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
