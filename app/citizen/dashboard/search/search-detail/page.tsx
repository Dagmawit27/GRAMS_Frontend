"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  User,
  Tag,
  Droplets,
  Layers,
  CheckCircle2,
  X,
  Copy,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Clock,
  Building,
  Check,
  Hash
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PropertyResponse, getPropertyByCode, getSession, submitLeaseRequest } from "@/lib/api";

export default function SearchDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyCodeParam = searchParams.get("code");

  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [proposedRent, setProposedRent] = useState<number>(0);
  const [leaseDurationMonths, setLeaseDurationMonths] = useState<number>(12);
  const [applicantNotes, setApplicantNotes] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<PropertyResponse['units'][0] | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyCodeParam) {
        setError("Property code not provided");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const session = getSession();
        const propertyData = await getPropertyByCode(propertyCodeParam, session?.token);
        setProperty(propertyData);
        setProposedRent(propertyData?.monthlyRent || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load property");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [propertyCodeParam]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyCode = () => {
    if (property?.propertyCode) {
      navigator.clipboard.writeText(property.propertyCode);
      setIsCopied(true);
      showToast("Property code copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleApplyLease = (prop: PropertyResponse) => {
    if (selectedUnit) {
      setProposedRent(selectedUnit.rentAmount);
    } else {
      setProposedRent(prop.monthlyRent);
    }
    setIsApplyModalOpen(true);
  };

  const handleSelectUnit = (unit: PropertyResponse['units'][0]) => {
    setSelectedUnit(unit);
  };

  const handleConfirmLeaseApplication = async () => {
    try {
      const session = getSession();
      if (!session?.token) {
        showToast("Please log in to submit a lease application");
        return;
      }

      if (!property) {
        showToast("Property information not available");
        return;
      }

      const leaseRequest = {
        propertyId: property.id,
        unitId: selectedUnit?.id,
        proposedRent: selectedUnit?.rentAmount || proposedRent,
        leaseDurationMonths: leaseDurationMonths,
        applicantNotes: applicantNotes,
      };

      await submitLeaseRequest(session.token, leaseRequest);
      setIsApplyModalOpen(false);
      showToast("Lease application submitted successfully!");
      setTimeout(() => {
        router.push("/citizen/dashboard/leases");
      }, 1500);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to submit lease application");
    }
  };

  const galleryList = property?.images?.map((img) => ({
    url: img.imageUrl,
    caption: img.isCover ? "Cover Image" : "Property Image"
  })) || [];

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : galleryList.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev < galleryList.length - 1 ? prev + 1 : 0));
  };

  const handleOpenPreview = (index: number) => {
    setSelectedImageIndex(index);
    setPreviewImage(galleryList[index]?.url || "");
  };

  const handlePreviewPrev = () => {
    const nextIdx = selectedImageIndex > 0 ? selectedImageIndex - 1 : galleryList.length - 1;
    setSelectedImageIndex(nextIdx);
    setPreviewImage(galleryList[nextIdx]?.url || "");
  };

  const handlePreviewNext = () => {
    const nextIdx = selectedImageIndex < galleryList.length - 1 ? selectedImageIndex + 1 : 0;
    setSelectedImageIndex(nextIdx);
    setPreviewImage(galleryList[nextIdx]?.url || "");
  };

  if (isLoading) {
    return (
      <div className="w-full bg-[#f8fafc] text-slate-900 font-sans antialiased min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="w-full bg-[#f8fafc] text-slate-900 font-sans antialiased min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Property Not Found</h3>
          <p className="text-sm text-slate-600 mb-4">{error || "Unable to load property details"}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f8fafc] text-slate-900 font-sans antialiased min-h-screen pb-16 pt-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULLSCREEN / MODAL IMAGE PREVIEW LIGHTBOX                                  */}
      {/* ========================================================================= */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="p-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-100">
                    {galleryList[selectedImageIndex]?.caption || property.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                     • Image {selectedImageIndex + 1} of {galleryList.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Close Preview (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lightbox Main Image Display */}
            <div className="relative flex-1 bg-black flex items-center justify-center p-2 min-h-[360px] max-h-[72vh] overflow-hidden group">
              <img
                src={previewImage}
                alt={galleryList[selectedImageIndex]?.caption || "Property Preview"}
                className="max-h-[68vh] max-w-full object-contain select-none transition-all duration-200"
              />

              {/* Prev / Next controls inside preview */}
              {galleryList.length > 1 && (
                <>
                  <button
                    onClick={handlePreviewPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-lg"
                    title="Previous Image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    onClick={handlePreviewNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-lg"
                    title="Next Image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Lightbox Footer Thumbnails Strip */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 overflow-x-auto">
              <div className="flex items-center gap-2">
                {galleryList.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImageIndex(idx);
                      setPreviewImage(item.url);
                    }}
                    className={`relative w-14 h-11 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      selectedImageIndex === idx
                        ? "border-emerald-400 ring-2 ring-emerald-500/40 scale-105"
                        : "border-slate-700 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN CONTAINER                                                            */}
      {/* ========================================================================= */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 space-y-6">
        {/* Navigation Breadcrumb / Back Button */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            onClick={() => router.push("/citizen/dashboard/search")}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#00450d] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span className="uppercase tracking-wider">Back to Search</span>
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              className="h-8 text-xs font-medium gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? "Copied!" : "Copy Property Code"}</span>
            </Button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2-COLUMN MAIN CONTENT GRID                                                */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* --------------------------------------------------------------------- */}
          {/* LEFT COLUMN (2/3 Width): Image Gallery with Eye Icon, Specs, Details   */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card 1: PROPERTY IMAGE GALLERY WITH EYE ICON PREVIEW */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#00450d]" />
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Property Gallery
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {galleryList.length} Verified Photos
                </span>
              </div>

              {/* Main Featured Display with Eye Icon Button */}
              <div className="relative h-72 sm:h-96 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 group">
                <img
                  src={galleryList[selectedImageIndex]?.url || property.images?.[0]?.imageUrl}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 pointer-events-none" />

                {/* EYE ICON: Click to Preview Image in Fullscreen Modal */}
                <button
                  onClick={() => handleOpenPreview(selectedImageIndex)}
                  className="absolute top-3.5 right-3.5 bg-slate-900/90 hover:bg-black text-white hover:text-emerald-300 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 shadow-lg backdrop-blur-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  title="Click to preview full image"
                >
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Preview Image</span>
                </button>

                {/* Caption Tag */}
                <div className="absolute bottom-4 left-4 right-16">
                  <span className="bg-white/95 backdrop-blur-xs text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs inline-block">
                    {galleryList[selectedImageIndex]?.caption || "Main Exterior"}
                  </span>
                </div>

                {/* Prev & Next in Hero View */}
                {galleryList.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer"
                      title="Previous"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer"
                      title="Next"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Row with Eye Icon Hover Overlay */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 pt-1">
                {galleryList.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative h-18 sm:h-20 rounded-lg overflow-hidden border-2 cursor-pointer group transition-all ${
                      selectedImageIndex === idx
                        ? "border-[#00450d] ring-2 ring-emerald-500/30 scale-102"
                        : "border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                    
                    {/* Hover eye icon overlay */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPreview(idx);
                      }}
                      className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                      title="Preview in modal"
                    >
                      <Eye className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: KEY PROPERTY SPECIFICATIONS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Property Specifications & Registry Details
                </h3>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {property.status}
                </span>
              </div>

              {/* Specs Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Property Type
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Building className="w-4 h-4 text-[#00450d]" />
                    <span className="font-bold text-slate-900 text-sm">{property.propertyType}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Total Area
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Maximize2 className="w-4 h-4 text-[#00450d]" />
                    <span className="font-bold text-slate-900 text-sm">{property.areaSqMeter} m²</span>
                  </div>
                </div>
              </div>

              {/* Geographic Cadastre Location Box */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <MapPin className="w-4 h-4 text-[#00450d]" />
                  <span>Cadastral Address & Administrative Boundaries</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Sub-City</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{property.address?.subCity}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Woreda</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{property.address?.woreda}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">House Number</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{property.houseNumber || property.address?.houseNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Floor / Elevation</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{property.floorNumber || "Standard"}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Property Description & Features
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {property.description || "No description provided"}
                </p>
              </div>
            </div>

            {/* If Commercial multi-unit plaza, display Units Breakdown */}
            {property.units && property.units.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Registered Building Units ({property.units.length})
                  </h3>
                  {selectedUnit && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Selected: {selectedUnit.unitCode}
                    </span>
                  )}
                  <span className="text-xs text-slate-500 font-medium">Submetered & Certified</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                        <th className="py-2.5 px-3 w-10">Select</th>
                        <th className="py-2.5 px-3">Unit Code</th>
                        <th className="py-2.5 px-3">Floor</th>
                        <th className="py-2.5 px-3">Area</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Monthly Rent</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {property.units.map((unit) => (
                        <tr
                          key={unit.id}
                          onClick={() => unit.status === "AVAILABLE" && handleSelectUnit(unit)}
                          className={`cursor-pointer transition-colors ${
                            selectedUnit?.id === unit.id
                              ? "bg-emerald-50 border-2 border-emerald-300"
                              : "hover:bg-slate-50/80 border-2 border-transparent"
                          } ${unit.status !== "AVAILABLE" ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <td className="py-2.5 px-3">
                            <div className="flex items-center justify-center">
                              {selectedUnit?.id === unit.id ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <div className="w-4 h-4 rounded border border-slate-300" />
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#00450d]">{unit.unitCode}</td>
                          <td className="py-2.5 px-3">{unit.floorLevel}</td>
                          <td className="py-2.5 px-3 font-medium">{unit.areaSqMeter} m²</td>
                          <td className="py-2.5 px-3">{unit.unitType}</td>
                          <td className="py-2.5 px-3 font-bold">ETB {unit.rentAmount?.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                unit.status === "AVAILABLE"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {unit.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* RIGHT COLUMN (1/3 Width): LANDLORD INFORMATION BOX & LEASE TERMS      */}
          {/* --------------------------------------------------------------------- */}
          <div className="space-y-6">
            {/* =================================================================== */}
            {/* CONSOLIDATED LANDLORD INFORMATION BOX                               */}
            {/* =================================================================== */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
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
                      Registered property owner & contact
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
                {/* Landlord Identity Row */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200/70">
                  <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-sm border border-slate-300 shrink-0">
                    {property.landlordName
                      ?.split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "LN"}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {property.landlordName || "Landlord Name"}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Property Owner
                    </p>
                  </div>
                </div>

                {/* Key Necessary Details */}
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block">Phone Number</span>
                      <span className="font-semibold text-slate-900 mt-0.5 block">{property.landlordPhone || "N/A"}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block">Email Address</span>
                      <span className="font-semibold text-slate-900 mt-0.5 block">{property.landlordEmail || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Ownership Type:</span>
                  <span className="font-semibold text-slate-800">{property.ownershipType || "N/A"}</span>
                </div>
              </div>

              {/* Landlord Contact Action */}
              <Button
                variant="outline"
                onClick={() => showToast(`Contacting landlord...`)}
                className="w-full text-xs font-semibold h-10 border-slate-300 text-slate-700 hover:bg-slate-100 gap-2 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-[#00450d]" />
                <span>Contact Landlord</span>
              </Button>
            </div>

            {/* Card 2: RENTAL TERMS & FINANCIAL CONDITIONS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Tag className="w-4 h-4 text-[#00450d]" />
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Lease & Payment Terms
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 font-medium">Monthly Rent</span>
                  <span className="font-bold text-slate-900 font-mono">
                    ETB {property.monthlyRent?.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 font-medium">Security Deposit</span>
                  <span className="font-bold text-slate-900">
                    {property.securityDepositMonths || 3} Months Rent
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 font-medium">Min. Lease Period</span>
                  <span className="font-bold text-slate-900">
                    {property.minLeasePeriod || "1 Year"}
                  </span>
                </div>

              </div>
            </div>

            {/* Card 3: Government Registry Notice */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-xs text-emerald-950 space-y-2">
              <Button
                size="sm"
                onClick={() => handleApplyLease(property)}
                disabled={property?.units && property.units.length > 1 && !selectedUnit}
                className={`w-full flex-1 text-xs font-medium h-9 rounded-lg flex items-center justify-center gap-1.5 shadow-2xs ${
                  property?.units && property.units.length > 1 && !selectedUnit
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-[#00450d] hover:bg-[#1b5e20] text-white cursor-pointer"
                }`}
              >
                <span>{selectedUnit ? `Apply for Unit ${selectedUnit.unitCode}` : "Apply Lease"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              {property?.units && property.units.length > 1 && !selectedUnit && (
                <p className="text-center text-[10px] text-amber-700 font-medium">
                  Please select a unit above to apply for lease
                </p>
              )}
              {selectedUnit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedUnit(null)}
                  className="w-full text-xs font-medium h-8 rounded-lg cursor-pointer border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Clear Unit Selection
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Lease Application Modal */}
      {isApplyModalOpen && property && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#00450d]" />
                <h3 className="text-base font-black text-slate-900">
                  Apply for Lease
                </h3>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900">{property.title}</p>
              <p className="text-slate-500 font-mono">
                Code: {property.propertyCode}
              </p>
              {selectedUnit && (
                <div className="pt-2 border-t border-slate-200 mt-2">
                  <p className="font-bold text-emerald-700">Selected Unit: {selectedUnit.unitCode}</p>
                  <p className="text-slate-500">
                    {selectedUnit.unitType} • {selectedUnit.floorLevel} • {selectedUnit.areaSqMeter} m²
                  </p>
                  <p className="text-slate-500 font-mono">
                    Rent: ETB {selectedUnit.rentAmount?.toLocaleString()}/month
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3 text-xs">
              
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Message to Landlord
                </label>
                <textarea
                  rows={3}
                  value={applicantNotes}
                  onChange={(e) => setApplicantNotes(e.target.value)}
                  placeholder="Optional message to the landlord..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-[#00450d]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsApplyModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmLeaseApplication}
                className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs font-bold px-4 cursor-pointer"
              >
                Submit Application
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
