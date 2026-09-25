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
