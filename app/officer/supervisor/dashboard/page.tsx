"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCitizenData } from "@/hooks/useCitizenData";
import { getSession, clearSession, getPropertiesByJurisdiction, PropertyResponse } from "@/lib/api";
import { getOfficerJurisdiction, OfficerJurisdiction } from "@/app/officer/useOfficerJurisdiction";
import {
  LayoutDashboard,
  ShieldCheck,
  FileText,
  BarChart3,
  HelpCircle,
  Archive,
  Search,
  Bell,
  Settings,
  Download,
  Hourglass,
  CheckCircle2,
  XCircle,
  Sliders,
  Filter,
  AlertTriangle,
  Info,
  ChevronDown,
  LogOut,
  X,
  Check,
  Eye,
  Building,
  User,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  FileCheck2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Telemetry Time-Series Datasets
export interface TelemetryPoint {
  date: string;
  submissions: number;
  validated: number;
  discrepancies: number;
  slaRate: number;
  boundaryQueries: number;
}

export const TELEMETRY_BIWEEKLY: TelemetryPoint[] = [
  { date: "Meskerem 01", submissions: 36, validated: 31, discrepancies: 5, slaRate: 91.2, boundaryQueries: 2 },
  { date: "Meskerem 08", submissions: 45, validated: 40, discrepancies: 5, slaRate: 92.5, boundaryQueries: 1 },
  { date: "Meskerem 15", submissions: 58, validated: 52, discrepancies: 6, slaRate: 93.4, boundaryQueries: 3 },
  { date: "Meskerem 22", submissions: 68, validated: 62, discrepancies: 6, slaRate: 94.8, boundaryQueries: 2 },
  { date: "Tikimt 01", submissions: 74, validated: 69, discrepancies: 5, slaRate: 95.3, boundaryQueries: 1 },
  { date: "Tikimt 08", submissions: 82, validated: 77, discrepancies: 5, slaRate: 95.9, boundaryQueries: 2 },
  { date: "Tikimt 15", submissions: 97, validated: 78, discrepancies: 14, slaRate: 96.1, boundaryQueries: 4 },
  { date: "Tikimt 22", submissions: 88, validated: 82, discrepancies: 6, slaRate: 96.4, boundaryQueries: 2 },
  { date: "Hidar 01", submissions: 91, validated: 86, discrepancies: 5, slaRate: 96.8, boundaryQueries: 1 },
];

// =========================================================================
// REUSABLE CADASTRAL & TENANCY VALIDATION TELEMETRY COMPONENT
// =========================================================================
export const CadastralTenancyValidationTelemetry: React.FC = () => {
  // Telemetry Filters
  const [timeRange, setTimeRange] = useState<"Bi-Weekly" | "Monthly" | "Quarterly">("Bi-Weekly");
  const [selectedSector, setSelectedSector] = useState("All Sectors (03-A - 03-F)");
  const [selectedPointIndex, setSelectedPointIndex] = useState<number>(6); // Tikimt 15 (Pin from Image)
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [citationGenerated, setCitationGenerated] = useState(false);

  // Selected audit point details
  const activePoint = TELEMETRY_BIWEEKLY[selectedPointIndex] || TELEMETRY_BIWEEKLY[6];

  // SVG Chart calculation parameters
  const chartHeight = 180;
  const chartWidth = 580;
  const maxFiles = 100;

  const getY = (val: number) => chartHeight - (val / maxFiles) * (chartHeight - 30) - 15;
  const getX = (idx: number) => 30 + (idx / (TELEMETRY_BIWEEKLY.length - 1)) * (chartWidth - 60);

  // Build SVG Paths
  const validatedPoints = TELEMETRY_BIWEEKLY.map((p, i) => `${getX(i)},${getY(p.validated)}`).join(" L ");
  const submissionsPoints = TELEMETRY_BIWEEKLY.map((p, i) => `${getX(i)},${getY(p.submissions)}`).join(" L ");
  const discrepanciesPoints = TELEMETRY_BIWEEKLY.map((p, i) => `${getX(i)},${getY(p.discrepancies)}`).join(" L ");

  const validatedAreaPath = `M ${getX(0)},${getY(TELEMETRY_BIWEEKLY[0].validated)} L ${validatedPoints} L ${getX(
    TELEMETRY_BIWEEKLY.length - 1
  )},${chartHeight - 10} L ${getX(0)},${chartHeight - 10} Z`;




import { Skeleton } from "@/components/ui/skeleton";

export const SupervisorDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-100">
      {/* 4 Metric KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex justify-between items-start">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Queue Table Skeleton */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3.5 w-64" />
            </div>
            <Skeleton className="h-8 w-32 rounded-lg" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((j) => (
              <div key={j} className="p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Chart & Summary Skeleton */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-5 space-y-4">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-44 w-full rounded-xl" />
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface QueueItem {
  id: string;
  propertyId: string;
  propertyTitle: string;
  officerCode: string;
  officerName: string;
  verificationDate: string;
  isFlagged?: boolean;
  flagReason?: string;
  propertyType: string;
  subCity: string;
  woreda: string;
  monthlyRent: number;
  ownerName: string;
  ownerFayda: string;
  officerNotes: string;
  rawProperty?: PropertyResponse;
}

function propertiesToQueueItems(properties: PropertyResponse[]): QueueItem[] {
  return properties.map((p) => ({
    id: p.id,
    propertyId: p.propertyCode,
    propertyTitle: p.title ?? p.propertyType,
    officerCode: "WO",
    officerName: "Woreda Officer",
    verificationDate: new Date(p.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    propertyType: p.propertyType,
    subCity: p.address?.subCity ?? "",
    woreda: p.address?.woreda ?? "",
    monthlyRent: Number(p.monthlyRent),
    ownerName: "Registered Landlord",
    ownerFayda: "ET-NID-VERIFIED",
    officerNotes:
      "Property inspected and verified by Woreda Officer. Documents attached. Ready for final Supervisor seal.",
    rawProperty: p,
  }));
}

export const SupervisorDashboardPage: React.FC = () => {
  const router = useRouter();
  const [jurisdiction, setJurisdiction] = useState<OfficerJurisdiction | null>(null);

  const [session, setSession] = useState(getSession());
  const [verifiedProperties, setVerifiedProperties] = useState<PropertyResponse[]>([]);
  const [listedProperties, setListedProperties] = useState<PropertyResponse[]>([]);
  const [rejectedProperties, setRejectedProperties] = useState<PropertyResponse[]>([]);
  const [pendingProperties, setPendingProperties] = useState<PropertyResponse[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const subCity = jurisdiction?.subCity ?? "";
  const woreda = jurisdiction?.woreda ?? "";
  const token = jurisdiction?.token ?? "";

  const [activeFilter, setActiveFilter] = useState<"All Pending" | "High Priority" | "Flagged Discrepancies">("All Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<"dashboard" | "properties" | "agreements" | "reports">("dashboard");

  // Modals & Interactivity
  
  const [selectedItemForReview, setSelectedItemForReview] = useState<QueueItem | null>(null);
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    setSession(getSession());
    const j = getOfficerJurisdiction();
    if (!j) {
      setError("Session expired. Please sign in again.");
      setLoading(false);
      return;
    }
    setJurisdiction(j);
  }, []);

  const loadAll = async () => {
    if (!jurisdiction) {
      setError("Session expired.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      let cancelled = false;
      const [verified, listed, rejected, pending] = await Promise.all([
        getPropertiesByJurisdiction(token, subCity, woreda, "VERIFIED"),
        getPropertiesByJurisdiction(token, subCity, woreda, "LISTED"),
        getPropertiesByJurisdiction(token, subCity, woreda, "REJECTED"),
        getPropertiesByJurisdiction(token, subCity, woreda, "PENDING"),
      ]);
      if (cancelled) return;
      setVerifiedProperties(verified);
      setListedProperties(listed);
      setRejectedProperties(rejected);
      setPendingProperties(pending);
      setQueue(propertiesToQueueItems(verified));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard data.";
      // Replace technical backend errors with user-friendly messages
      if (errorMessage.includes("No row with the given identifier exists for entity") && errorMessage.includes("Citizen")) {
        setError("Property owner information not found. The property may be linked to a deleted user account. Please contact system administrator.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!subCity || !woreda || !token) return;
    loadAll();
    return () => {};
  }, [subCity, woreda, token]); // eslint-disable-line react-hooks/exhaustive-deps

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const awaitingApproval = verifiedProperties.length;
  const verifiedToday = verifiedProperties.filter((p) => new Date(p.createdAt).getTime() >= startOfToday).length;
  const totalApproved = listedProperties.length;
  const totalProcessed = listedProperties.length + rejectedProperties.length + verifiedProperties.length;
  const rejectionRate = totalProcessed > 0 ? ((rejectedProperties.length / totalProcessed) * 100).toFixed(1) : "0.0";

  const allProperties = useMemo(
    () => [...verifiedProperties, ...listedProperties, ...rejectedProperties, ...pendingProperties],
    [verifiedProperties, listedProperties, rejectedProperties, pendingProperties]
  );

  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIdx = now.getMonth();
    const currentYear = now.getFullYear();

    const last6Months: { label: string; monthIdx: number; year: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonthIdx - i, 1);
      last6Months.push({
        label: months[d.getMonth()],
        monthIdx: d.getMonth(),
        year: d.getFullYear(),
      });
    }

    const counts = last6Months.map((m) => {
      const approved = allProperties.filter(
        (p) => {
          const d = new Date(p.createdAt);
          return d.getMonth() === m.monthIdx && d.getFullYear() === m.year &&
                 (p.status === "LISTED");
        }
      ).length;
      const rejected = allProperties.filter(
        (p) => {
          const d = new Date(p.createdAt);
          return d.getMonth() === m.monthIdx && d.getFullYear() === m.year &&
                 (p.status === "REJECTED");
        }
      ).length;
      return { ...m, approved, rejected };
    });

    const maxCount = Math.max(1, ...counts.flatMap((c) => [c.approved, c.rejected]));
    return { counts, maxCount };
  }, [allProperties, now]);

  const goToDetail = (id: string) => {
    router.push(`/officer/supervisor/properties/verification-detail?id=${id}`);
  };

  const handleLogout = () => {
    clearSession();
    router.push("/");
  };

  const handleApproveItem = (item: QueueItem) => {
    setQueue((prev) => prev.filter((q) => q.id !== item.id));
    setSelectedItemForReview(null);
    setActionSuccessToast(`Property ${item.propertyId} has received Final Supervisor Seal & Official Approval.`);
    setTimeout(() => setActionSuccessToast(null), 5000);
  };

  const handleRejectItem = (item: QueueItem) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a formal rejection or correction notice reason.");
      return;
    }
    setQueue((prev) => prev.filter((q) => q.id !== item.id));
    setSelectedItemForReview(null);
    setIsRejecting(false);
    setRejectionReason("");
    setActionSuccessToast(`Property ${item.propertyId} sent back to Officer with correction orders.`);
    setTimeout(() => setActionSuccessToast(null), 5000);
  };

  const handleExportReport = () => {
    const csvContent = [
      "Property ID,Property Title,Verified By Officer,Verification Date,Status,Monthly Rent (ETB),SubCity",
      ...queue.map(
        (q) =>
          `"${q.propertyId}","${q.propertyTitle}","${q.officerName}","${q.verificationDate}","${
            q.isFlagged ? "Flagged" : "Pending Supervisor Approval"
          }",${q.monthlyRent},"${q.subCity}"`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Supervisor_Approval_Queue_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setActionSuccessToast("Official Supervisor Report exported successfully.");
    setTimeout(() => setActionSuccessToast(null), 4000);
  };
  const filteredQueue = queue.filter((item) => {
    const matchesSearch =
      item.propertyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.officerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === "Flagged Discrepancies") return item.isFlagged;
    if (activeFilter === "High Priority") return item.monthlyRent > 50000 || item.isFlagged;
    return true;
  });

  if (loading) {
    return <SupervisorDashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Action Success Toast Banner */}
      {actionSuccessToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{actionSuccessToast}</span>
          </div>
          <button onClick={() => setActionSuccessToast(null)} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
      )}
  
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* ================================================================= */}
      {/* SECTION 1: 4 TOP KPI METRIC CARDS (EXACT MATCH TO IMAGE)          */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ------------------------------------------------------------- */}
        {/* CARD 1: LEASE CLEARANCE                                       */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  LEASE CLEARANCE
                </span>
              </div>
              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded leading-none">
                PROCLAMATION 1284
              </span>
            </div>

            {/* Metric Row */}
            <div className="mt-3 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-[#00450d] tracking-tight">
                  92.8%
                </span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                  +4.8%
                </span>
              </div>
              <div className="text-right text-[10px] text-slate-500 font-medium leading-tight">
                <div>Goal: <span className="font-bold text-slate-700">90.0%</span></div>
                <div className="text-emerald-700 font-bold">+2.8% Above SLA</div>
              </div>
            </div>

            {/* Subtext */}
            <p className="text-xs text-slate-500 mt-1">
              74 Cleared / 79 Filed • 5 Pending
            </p>

            {/* Area Sparkline Chart */}
            <div className="mt-3 h-12 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 200 45" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="leaseSparklineMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 38 Q 60 32 100 24 T 195 8 L 195 45 L 0 45 Z"
                  fill="url(#leaseSparklineMain)"
                />
                <path
                  d="M 0 38 Q 60 32 100 24 T 195 8"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="0" cy="38" r="3" fill="#059669" />
                <circle cx="100" cy="24" r="3" fill="#059669" />
                <circle cx="195" cy="8" r="3.5" fill="#059669" />
              </svg>
            </div>

            {/* X-Axis labels for sparkline */}
            <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
              <span>Wk 1 (88.0%)</span>
              <span>Wk 3 (90.2%)</span>
              <span>Wk 6 (92.8%)</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="text-slate-500 font-medium">Rental Ceiling Cap:</span>
            <span className="font-black text-slate-900">100% Audited</span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CARD 2: TITLE VALIDATION                                      */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  TITLE VALIDATION
                </span>
              </div>
              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded leading-none">
                CADASTRE GIS
              </span>
            </div>

            {/* Metric Row */}
            <div className="mt-3 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-[#00450d] tracking-tight">
                  96.2%
                </span>
                <span className="text-xs font-bold text-slate-600">
                  148 Deeds
                </span>
              </div>
              <div className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-1 rounded text-center leading-tight">
                <div className="text-[10px] font-bold">Flags: 2.7%</div>
                <div className="text-[9px] text-rose-500 font-medium">Declining trend</div>
              </div>
            </div>

            {/* Subtext */}
            <p className="text-xs text-slate-500 mt-1">
              144 Certified • 4 Boundary Flags
            </p>

            {/* Dual Sparkline */}
            <div className="mt-3 h-12 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 200 45" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="valSparklineMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Validation Area */}
                <path
                  d="M 0 32 Q 80 26 120 18 T 195 8 L 195 45 L 0 45 Z"
                  fill="url(#valSparklineMain)"
                />
                {/* Validation Line */}
                <path
                  d="M 0 32 Q 80 26 120 18 T 195 8"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Flags Line (red declining) */}
                <path
                  d="M 0 38 Q 80 40 120 41 T 195 42"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[10px] mt-1 font-semibold">
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Validation (96.2%)
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Flags (2.7%)
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="text-slate-500 font-medium">National Fayda Match:</span>
            <span className="font-black text-slate-900">99.1% Sync</span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CARD 3: SLA VELOCITY                                          */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-700 shrink-0" />
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  SLA VELOCITY
                </span>
              </div>
              <span className="bg-sky-100 text-sky-900 border border-sky-300 text-[10px] font-bold px-2 py-0.5 rounded leading-none">
                GOV STANDARD
              </span>
            </div>

            {/* Metric Row */}
            <div className="mt-3 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  1.4d
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  AVG TURNAROUND
                </span>
              </div>
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded text-center leading-tight">
                <div className="text-[10px] font-bold text-emerald-700">+53% Ahead</div>
                <div className="text-[9px] text-emerald-600 font-medium">Fast-Track Active</div>
              </div>
            </div>

            {/* Mandate */}
            <p className="text-xs text-slate-500 mt-1">
              Statutory Mandate: Max 3.0 Days
            </p>

            {/* Buffer Limit Indicator Gauge */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] font-bold mb-1">
                <span className="text-emerald-700">Ahead (&lt;24h - 48h)</span>
                <span className="text-amber-700">Buffer Limit (72h)</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex relative">
                <div className="bg-emerald-500 w-[55%]" />
                <div className="bg-amber-400 w-[35%]" />
                <div className="bg-red-400 w-[10%]" />
                {/* Marker at 1.4 days (~46%) */}
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-slate-900 shadow-sm"
                  style={{ left: "46%" }}
                />
              </div>
            </div>

            {/* Sub-breakdown files */}
            <div className="flex justify-between text-[10px] text-slate-500 font-semibold mt-2">
              <span>Dispatch: 348 Files/Day</span>
              <span className="text-emerald-700 font-bold">100% On-Time</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="text-slate-500 font-medium">Auditor Stamp:</span>
            <span className="font-mono text-[11px] font-bold text-[#00450d] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              SEAL #BOLE-W03-88
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CARD 4: LEGAL ACTION SPLIT (DARK BLUE SLATE CARD)             */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-[#0a1120] text-white border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">
                  LEGAL ACTION SPLIT
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Total: 227 Files
              </span>
            </div>

            {/* Progress Bar (92.5% green, 6.1% amber, 1.4% red) */}
            <div className="mt-3.5">
              <div className="h-2 w-full flex rounded-full overflow-hidden bg-slate-800">
                <div className="bg-[#059669] w-[92.5%]" />
                <div className="bg-[#f59e0b] w-[6.1%]" />
                <div className="bg-[#ef4444] w-[1.4%]" />
              </div>
            </div>

            {/* 3 Status Rows */}
            <div className="mt-4 space-y-2.5 text-xs font-semibold">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-slate-300 font-medium">Approved &amp; Sealed</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold mr-1">210</span>
                  <span className="text-emerald-400 text-[11px]">(92.5%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-slate-300 font-medium">Discrepancy Query Notice</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold mr-1">14</span>
                  <span className="text-amber-400 text-[11px]">(6.1%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span className="text-slate-300 font-medium">Court / Injunction Caveat</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold mr-1">3</span>
                  <span className="text-red-400 text-[11px]">(1.4%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Auditor Stamp:</span>
            <span className="font-mono text-emerald-300 font-bold bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded">
              SEAL #BOLE-W03-88
            </span>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* SECTION 2: TELEMETRY GRAPH (LEFT) & DISCREPANCY DIAGNOSTICS (RIGHT)*/}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ------------------------------------------------------------- */}
        {/* LEFT: Cadastral & Tenancy Validation Telemetry Graph (2 COLS) */}
        {/* ------------------------------------------------------------- */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
          {/* Graph Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Cadastral &amp; Tenancy Validation Telemetry Graph
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>LIVE STREAMING</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Bi-weekly velocity of Landlord Submissions vs Validated Cadastral Deeds &amp; Discrepancies across Bole Sub-City Sectors
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Bi-Weekly / Monthly / Quarterly tabs */}
              <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex items-center text-xs">
                {(["Bi-Weekly", "Monthly", "Quarterly"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTimeRange(mode)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      timeRange === mode
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Ethiopian Date Badge */}
              <span className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold">
                Q1 - 2017 E.C.
              </span>

              {/* Sector Filter Dropdown Button */}
              <div className="relative">
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg pl-3 pr-7 py-1.5 cursor-pointer shadow-2xs focus:outline-hidden"
                >
                  <option>All Sectors (03-A - 03-F)</option>
                  <option>Sector 03-A (Bole Atlas)</option>
                  <option>Sector 03-B (Bole Medhanialem)</option>
                  <option>Sector 03-C (Bole Rwanda)</option>
                  <option>Sector 03-D (Bole Olympia)</option>
                  <option>Sector 03-E (Bole Japan)</option>
                  <option>Sector 03-F (Bole Airport)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
              </div>

              <button
                title="Download Telemetry SVG"
                onClick={() => alert("Downloading Cadastral Telemetry high-resolution export...")}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 cursor-pointer shadow-2xs"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Multi-Line SVG Chart */}
          <div className="relative h-60 w-full select-none">
            {/* Y-Axis scale indicators */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] font-mono text-slate-400 pointer-events-none">
              <span>FILES: 100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>

            <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
              <defs>
                <linearGradient id="telemetryGradientMain" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="30" y1={getY(100)} x2={chartWidth - 20} y2={getY(100)} stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="30" y1={getY(75)} x2={chartWidth - 20} y2={getY(75)} stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="30" y1={getY(50)} x2={chartWidth - 20} y2={getY(50)} stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="30" y1={getY(25)} x2={chartWidth - 20} y2={getY(25)} stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="30" y1={getY(0)} x2={chartWidth - 20} y2={getY(0)} stroke="#e2e8f0" />

              {/* Area Fill for Validated Deeds */}
              <path d={validatedAreaPath} fill="url(#telemetryGradientMain)" />

              {/* 1. Line: Gross Submissions (Dark Slate) */}
              <path
                d={`M ${submissionsPoints}`}
                fill="none"
                stroke="#334155"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 2. Line: Validated Deeds (Emerald Green) */}
              <path
                d={`M ${validatedPoints}`}
                fill="none"
                stroke="#059669"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 3. Line: Discrepancies (Amber Yellow) */}
              <path
                d={`M ${discrepanciesPoints}`}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4 2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Vertical Pin Line for selected point (Tikimt 15) */}
              <line
                x1={getX(selectedPointIndex)}
                y1={20}
                x2={getX(selectedPointIndex)}
                y2={chartHeight - 15}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* Clickable Dots for Each Data Point */}
              {TELEMETRY_BIWEEKLY.map((p, idx) => {
                const x = getX(idx);
                const isSelected = idx === selectedPointIndex;
                return (
                  <g key={p.date} className="cursor-pointer" onClick={() => setSelectedPointIndex(idx)}>
                    {/* Hitbox */}
                    <circle cx={x} cy={getY(p.submissions)} r="12" fill="transparent" />

                    {/* Submissions point */}
                    <circle
                      cx={x}
                      cy={getY(p.submissions)}
                      r={isSelected ? "5" : "3"}
                      className="fill-[#334155] stroke-white stroke-2"
                    />

                    {/* Validated point */}
                    <circle
                      cx={x}
                      cy={getY(p.validated)}
                      r={isSelected ? "6" : "3.5"}
                      className="fill-[#059669] stroke-white stroke-2"
                    />

                    {/* Discrepancies point */}
                    <circle
                      cx={x}
                      cy={getY(p.discrepancies)}
                      r={isSelected ? "4.5" : "2.5"}
                      className="fill-[#f59e0b] stroke-white stroke-2"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Tooltip Overlay Popup (Pinned matching image design) */}
            <div
              className="absolute z-20 bg-[#0f172a] text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700/80 pointer-events-none transform -translate-x-1/2 -translate-y-full animate-in fade-in"
              style={{
                left: `${(getX(selectedPointIndex) / chartWidth) * 100}%`,
                top: `${getY(activePoint.submissions) - 8}px`,
              }}
            >
              <div className="flex items-center justify-between gap-3 pb-1 border-b border-slate-700 text-[10px] font-bold">
                <span className="uppercase text-slate-300 tracking-wider">
                  {activePoint.date.toUpperCase()} AUDIT TELEMETRY
                </span>
                <span className="text-emerald-400">{activePoint.slaRate}% SLA</span>
              </div>
              <div className="mt-1.5 space-y-0.5 text-[11px]">
                <div className="text-slate-200">
                  <span className="font-semibold text-white">Submissions:</span> {activePoint.submissions} Files
                </div>
                <div className="text-emerald-300">
                  <span className="font-semibold text-white">Validated &amp; Sealed:</span> {activePoint.validated} ({activePoint.slaRate}%)
                </div>
                <div className="text-amber-300">
                  <span className="font-semibold text-white">Boundary Query:</span> {activePoint.boundaryQueries} Files
                </div>
              </div>
            </div>
          </div>

          {/* X-Axis Month Labels */}
          <div className="flex justify-between text-[11px] text-slate-500 font-semibold px-6 pt-1">
            {TELEMETRY_BIWEEKLY.map((p, idx) => (
              <span
                key={p.date}
                onClick={() => setSelectedPointIndex(idx)}
                className={`cursor-pointer transition-colors ${
                  idx === selectedPointIndex ? "text-[#00450d] font-black underline underline-offset-4" : "hover:text-slate-800"
                }`}
              >
                {p.date}
              </span>
            ))}
          </div>

          {/* Legend Row */}
          <div className="flex flex-wrap items-center gap-5 pt-3 border-t border-slate-100 text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
              <span>Validated Deeds (96.2% avg)</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#334155]" />
              <span>Gross Submissions (227 total)</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
              <span>Discrepancies (14 under audit)</span>
            </div>
          </div>

          {/* Peak Velocity Notification Banner */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs text-emerald-950 font-semibold">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <span className="font-bold">Peak Velocity:</span> Tikimt 03 (91 Files/wk lodged across Bole Sub-City)
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-emerald-200">
              SLA: Optimal
            </span>
          </div>

          {/* Footnote Compliance Index */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 pt-1">
            <div>
              Aggregated Woreda 03 Registry: <span className="font-bold text-slate-800">227 Files</span> • Cadastre Confidence Index: <span className="font-bold text-emerald-700">98.4%</span>
            </div>
            <div className="flex items-center gap-2 mt-1 sm:mt-0">
              <span className="font-mono text-[10px] text-slate-400">Telemetry Ref: 89f4b-addis-bole-cadastre</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                PROCLAMATION 1284 COMPLIANT
              </span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* RIGHT: Discrepancy Diagnostics (EXACT MATCH TO IMAGE)         */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs flex flex-col justify-between space-y-5">
          <div>
            {/* Header */}
            <div className="flex items-start gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  Discrepancy Diagnostics
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Root causes for 14 files returned or halted under Civil Code and Proclamation 1284.
                </p>
              </div>
            </div>

            {/* 3 Impact Diagnostic Cards */}
            <div className="space-y-4 mt-4">
              {/* Diagnostic 1: Unregistered Title / Inheritance Dispute */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-rose-300 transition-all shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900">
                    1. Unregistered Title / Inheritance Dispute
                  </span>
                  <span className="text-rose-600 font-black">
                    46% Impact
                  </span>
                </div>
                {/* Red Progress Bar */}
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full w-[46%]" />
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Discrepancy with Bole Sub-City legacy paper ledger vs digitized 2018 Cadastre base.
                </p>
              </div>

              {/* Diagnostic 2: Over-Ceiling Rent Escalation */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-amber-300 transition-all shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900">
                    2. Over-Ceiling Rent Escalation
                  </span>
                  <span className="text-amber-600 font-black">
                    32% Impact
                  </span>
                </div>
                {/* Amber Progress Bar */}
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[32%]" />
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Exceeds statutory freeze limits prescribed under Directive No. 49/2018 Addis Ababa.
                </p>
              </div>

              {/* Diagnostic 3: Missing TIN / Fayda Biometric Mismatch */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-sky-300 transition-all shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900">
                    3. Missing TIN / Fayda Biometric Mismatch
                  </span>
                  <span className="text-sky-600 font-black">
                    22% Impact
                  </span>
                </div>
                {/* Sky Blue Progress Bar */}
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full w-[22%]" />
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Revenue stamp unattached or national identification token failed cryptographic match.
                </p>
              </div>
            </div>
          </div>

          {/* Action Button: Generate Audit Citation Notice */}
          <div>
            <button
              onClick={() => setShowCitationModal(true)}
              className="w-full py-3.5 px-4 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Gavel className="w-4 h-4 text-amber-400" />
              <span>Generate Audit Citation Notice</span>
            </button>

            {citationGenerated && (
              <div className="mt-2 text-center text-[11px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                ✓ Citation Notice #CIT-2023-094 Dispatched to Bole Sub-City Legal Unit
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* AUDIT CITATION NOTICE MODAL                                           */}
      {/* --------------------------------------------------------------------- */}
      {showCitationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in-50 zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#0f172a] text-white flex items-center justify-center shadow-xs">
                  <Gavel className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Official Audit Citation Notice
                  </h3>
                  <p className="text-xs text-slate-500">
                    Proclamation No. 1284/2023 • Woreda 03 Housing Bureau
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCitationModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                <span className="font-bold block mb-1">Formal Citation Summary:</span>
                14 parcels identified with boundary flag disputes and statutory ceiling escalation in Bole Sub-City Woreda 03.
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Legal Examiner</label>
                <input
                  type="text"
                  readOnly
                  value="Ato Dawit Mengistu (Senior Cadastral Auditor #402)"
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Citation Category</label>
                <select className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-800">
                  <option>Unregistered Title / Inheritance Dispute (46% Impact)</option>
                  <option>Over-Ceiling Rent Escalation (32% Impact)</option>
                  <option>Missing TIN / Fayda Biometric Mismatch (22% Impact)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Auditor Citation Directive</label>
                <textarea
                  rows={3}
                  defaultValue="Pursuant to Proclamation 1284, the registered lessor is hereby instructed to lodge verified GIS parcel documentation within 48 hours to prevent caveat encumbrance."
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-sans text-slate-700"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCitationModal(false)}
                className="h-10 text-xs font-bold text-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowCitationModal(false);
                  setCitationGenerated(true);
                  setTimeout(() => setCitationGenerated(false), 5000);
                }}
                className="h-10 bg-[#00450d] hover:bg-[#164e23] text-white font-bold text-xs gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Issue Formal Citation</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// FULL PAGE ROUTE COMPONENT: officer/office/dashboard/page.tsx
// =========================================================================
export const OfficerOfficeDashboardPage: React.FC = () => {
  const router = useRouter();

  // Active view toggle between Cadastral Telemetry & Desk Operations
  const [activeTab, setActiveTab] = useState<"telemetry" | "queue">("telemetry");

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased overflow-hidden">
      {/* --------------------------------------------------------------------- */}
      {/* SIDEBAR NAVIGATION                                                    */}
      {/* --------------------------------------------------------------------- */}
      <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 hidden md:flex select-none">
        <div>
          {/* Header Brand */}
          <div className="p-6 pb-5 flex items-center gap-3 border-b border-slate-100">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-slate-200 shadow-xs shrink-0 bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                alt="Officer Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight tracking-tight">
                Property Admin
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Woreda 03 Portal</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => {
                setActiveTab("telemetry");
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "telemetry"
                  ? "bg-[#e3f2e4] text-[#00450d] shadow-2xs border-l-4 border-[#00450d]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${activeTab === "telemetry" ? "text-[#00450d]" : "text-slate-500"}`} />
              <span>Cadastral Telemetry</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("queue");
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === "queue"
                  ? "bg-[#e3f2e4] text-[#00450d] font-bold shadow-2xs border-l-4 border-[#00450d]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <ClipboardList className="w-4 h-4 text-slate-500" />
              <span>Task Queues</span>
            </button>

            <button
              onClick={() => router.push("/officer/office/properties")}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors text-xs font-medium cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Registry Search</span>
            </button>

            <button
              onClick={() => router.push("/officer/office/properties")}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors text-xs font-medium cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-500" />
              <span>Pending Approvals</span>
            </button>

            <button
              onClick={() => router.push("/officer/supervisor/properties")}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors text-xs font-medium cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <span>Verified Records</span>
            </button>

            <button
              onClick={() => router.push("/officer/dashboard/history")}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors text-xs font-medium cursor-pointer"
            >
              <History className="w-4 h-4 text-slate-500" />
              <span>Audit Logs</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 space-y-1">
          <button
            onClick={() => router.push("/officer/dashboard/settings")}
            className="w-full flex items-center gap-3 px-3.5 py-2 text-slate-500 hover:text-slate-900 text-xs font-medium cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => router.push("/officer")}
            className="w-full flex items-center gap-3 px-3.5 py-2 text-slate-500 hover:text-slate-900 text-xs font-medium cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Sign Out Desk</span>
          </button>
        </div>
      </aside>

      {/* --------------------------------------------------------------------- */}
      {/* MAIN VIEWPORT CONTENT                                                 */}
      {/* --------------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00450d] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 leading-tight">
                Addis Ababa Bole Sub-City Office
              </h1>
              <p className="text-[11px] text-slate-500">
                Woreda 03 Housing &amp; Cadastral Bureau • Proclamation 1284/2023
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher Tabs */}
            <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex items-center text-xs">
              <button
                onClick={() => setActiveTab("telemetry")}
                className={`px-3 py-1 rounded-md font-bold transition-all ${
                  activeTab === "telemetry"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Cadastral Telemetry
              </button>
              <button
                onClick={() => setActiveTab("queue")}
                className={`px-3 py-1 rounded-md font-bold transition-all ${
                  activeTab === "queue"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Desk Intake &amp; Tasks
              </button>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>Auditor Seal: Active</span>
              </span>
              <button
                onClick={() => {
                  const csvData = "Metric,Value,Status\nLease Clearance,92.8%,Proclamation 1284\nTitle Validation,96.2%,Cadastre GIS\nSLA Velocity,1.4d,Gov Standard\nApproved & Sealed,210,92.5%";
                  const blob = new Blob([csvData], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `Cadastral_Telemetry_Bole_${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Dossier</span>
              </button>
            </div>
          </div>
        </header>

        {/* Inner Content Area */}
        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto pb-16">
          {activeTab === "telemetry" ? (
            <CadastralTenancyValidationTelemetry />
          ) : (
            /* ================================================================= */
            /* VIEW 2: DESK INTAKE & TASK QUEUE (EXISTED OFFICER WORKFLOW)       */
            /* ================================================================= */
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Woreda 03 Officer Task Queue &amp; Intake
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Operational verification desk for residential and commercial title deeds.
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/officer/office/properties")}
                  className="bg-[#00450d] hover:bg-[#164e23] text-white text-xs font-bold gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Open Task Queues</span>
                </Button>
              </div>

              {/* Quick Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    PENDING VERIFICATIONS
                  </span>
                  <div className="mt-2 text-3xl font-black text-slate-900">42</div>
                  <p className="text-xs font-semibold text-rose-600 mt-1">+12% from last week</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    AGREEMENTS TO REVIEW
                  </span>
                  <div className="mt-2 text-3xl font-black text-slate-900">18</div>
                  <p className="text-xs font-semibold text-amber-600 mt-1">5 require immediate attention</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    VERIFIED THIS MONTH
                  </span>
                  <div className="mt-2 text-3xl font-black text-[#00450d]">128</div>
                  <p className="text-xs font-semibold text-emerald-700 mt-1">98.4% SLA Compliance</p>
                </div>
              </div>

              {/* History Table */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">
                    Active Submissions under Telemetry Audit
                  </h3>
                  <span className="text-xs text-slate-400">Proclamation 1284 Stream</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider bg-slate-50/50">
                        <th className="py-2.5 px-3">PARCEL ID</th>
                        <th className="py-2.5 px-3">OWNER / APPLICANT</th>
                        <th className="py-2.5 px-3">SUB-CITY / WOREDA</th>
                        <th className="py-2.5 px-3">STATUS</th>
                        <th className="py-2.5 px-3 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-bold font-mono text-slate-900">PRP-2023-8901</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">Abebe Bikila</td>
                        <td className="py-3 px-3 text-slate-500">Bole / Woreda 03</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Discrepancy Query
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => router.push("/officer/office/properties")}
                            className="text-xs font-bold text-[#00450d] hover:underline"
                          >
                            Inspect Deed
                          </button>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-bold font-mono text-slate-900">PRP-2023-8905</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">Aster Aweke</td>
                        <td className="py-3 px-3 text-slate-500">Bole / Woreda 03</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Approved &amp; Sealed
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => router.push("/officer/office/properties")}
                            className="text-xs font-bold text-[#00450d] hover:underline"
                          >
                            View Seal
                          </button>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-bold font-mono text-slate-900">PRP-2023-8912</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">Tilahun Gessesse</td>
                        <td className="py-3 px-3 text-slate-500">Bole / Woreda 03</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Approved &amp; Sealed
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => router.push("/officer/office/properties")}
                            className="text-xs font-bold text-[#00450d] hover:underline"
                          >
                            View Seal
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
    


    


      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: AWAITING FINAL APPROVAL */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
              AWAITING FINAL APPROVAL
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{awaitingApproval}</span>
            <p className="text-xs text-slate-500 mt-1 font-medium">Verified by Officers in {subCity} W{woreda}</p>
          </div>
        </div>

        {/* KPI 2: VERIFIED TODAY */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
              VERIFIED TODAY
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{verifiedToday}</span>
            <p className="text-xs font-semibold text-slate-500 mt-1">Officer submissions today</p>
          </div>
        </div>

        {/* KPI 3: TOTAL APPROVED */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
              TOTAL APPROVED & LISTED
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{totalApproved}</span>
            <p className="text-xs text-slate-500 mt-1 font-medium">Published in this jurisdiction</p>
          </div>
        </div>

        {/* KPI 4: REJECTION RATE */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
              REJECTION RATE
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{rejectionRate}%</span>
            <p className="text-xs font-semibold text-slate-500 mt-1">{rejectedProperties.length} sent back for fixes</p>
          </div>
        </div>
      </div>

      {/* 2-Column Grid (Left: Approval Queue, Right: Summary Chart & System Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* =================================================================== */}
        {/* LEFT COLUMN: APPROVAL QUEUE TABLE (Col-Span 2)                      */}
        {/* =================================================================== */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            {/* Header & Filter Dropdown */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Approval Queue</h3>

              <div className="relative">
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value as any)}
                  className="h-8 pl-3 pr-8 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#00450d] appearance-none cursor-pointer"
                >
                  <option value="All Pending">All Pending</option>
                  <option value="High Priority">High Priority</option>
                  <option value="Flagged Discrepancies">Flagged Discrepancies</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Queue Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider bg-transparent">
                    <th className="py-3 px-3 font-semibold">PROPERTY ID</th>
                    <th className="py-3 px-3 font-semibold">VERIFIED BY (OFFICER)</th>
                    <th className="py-3 px-3 font-semibold">VERIFICATION DATE</th>
                    <th className="py-3 px-3 text-right font-semibold">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                        <RefreshCw className="w-4 h-4 animate-spin inline mr-2" /> Loading approval queue...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-red-600 text-xs">
                        {error}
                      </td>
                    </tr>
                  ) : filteredQueue.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                        {activeFilter !== "All Pending"
                          ? `No items matching filter "${activeFilter}".`
                          : "No verified properties awaiting approval. Great job!"}
                      </td>
                    </tr>
                  ) : (
                    filteredQueue.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => {
                          if (item.rawProperty) {
                            goToDetail(item.id);
                          } else {
                            setSelectedItemForReview(item);
                          }
                        }}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                      >
                        {/* PROPERTY ID */}
                        <td className="py-3.5 px-3">
                          {item.isFlagged ? (
                            <span className="font-bold text-red-600">
                              {item.propertyId}{" "}
                              <span className="font-normal text-[11px] text-red-500">(Flagged)</span>
                            </span>
                          ) : (
                            <span className="font-bold text-slate-900 group-hover:text-[#00450d] transition-colors">
                              {item.propertyId}
                            </span>
                          )}
                        </td>

                        {/* VERIFIED BY (OFFICER) */}
                        <td className="py-3.5 px-3">
                          <span className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                item.isFlagged
                                  ? "bg-red-100 text-red-700"
                                  : "bg-[#e2e8f0] text-slate-700"
                              }`}
                            >
                              {item.officerCode}
                            </span>
                            <span className="text-slate-800 font-medium">{item.officerName}</span>
                          </span>
                        </td>

                        {/* VERIFICATION DATE */}
                        <td className="py-3.5 px-3 text-slate-600 font-normal">
                          {item.verificationDate}
                        </td>

                        {/* ACTION BUTTON */}
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.rawProperty) {
                                goToDetail(item.id);
                              } else {
                                setSelectedItemForReview(item);
                              }
                            }}
                            className={`text-xs font-bold hover:underline ${
                              item.isFlagged ? "text-red-700" : "text-[#00450d]"
                            }`}
                          >
                            {item.isFlagged ? "Investigate" : "Review"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* View All Queue Button */}
          <div className="pt-3 text-center border-t border-slate-100">
            <button
              onClick={() => setIsViewAllModalOpen(true)}
              className="text-xs font-bold text-slate-900 hover:text-[#00450d] uppercase tracking-wider transition-colors cursor-pointer"
            >
              VIEW ALL QUEUE ({queue.length})
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: MONTHLY SUMMARY CHART & SYSTEM ALERTS (Col-Span 1)    */}
        {/* =================================================================== */}
        <div className="space-y-5">
          {/* Approval Summary (Monthly) Visual Bar Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Approval Summary (Last 6 Months)</h3>

            {/* Vertical Bar Chart Container */}
            <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-3 border-b border-slate-100">
              {loading ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading chart...
                </div>
              ) : (
                monthlyData.counts.map((m) => {
                  const approvedHeight = monthlyData.maxCount > 0 ? Math.max(4, (m.approved / monthlyData.maxCount) * 100) : 4;
                  const rejectedHeight = monthlyData.maxCount > 0 ? Math.max(2, (m.rejected / monthlyData.maxCount) * 60) : 2;
                  return (
                    <div key={`${m.year}-${m.monthIdx}`} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="w-full flex items-end justify-center gap-1.5 h-32">
                        <div
                          className="w-5 bg-[#1b5e20] rounded-t-xs transition-all hover:opacity-90"
                          style={{ height: `${approvedHeight}%` }}
                          title={`${m.label} ${m.year} Approved: ${m.approved}`}
                        />
                        <div
                          className="w-3.5 bg-[#b91c1c] rounded-t-xs transition-all hover:opacity-90"
                          style={{ height: `${rejectedHeight}%` }}
                          title={`${m.label} ${m.year} Rejected: ${m.rejected}`}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-slate-500">{m.label}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Legend (Approved / Rejected) */}
            <div className="flex items-center justify-center gap-5 text-xs">
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1b5e20]" />
                <span>Approved & Listed</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#b91c1c]" />
                <span>Rejected</span>
              </span>
            </div>
          </div>

          {/* System Alerts Container */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 px-1">System Alerts</h3>

            {/* Alert 1: Pending Workload */}
            {pendingProperties.length > 0 && (
              <div className="p-4 bg-[#fff8e1] border border-[#ffe082] rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#f57f17] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#e65100]">Officer Workload Alert</h4>
                  <p className="text-[11px] text-[#ef6c00] leading-snug mt-1 font-medium">
                    {pendingProperties.length} properties pending officer verification in {subCity} W{woreda}.
                  </p>
                </div>
              </div>
            )}

            {/* Alert 2: Queue Status */}
            <div className="p-4 bg-[#e8f5e9] border border-[#c8e6c9] rounded-xl flex items-start gap-3">
              <Info className="w-5 h-5 text-[#2e7d32] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#1b5e20]">Jurisdiction Status</h4>
                <p className="text-[11px] text-[#388e3c] leading-snug mt-1 font-medium">
                  Managing {subCity} Sub-City · Woreda {woreda}. {totalApproved} properties live to date.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODALS & INTERACTIVE POPUPS                                            */}
      {/* ========================================================================= */}

      {/* A. Supervisor Property Review & Final Seal Modal */}
      {selectedItemForReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in-50 zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#00450d] text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Final Verification Review: {selectedItemForReview.propertyId}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verified by {selectedItemForReview.officerName} on {selectedItemForReview.verificationDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedItemForReview(null);
                  setIsRejecting(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Discrepancy warning if flagged */}
            {selectedItemForReview.isFlagged && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Flagged Discrepancy Warning</p>
                  <p className="text-[11px] text-red-800">{selectedItemForReview.flagReason}</p>
                </div>
              </div>
            )}

            {/* Property Summary Specs */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Property Title</span>
                  <span className="font-bold text-slate-900">{selectedItemForReview.propertyTitle}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Property Type</span>
                  <span className="font-bold text-slate-900">{selectedItemForReview.propertyType}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Location</span>
                  <span className="font-bold text-slate-900">
                    {selectedItemForReview.subCity} ({selectedItemForReview.woreda})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Monthly Valuation</span>
                  <span className="font-bold text-emerald-800">
                    ETB {selectedItemForReview.monthlyRent.toLocaleString()}/mo
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Applicant / Owner</span>
                  <span className="font-bold text-slate-900">{selectedItemForReview.ownerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Fayda Digital ID</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedItemForReview.ownerFayda}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">
                  Officer Inspection Audit Notes
                </span>
                <p className="text-slate-700 italic mt-0.5">{selectedItemForReview.officerNotes}</p>
              </div>
            </div>

            {/* Navigation to full review page */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedItemForReview(null);
                  setIsRejecting(false);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const id = selectedItemForReview.id;
                  setSelectedItemForReview(null);
                  setIsRejecting(false);
                  goToDetail(id);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#00450d] hover:bg-[#164e23] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md"
              >
                <Eye className="w-4 h-4" />
                <span>Open Full Review</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* B. View All Queue Modal */}
      {isViewAllModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Full Municipal Verification Queue ({queue.length} Total)
                </h3>
                <p className="text-xs text-slate-500">
                  All active dossiers awaiting Final Supervisor Seal
                </p>
              </div>
              <button
                onClick={() => setIsViewAllModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2 text-xs">
              {loading ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <RefreshCw className="w-4 h-4 animate-spin inline mr-2" /> Loading queue...
                </div>
              ) : queue.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No properties in the approval queue.
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">PROPERTY ID</th>
                      <th className="py-2.5 px-3">TITLE / SUB-CITY</th>
                      <th className="py-2.5 px-3">VERIFIED BY</th>
                      <th className="py-2.5 px-3">DATE</th>
                      <th className="py-2.5 px-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {queue.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900">{item.propertyId}</td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-800 block">{item.propertyTitle}</span>
                          <span className="text-[10px] text-slate-400">{item.subCity}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-700">{item.officerName}</td>
                        <td className="py-3 px-3 text-slate-500">{item.verificationDate}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setIsViewAllModalOpen(false);
                              goToDetail(item.id);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#00450d] text-white text-xs font-bold hover:bg-[#164e23]"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsViewAllModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorDashboardPage;
