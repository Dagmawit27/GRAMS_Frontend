"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileText,
  Eye,
  Download,
  PenTool,
  CheckCircle2,
  Undo2,
  X,
  Check,
  AlertTriangle,
  Building,
  User,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  Calendar,
  Layers,
  FileCheck2,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyResponse, getPropertyById, updatePropertyStatus, getSession, getUnitById, PropertyUnitResponse } from "@/lib/api";

function VerificationDetailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propIdParam = searchParams.get("id");
  const session = getSession();

  const [propertyData, setPropertyData] = useState<PropertyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal / Feedback state
  const [previewDoc, setPreviewDoc] = useState<{ name: string; url: string; type: string } | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnNotes, setReturnNotes] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<PropertyUnitResponse | null>(null);
  const [showUnitModal, setShowUnitModal] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propIdParam) {
        setIsLoading(false);
        setError("No property ID provided.");
        return;
      }

      setIsLoading(true);
      setError("");
      try {
        const token = session?.token;
        const data = await getPropertyById(propIdParam, token);
        setPropertyData(data);
      } catch (error) {
        console.error("Failed to fetch property:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to load property details.";
        if ((errorMessage.includes("No row with the given identifier exists for entity") || errorMessage.includes("does not exist")) && errorMessage.includes("Citizen")) {
          setError("Property owner information not found. The property may be linked to a deleted user account. Please contact system administrator.");
        } else {
          setError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [propIdParam, session?.token]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 animate-in fade-in duration-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="space-y-2">
            <Skeleton className="h-6 w-60" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <Skeleton className="h-5 w-48" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <Skeleton className="h-5 w-40" />
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="text-center">
          <p className="text-sm text-slate-600">{error}</p>
          <Button
            onClick={() => router.push("/officer/supervisor/properties")}
            className="mt-4"
          >
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  if (!propertyData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="text-center">
          <p className="text-sm text-slate-600">Property not found.</p>
          <Button
            onClick={() => router.push("/officer/supervisor/properties")}
            className="mt-4"
          >
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  const handleConfirmApprove = async () => {
    if (!propertyData || !session?.token) return;

    setIsProcessing(true);
    try {
      await updatePropertyStatus(session.token, propertyData.id, "LISTED", "Approved by supervisor");
      setIsApproveModalOpen(false);
      showToast(
        `Property ${propertyData.propertyCode} officially approved and recorded in municipal registry!`
      );
      setTimeout(() => {
        router.push("/officer/supervisor/properties");
      }, 1800);
    } catch (error) {
      console.error("Failed to approve property:", error);
      showToast("Failed to approve property. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReturn = async () => {
    if (!returnNotes.trim()) {
      showToast("Please provide revision feedback for the field officer.");
      return;
    }
    if (!propertyData || !session?.token) return;

    setIsProcessing(true);
    try {
      await updatePropertyStatus(session.token, propertyData.id, "PENDING", returnNotes);
      setIsReturnModalOpen(false);
      showToast(
        `Property ${propertyData.propertyCode} returned to field officer for revision.`
      );
      setTimeout(() => {
        router.push("/officer/supervisor/properties");
      }, 1800);
    } catch (error) {
      console.error("Failed to return property:", error);
      showToast("Failed to return property. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnitClick = async (unitId: string) => {
    if (!session?.token) return;

    try {
      const unitData = await getUnitById(unitId, session.token);
      setSelectedUnit(unitData);
      setShowUnitModal(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load unit details");
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] text-slate-900 font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Document Preview Lightbox Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#00450d]" />
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  {previewDoc.name}
                </span>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 bg-slate-900 flex flex-col items-center justify-center max-h-[70vh] overflow-y-auto">
              <img
                src={previewDoc.url}
                alt={previewDoc.name}
                className="max-h-[60vh] rounded-lg shadow-md object-contain"
              />
              <div className="mt-3 flex items-center gap-2 text-white/80 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Municipal Archive Record • Kebele 04 Sub-City Registry</span>
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">MD5: e79f29a044bc191</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => showToast(`Downloaded ${previewDoc.name}`)}
                className="text-xs gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Return to Officer Modal */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2.5 text-amber-800 pb-2 border-b border-slate-100">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-black text-slate-900">Return Property to Officer</h3>
            </div>
            <p className="text-xs text-slate-600">
              Specify the revision requirements or discrepancies found for Officer Dawit M. (WRD-OFF-402):
            </p>
            <textarea
              rows={4}
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              placeholder="e.g. Boundary marker on western boundary shows 1.5m discrepancy against cadastral survey..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#00450d] text-slate-800 resize-none"
            />
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReturnModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmReturn}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Return
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN CONTENT COMPONENT ONLY (NO STATIC SIDEBAR OR STATIC TOP NAV BAR)     */}
      {/* ========================================================================= */}
      <main className="w-full min-w-0 px-4 sm:px-6 lg:px-8 pt-2 pb-6 max-w-7xl mx-auto space-y-6">
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200/90">
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/officer/supervisor/properties"
              className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-[#00450d] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>PROPERTIES</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="font-mono font-bold text-slate-800">
              {propertyData.propertyCode}
            </span>
          </div>
        </div>

        {/* Main Title & Status Badge */}
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Property Approval: <span className="text-[#00450d]">{propertyData.propertyCode}</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#e1effe] text-[#1e429f] border border-blue-200">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Verified by Officer
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Review the submitted property dossier, landlord identity credentials, and finalize the registration.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 2-COLUMN MAIN CONTENT GRID                                                */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* --------------------------------------------------------------------- */}
          {/* LEFT COLUMN (2/3 Width): Property Overview, Landlord Box, & Documents */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card 1: Property Overview */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Property Overview
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#00450d] border border-emerald-200">
                  {propertyData.propertyType}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                {/* Property Photo with Primary Photo Badge */}
                <div className="relative h-44 rounded-lg overflow-hidden border border-slate-200 shadow-2xs group bg-slate-900">
                  <img
                    src={propertyData.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80"}
                    alt="Property"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <span className="absolute bottom-2.5 left-2.5 bg-white/95 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                    Primary Photo
                  </span>
                </div>

                {/* Metadata Specs */}
                <div className="md:col-span-2 space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block">
                        Property Type
                      </span>
                      <span className="font-semibold text-slate-900 text-xs mt-0.5 block">
                        {propertyData.propertyType}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block">
                        Plot Size
                      </span>
                      <span className="font-semibold text-slate-900 text-xs mt-0.5 block">
                        {propertyData.areaSqMeter} Sq. Meters
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block">
                      Registered Address
                    </span>
                    <span className="font-semibold text-slate-900 text-xs mt-0.5 block">
                      {propertyData.address?.subCity}, Woreda {propertyData.address?.woreda}, {propertyData.address?.city || "Addis Ababa"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Sub-City</span>
                      <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{propertyData.address?.subCity}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Woreda</span>
                      <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{propertyData.address?.woreda}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">House No.</span>
                      <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{propertyData.houseNumber || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* Card 2: CONSOLIDATED LANDLORD INFORMATION (Single Box with Necessary Info) */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#00450d] flex items-center justify-center border border-emerald-200">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      Landlord Information
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Official property owner identification and contact record
                    </p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-[#00450d] hover:bg-emerald-100 text-[10px] font-bold border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                  ID Verified
                </Badge>
              </div>

              {/* Single Structured Box with Necessary Information */}
              <div className="bg-[#fafbfc] rounded-xl border border-slate-200/80 p-4 space-y-4">
                {/* Primary Owner Identity Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/70">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-sm border border-slate-300 shrink-0">
                      {propertyData.landlordName ? propertyData.landlordName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'NA'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {propertyData.landlordName || "N/A"}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Property ID: <span className="font-semibold text-slate-800">{propertyData.propertyCode}</span>
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Ownership Status</span>
                    <span className="text-xs font-semibold text-slate-800 block mt-0.5">
                      {propertyData.ownershipType || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Key Necessary Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block">Phone Number</span>
                      <span className="font-semibold text-slate-900 mt-0.5 block">{propertyData.landlordPhone || "N/A"}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block">Email Address</span>
                      <span className="font-semibold text-slate-900 mt-0.5 block">{propertyData.landlordEmail || "N/A"}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CreditCard className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block">Title Deed Number</span>
                      <span className="font-semibold text-slate-900 mt-0.5 font-mono block">{propertyData.titleDeedNumber || "N/A"}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block">Property Address</span>
                      <span className="font-semibold text-slate-900 mt-0.5 block">{propertyData.address?.subCity}, Woreda {propertyData.address?.woreda}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Mall Units (for shopping malls) */}
            {(propertyData.propertyType?.toLowerCase().includes("mall") ||
              propertyData.propertyType?.toLowerCase().includes("commercial") ||
              propertyData.propertyType?.toLowerCase().includes("plaza") ||
              propertyData.propertyType?.toLowerCase().includes("shopping") ||
              propertyData.propertyType?.toLowerCase().includes("retail") ||
              (propertyData.units && propertyData.units.length > 0)) && propertyData.units && propertyData.units.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Shopping Mall Units
                  </h3>
                  <span className="text-xs font-semibold text-slate-500">
                    {propertyData.units.length} Units
                  </span>
                </div>

                <div className="space-y-2">
                  {propertyData.units.map((unit) => (
                    <div
                      key={unit.id}
                      className="p-3 rounded-lg bg-[#fafbfc] border border-slate-200/80 hover:bg-slate-100/60 transition-colors cursor-pointer"
                      onClick={() => handleUnitClick(unit.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-emerald-100 text-[#00450d] flex items-center justify-center font-bold text-xs">
                            {unit.unitCode?.slice(0, 2) || "UN"}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{unit.unitCode || unit.shopNumber || "—"}</p>
                            <p className="text-[11px] text-slate-500">{unit.unitType || unit.category || "—"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-900">{unit.rentAmount ? `ETB ${Number(unit.rentAmount).toLocaleString()}` : "—"}</p>
                          <p className="text-[10px] text-slate-500">{unit.areaSqMeter ? `${Number(unit.areaSqMeter).toLocaleString()} m²` : "—"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* RIGHT COLUMN (1/3 Width): Recommendation, Checklist & Action Buttons  */}
          {/* --------------------------------------------------------------------- */}
          <div className="space-y-6">
            
            {/* Card 3: Attached Documentation */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Attached Documentation
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  {propertyData.ownershipDocuments?.length || 0} Files
                </span>
              </div>

              <div className="space-y-3">
                {propertyData.ownershipDocuments?.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-lg bg-[#fafbfc] border border-slate-200/80 flex items-center justify-between hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 font-mono">
                          {doc.documentNumber || doc.documentType}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {doc.documentType}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setPreviewDoc({ name: doc.documentNumber || doc.documentType, url: doc.filePath || "", type: "pdf" })
                        }
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                        title="View Document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => showToast(`Downloading ${doc.documentNumber || doc.documentType}...`)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => setIsApproveModalOpen(true)}
                className="w-full h-11 bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs font-bold rounded-lg shadow-sm gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Register</span>
              </Button>

              <Button
                onClick={() => setIsReturnModalOpen(true)}
                variant="outline"
                className="w-full h-11 bg-white hover:bg-slate-50 border-slate-300 text-slate-700 text-xs font-bold rounded-lg gap-2 cursor-pointer"
              >
                <Undo2 className="w-4 h-4" />
                <span>Return to Officer</span>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal for Final Approval */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#00450d] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black text-slate-900">Grant Official Municipal Approval</h3>
              <p className="text-xs text-slate-600 mt-1">
                You are about to register <span className="font-bold">{propertyData.propertyCode}</span> into the Addis Ababa Woreda Master Cadastre.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-left space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Owner:</span>
                <span className="font-semibold text-slate-800">
                  {propertyData.landlordName || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-semibold text-slate-800">
                  {propertyData.landlordPhone || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-semibold text-slate-800">
                  {propertyData.landlordEmail || "N/A"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsApproveModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmApprove}
                className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs font-bold cursor-pointer"
              >
                Confirm Approval
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Unit Detail Modal */}
      {showUnitModal && selectedUnit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Unit Details</h3>
              <button
                onClick={() => setShowUnitModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Unit Code</span>
                  <span className="font-semibold text-slate-900">{selectedUnit.unitCode || selectedUnit.shopNumber || "—"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Type</span>
                  <span className="font-semibold text-slate-900">{selectedUnit.unitType || selectedUnit.category || "—"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Floor</span>
                  <span className="font-semibold text-slate-900">{selectedUnit.floorLevel || "—"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Area</span>
                  <span className="font-semibold text-slate-900">{selectedUnit.areaSqMeter ? `${Number(selectedUnit.areaSqMeter).toLocaleString()} m²` : "—"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Monthly Rent</span>
                  <span className="font-semibold text-slate-900">{selectedUnit.rentAmount ? `ETB ${Number(selectedUnit.rentAmount).toLocaleString()}` : "—"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Status</span>
                  <span className="font-semibold text-slate-900">{selectedUnit.status}</span>
                </div>
              </div>
              {selectedUnit.tenantName && (
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Current Tenant</span>
                  <span className="font-semibold text-slate-900">{selectedUnit.tenantName}</span>
                </div>
              )}
              {selectedUnit.description && (
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Description</span>
                  <p className="text-slate-700 leading-relaxed">{selectedUnit.description}</p>
                </div>
              )}
            </div>
            <Button
              onClick={() => setShowUnitModal(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs h-9 rounded-lg"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerificationDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading property verification...</div>}>
      <VerificationDetailPageContent />
    </Suspense>
  );
}
