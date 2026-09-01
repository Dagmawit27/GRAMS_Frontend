"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  FileText,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  ArrowLeft,
  Edit3,
  Eye,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Building,
  User,
  Phone,
  MapPin,
  Calendar,
  Layers,
  Award,
  Stamp,
  PenTool,
  Check,
  Copy,
  Info,
  ZoomIn,
  ZoomOut,
  FileCheck2,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Maximize2,
  X,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSession, getAgreementByRequestCode } from "@/lib/api";
import { AgreementResponse } from "@/lib/api";

// Import generated realistic form document assets
import formPage1Img from "@/public/bg.png";
import formPage2Img from "@/public/bg.png";

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
  monthlyRentInWords: string;
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
  witness1Name: string;
  witness1Signature: string;
  witness1Date: string;
  witness2Name: string;
  witness2Signature: string;
  witness2Date: string;
}

const DEFAULT_FORM_DATA: ContractFormData = {
  contractDate: "18/06/2016",
  contractNumber: "AA-HD-2016-84920",
  landlordName: "አቶ በቀለ ታደሰ ገብሬ",
  landlordSubCity: "የካ",
  landlordWoreda: "04",
  landlordHouseNo: "412/ለ",
  landlordPhone: "+251 91 123 4567",
  landlordRegion: "አዲስ አበባ",
  landlordCity: "አዲስ አበባ",
  landlordSpecificPlace: "ኮተቤ መምህራን ኮሌጅ ጀርባ",

  tenantName: "ወ/ሮ ሰላማዊት አስፋው ተሾመ",
  tenantSubCity: "ቦሌ",
  tenantWoreda: "03",
  tenantHouseNo: "891",
  tenantPhone: "+251 92 345 6789",
  tenantRegion: "አዲስ አበባ",
  tenantCity: "አዲስ አበባ",
  tenantSpecificPlace: "ሩዋንዳ ኤምባሲ አካባቢ",

  propertyRegion: "አዲስ አበባ",
  propertyCity: "አዲስ አበባ",
  propertySubCity: "የካ",
  propertyWoreda: "04",
  propertySpecificPlace: "ኮተቤ 04 ቀበሌ አጠገብ",
  propertyHouseNo: "412/ለ",
  propertyOwnershipType: "የራሱን የቻለ ግቢ",

  propertyCondition: "ነባር የኪራይ መኖሪያ ቤት",
  monthlyRentInBirr: "25,000",
  monthlyRentInWords: "ሃያ አምስት ሺህ ብር",
  utilitiesPaidBy: "ተከራይ",

  advancePaymentMonths: "ሁለት",
  advancePaymentBirr: "50,000",
  advancePaymentWords: "ሃምሳ ሺህ ብር",
  monthlyPaymentDueDay: "5",

  landlordSignature: "Bekele Tadesse",
  landlordSignDate: "18/06/2016",
  tenantSignature: "Selamawit Asfaw",
  tenantSignDate: "18/06/2016",
  officerName: "ዳዊት መንግስቱ (WRD-OFF-402)",
  officerSignature: "Dawit M. (Verified)",
  officerSignDate: "19/06/2016",
  witness1Name: "አቶ ግርማ ወልዴ",
  witness1Signature: "Girma Wolde",
  witness1Date: "18/06/2016",
  witness2Name: "አቶ ታሪኩ አለሙ",
  witness2Signature: "Tariku Alemu",
  witness2Date: "18/06/2016",
};

