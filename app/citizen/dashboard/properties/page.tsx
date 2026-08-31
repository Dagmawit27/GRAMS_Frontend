"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Building2,
  TrendingUp,
  Plus,
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
  ShieldCheck,
  FileCheck2,
  Sparkles,
  Search,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  List as ListIcon,
  Copy,
  Check,
  ExternalLink,
  Download,
  Share2,
  Layers,
  Building,
  KeyRound,
  X,
  FileSpreadsheet,
  FileText,
  UserCheck,
  CheckCheck,
  Info,
  Calendar,
  DollarSign,
  ChevronDown,
} from "lucide-react";
import { getSession, getMyProperties, PropertyResponse } from "@/lib/api";
import { useCitizenData } from "@/hooks/useCitizenData";
import { PropertyUnit } from "@/types";

// =========================================================================
// DEFAULT HIGH-QUALITY FALLBACK IMAGES
// =========================================================================
const DEFAULT_PROPERTY_IMAGES: Record<string, string> = {
  mall: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&auto=format&fit=crop&q=80",
  commercial: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
  villa: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=80",
  apartment: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
  condominium: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=80",
};


function getPropertyCoverImage(p: PropertyResponse): string {
  // Use database image if available
  const customCover = p.images?.find((i) => i.isCover)?.imageUrl ?? p.images?.[0]?.imageUrl;
  if (customCover) {
    return customCover;
  }
  // Fall back to static images based on property type
  const typeKey = (p.propertyType || "").toLowerCase();
  if (typeKey.includes("mall") || typeKey.includes("plaza") || typeKey.includes("commercial")) {
    return DEFAULT_PROPERTY_IMAGES.mall;
  }
  if (typeKey.includes("villa")) return DEFAULT_PROPERTY_IMAGES.villa;
  if (typeKey.includes("condo")) return DEFAULT_PROPERTY_IMAGES.condominium;
  if (typeKey.includes("apartment")) return DEFAULT_PROPERTY_IMAGES.apartment;
  return DEFAULT_PROPERTY_IMAGES.default;
}

// Status categorization and visual styling
type FilterStatusTab = "ALL" | "LISTED" | "VERIFIED" | "APPROVED" | "PENDING" | "RENTED";

interface StatusMetaInfo {
  label: string;
  badgeClass: string;
  dotClass: string;
  icon: React.ReactNode;
  description: string;
}

function getStatusMeta(status: PropertyResponse["status"]): StatusMetaInfo {
  switch (status) {
    case "LISTED":
      return {
        label: "Listed",
        badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200/90",
        dotClass: "bg-emerald-500",
        icon: <Sparkles className="w-3 h-3 text-emerald-600" />,
        description: "Publicly listed & accepting leases",
      };
    case "VERIFIED":
      return {
        label: "Officer Verified",
        badgeClass: "bg-blue-50 text-blue-800 border-blue-200/90",
        dotClass: "bg-blue-500",
        icon: <FileCheck2 className="w-3 h-3 text-blue-600" />,
        description: "Inspected by Woreda Officer",
      };
    case "RENTED":
      return {
        label: "Rented",
        badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200/90",
        dotClass: "bg-indigo-500",
        icon: <KeyRound className="w-3 h-3 text-indigo-600" />,
        description: "Active tenant contract running",
      };
    case "PENDING":
      return {
        label: "Pending Review",
        badgeClass: "bg-amber-50 text-amber-800 border-amber-200/90",
        dotClass: "bg-amber-500",
        icon: <Hourglass className="w-3 h-3 text-amber-600" />,
        description: "Awaiting field officer review",
      };
    case "REJECTED":
      return {
        label: "Revision Needed",
        badgeClass: "bg-rose-50 text-rose-800 border-rose-200/90",
        dotClass: "bg-rose-500",
        icon: <XCircle className="w-3 h-3 text-rose-600" />,
        description: "Discrepancy reported by officer",
      };
    default:
      return {
        label: status || "Registered",
        badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
        dotClass: "bg-slate-400",
        icon: <Building2 className="w-3 h-3 text-slate-500" />,
        description: "Municipal record registered",
      };
  }
}

