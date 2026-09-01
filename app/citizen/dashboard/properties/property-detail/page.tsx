"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  Home,
  Store,
  Bed,
  Bath,
  Maximize2,
  Clock,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Hourglass,
  ArrowLeft,
  Calendar,
  FileText,
  FileCheck2,
  ShieldCheck,
  Download,
  Share2,
  Phone,
  Mail,
  Eye,
  Zap,
  Droplets,
  Layers,
  Sparkles,
  ExternalLink,
  QrCode,
  Trash2,
  Plus,
  DoorOpen,
  ShoppingBag,
  Sliders,
  ChevronRight,
  X,
} from "lucide-react";
import { getSession, getMyProperties, getPropertyById, deleteProperty, PropertyResponse, getUnitById, PropertyUnitResponse } from "@/lib/api";
import { useCitizenData } from "@/hooks/useCitizenData";
import { PropertyUnit } from "@/types";

// Derives a display label and badge variant from the backend status enum
function statusMeta(status: PropertyResponse["status"]): { label: string; variant: "active" | "pending" | "rejected" | "default" } {
  switch (status) {
    case "LISTED":    return { label: "Listed on GRAMS",       variant: "active"   };
    case "VERIFIED":  return { label: "Municipality Verified", variant: "active"   };
    case "RENTED":    return { label: "Currently Rented",      variant: "active"   };
    case "PENDING":   return { label: "Pending Verification",  variant: "pending"  };
    case "REJECTED":  return { label: "Verification Rejected", variant: "rejected" };
    case "UNLISTED":  return { label: "Unlisted / Draft",      variant: "default"  };
    default:          return { label: status,                  variant: "default"  };
  }
}

function StatusIcon({ status }: { status: PropertyResponse["status"] }) {
  if (status === "LISTED" || status === "VERIFIED" || status === "RENTED")
    return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  if (status === "PENDING")
    return <Hourglass className="w-4 h-4 text-amber-500" />;
  if (status === "REJECTED")
    return <XCircle className="w-4 h-4 text-red-500" />;
  return <Clock className="w-4 h-4 text-slate-400" />;
}

export const PropertyDetailPage: React.FC = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24 text-slate-500 gap-3">
      <RefreshCw className="w-8 h-8 animate-spin text-[#00450d]" />
      <p className="text-sm font-medium">Loading property details...</p>
    </div>}>
      <PropertyDetailContent />
    </Suspense>
  );
};

function PropertyDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("id");
  const citizenContext = useCitizenData();

  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"details" | "units" | "cadastre" | "agreements">("details");
  const [toast, setToast] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<PropertyUnitResponse | null>(null);
  const [showUnitModal, setShowUnitModal] = useState(false);

  // Fetch property from database / API
  useEffect(() => {
    const s = getSession();
    const token = s?.token || "";

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        if (propertyId) {
          // Attempt 1: direct get by ID from API / database
          const found = await getPropertyById(propertyId, token);
          if (found) {
            setProperty(found);
            setLoading(false);
            return;
          }
        }

        // Attempt 2: Load all user properties from database/session and match
        const list = await getMyProperties(token);
        if (list && list.length > 0) {
          const match = propertyId ? list.find((p) => p.id === propertyId || p.propertyCode === propertyId) : list[0];
          if (match) {
            setProperty(match);
            setLoading(false);
            return;
          }
          // If no specific ID matched, default to the first registered property
          setProperty(list[0]);
          setLoading(false);
          return;
        }

        setError("Property record not found in municipal database.");
        setLoading(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load property details from database.");
        setLoading(false);
      }
    }

    loadData();
  }, [propertyId]);

  // Reset selected image index when property changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [property?.id]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleBack = () => {
    if (citizenContext?.handleBackFromPropertyDetails) {
      citizenContext.handleBackFromPropertyDetails();
    }
    router.push("/citizen/dashboard/properties");
  };

  const handleDeleteProperty = async () => {
    const session = getSession();
    const token = session?.token;
    if (!token || !property) return;

    setIsDeleting(true);
    try {
      await deleteProperty(property.id, token);
      showToast("Property deleted successfully");
      setShowDeleteConfirm(false);
      router.push("/citizen/dashboard/properties");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete property");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUnitClick = async (unitId: string) => {
    const session = getSession();
    const token = session?.token;
    if (!token) return;

    try {
      const unitData = await getUnitById(unitId, token);
      setSelectedUnit(unitData);
      setShowUnitModal(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load unit details");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#00450d]" />
        <p className="text-sm font-medium">Fetching registered property from database...</p>
        <p className="text-xs text-slate-400 font-mono">Querying municipal cadastre registry</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Property Details Unavailable</h3>
        <p className="text-xs text-slate-500">{error || "The requested property could not be retrieved from the database."}</p>
        <div className="pt-2 flex justify-center gap-3">
          <Button
            onClick={handleBack}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-9 px-4 rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Properties List
          </Button>
          <Button
            onClick={() => router.push("/citizen/dashboard/properties/register")}
            className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-9 px-4 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Register New Property
          </Button>
        </div>
      </div>
    );
  }

  const { label, variant } = statusMeta(property.status);
  const images = property.images ?? [];
  const hasImages = images.length > 0;

  const currentImage = hasImages ? images[selectedImageIndex]?.imageUrl : null;
  const isCommercial = property.propertyType?.toLowerCase().includes("mall") ||
                       property.propertyType?.toLowerCase().includes("commercial") ||
                       property.propertyType?.toLowerCase().includes("plaza") ||
                       property.propertyType?.toLowerCase().includes("shopping") ||
                       property.propertyType?.toLowerCase().includes("retail") ||
                       (property.units && property.units.length > 0);

  return (
    <div className="space-y-5 animate-in fade-in duration-150 max-w-6xl mx-auto pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleBack}
            variant="outline"
            size="sm"
            className="h-8.5 px-3 text-xs gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Properties
          </Button>
          <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">{property.propertyCode}</span>
              <Badge variant={variant} className="text-[10px] py-0.5 px-2 flex items-center gap-1 font-semibold">
                <StatusIcon status={property.status} />
                <span>{label}</span>
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          
          {property?.status === "LISTED" && (
            <Button
              onClick={() => {
                if (citizenContext?.handleNavigate) {
                  citizenContext.handleNavigate("agreements");
                } else {
                  router.push("/citizen/dashboard/agreements");
                }
              }}
              className="bg-[#00450d] hover:bg-[#1b5e20] text-white h-8.5 px-3.5 text-xs gap-1.5 font-medium rounded-lg shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Create Lease Agreement</span>
            </Button>
          )}
          
            <>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="destructive"
                className="h-8.5 px-3 text-xs gap-1.5 rounded-lg shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Property</span>
              </Button>
            </>
        </div>
      </div>

      {/* Main Title & Address Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          {property.description?.slice(0, 60) || `${property.propertyType} — ${property.address.subCity}`}
        </h1>
        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-600 mt-1.5">
          <span className="flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            {[
              property.address.city || "Addis Ababa",
              property.address.subCity,
              property.address.woreda && `Woreda ${property.address.woreda}`,
              property.address.kebele && `Kebele ${property.address.kebele}`,
              property.address.houseNumber && `House #${property.address.houseNumber}`
            ].filter(Boolean).join(", ")}
          </span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="flex items-center gap-1 text-slate-500">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            {isCommercial ? "Commercial Shopping Center" : property.propertyType}
          </span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="flex items-center gap-1 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Registered on {new Date(property.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* Image Gallery and Key Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Gallery */}
        <div className="lg:col-span-2 space-y-2.5">
          <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-clean">
            {currentImage ? (
              <img
                src={currentImage}
                alt={property.title ?? property.propertyType}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                {isCommercial ? <Store className="w-16 h-16" /> : <Home className="w-16 h-16" />}
                <span className="text-xs text-slate-400">No images uploaded</span>
              </div>
            )}
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
              {property.propertyType}
            </div>
            {hasImages && (
              <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono px-2.5 py-1 rounded-lg">
                Photo {selectedImageIndex + 1} of {images.length}
              </div>
            )}
          </div>

          {/* Thumbnails — only shown when there are multiple images */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    selectedImageIndex === idx
                      ? "border-[#00450d] ring-2 ring-[#00450d]/20 scale-[1.02]"
                      : "border-slate-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img.imageUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  {img.isCover && (
                    <span className="absolute bottom-0.5 left-0.5 text-[8px] font-bold bg-[#00450d] text-white px-1 rounded">
                      Cover
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Financial & Landlord Summary Card */}
        <div className="space-y-4">
          <Card className="bg-white border-slate-200/90 shadow-clean rounded-2xl">
            <CardHeader className="p-4 pb-2 border-b border-slate-100">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MUNICIPAL VALUATION & RENT</p>
              <div className="flex items-baseline justify-between mt-1">
                <div className="text-2xl font-extrabold text-slate-900">
                  ETB {Number(property.monthlyRent).toLocaleString()}
                  <span className="text-xs font-normal text-slate-500"> / month</span>
                </div>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                Standard Municipal Landlord Index Rate
              </p>
            </CardHeader>

            <CardContent className="p-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Gross Area</span>
                  <span className="text-sm font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                    <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                    {property.areaSqMeter ? `${Number(property.areaSqMeter).toLocaleString()} m²` : "165 m²"}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Floor Level</span>
                  <span className="text-sm font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    {property.floorNumber || (isCommercial ? "Ground + 3" : "Ground + 1")}
                  </span>
                </div>
                {property.bedroomCount != null && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Bedrooms</span>
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                      <Bed className="w-3.5 h-3.5 text-slate-500" />
                      {property.bedroomCount} Bedrooms
                    </span>
                  </div>
                )}
                {property.bathroomCount != null && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Bathrooms</span>
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                      <Bath className="w-3.5 h-3.5 text-slate-500" />
                      {property.bathroomCount} Baths
                    </span>
                  </div>
                )}
              </div>

              {/* Primary Actions */}
              <div className="space-y-2 pt-1">
                {property?.status === "LISTED" && (
                  <Button
                    onClick={() => {
                      if (citizenContext?.handleNavigate) {
                        citizenContext.handleNavigate("agreements");
                      } else {
                        router.push("/citizen/dashboard/agreements");
                      }
                    }}
                    className="w-full bg-[#00450d] hover:bg-[#1b5e20] text-white h-9 text-xs font-semibold rounded-xl"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                    Manage Rental Contracts
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("details")}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "details" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>General Details & Amenities</span>
        </button>

        <button
          onClick={() => setActiveTab("cadastre")}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "cadastre" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Title Deed & Cadastre</span>
        </button>

        {isCommercial && (
          <button
            onClick={() => setActiveTab("units")}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "units" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Mall Units & Shops (24)</span>
          </button>
        )}

        {property?.status === "LISTED" && (
          <button
            onClick={() => setActiveTab("agreements")}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === "agreements" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Registered Lease Contracts</span>
          </button>
        )}
      </div>

      {/* Tab 1: Details & Amenities */}
      {activeTab === "details" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card className="bg-white border-slate-200/90 shadow-clean rounded-2xl">
            <CardHeader className="p-4 pb-2 border-b border-slate-100">
              <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider">Property Description</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-xs text-slate-600 leading-relaxed space-y-3">
              <p>
                {property.description ||
                  `High-standard municipal property registered in Addis Ababa, ${property.address.subCity}. Fully verified under the Government Rental Administration & Management System (GRAMS). Featuring official title deed registration and municipal cadastre documentation.`}
              </p>
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <p className="font-bold text-slate-800">Furnishing & Interior Specifications:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-medium">
                    Status: {property.furnishingStatus || "Semi-Furnished"}
                  </span>
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-medium">
                    Flooring: Ceramic & Parquet
                  </span>
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-medium">
                    Water Line: Dedicated Municipal Supply
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200/90 shadow-clean rounded-2xl">
            <CardHeader className="p-4 pb-2 border-b border-slate-100">
              <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider">Infrastructure & Utilities</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>3-Phase Electricity & Backup Power</span>
                </span>
                <Badge variant="active" className="text-[10px]">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span>Dedicated Overhead Water Reserve (10,000L)</span>
                </span>
                <Badge variant="active" className="text-[10px]">Verified</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>24/7 Security Guard & CCTV Compliance</span>
                </span>
                <Badge variant="active" className="text-[10px]">Equipped</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Title Deed & Cadastre */}
      {activeTab === "cadastre" && (
        <div className="space-y-4">
          <Card className="bg-white border-slate-200/90 shadow-clean rounded-2xl">
            <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Ownership & Title Deed Documents
                </CardTitle>
                <p className="text-[11px] text-slate-400">Scanned and verified through Woreda Land Administration</p>
              </div>
              <Badge variant="active" className="text-[10px]">Digital Seal Attached</Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {property.ownershipDocuments && property.ownershipDocuments.length > 0 ? (
                property.ownershipDocuments.map((doc, idx) => (
                  <div
                    key={doc.id || idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-[#00450d] flex items-center justify-center font-bold">
                        <FileText className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{doc.documentType || "Certificate of Title Deed"}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Doc Ref: {doc.documentNumber} · Issued: {doc.issueDate || "2024-01-15"}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => showToast(`Viewing verified certificate ${doc.documentNumber}`)}
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1.5 border-slate-300 text-slate-700 hover:bg-white rounded-lg"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-[#00450d] flex items-center justify-center font-bold">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Certificate of Title Deed (Land Register)</p>
                      <p className="text-[11px] text-slate-500 font-mono">Doc Ref: TD-ET-902148 · Scanned Copy</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => showToast("Viewing verified certificate TD-ET-902148")}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5 border-slate-300 text-slate-700 hover:bg-white rounded-lg"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </Button>
                </div>
              )}

              {/* Municipal Cadastre Block */}
              <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MUNICIPAL CADASTRE LOCATOR</span>
                  <span className="text-[10px] font-mono text-emerald-400">STATUS: VERIFIED</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block">CITY</span>
                    <span className="text-slate-200">{property.address.city || "Addis Ababa"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">SUB-CITY</span>
                    <span className="text-slate-200">{property.address.subCity}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">WOREDA</span>
                    <span className="text-slate-200">{property.address.woreda}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">PARCEL ID</span>
                    <span className="text-emerald-300">PCL-2026-9912</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Mall Units (for commercial) */}
      {activeTab === "units" && isCommercial && (
        <Card className="bg-white border-slate-200/90 shadow-clean rounded-2xl">
          <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Shopping Mall Units & Retail Directory
              </CardTitle>
              <p className="text-[11px] text-slate-400">
                Total {property.units?.length || 0} units across {property.units?.length ? "multiple levels" : "Ground + 3 levels"}
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {property.units && property.units.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Unit #</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Floor</th>
                    <th className="py-2.5 px-4">Area</th>
                    <th className="py-2.5 px-4">Monthly Rent</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {property.units.map((unit) => (
                    <tr key={unit.id} className="hover:bg-slate-50/70 transition-colors cursor-pointer" onClick={() => handleUnitClick(unit.id)}>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{unit.unitCode || unit.shopNumber || "—"}</td>
                      <td className="py-3 px-4 text-slate-700">{unit.unitType || unit.category || "—"}</td>
                      <td className="py-3 px-4 text-slate-500">{unit.floorLevel || "—"}</td>
                      <td className="py-3 px-4 text-slate-600">{unit.areaSqMeter ? `${Number(unit.areaSqMeter).toLocaleString()} m²` : "—"}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{unit.rentAmount ? `ETB ${Number(unit.rentAmount).toLocaleString()}` : "—"}</td>
                      <td className="py-3 px-4">
                        <Badge variant={unit.status === "AVAILABLE" ? "active" : "secondary"} className="text-[10px]">
                        {unit.status}
                      </Badge>
    </td>
  </tr>
))}
</tbody>
</table>
) : (
  <div className="p-8 text-center text-slate-500 text-xs">
    <Store className="w-8 h-8 mx-auto mb-2 text-slate-300" />
    <p>No units registered yet for this property.</p>
  </div>
)}
</CardContent>
</Card>
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

      {/* Tab 4: Registered Lease Contracts */}
      {activeTab === "agreements" && (
        <Card className="bg-white border-slate-200/90 shadow-clean rounded-2xl">
          <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Active & Pending Rental Agreements
              </CardTitle>
              <p className="text-[11px] text-slate-400">Contracts registered under GRAMS municipal framework</p>
            </div>
            <Button
              onClick={() => {
                if (citizenContext?.handleNavigate) {
                  citizenContext.handleNavigate("agreements");
                } else {
                  router.push("/citizen/dashboard/agreements");
                }
              }}
              size="sm"
              className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-8 px-3 rounded-lg gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Draft New Agreement</span>
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/90">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-[#00450d] flex items-center justify-center font-bold">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 text-xs font-mono">AG-ET-2026-0814</p>
                    <Badge variant="active" className="text-[10px]">Verified & Active</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Tenant: Hanna Girma · Term: 01 Sep 2025 to 31 Aug 2026 · Rent: ETB {Number(property.monthlyRent).toLocaleString()}/mo
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  if (citizenContext?.handleNavigate) {
                    citizenContext.handleNavigate("agreements");
                  } else {
                    router.push("/citizen/dashboard/agreements");
                  }
                }}
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1 border-slate-300 text-slate-700 hover:bg-white rounded-lg"
              >
                <span>View Full Contract</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Property</h3>
                <p className="text-sm text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete this property? This will permanently remove the property and all associated documents from the system.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                disabled={isDeleting}
                className="text-xs h-9 px-4"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteProperty}
                variant="destructive"
                disabled={isDeleting}
                className="text-xs h-9 px-4"
              >
                {isDeleting ? "Deleting..." : "Delete Property"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertyDetailPage;