export default function CitizenModelContractFormPage() {
  const router = useRouter();
  const params = useParams();
  const requestCode = params.id as string;
  const printRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<ContractFormData>(DEFAULT_FORM_DATA);
  const [activeTab, setActiveTab] = useState<"document" | "scanned_images" | "editor" | "both">("document");
  const [activePage, setActivePage] = useState<1 | 2 | "all">("all");
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signingParty, setSigningParty] = useState<"landlord" | "tenant" | "witness1" | "witness2">("tenant");
  const [signatureInput, setSignatureInput] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [agreement, setAgreement] = useState<AgreementResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Image preview modal state
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string; page: number } | null>(null);

  // Fetch agreement data on mount
  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        const session = getSession();
        if (!session?.token) {
          setError("No authentication token found");
          setIsLoading(false);
          return;
        }
        const data = await getAgreementByRequestCode(session.token, requestCode);
        setAgreement(data);
        
        // Auto-fill form with agreement data
        setFormData({
          contractDate: data.contractDate,
          contractNumber: data.contractNumber,
          landlordName: data.landlordName,
          landlordSubCity: data.landlordSubCity,
          landlordWoreda: data.landlordWoreda,
          landlordHouseNo: data.landlordHouseNo,
          landlordPhone: data.landlordPhone,
          landlordRegion: data.landlordRegion,
          landlordCity: data.landlordCity,
          landlordSpecificPlace: data.landlordSpecificPlace,
          tenantName: data.tenantName,
          tenantSubCity: data.tenantSubCity,
          tenantWoreda: data.tenantWoreda,
          tenantHouseNo: data.tenantHouseNo,
          tenantPhone: data.tenantPhone,
          tenantRegion: data.tenantRegion,
          tenantCity: data.tenantCity,
          tenantSpecificPlace: data.tenantSpecificPlace,
          propertyRegion: data.propertyRegion,
          propertyCity: data.propertyCity,
          propertySubCity: data.propertySubCity,
          propertyWoreda: data.propertyWoreda,
          propertySpecificPlace: data.propertySpecificPlace,
          propertyHouseNo: data.propertyHouseNo,
          propertyOwnershipType: data.propertyOwnershipType as any,
          propertyCondition: data.propertyCondition,
          monthlyRentInBirr: data.monthlyRentInBirr.toString(),
          monthlyRentInWords: data.monthlyRentInWords,
          utilitiesPaidBy: data.utilitiesPaidBy as any,
          advancePaymentMonths: data.advancePaymentMonths,
          advancePaymentBirr: data.advancePaymentBirr.toString(),
          advancePaymentWords: data.advancePaymentWords,
          monthlyPaymentDueDay: data.monthlyPaymentDueDay,
          landlordSignature: data.landlordSignature || "",
          landlordSignDate: data.landlordSignedAt ? new Date(data.landlordSignedAt).toLocaleDateString("en-GB") : "",
          tenantSignature: data.tenantSignature || "",
          tenantSignDate: data.tenantSignedAt ? new Date(data.tenantSignedAt).toLocaleDateString("en-GB") : "",
          officerName: data.officerName || "",
          officerSignature: data.officerSignature || "",
          officerSignDate: data.officerSignedAt ? new Date(data.officerSignedAt).toLocaleDateString("en-GB") : "",
          witness1Name: data.witness1Name || "",
          witness1Signature: data.witness1Signature || "",
          witness1Date: data.witness1SignedAt ? new Date(data.witness1SignedAt).toLocaleDateString("en-GB") : "",
          witness2Name: data.witness2Name || "",
          witness2Signature: data.witness2Signature || "",
          witness2Date: data.witness2SignedAt ? new Date(data.witness2SignedAt).toLocaleDateString("en-GB") : "",
        });
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load agreement");
        setIsLoading(false);
      }
    };

    if (requestCode) {
      fetchAgreement();
    }
  }, [requestCode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFieldChange = (field: keyof ContractFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFormData(DEFAULT_FORM_DATA);
    showToast("ቅጹ ወደ ነባሪ መረጃ ተመልሷል (Form reset to default)");
  };

  const handleApplySignature = () => {
    if (!signatureInput.trim()) return;
    const now = new Date().toLocaleDateString("en-GB");
    if (signingParty === "landlord") {
      setFormData((prev) => ({
        ...prev,
        landlordSignature: signatureInput,
        landlordSignDate: now,
      }));
    } else if (signingParty === "tenant") {
      setFormData((prev) => ({
        ...prev,
        tenantSignature: signatureInput,
        tenantSignDate: now,
      }));
    } else if (signingParty === "witness1") {
      setFormData((prev) => ({
        ...prev,
        witness1Signature: signatureInput,
        witness1Date: now,
      }));
    } else if (signingParty === "witness2") {
      setFormData((prev) => ({
        ...prev,
        witness2Signature: signatureInput,
        witness2Date: now,
      }));
    }
    setIsSignModalOpen(false);
    setSignatureInput("");
    showToast("ዲጂታል ፊርማ በተሳካ ሁኔታ ተቀምጧል! (Digital signature recorded)");
  };

  return (
    <div className="w-full min-h-screen bg-[#f1f5f9] text-slate-900 pb-16 font-sans">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-sm text-slate-600">Loading agreement data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md">
            <p className="text-red-800 text-sm font-medium">{error}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 text-xs text-red-700 hover:underline"
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content - Only show when not loading and no error */}
      {!isLoading && !error && (
        <>
      {/* Top Header & Toolbar (Screen Only) */}
      <div className="print:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Breadcrumb & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/citizen/dashboard")}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#00450d] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  አዋጅ ቁጥር 1320/2016
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-mono">ህጋዊ የመኖሪያ ቤት ሞዴል ውል</span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                የመኖሪያ ቤት የአከራይ ተከራይ ሞዴል ውል ስምምነት (Official Model Lease Form)
              </h1>
            </div>
          </div>

          {/* Action Buttons & View Mode Tabs */}
          <div className="flex items-center flex-wrap gap-2">
            {/* View Mode Switcher */}
            <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("document")}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "document"
                    ? "bg-white text-[#00450d] shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Document View</span>
              </button>

              <button
                onClick={() => setActiveTab("scanned_images")}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "scanned_images"
                    ? "bg-white text-[#00450d] shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Original Scanned Visual</span>
              </button>

              <button
                onClick={() => setActiveTab("editor")}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "editor"
                    ? "bg-white text-[#00450d] shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Fill Form</span>
              </button>

              <button
                onClick={() => setActiveTab("both")}
                className={`hidden lg:flex px-3 py-1.5 rounded-md transition-all cursor-pointer items-center gap-1.5 ${
                  activeTab === "both"
                    ? "bg-white text-[#00450d] shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Side-by-Side</span>
              </button>
            </div>

            {/* Page Filter when in Document View */}
            {activeTab === "document" && (
              <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => setActivePage("all")}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    activePage === "all" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600"
                  }`}
                >
                  All (2 Pages)
                </button>
                <button
                  onClick={() => setActivePage(1)}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    activePage === 1 ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600"
                  }`}
                >
                  Page 1
                </button>
                <button
                  onClick={() => setActivePage(2)}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    activePage === 2 ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600"
                  }`}
                >
                  Page 2
                </button>
              </div>
            )}

            {/* Reset / Sign / Print Buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs h-8 border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer gap-1"
              title="Reset to sample values"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSigningParty("tenant");
                setIsSignModalOpen(true);
              }}
              className="text-xs h-8 border-emerald-600 text-[#00450d] hover:bg-emerald-50 font-bold cursor-pointer gap-1.5"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Digital Sign</span>
            </Button>

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

      {/* Main Content Workspace */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* ========================================================================= */}
        {/* SCANNED FORM IMAGES GALLERY TAB                                           */}
        {/* ========================================================================= */}
        

        {/* ========================================================================= */}
        {/* DOCUMENT VIEW & EDITOR WORKSPACE                                         */}
        {/* ========================================================================= */}
        <div
          className={`grid gap-8 ${
            activeTab === "both" ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1"
          }`}
        >
          {/* ========================================================================= */}
          {/* INTERACTIVE FORM EDITOR (When activeTab is 'editor' or 'both')            */}
          {/* ========================================================================= */}
          {(activeTab === "editor" || activeTab === "both") && (
            <div
              className={`print:hidden space-y-6 ${
                activeTab === "both" ? "lg:col-span-5" : "max-w-3xl mx-auto w-full"
              }`}
            >
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-[#00450d]" />
                    <h2 className="text-base font-bold text-slate-900">
                      የውል ቅጽ ማስተካከያ (Form Fields)
                    </h2>
                  </div>
                  <Badge className="bg-emerald-50 text-[#00450d] border border-emerald-200 text-[10px]">
                    Auto Synchronized
                  </Badge>
                </div>

                {/* Section 0: Contract Meta */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    የውል መረጃ (Contract Metadata)
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">የውል ቀን (Date)</label>
                      <input
                        type="text"
                        value={formData.contractDate}
                        onChange={(e) => handleFieldChange("contractDate", e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-[#00450d] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">የውል ቁጥር (Ref Number)</label>
                      <input
                        type="text"
                        value={formData.contractNumber}
                        onChange={(e) => handleFieldChange("contractNumber", e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono focus:ring-1 focus:ring-[#00450d] focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 1: Landlord */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#00450d] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>1. የአከራይ መረጃ (Landlord Information)</span>
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">የአከራይ ስም ከነአያት (Full Name)</label>
                      <input
                        type="text"
                        value={formData.landlordName}
                        readOnly
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium bg-slate-50 text-slate-700"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">ክፍለ ከተማ (Sub-City)</label>
                        <input
                          type="text"
                          value={formData.landlordSubCity}
                          readOnly
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">ወረዳ/ቀበሌ (Woreda/Kebele)</label>
                        <input
                          type="text"
                          value={formData.landlordWoreda}
                          readOnly
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 text-slate-700"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">የቤት ቁጥር (House No)</label>
                        <input
                          type="text"
                          value={formData.landlordHouseNo}
                          readOnly
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">ስልክ ቁጥር (Phone Number)</label>
                        <input
                          type="text"
                          value={formData.landlordPhone}
                          readOnly
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono bg-slate-50 text-slate-700"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">ልዩ ቦታ (Specific Address / Landmark)</label>
                      <input
                        type="text"
                        value={formData.landlordSpecificPlace}
                        readOnly
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Tenant */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>2. የተከራይ መረጃ (Tenant Information)</span>
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">የተከራይ ስም ከነአያት (Full Name)</label>
                      <input
                        type="text"
                        value={formData.tenantName}
                        readOnly
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs font-medium bg-slate-50 text-slate-700"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">ክፍለ ከተማ (Sub-City)</label>
                        <input
                          type="text"
                          value={formData.tenantSubCity}
                          readOnly
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">ወረዳ/ቀበሌ (Woreda/Kebele)</label>
                        <input
                          type="text"
                          value={formData.tenantWoreda}
                          readOnly
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 text-slate-700"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">የቤት ቁጥር (House No)</label>
                        <input
                          type="text"
                          value={formData.tenantHouseNo}
                          readOnly
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">ስልክ ቁጥር (Phone Number)</label>
                        <input
                          type="text"
                          value={formData.tenantPhone}
                          readOnly
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono bg-slate-50 text-slate-700"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">ልዩ ቦታ (Specific Address / Landmark)</label>
                      <input
                        type="text"
                        value={formData.tenantSpecificPlace}
                        readOnly
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Property Details */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    <span>3. የሚከራየው ቤት አድራሻና ሁኔታ</span>
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">ክፍለ ከተማ (Sub-City)</label>
                        <input
                          type="text"
                          value={formData.propertySubCity}
                          readOnly
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">ወረዳ/ቀበሌ (Woreda)</label>
                        <input
                          type="text"
                          value={formData.propertyWoreda}
                          readOnly
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">የቤት ቁጥር (House No)</label>
                        <input
                          type="text"
                          value={formData.propertyHouseNo}
                          readOnly
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">የባለቤትነት አይነት</label>
                        <input
                          type="text"
                          value={formData.propertyOwnershipType}
                          readOnly
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 text-slate-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">የኪራይ ቤቱ ሁኔታ</label>
                      <input
                        type="text"
                        value={formData.propertyCondition}
                        readOnly
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Rent & Payment Terms */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>4. የኪራይ ዋጋና የክፍያ ሁኔታ (Financial Terms)</span>
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">ወርኃዊ ኪራይ በብር (Monthly Rent ETB)</label>
                        <input
                          type="text"
                          value={formData.monthlyRentInBirr}
                          readOnly
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold text-[#00450d] bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">በፊደል (In Words)</label>
                        <input
                          type="text"
                          value={formData.monthlyRentInWords}
                          readOnly
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 text-slate-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1">የኪራይ ዋጋ የሚከፍለው (Utilities Paid By)</label>
                      <input
                        type="text"
                        value={formData.utilitiesPaidBy}
                        readOnly
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 text-slate-700"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">የቅድመ ክፍያ ወራት (Advance Payment Months)</label>
                        <input
                          type="text"
                          value={formData.advancePaymentMonths}
                          readOnly
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">የቅድመ ክፍያ በብር (Advance Payment ETB)</label>
                        <input
                          type="text"
                          value={formData.advancePaymentBirr}
                          readOnly
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold text-[#00450d] bg-slate-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">በፊደል (In Words)</label>
                        <input
                          type="text"
                          value={formData.advancePaymentWords}
                          readOnly
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-medium mb-1">ወርኃዊ ክፍያ ቀን (Monthly Payment Due Day)</label>
                        <input
                          type="text"
                          value={formData.monthlyPaymentDueDay}
                          readOnly
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50 text-slate-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">የአዲስ አበባ ከተማ ቤቶች ልማት ቢሮ</span>
                  <Button
                    onClick={() => {
                      setActiveTab("document");
                      showToast("ቅጹን ወደ ሰነድ እይታ ቀይረነዋል (Switched to Document view)");
                    }}
                    className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs font-bold"
                  >
                    ሰነዱን ተመልከት (View Document)
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* HIGH FIDELITY OFFICIAL DOCUMENT RENDERING (PAGE 1 & PAGE 2)               */}
          {/* ========================================================================= */}
          {(activeTab === "document" || activeTab === "both") && (
            <div
              className={`space-y-8 ${
                activeTab === "both" ? "lg:col-span-7" : "max-w-4xl mx-auto w-full"
              }`}
            >
              {/* Document Pages Container */}
              <div ref={printRef} className="space-y-8 print:space-y-0">
                {/* ----------------------------------------------------------------- */}
                {/* OFFICIAL DOCUMENT PAGE 1 (Matching form1.jpeg)                   */}
                {/* ----------------------------------------------------------------- */}
                {(activePage === "all" || activePage === 1) && (
                  <div className="bg-white text-[#111827] shadow-xl rounded-xl sm:rounded-2xl border border-slate-300/80 p-6 sm:p-10 lg:p-12 relative overflow-hidden print:shadow-none print:border-none print:p-8 print:m-0 print:rounded-none print:page-break-after-always">
                    {/* Watermark in background */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                      <div className="w-96 h-96 rounded-full border-8 border-slate-900 flex items-center justify-center">
                        <span className="text-4xl font-black text-center">ADDIS ABABA HOUSING</span>
                      </div>
                    </div>

                    {/* Official Letterhead Header (Left Logo, Center Text, Right Logo) */}
                    <div className="border-b-2 border-slate-900 pb-4 mb-4">
                      <div className="flex items-center justify-between gap-4">
                        {/* Left Emblem: Monument Logo inside round circle */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-slate-800 p-1 flex items-center justify-center bg-slate-50 shrink-0">
                          <div className="w-full h-full rounded-full border border-slate-400 flex flex-col items-center justify-center text-center p-1">
                            <div className="w-4 h-6 border-l-2 border-r-2 border-t-2 border-slate-800 relative mb-0.5">
                              <div className="w-1.5 h-3 bg-slate-800 mx-auto" />
                            </div>
                            <span className="text-[7px] font-bold text-slate-800 leading-none">አ.አ ከተማ</span>
                          </div>
                        </div>

                        {/* Center Header Titles (Exact match to form1.jpeg) */}
                        <div className="text-center flex-1 space-y-0.5">
                          <h2 className="text-sm sm:text-base md:text-lg font-black text-slate-950 tracking-tight">
                            በአዲስ አበባ ከተማ አስተዳደር
                          </h2>
                          <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-900">
                            የቤቶች ልማትና አስተዳደር ቢሮ
                          </h3>
                          <h4 className="text-xs sm:text-sm font-black text-slate-950 tracking-tight pt-0.5">
                            የመኖሪያ ቤት የአከራይ ተከራይ
                          </h4>
                          <h1 className="text-sm sm:text-base md:text-lg font-black text-slate-950 underline decoration-1 underline-offset-4">
                            ሞዴል ውል ስምምነት
                          </h1>
                        </div>

                        {/* Right Emblem: Housing Administration Logo */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-slate-800 p-1 flex items-center justify-center bg-slate-50 shrink-0">
                          <div className="w-full h-full rounded-full border border-slate-400 flex flex-col items-center justify-center text-center p-1">
                            <Building className="w-5 h-5 text-slate-900 mb-0.5" />
                            <span className="text-[7px] font-bold text-slate-800 leading-none">ቤቶች ቢሮ</span>
                          </div>
                        </div>
                      </div>

                      {/* Header Sub-meta: Date and Contract Number */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-2 sm:gap-6 text-xs text-slate-800 font-serif pt-3">
                        <div>
                          <span className="font-bold">የውል ቀን: </span>
                          <span className="font-mono font-bold border-b border-dotted border-slate-900 pb-0.5 px-2">
                            {formData.contractDate} ዓ.ም
                          </span>
                        </div>
                        <div>
                          <span className="font-bold">የውል ቁጥር: </span>
                          <span className="font-mono font-bold border-b border-dotted border-slate-900 pb-0.5 px-2">
                            {formData.contractNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Document Title Header */}
                    <div className="text-center my-3">
                      <h3 className="text-sm sm:text-base font-black text-slate-950 tracking-wide uppercase inline-block border-b-2 border-slate-900 pb-0.5">
                        የአከራይ ተከራይ ሞዴል ውል
                      </h3>
                    </div>

                    {/* Clauses & Body Text (Exact match to form1.jpeg) */}
                    <div className="space-y-3.5 text-xs sm:text-[13px] leading-relaxed text-slate-900 font-serif">
                      {/* 1. Landlord */}
                      <div className="space-y-1 text-justify">
                        <p>
                          <span className="font-bold text-slate-950">1. የአከራይ ስም ከነአያት፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[140px] inline-block">
                            {formData.landlordName}
                          </span>
                          <span className="font-bold ml-2">ክፍለ ከተማ፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[70px] inline-block">
                            {formData.landlordSubCity}
                          </span>
                          <span className="font-bold ml-2">ወረዳ/ቀበሌ፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[60px] inline-block">
                            {formData.landlordWoreda}
                          </span>
                          <span className="font-bold ml-2">የቤት ቁጥር፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[60px] inline-block">
                            {formData.landlordHouseNo}
                          </span>
                          <span className="font-bold ml-2">ስልክ ቁጥር፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[100px] inline-block">
                            {formData.landlordPhone}
                          </span>
                          <br />
                          <span className="font-bold">የመኖሪያ አድራሻ፡ ክልል፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[70px] inline-block">
                            {formData.landlordRegion}
                          </span>
                          <span className="font-bold ml-2">ከተማ፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[70px] inline-block">
                            {formData.landlordCity}
                          </span>
                          <span className="font-bold ml-2">ወረዳ/ቀበሌ፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[60px] inline-block">
                            {formData.landlordWoreda}
                          </span>
                          <span className="font-bold ml-2">ልዩ ቦታ፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[120px] inline-block">
                            {formData.landlordSpecificPlace}
                          </span>
                          <span className="font-bold ml-2">የቤት ቁጥር፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[60px] inline-block">
                            {formData.landlordHouseNo}
                          </span>
                        </p>
                      </div>

                      {/* 2. Tenant */}
                      <div className="space-y-1 text-justify pt-1">
                        <p>
                          <span className="font-bold text-slate-950">2. የተከራይ ስም ከነአያት፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[140px] inline-block">
                            {formData.tenantName}
                          </span>
                          <span className="font-bold ml-2">ክፍለ ከተማ፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[70px] inline-block">
                            {formData.tenantSubCity}
                          </span>
                          <span className="font-bold ml-2">ወረዳ/ቀበሌ፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[60px] inline-block">
                            {formData.tenantWoreda}
                          </span>
                          <span className="font-bold ml-2">የቤት ቁጥር፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[60px] inline-block">
                            {formData.tenantHouseNo}
                          </span>
                          <span className="font-bold ml-2">ስልክ ቁጥር፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[100px] inline-block">
                            {formData.tenantPhone}
                          </span>
                          <br />
                          <span className="font-bold">የመኖሪያ አድራሻ፡ ክልል፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[70px] inline-block">
                            {formData.tenantRegion}
                          </span>
                          <span className="font-bold ml-2">ከተማ፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[70px] inline-block">
                            {formData.tenantCity}
                          </span>
                          <span className="font-bold ml-2">ወረዳ/ቀበሌ፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[60px] inline-block">
                            {formData.tenantWoreda}
                          </span>
                          <span className="font-bold ml-2">ልዩ ቦታ፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[120px] inline-block">
                            {formData.tenantSpecificPlace}
                          </span>
                          <span className="font-bold ml-2">የቤት ቁጥር፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[60px] inline-block">
                            {formData.tenantHouseNo}
                          </span>
                        </p>
                      </div>

                      {/* 3. Property to Rent */}
                      <div className="space-y-1 text-justify pt-1">
                        <p>
                          <span className="font-bold text-slate-950">3. የሚከራየው መኖሪያ ቤት አድራሻ፡ </span>
                          <br />
                          <span className="font-bold">ክልል፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[70px] inline-block">
                            {formData.propertyRegion}
                          </span>
                          <span className="font-bold ml-2">ከተማ፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[70px] inline-block">
                            {formData.propertyCity}
                          </span>
                          <span className="font-bold ml-2">ክፍለ ከተማ፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[70px] inline-block">
                            {formData.propertySubCity}
                          </span>
                          <span className="font-bold ml-2">ወረዳ/ቀበሌ፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[60px] inline-block">
                            {formData.propertyWoreda}
                          </span>
                          <br />
                          <span className="font-bold">ልዩ ቦታ፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[140px] inline-block">
                            {formData.propertySpecificPlace}
                          </span>
                          <span className="font-bold ml-2">የቤት ቁጥር፡ </span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[60px] inline-block">
                            {formData.propertyHouseNo}
                          </span>
                          <span className="font-bold ml-2">የባለቤትነቱ የ</span>
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 min-w-[120px] inline-block">
                            {formData.propertyOwnershipType}
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
                            {formData.propertyCondition}
                          </span>{" "}
                          <span className="text-slate-700">
                            (ነባር የኪራይ መኖሪያ ቤት/ አዲስ የተገነባ የኪራይ መኖሪያ ቤት/ ነባር ተከራይቶ የማያውቅ የኪራይ መኖሪያ ቤት)
                          </span>
                        </p>
                        <p className="pl-3">
                          2) አከራይ ከላይ የተጠቀሰውን መኖሪያ ቤት በብር{" "}
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 inline-block">
                            {formData.monthlyRentInBirr} ({formData.monthlyRentInWords})
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
                            በ{formData.utilitiesPaidBy}
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
                            {formData.advancePaymentMonths}
                          </span>{" "}
                          ወር (የአንድ ወር / የሁለት ወር) የመኖሪያ ቤቱ ኪራይ ብር (
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 inline-block">
                            {formData.advancePaymentBirr} - {formData.advancePaymentWords}
                          </span>
                          ) በዛሬው ዕለት ለአከራይ ከፍያለሁ። ከዚህ በኋላ ያለው አከፋፈል ቅድሚያ የሚከፈል ሆኖ ወርኃዊ ክፍያ በየወሩ ወር በገባ እስከ{" "}
                          <span className="font-bold border-b border-dotted border-slate-800 px-2 inline-block">
                            {formData.monthlyPaymentDueDay}
                          </span>{" "}
                          ቀን ለመክፈል ተስማምቻለሁ።
                        </p>
                      </div>
                    </div>

                    {/* Page 1 Footer */}
                    <div className="mt-8 pt-3 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-500 font-sans">
                      <span>የመኖሪያ ቤት የአከራይ ተከራይ ሞዴል ውል ስምምነት • ገጽ 1/2</span>
                      <span className="font-mono">{formData.contractNumber}</span>
                    </div>
                  </div>
                )}

                {/* ----------------------------------------------------------------- */}
                {/* OFFICIAL DOCUMENT PAGE 2 (Matching form2.jpeg)                   */}
                {/* ----------------------------------------------------------------- */}
                {(activePage === "all" || activePage === 2) && (
                  <div className="bg-white text-[#111827] shadow-xl rounded-xl sm:rounded-2xl border border-slate-300/80 p-6 sm:p-10 lg:p-12 relative overflow-hidden print:shadow-none print:border-none print:p-8 print:m-0 print:rounded-none">
                    {/* Header on Page 2 (Exact match to form2.jpeg) */}
                    <div className="border-b-2 border-slate-900 pb-3 mb-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-slate-800 p-0.5 flex items-center justify-center bg-slate-50 shrink-0">
                          <div className="w-full h-full rounded-full border border-slate-400 flex flex-col items-center justify-center text-center p-0.5">
                            <span className="text-[6px] font-bold text-slate-800 leading-none">አ.አ ከተማ</span>
                          </div>
                        </div>

                        <div className="text-center flex-1">
                          <h2 className="text-xs sm:text-sm md:text-base font-black text-slate-950">
                            በአዲስ አበባ ከተማ አስተዳደር የቤቶች ልማትና አስተዳደር ቢሮ
                          </h2>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                            የመኖሪያ ቤት የአከራይ ተከራይ ሞዴል ውል ስምምነት
                          </h3>
                        </div>

                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-slate-800 p-0.5 flex items-center justify-center bg-slate-50 shrink-0">
                          <div className="w-full h-full rounded-full border border-slate-400 flex flex-col items-center justify-center text-center p-0.5">
                            <Building className="w-4 h-4 text-slate-900" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Page 2 Clauses Continuation (Exact text from form2.jpeg) */}
                    <div className="space-y-3.5 text-xs sm:text-[13px] leading-relaxed text-slate-900 font-serif">
                      <p className="text-justify pl-3">
                        2) ተከራይ በመኖሪያ ቤት ኪራይ ቁጥጥር እና አስተዳደር አዋጅ ቁጥር 1320/2016 መሰረት ተቆጣጣሪው አካል የወሰነውን የመኖሪያ ቤት ኪራይ ዋጋ ማሻሻያ መነሻ በማድረግ አከራይ የሚጨምረውን የመኖሪያ ቤት ኪራይ ዋጋ በዚህ ውል ላይ ከተመለከተው የኪራይ ዋጋ ላይ በመጨመር ይከፍላል።
                      </p>

                      <p className="text-justify pl-3">
                        3) ተከራይ የዚህ የኪራይ ውል ዘመን ሳይጠናቀቅ የመኖሪያ ቤቱን መልቀቅ ቢፈልግ የሁለት ወር የቅድሚያ ማስታወቂያ ለአከራዩ የመስጠት ግዴታ አለበት።
                      </p>

                      <p className="text-justify pl-3">
                        4) ተከራይ የመኖሪያ ቤቱን በአግባቡ ጠብቆና ጉዳት ሳያደርስ የመኖሪያ ኪራይ ውሉ ሲያበቃ በተረከበበት ሁኔታ ለአከራይ የማስረከብ ኃላፊነት አለበት።
                      </p>

                      <p className="text-justify pl-3">
                        5) ተከራይ የመኖሪያ ቤት ኪራይ ክፍያ በባንክ ወይም በሌላ ህጋዊ በሆነ የኤሌክትሮኒክስ ዘዴ ብቻ መፈጸም አለበት።
                      </p>

                      <p className="text-justify pt-1 font-semibold">
                        7. በዚህ ውል ላልተሸፈኑ ጉዳዮች ላይ የመኖሪያ ቤት ኪራይ ቁጥጥር እና አስተዳደር አዋጅ ቁጥር 1320/2016 ተፈጻሚ ይሆናል።
                      </p>

                      <p className="text-justify font-semibold">
                        8. ይህ ውል በአከራይና በተከራይ ተፈርሞ በተቆጣጣሪው አካል ሲረጋገጥ የፀና ይሆናል።
                      </p>

                      <p className="text-justify font-semibold">
                        9. ተከራይ የውል ዘመኑ ሳይጠናቀቅ የተከራየውን ቤት በፍቃዱ የለቀቀ ከሆነ በአካል ቀርቦ ውል የማቋረጥ ግዴታ አለበት።
                      </p>

                      {/* Official Signatures Grid (Exact layout from form2.jpeg) */}
                      <div className="pt-6 space-y-6">
                        {/* Landlord, Tenant, and Verifying Body Signatures */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                          {/* Landlord Signature Block */}
                          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/80 space-y-2">
                            <div className="font-bold text-slate-950 border-b border-slate-300 pb-1">
                              አከራይ (Landlord)
                            </div>
                            <div className="space-y-1.5 text-xs">
                              <div>
                                <span className="text-slate-600">ስም: </span>
                                <span className="font-bold">{formData.landlordName}</span>
                              </div>
                              <div>
                                <span className="text-slate-600">ፊርማ: </span>
                                <span className="font-serif italic font-bold text-[#00450d] underline decoration-wavy decoration-emerald-500">
                                  {formData.landlordSignature || "________________"}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-600">ቀን: </span>
                                <span className="font-mono">{formData.landlordSignDate}</span>
                              </div>
                            </div>
                          </div>

                          {/* Tenant Signature Block */}
                          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/80 space-y-2">
                            <div className="font-bold text-slate-950 border-b border-slate-300 pb-1">
                              ተከራይ (Tenant)
                            </div>
                            <div className="space-y-1.5 text-xs">
                              <div>
                                <span className="text-slate-600">ስም: </span>
                                <span className="font-bold">{formData.tenantName}</span>
                              </div>
                              <div>
                                <span className="text-slate-600">ፊርማ: </span>
                                <span className="font-serif italic font-bold text-blue-800 underline decoration-wavy decoration-blue-500">
                                  {formData.tenantSignature || "________________"}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-600">ቀን: </span>
                                <span className="font-mono">{formData.tenantSignDate}</span>
                              </div>
                            </div>
                          </div>

                          {/* Verifying Regulatory Body */}
                          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-300/80 space-y-2 relative">
                            <div className="font-bold text-emerald-950 border-b border-emerald-300 pb-1 flex items-center justify-between">
                              <span>ያረጋገጠው ተቆጣጣሪ አካል</span>
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                            </div>
                            <div className="space-y-1.5 text-xs">
                              <div>
                                <span className="text-slate-600">ስም: </span>
                                <span className="font-bold text-slate-900">{formData.officerName}</span>
                              </div>
                              <div>
                                <span className="text-slate-600">ፊርማ: </span>
                                <span className="font-serif italic font-bold text-emerald-900">
                                  {formData.officerSignature || "________________"}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-600">ቀን: </span>
                                <span className="font-mono">{formData.officerSignDate}</span>
                              </div>
                            </div>

                            {/* Official Municipal Circular Stamp */}
                            <div className="absolute right-2 bottom-2 w-14 h-14 rounded-full border-2 border-emerald-700/80 text-emerald-800 flex flex-col items-center justify-center rotate-[-12deg] pointer-events-none select-none opacity-80">
                              <span className="text-[6px] font-black uppercase">አዲስ አበባ ቤቶች</span>
                              <span className="text-[8px] font-bold">★ ጸድቋል ★</span>
                              <span className="text-[5px] font-mono">APPROVED</span>
                            </div>
                          </div>
                        </div>

                        {/* Witnesses Section (የዕማኞች ስም) */}
                        <div className="pt-2 border-t border-slate-200">
                          <h4 className="font-bold text-slate-950 text-xs mb-2">የዕማኞች ስም (Witnesses)</h4>
                          <div className="space-y-2 text-xs">
                            {/* Witness 1 */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-slate-50 rounded border border-slate-200">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold">1. ስም፡ </span>
                                <span className="font-bold border-b border-dotted border-slate-700 px-2 min-w-[140px]">
                                  {formData.witness1Name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span>ፊርማ፡ </span>
                                <span className="font-serif italic font-bold border-b border-dotted border-slate-700 px-2 min-w-[100px]">
                                  {formData.witness1Signature}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span>ቀን፡ </span>
                                <span className="font-mono border-b border-dotted border-slate-700 px-2 min-w-[80px]">
                                  {formData.witness1Date}
                                </span>
                              </div>
                            </div>

                            {/* Witness 2 */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-slate-50 rounded border border-slate-200">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold">2. ስም፡ </span>
                                <span className="font-bold border-b border-dotted border-slate-700 px-2 min-w-[140px]">
                                  {formData.witness2Name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span>ፊርማ፡ </span>
                                <span className="font-serif italic font-bold border-b border-dotted border-slate-700 px-2 min-w-[100px]">
                                  {formData.witness2Signature}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span>ቀን፡ </span>
                                <span className="font-mono border-b border-dotted border-slate-700 px-2 min-w-[80px]">
                                  {formData.witness2Date}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Page 2 Footer with Verification QR Code & Seal */}
                    <div className="mt-8 pt-4 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-sans">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 text-white rounded p-1 flex items-center justify-center font-mono text-[8px] font-bold text-center leading-tight">
                          QR VERIFIED
                        </div>
                        <div>
                          <p className="font-bold text-slate-700">
                            የኢትዮጵያ ፌዴራላዊ ዴሞክራሲያዊ ሪፐብሊክ
                          </p>
                          <p className="text-[10px]">
                            የመኖሪያ ቤት ኪራይ ቁጥጥርና አስተዳደር አዋጅ ቁጥር 1320/2016
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span>የመኖሪያ ቤት የአከራይ ተከራይ ሞዴል ውል ስምምነት • ገጽ 2/2</span>
                        <p className="font-mono text-[10px] text-slate-400">MD5: 84920-ET-CADASTRE</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Fullscreen Lightbox Modal for Scanned Document Images */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-5xl flex items-center justify-between text-white pb-3 px-2">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm sm:text-base font-bold">{lightboxImage.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const nextImg = lightboxImage.page === 1 ? formPage2Img : formPage1Img;
                  const nextTitle =
                    lightboxImage.page === 1
                      ? "የአከራይ ተከራይ ሞዴል ውል ስምምነት - ገጽ 2 (Signatures & Legal Terms)"
                      : "የአከራይ ተከራይ ሞዴል ውል ስምምነት - ገጽ 1 (Form Page 1)";
                  const nextPage = lightboxImage.page === 1 ? 2 : 1;
                  
                }}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Switch to Page {lightboxImage.page === 1 ? "2" : "1"}
              </button>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center overflow-auto rounded-xl bg-slate-900/50 p-2 border border-slate-800">
            <img
              src={lightboxImage.src}
              alt={lightboxImage.title}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Digital Signature Modal */}
      {isSignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PenTool className="w-5 h-5 text-[#00450d]" />
                <h3 className="text-base font-bold text-slate-900">ዲጂታል ፊርማ አስቀምጥ (Digital Signature)</h3>
              </div>
              <button
                onClick={() => setIsSignModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">የሚፈርመው አካል (Signer Role)</label>
                <select
                  value={signingParty}
                  onChange={(e) => setSigningParty(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs bg-white"
                >
                  <option value="tenant">ተከራይ (Tenant - {formData.tenantName})</option>
                  <option value="landlord">አከራይ (Landlord - {formData.landlordName})</option>
                  <option value="witness1">ምስክር 1 (Witness 1 - {formData.witness1Name})</option>
                  <option value="witness2">ምስክር 2 (Witness 2 - {formData.witness2Name})</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  የፊርማ ጽሁፍ / ስም (Type Signature Text)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Selamawit Asfaw"
                  value={signatureInput}
                  onChange={(e) => setSignatureInput(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-300 text-sm font-serif italic text-[#00450d] focus:ring-1 focus:ring-[#00450d] focus:outline-hidden"
                />
              </div>

              {signatureInput && (
                <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                    Signature Preview
                  </span>
                  <span className="text-xl font-serif italic font-bold text-[#00450d]">
                    {signatureInput}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSignModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApplySignature}
                className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs font-bold cursor-pointer"
              >
                ፊርማውን አጽድቅ (Apply Signature)
              </Button>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