export const PropertiesPage: React.FC = () => {
  const router = useRouter();
  const context = useCitizenData();

  // State Management
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [ownerName, setOwnerName] = useState("Dagmawit Mesfin Tadesse");
  const [ownerEmail, setOwnerEmail] = useState("dagmawitmesfin27@gmail.com");
  const [ownerSubCity, setOwnerSubCity] = useState("Bole Sub City");

  // Filtering, Search & Sorting States
  const [statusFilter, setStatusFilter] = useState<FilterStatusTab>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [subCityFilter, setSubCityFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"NEWEST" | "RENT_HIGH" | "RENT_LOW" | "AREA_DESC" | "CODE_ASC">("NEWEST");
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");

  // Toast / Copy Feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyCode = (code: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Property Code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Load properties from API, localStorage, and Seeded registry
  useEffect(() => {
    const s = getSession();
    if (s?.user) {
      const fullName = [s.user.firstName, s.user.middleName, s.user.lastName].filter(Boolean).join(" ");
      if (fullName) setOwnerName(fullName);
      if (s.user.email) setOwnerEmail(s.user.email);
    }

    const token = s?.token || "demo-token";

    getMyProperties(token)
      .then((data) => {
        // Merge API/LocalStorage data with seeded portfolio so user always has rich interactive data
        const mergedList: PropertyResponse[] = [];
        const seenCodes = new Set<string>();

        const addProp = (p: PropertyResponse) => {
          const code = (p.propertyCode || p.id).toUpperCase();
          if (!seenCodes.has(code)) {
            seenCodes.add(code);
            mergedList.push({
              ...p,
              propertyCode: p.propertyCode || p.id,
            });
          }
        };

        // 1. Data from API/LocalStorage
        (data || []).forEach(addProp);

        // 2. Data from localStorage registered_properties directly if any
        if (typeof window !== "undefined") {
          try {
            const rawStored = localStorage.getItem("registered_properties");
            if (rawStored) {
              const parsed: PropertyResponse[] = JSON.parse(rawStored);
              parsed.forEach(addProp);
            }
          } catch {
            // ignore
          }
        }


        setProperties(mergedList);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load properties:", err);
        setError("Failed to load properties. Please try again.");
        setLoading(false);
      });
  }, []);

  // SSE connection for real-time property status updates
  useEffect(() => {
    const s = getSession();
    if (!s?.user?.email) return;

    const landlordUserId = s.user.email;
    console.log("Connecting to SSE with userId:", landlordUserId);
    const eventSource = new EventSource(`http://localhost:8080/api/notifications/subscribe?userId=${landlordUserId}`);

    eventSource.addEventListener('connected', (event) => {
      console.log("SSE connected:", event.data);
    });

    eventSource.addEventListener('notification', (event) => {
      console.log("Received SSE notification:", event.data);
      const notification = JSON.parse(event.data);
      
      // If notification is about property status change, reload properties
      if (notification.type === 'PROPERTY_VERIFIED' || notification.type === 'PROPERTY_APPROVED' || notification.type === 'PROPERTY_REJECTED') {
        console.log("Property status changed, reloading...");
        setTimeout(() => {
          const token = s?.token || "demo-token";
          getMyProperties(token)
            .then((data) => {
              setProperties(data || []);
              showToast("Property status updated!");
            })
            .catch((err) => {
              console.error("Failed to reload properties:", err);
            });
        }, 500);
      }
    });

    eventSource.addEventListener('unreadCount', (event) => {
      console.log("Received unread count update:", event.data);
    });

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      console.error("EventSource readyState:", eventSource.readyState);
      eventSource.close();
    };

    return () => {
      console.log("Closing SSE connection");
      eventSource.close();
    };
  }, []);

  // Compute Counts for Status Pills
  const counts = useMemo(() => {
    const total = properties.length;
    const listed = properties.filter((p) => p.status === "LISTED").length;
    const verified = properties.filter((p) => p.status === "VERIFIED").length;
    // Approved includes listed & rented properties (not verified)
    const approved = properties.filter((p) => p.status === "LISTED" || p.status === "RENTED").length;
    const pending = properties.filter((p) => p.status === "PENDING").length;
    const rented = properties.filter((p) => p.status === "RENTED").length;

    // Total monthly potential revenue from active/listed/rented portfolio
    const totalMonthlyRevenue = properties
      .filter((p) => p.status !== "REJECTED")
      .reduce((sum, p) => sum + (Number(p.monthlyRent) || 0), 0);

    // Total commercial units & residences
    const totalUnitsCount = properties.reduce(
      (sum, p) => sum + (p.units?.length || 1),
      0
    );

    return { total, listed, verified, approved, pending, rented, totalMonthlyRevenue, totalUnitsCount };
  }, [properties]);

  // Unique Sub-Cities for filter dropdown
  const availableSubCities = useMemo(() => {
    const set = new Set<string>();
    properties.forEach((p) => {
      if (p.address?.subCity) set.add(p.address.subCity);
    });
    return Array.from(set).sort();
  }, [properties]);

  // Filtered & Sorted Properties List
  const filteredProperties = useMemo(() => {
    return properties
      .filter((p) => {
        // Status Filter
        if (statusFilter === "LISTED" && p.status !== "LISTED") return false;
        if (statusFilter === "VERIFIED" && p.status !== "VERIFIED") return false;
        if (statusFilter === "APPROVED" && !(p.status === "LISTED" || p.status === "RENTED")) return false;
        if (statusFilter === "PENDING" && p.status !== "PENDING") return false;
        if (statusFilter === "RENTED" && p.status !== "RENTED") return false;

        // Property Type Filter
        if (typeFilter !== "ALL") {
          const pType = (p.propertyType || "").toLowerCase();
          const target = typeFilter.toLowerCase();
          if (target === "commercial") {
            if (!pType.includes("commercial") && !pType.includes("mall") && !pType.includes("plaza")) return false;
          } else if (!pType.includes(target)) {
            return false;
          }
        }

        // Sub-City Filter
        if (subCityFilter !== "ALL") {
          if (p.address?.subCity !== subCityFilter) return false;
        }

        // Search Query Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const code = (p.propertyCode || p.id).toLowerCase();
          const title = (p.title || "").toLowerCase();
          const subCity = (p.address?.subCity || "").toLowerCase();
          const street = (p.address?.street || "").toLowerCase();
          const woreda = (p.address?.woreda || "").toLowerCase();
          const houseNo = (p.houseNumber || p.address?.houseNumber || "").toLowerCase();

          return (
            code.includes(q) ||
            title.includes(q) ||
            subCity.includes(q) ||
            street.includes(q) ||
            woreda.includes(q) ||
            houseNo.includes(q)
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "RENT_HIGH") return (b.monthlyRent || 0) - (a.monthlyRent || 0);
        if (sortBy === "RENT_LOW") return (a.monthlyRent || 0) - (b.monthlyRent || 0);
        if (sortBy === "AREA_DESC") return (b.areaSqMeter || 0) - (a.areaSqMeter || 0);
        if (sortBy === "CODE_ASC") return (a.propertyCode || "").localeCompare(b.propertyCode || "");
        // Default NEWEST
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [properties, statusFilter, typeFilter, subCityFilter, searchQuery, sortBy]);

  const handleNavigateDetail = (property: PropertyResponse) => {
    const targetId = property.id || property.propertyCode;
    router.push(`/citizen/dashboard/properties/property-detail?id=${encodeURIComponent(targetId)}`);
  };

  const handleResetFilters = () => {
    setStatusFilter("ALL");
    setSearchQuery("");
    setTypeFilter("ALL");
    setSubCityFilter("ALL");
    setSortBy("NEWEST");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

     

      {/* ========================================================================= */}
      {/* 3. COMPREHENSIVE FILTERING & SEARCH CONTROL BAR                          */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Row 1: Status Tab Pills (Listed, Verified, Approved, Pending, Rented) */}
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
           {/* View Mode Toggle (Grid / List) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("GRID")}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === "GRID" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("LIST")}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === "LIST" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Table / List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>All Properties</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${statusFilter === "ALL" ? "bg-white/20 text-white" : "bg-white text-slate-700"}`}>
              {counts.total}
            </span>
          </button>

          {/* LISTED FILTER */}
          <button
            onClick={() => setStatusFilter("LISTED")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              statusFilter === "LISTED"
                ? "bg-[#00450d] text-white shadow-xs"
                : "bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/70"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Listed</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${statusFilter === "LISTED" ? "bg-white/20 text-white" : "bg-white text-emerald-800"}`}>
              {counts.listed}
            </span>
          </button>

          {/* VERIFIED FILTER */}
          <button
            onClick={() => setStatusFilter("VERIFIED")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              statusFilter === "VERIFIED"
                ? "bg-blue-700 text-white shadow-xs"
                : "bg-blue-50 hover:bg-blue-100/80 text-blue-800 border border-blue-200/70"
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Verified</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${statusFilter === "VERIFIED" ? "bg-white/20 text-white" : "bg-white text-blue-800"}`}>
              {counts.verified}
            </span>
          </button>

          {/* APPROVED FILTER */}
          <button
            onClick={() => setStatusFilter("APPROVED")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              statusFilter === "APPROVED"
                ? "bg-[#00450d] text-white shadow-xs"
                : "bg-emerald-50 hover:bg-emerald-100/80 text-[#00450d] border border-emerald-300 font-semibold"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Approved</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${statusFilter === "APPROVED" ? "bg-white/20 text-white" : "bg-white text-[#00450d]"}`}>
              {counts.approved}
            </span>
          </button>

          {/* PENDING FILTER */}
          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              statusFilter === "PENDING"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 hover:bg-amber-100/80 text-amber-800 border border-amber-200/70"
            }`}
          >
            <Hourglass className="w-3.5 h-3.5" />
            <span>Pending</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${statusFilter === "PENDING" ? "bg-white/20 text-white" : "bg-white text-amber-800"}`}>
              {counts.pending}
            </span>
          </button>

          {/* RENTED FILTER */}
          <button
            onClick={() => setStatusFilter("RENTED")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              statusFilter === "RENTED"
                ? "bg-indigo-700 text-white shadow-xs"
                : "bg-indigo-50 hover:bg-indigo-100/80 text-indigo-800 border border-indigo-200/70"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Rented</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${statusFilter === "RENTED" ? "bg-white/20 text-white" : "bg-white text-indigo-800"}`}>
              {counts.rented}
            </span>
          </button>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            
            <Button
              size="sm"
              id="btn-register-new-property"
              onClick={() => router.push("/citizen/dashboard/properties/register")}
              className="h-10 px-2 bg-[#00450d] hover:bg-[#1b5e20] text-white font-bold text-xs rounded-xl shadow-xs gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register Property</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CONTENT VIEW: LOADING, EMPTY, GRID, OR LIST VIEW                      */}
      {/* ========================================================================= */}

      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#00450d]" />
          <p className="text-sm font-semibold text-slate-700">Loading Municipal Property Portfolio...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-3 p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <div>
            <p className="font-bold">Portfolio Access Notice</p>
            <p className="text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProperties.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-slate-900">No matching properties found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No property in your portfolio matches the selected status or search query. Try changing or clearing your filters.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={handleResetFilters} className="text-xs h-9">
              Clear Filters
            </Button>
            <Button
              size="sm"
              onClick={() => router.push("/citizen/dashboard/properties/register")}
              className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-9"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Register New Property
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. A. GRID VIEW (Cards with Photos, Badges, Specs & Actions)             */}
      {/* ========================================================================= */}
      {!loading && !error && filteredProperties.length > 0 && viewMode === "GRID" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProperties.map((p) => {
            const statusInfo = getStatusMeta(p.status);
            const coverImage = getPropertyCoverImage(p);
            const isCommercial =
              p.propertyType?.toLowerCase().includes("mall") ||
              p.propertyType?.toLowerCase().includes("commercial") ||
              p.propertyType?.toLowerCase().includes("plaza") ||
              (p.title && p.title.toLowerCase().includes("mall")) ||
              (p.units && p.units.length > 1);
            const unitsCount = p.units?.length || (isCommercial ? 24 : 1);
            const isApproved = p.status === "LISTED" || p.status === "RENTED";

            return (
              <Card
                key={p.id}
                onClick={() => handleNavigateDetail(p)}
                className="bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col cursor-pointer group rounded-2xl overflow-hidden"
              >
                {/* Hero Photograph with Badges */}
                <div className="relative h-48 bg-slate-900 overflow-hidden shrink-0">
                  <img
                    src={coverImage}
                    alt={p.title ?? p.propertyType}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = DEFAULT_PROPERTY_IMAGES.default;
                      if (target.src !== fallback) target.src = fallback;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-black/30" />

                  {/* Top Left: Property Code Tag with 1-click copy */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleCopyCode(p.propertyCode || p.id, e)}
                      className="bg-slate-900/90 backdrop-blur-md text-emerald-300 font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1.5 shadow-sm hover:bg-slate-800 transition-colors"
                      title="Click to copy property code"
                    >
                      <span>{p.propertyCode || p.id}</span>
                      {copiedCode === (p.propertyCode || p.id) ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400 opacity-70" />
                      )}
                    </button>

                    {isApproved && (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                        <ShieldCheck className="w-3 h-3" />
                        Approved
                      </span>
                    )}
                  </div>

                  {/* Top Right: Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold backdrop-blur-md shadow-xs border ${
                        p.status === "VERIFIED"
                          ? "bg-blue-950/80 text-blue-200 border-blue-500/40"
                          : p.status === "RENTED"
                          ? "bg-indigo-950/80 text-indigo-200 border-indigo-500/40"
                          : "bg-amber-950/80 text-amber-200 border-amber-500/40"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${statusInfo.dotClass} animate-pulse`} />
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Bottom Image Info: Monthly Rent & Type */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <p className="text-white text-lg font-black drop-shadow-sm leading-tight">
                        ETB {Number(p.monthlyRent).toLocaleString()}
                        <span className="text-xs font-normal text-slate-300 ml-1">/ month</span>
                      </p>
                    </div>

                    <span className="bg-black/70 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                      {p.propertyType}
                    </span>
                  </div>
                </div>

                {/* Card Body & Details */}
                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    {/* Title */}
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#00450d] transition-colors line-clamp-1">
                        {p.title || `${p.propertyType} — ${p.address?.subCity}`}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {[p.address?.subCity, p.address?.woreda && `Woreda ${p.address.woreda}`, p.houseNumber && `H.No ${p.houseNumber}`]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </p>
                    </div>

                    {/* Specifications Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-2 pb-1 border-t border-slate-100 text-xs text-slate-700">
                      <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate font-medium">{p.address?.subCity?.replace(" Sub City", "") || "Bole"}</span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
                        <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">{p.areaSqMeter || 120} m²</span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg">
                        {isCommercial ? (
                          <>
                            <Store className="w-3.5 h-3.5 text-amber-600" />
                            <span className="font-medium">{unitsCount} Units</span>
                          </>
                        ) : p.bedroomCount != null ? (
                          <>
                            <Bed className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium">{p.bedroomCount} Beds</span>
                          </>
                        ) : (
                          <>
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium">{p.floorNumber || "G+0"}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Verification Status Banner */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        {statusInfo.icon}
                        <span>{statusInfo.description}</span>
                      </span>
                      {p.ownershipDocuments && p.ownershipDocuments.length > 0 && (
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {p.ownershipDocuments.length} Deeds
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateDetail(p);
                      }}
                      className="flex-1 h-9 text-xs font-semibold text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-50 rounded-xl gap-1.5 cursor-pointer"
                    >
                      <span>View Details & Units</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </Button>

                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyCode(p.propertyCode || p.id, e);
                      }}
                      className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl gap-1 cursor-pointer"
                      title="Copy official code"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. B. LIST / TABLE VIEW (Dense Professional Municipal Ledger)             */}
      {/* ========================================================================= */}
      {!loading && !error && filteredProperties.length > 0 && viewMode === "LIST" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3.5 px-4">Property Code</th>
                  <th className="py-3.5 px-4">Property & Type</th>
                  <th className="py-3.5 px-4">Location / Woreda</th>
                  <th className="py-3.5 px-4">Size & Units</th>
                  <th className="py-3.5 px-4">Status & Seal</th>
                  <th className="py-3.5 px-4 text-right">Monthly Rent</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProperties.map((p) => {
                  const statusInfo = getStatusMeta(p.status);
                  const coverImage = getPropertyCoverImage(p);
                  const isCommercial =
                    p.propertyType?.toLowerCase().includes("mall") ||
                    p.propertyType?.toLowerCase().includes("commercial") ||
                    p.propertyType?.toLowerCase().includes("plaza");
                  const unitsCount = p.units?.length || (isCommercial ? 24 : 1);
                  const isApproved = p.status === "LISTED" || p.status === "RENTED";

                  return (
                    <tr
                      key={p.id}
                      onClick={() => handleNavigateDetail(p)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#00450d] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 font-semibold text-xs">
                            {p.propertyCode || p.id}
                          </span>
                          <button
                            onClick={(e) => handleCopyCode(p.propertyCode || p.id, e)}
                            className="text-slate-400 hover:text-slate-700 p-1"
                            title="Copy Code"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Title & Type */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3 min-w-[220px]">
                          <img
                            src={coverImage}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 group-hover:text-[#00450d] transition-colors truncate text-xs">
                              {p.title || p.propertyType}
                            </p>
                            <span className="inline-block text-[10px] text-slate-500 font-medium">
                              {p.propertyType} {p.floorNumber && `• ${p.floorNumber}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {p.address?.subCity}, Woreda {p.address?.woreda || "03"}
                          </span>
                        </div>
                        {p.houseNumber && <p className="text-[10px] text-slate-400 pl-5">H.No: {p.houseNumber}</p>}
                      </td>

                      {/* Size & Units */}
                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                        <p className="font-semibold text-xs">{p.areaSqMeter || 120} m²</p>
                        <p className="text-[10px] text-slate-400">
                          {isCommercial ? `${unitsCount} Commercial Units` : `${p.bedroomCount || 3} Beds • ${p.bathroomCount || 2} Baths`}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusInfo.badgeClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                            {statusInfo.label}
                          </span>
                          {isApproved && (
                            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3" />
                              Certified Approved
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Rent */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <p className="font-bold text-slate-900 text-sm">
                          ETB {Number(p.monthlyRent).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-400">per month</p>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigateDetail(p);
                          }}
                          className="h-8 px-3 text-xs font-semibold rounded-lg hover:bg-slate-100"
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
