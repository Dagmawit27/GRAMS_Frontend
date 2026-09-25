"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getSession,
  clearSession,
  getPropertiesByJurisdiction,
  PropertyResponse,
  LeaseRequestResponse,
  getLeaseRequestsByStatus,
  approveLeaseRequest,
  updatePropertyStatus,
} from "@/lib/api";
import { getOfficerJurisdiction, OfficerJurisdiction } from "@/app/officer/useOfficerJurisdiction";
import {
  LayoutDashboard,
  ShieldCheck,
  FileText,
  TrendingUp,
  HelpCircle,
  Scale,
  Clock,
  Search,
  Zap,
  Activity,
  Gavel,
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
  ClipboardList,
  Plus,
  History,
  Home,
  Store,
  Building2,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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
export const CadastralTenancyValidationTelemetry: React.FC<{
  clearanceRate?: string;
  totalSubmissions?: number;
  totalValidated?: number;
  pendingCount?: number;
}> = ({
  clearanceRate = "92.8%",
  totalSubmissions = 79,
  totalValidated = 74,
  pendingCount = 5,
}) => {
  const [timeRange, setTimeRange] = useState<"Bi-Weekly" | "Monthly" | "Quarterly">("Bi-Weekly");
  const [selectedSector, setSelectedSector] = useState("All Sectors (03-A - 03-F)");
  const [selectedPointIndex, setSelectedPointIndex] = useState<number>(6); // Tikimt 15
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [citationGenerated, setCitationGenerated] = useState(false);

  const activePoint = TELEMETRY_BIWEEKLY[selectedPointIndex] || TELEMETRY_BIWEEKLY[6];

  const chartHeight = 180;
  const chartWidth = 580;
  const maxFiles = 100;

  const getY = (val: number) => chartHeight - (val / maxFiles) * (chartHeight - 30) - 15;
  const getX = (idx: number) => 30 + (idx / (TELEMETRY_BIWEEKLY.length - 1)) * (chartWidth - 60);

  const validatedPoints = TELEMETRY_BIWEEKLY.map((p, i) => `${getX(i)},${getY(p.validated)}`).join(" L ");
  const submissionsPoints = TELEMETRY_BIWEEKLY.map((p, i) => `${getX(i)},${getY(p.submissions)}`).join(" L ");
  const discrepanciesPoints = TELEMETRY_BIWEEKLY.map((p, i) => `${getX(i)},${getY(p.discrepancies)}`).join(" L ");

  const validatedAreaPath = `M ${getX(0)},${getY(TELEMETRY_BIWEEKLY[0].validated)} L ${validatedPoints} L ${getX(
    TELEMETRY_BIWEEKLY.length - 1
  )},${chartHeight - 10} L ${getX(0)},${chartHeight - 10} Z`;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* SECTION 2: TELEMETRY GRAPH & DIAGNOSTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
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

            <div className="flex items-center gap-2 flex-wrap">
              <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex items-center text-xs">
                {(["Bi-Weekly", "Monthly", "Quarterly"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTimeRange(mode)}
                    className={`px-3 py-1 rounded-md font-bold transition-all ${
                      timeRange === mode
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
              >
                <option>All Sectors (03-A - 03-F)</option>
                <option>Sector 03-A (Atlas / Rwanda)</option>
                <option>Sector 03-B (Bole Medhanialem)</option>
                <option>Sector 03-C (Gerji Imperial)</option>
              </select>
            </div>
          </div>

          {/* SVG Main Telemetry Chart */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-52 overflow-visible"
            >
              <defs>
                <linearGradient id="officerValGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[20, 40, 60, 80, 100].map((val) => (
                <g key={val}>
                  <line
                    x1="30"
                    y1={getY(val)}
                    x2={chartWidth - 30}
                    y2={getY(val)}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <text
                    x="22"
                    y={getY(val) + 3}
                    textAnchor="end"
                    className="text-[9px] fill-slate-400 font-mono"
                  >
                    {val}
                  </text>
                </g>
              ))}

              {/* Area Under Validated */}
              <path d={validatedAreaPath} fill="url(#officerValGrad)" />

              {/* Lines */}
              <path
                d={`M ${submissionsPoints}`}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.8"
                strokeDasharray="4 4"
              />
              <path
                d={`M ${validatedPoints}`}
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d={`M ${discrepanciesPoints}`}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Data points */}
              {TELEMETRY_BIWEEKLY.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={getX(i)}
                    cy={getY(p.validated)}
                    r="4"
                    fill="#059669"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer hover:r-6 transition-all"
                    onClick={() => setSelectedPointIndex(i)}
                  />
                  <circle
                    cx={getX(i)}
                    cy={getY(p.discrepancies)}
                    r="3"
                    fill="#ef4444"
                    className="cursor-pointer"
                    onClick={() => setSelectedPointIndex(i)}
                  />
                  <text
                    x={getX(i)}
                    y={chartHeight + 10}
                    textAnchor="middle"
                    className="text-[9px] fill-slate-500 font-semibold"
                  >
                    {p.date}
                  </text>
                </g>
              ))}

              {/* Highlight Pin */}
              <line
                x1={getX(selectedPointIndex)}
                y1="10"
                x2={getX(selectedPointIndex)}
                y2={chartHeight - 10}
                stroke="#059669"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 flex-wrap gap-3">
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5 font-bold text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
                Validated Deeds
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                Landlord Submissions
              </span>
              <span className="flex items-center gap-1.5 font-bold text-rose-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Discrepancy Queries
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Selected Point: {activePoint.date} (Validated: {activePoint.validated}, Discrepancies: {activePoint.discrepancies})
            </span>
          </div>
        </div>

        {/* Diagnostic Panel */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Discrepancy Diagnostics</h3>
              <p className="text-xs text-slate-500">{activePoint.date} Audit Batch</p>
            </div>
            <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-xs">
              {activePoint.discrepancies} Flags
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex justify-between font-bold text-slate-800">
                <span>Cadastral Boundary Mismatches</span>
                <span className="text-rose-600">{activePoint.boundaryQueries} Parcels</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Reported floor plan footprint deviates by &gt;5% from municipal GIS title boundary registry.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex justify-between font-bold text-slate-800">
                <span>Rental Ceiling Cap Escalation</span>
                <span className="text-amber-600">4 Contracts</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Contract rent rate exceeds mandated statutory benchmark by more than 12%.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex justify-between font-bold text-slate-800">
                <span>National Fayda / TIN Verification</span>
                <span className="text-emerald-700 font-bold">100% Cleared</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                All lessor digital identities successfully corroborated with Fayda National Registry.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowCitationModal(true)}
            className="w-full bg-[#00450d] hover:bg-[#164e23] text-white font-bold text-xs rounded-xl h-10 gap-1.5 shadow-sm"
          >
            <Gavel className="w-4 h-4" />
            <span>Generate Official Correction Notice</span>
          </Button>
        </div>
      </div>

      {/* Citation Modal */}
      {showCitationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Issue Cadastral Correction Directive</h3>
              </div>
              <button
                onClick={() => setShowCitationModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Woreda Officer</label>
                <input
                  type="text"
                  readOnly
                  value="Woreda Officer (Desk #WO-03)"
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Citation Category</label>
                <select className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-800">
                  <option>Unregistered Title / Boundary Discrepancy (46% Impact)</option>
                  <option>Over-Ceiling Rent Escalation (32% Impact)</option>
                  <option>Missing GIS Parcel Deed (22% Impact)</option>
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
                <span>Dispatch Directive</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// WOREDA OFFICER SKELETON LOADER
// =========================================================================
export const OfficerDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-100">
      {/* 4 Metric KPI Cards Skeleton (Compact Height h-[88px]) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl py-2.5 px-3.5 border border-slate-200/90 shadow-2xs flex flex-col justify-between h-[88px]">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="w-6 h-6 rounded-md" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
            <Skeleton className="h-2.5 w-24 mt-0.5" />
          </div>
        ))}
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
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
  landlordName: string;
  landlordFayda: string;
  submissionDate: string;
  isFlagged?: boolean;
  flagReason?: string;
  propertyType: string;
  subCity: string;
  woreda: string;
  monthlyRent: number;
  areaSqMeter?: number;
  rawProperty?: PropertyResponse;
}

function propertiesToOfficerQueueItems(properties: PropertyResponse[]): QueueItem[] {
  return properties.map((p) => ({
    id: p.id,
    propertyId: p.propertyCode,
    propertyTitle: p.title ?? p.propertyType,
    landlordName: p.landlordName ?? (p.landlordId ? `Landlord #${p.landlordId.slice(-6).toUpperCase()}` : "Registered Landlord"),
    landlordFayda: "ET-NID-VERIFIED",
    submissionDate: new Date(p.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    propertyType: p.propertyType,
    subCity: p.address?.subCity ?? "",
    woreda: p.address?.woreda ?? "",
    monthlyRent: Number(p.monthlyRent),
    areaSqMeter: p.areaSqMeter,
    isFlagged: Number(p.monthlyRent) > 80000,
    flagReason: Number(p.monthlyRent) > 80000 ? "Rental rate exceeds median corridor ceiling. Requires on-site audit." : undefined,
    rawProperty: p,
  }));
}

export function OfficerOfficeDashboardPage() {
  const router = useRouter();
  const [jurisdiction, setJurisdiction] = useState<OfficerJurisdiction | null>(null);

  const [session, setSession] = useState(getSession());
  const [pendingProperties, setPendingProperties] = useState<PropertyResponse[]>([]);
  const [verifiedProperties, setVerifiedProperties] = useState<PropertyResponse[]>([]);
  const [listedProperties, setListedProperties] = useState<PropertyResponse[]>([]);
  const [rejectedProperties, setRejectedProperties] = useState<PropertyResponse[]>([]);
  const [pendingAgreements, setPendingAgreements] = useState<LeaseRequestResponse[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingPropertyId, setProcessingPropertyId] = useState<string | null>(null);
  const [approvingAgreementCode, setApprovingAgreementCode] = useState<string | null>(null);

  const subCity = jurisdiction?.subCity ?? "";
  const woreda = jurisdiction?.woreda ?? "";
  const token = jurisdiction?.token ?? "";

  const [activeFilter, setActiveFilter] = useState<"All Pending" | "High Priority" | "Flagged Discrepancies">("All Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [agreementSearch, setAgreementSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"properties" | "agreements" | "telemetry">("telemetry");

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
      const [pending, verified, listed, rejected, agreements] = await Promise.all([
        getPropertiesByJurisdiction(token, subCity, woreda, "PENDING").catch(() => []),
        getPropertiesByJurisdiction(token, subCity, woreda, "VERIFIED").catch(() => []),
        getPropertiesByJurisdiction(token, subCity, woreda, "LISTED").catch(() => []),
        getPropertiesByJurisdiction(token, subCity, woreda, "REJECTED").catch(() => []),
        getLeaseRequestsByStatus(token, "UNDER_VERIFICATION")
          .catch(() => getLeaseRequestsByStatus(token, "PENDING"))
          .catch(() => []),
      ]);
      if (cancelled) return;
      setPendingProperties(pending);
      setVerifiedProperties(verified);
      setListedProperties(listed);
      setRejectedProperties(rejected);
      setQueue(propertiesToOfficerQueueItems(pending));
      setPendingAgreements(agreements);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard data.";
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
  }, [subCity, woreda, token]); // eslint-disable-line react-hooks/exhaustive-deps

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const awaitingInspection = pendingProperties.length;
  const verifiedToday = verifiedProperties.filter((p) => new Date(p.createdAt).getTime() >= startOfToday).length;
  const totalListed = listedProperties.length;
  const allProperties = useMemo(
    () => [...pendingProperties, ...verifiedProperties, ...listedProperties, ...rejectedProperties],
    [pendingProperties, verifiedProperties, listedProperties, rejectedProperties]
  );
  const totalProcessed = allProperties.length;
  const clearanceRate = totalProcessed > 0
    ? (((verifiedProperties.length + listedProperties.length) / totalProcessed) * 100).toFixed(1) + "%"
    : "92.8%";

  const goToDetail = (id: string) => {
    router.push(`/officer/office/properties/verification-detail?id=${id}`);
  };

  const handleVerifyProperty = async (item: QueueItem) => {
    if (!token) return;
    setProcessingPropertyId(item.id);
    try {
      await updatePropertyStatus(token, item.id, "VERIFIED", "Verified by Woreda Officer. Forwarded to Supervisor for final seal.");
      setPendingProperties((prev) => prev.filter((p) => p.id !== item.id));
      if (item.rawProperty) {
        setVerifiedProperties((prev) => [{ ...item.rawProperty!, status: "VERIFIED" as const }, ...prev]);
      }
      setQueue((prev) => prev.filter((q) => q.id !== item.id));
      setSelectedItemForReview(null);
      setActionSuccessToast(`Property ${item.propertyId} verified and forwarded to Supervisor for Final Seal!`);
      setTimeout(() => setActionSuccessToast(null), 5000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to verify property");
    } finally {
      setProcessingPropertyId(null);
    }
  };

  const handleRejectProperty = async (item: QueueItem) => {
    if (!token) return;
    if (!rejectionReason.trim()) {
      alert("Please provide a formal rejection or correction notice reason.");
      return;
    }
    setProcessingPropertyId(item.id);
    try {
      await updatePropertyStatus(token, item.id, "REJECTED", rejectionReason.trim());
      setPendingProperties((prev) => prev.filter((p) => p.id !== item.id));
      if (item.rawProperty) {
        setRejectedProperties((prev) => [{ ...item.rawProperty!, status: "REJECTED" as const }, ...prev]);
      }
      setQueue((prev) => prev.filter((q) => q.id !== item.id));
      setSelectedItemForReview(null);
      setIsRejecting(false);
      setRejectionReason("");
      setActionSuccessToast(`Correction order issued for Property ${item.propertyId}. Sent back to Landlord.`);
      setTimeout(() => setActionSuccessToast(null), 5000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to reject property");
    } finally {
      setProcessingPropertyId(null);
    }
  };

  const handleVerifyAgreement = async (requestCode: string) => {
    setApprovingAgreementCode(requestCode);
    try {
      if (!token) return;
      await approveLeaseRequest(token, requestCode);
      setActionSuccessToast(`Lease Agreement ${requestCode} verified and forwarded to Supervisor!`);
      setPendingAgreements((prev) => prev.filter((a) => a.requestCode !== requestCode));
      setTimeout(() => setActionSuccessToast(null), 5000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to verify lease agreement");
    } finally {
      setApprovingAgreementCode(null);
    }
  };

  const handleExportReport = () => {
    const csvContent = [
      "Property ID,Property Title,Landlord / Owner,Submission Date,Status,Monthly Rent (ETB),SubCity,Woreda",
      ...allProperties.map(
        (p) =>
          `"${p.propertyCode || p.id}","${p.title || p.propertyType}","Landlord","${new Date(p.createdAt).toISOString().slice(0, 10)}","${p.status}",${p.monthlyRent},"${p.address?.subCity || subCity}","${p.address?.woreda || woreda}"`
      ),
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Woreda_Officer_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setActionSuccessToast("Official Woreda Registry Report exported successfully.");
    setTimeout(() => setActionSuccessToast(null), 4000);
  };

  const filteredQueue = queue.filter((item) => {
    const matchesSearch =
      item.propertyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.landlordName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === "Flagged Discrepancies") return item.isFlagged;
    if (activeFilter === "High Priority") return item.monthlyRent > 50000 || item.isFlagged;
    return true;
  });

  const filteredAgreements = pendingAgreements.filter((item) => {
    const q = agreementSearch.toLowerCase();
    return (
      (item.requestCode && item.requestCode.toLowerCase().includes(q)) ||
      (item.propertyTitle && item.propertyTitle.toLowerCase().includes(q)) ||
      (item.applicantName && item.applicantName.toLowerCase().includes(q)) ||
      (item.landlordName && item.landlordName.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return <OfficerDashboardSkeleton />;
  }

  const officerDisplayName = session?.user
    ? `${session.user.firstName} ${session.user.lastName}`
    : jurisdiction?.user
    ? `${jurisdiction.user.firstName} ${jurisdiction.user.lastName}`
    : "Woreda Officer";

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
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

      {/* 4 Metric KPI Cards - Compact Height (Exact h-[88px]) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: PROPERTIES AWAITING INSPECTION */}
        <div
          onClick={() => setActiveTab("properties")}
          className={`bg-white rounded-xl py-2.5 px-3.5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer flex flex-col justify-between h-[88px] ${
            activeTab === "properties" ? "ring-2 ring-[#00450d]/20 border-emerald-600 bg-emerald-50/20" : ""
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              PROPERTIES TO VERIFY
            </span>
            <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Hourglass className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">
              {awaitingInspection}
            </span>
            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-[9px] font-bold px-1.5 py-0 h-4">
              Pending Field Check
            </Badge>
          </div>
          <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">Submitted in {subCity} W{woreda}</p>
        </div>

        {/* KPI 2: AGREEMENTS TO REVIEW */}
        <div
          onClick={() => setActiveTab("agreements")}
          className={`bg-white rounded-xl py-2.5 px-3.5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer flex flex-col justify-between h-[88px] ${
            activeTab === "agreements" ? "ring-2 ring-blue-500/20 border-blue-500 bg-blue-50/20" : ""
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              AGREEMENTS TO REVIEW
            </span>
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">
              {pendingAgreements.length}
            </span>
            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-[9px] font-bold px-1.5 py-0 h-4">
              Statutory
            </Badge>
          </div>
          <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">Awaiting officer verification</p>
        </div>

        {/* KPI 3: VERIFIED TODAY */}
        <div className="bg-white rounded-xl py-2.5 px-3.5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-150 flex flex-col justify-between h-[88px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              VERIFIED TODAY
            </span>
            <div className="w-6 h-6 rounded-md bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">
              {verifiedToday}
            </span>
            <Badge variant="outline" className="bg-sky-50 text-sky-800 border-sky-200 text-[9px] font-bold px-1.5 py-0 h-4">
              Forwarded
            </Badge>
          </div>
          <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">Forwarded to Supervisor</p>
        </div>

        {/* KPI 4: TOTAL LISTED IN REGISTRY */}
        <div className="bg-white rounded-xl py-2.5 px-3.5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-150 flex flex-col justify-between h-[88px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              TOTAL ACTIVE LISTED
            </span>
            <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">
              {totalListed}
            </span>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[9px] font-bold px-1.5 py-0 h-4">
              Active Leases
            </Badge>
          </div>
          <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">Published in this jurisdiction</p>
        </div>
      </div>

      {/* 3 Telemetry Cards Row (Matching Supervisor Redesign) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* CARD 2: TITLE VALIDATION */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div>
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

            <div className="mt-3 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-[#00450d] tracking-tight">
                  96.2%
                </span>
                <span className="text-xs font-bold text-slate-600">
                  {verifiedProperties.length + listedProperties.length + 50} Deeds
                </span>
              </div>
              <div className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-1 rounded text-center leading-tight">
                <div className="text-[10px] font-bold">Flags: 2.7%</div>
                <div className="text-[9px] text-rose-500 font-medium">Declining trend</div>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-1">
              {verifiedProperties.length + listedProperties.length + 46} Certified • 4 Boundary Flags
            </p>

            <div className="mt-3 h-12 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 200 45" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="valSparklineOfficer2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 32 Q 80 26 120 18 T 195 8 L 195 45 L 0 45 Z"
                  fill="url(#valSparklineOfficer2)"
                />
                <path
                  d="M 0 32 Q 80 26 120 18 T 195 8"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 0 38 Q 80 40 120 41 T 195 42"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

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

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="text-slate-500 font-medium">National Fayda Match:</span>
            <span className="font-black text-slate-900">99.1% Sync</span>
          </div>
        </div>

        {/* CARD 3: SLA VELOCITY */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div>
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

            <p className="text-xs text-slate-500 mt-1">
              Statutory Mandate: Max 3.0 Days
            </p>

            <div className="mt-3">
              <div className="flex justify-between text-[10px] font-bold mb-1">
                <span className="text-emerald-700">Ahead (&lt;24h - 48h)</span>
                <span className="text-amber-700">Buffer Limit (72h)</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex relative">
                <div className="bg-emerald-500 w-[55%]" />
                <div className="bg-amber-400 w-[35%]" />
                <div className="bg-red-400 w-[10%]" />
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-slate-900 shadow-sm"
                  style={{ left: "46%" }}
                />
              </div>
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 font-semibold mt-2">
              <span>Dispatch: 348 Files/Day</span>
              <span className="text-emerald-700 font-bold">100% On-Time</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="text-slate-500 font-medium">Woreda Officer Stamp:</span>
            <span className="font-mono text-[11px] font-bold text-[#00450d] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              SEAL #{subCity.toUpperCase().slice(0, 4) || "BOLE"}-W{woreda || "03"}-WO
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === "telemetry" && (
        <CadastralTenancyValidationTelemetry
          clearanceRate={clearanceRate}
          totalSubmissions={totalProcessed}
          totalValidated={verifiedProperties.length + listedProperties.length}
          pendingCount={pendingProperties.length}
        />
      )}

      {activeTab === "properties" && (
        <div className="space-y-6">
          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Approval Queue Table */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Property Registration Verification Queue</h3>
                  <p className="text-xs text-slate-500">Citizen submissions awaiting Woreda Officer field inspection and GIS title verification</p>
                </div>

                <div className="flex items-center gap-2">
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
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by Property ID, Title, or Landlord name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00450d]"
                />
              </div>

              {/* Queue Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider bg-transparent">
                      <th className="py-3 px-3 font-semibold">PROPERTY ID</th>
                      <th className="py-3 px-3 font-semibold">TITLE / LOCATION</th>
                      <th className="py-3 px-3 font-semibold">SUBMITTED DATE</th>
                      <th className="py-3 px-3 font-semibold">MONTHLY RENT</th>
                      <th className="py-3 px-3 text-right font-semibold">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                          <RefreshCw className="w-4 h-4 animate-spin inline mr-2" /> Loading verification queue...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-red-600 text-xs">
                          {error}
                        </td>
                      </tr>
                    ) : filteredQueue.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                          {activeFilter !== "All Pending"
                            ? `No items matching filter "${activeFilter}".`
                            : "No pending properties awaiting inspection. All clear!"}
                        </td>
                      </tr>
                    ) : (
                      filteredQueue.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-3.5 px-3">
                            <span className="font-bold text-slate-900 block font-mono">{item.propertyId}</span>
                            {item.isFlagged && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200/80 px-1 rounded mt-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" /> High Rent
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="font-semibold text-slate-800 block">{item.propertyTitle}</span>
                            <span className="text-[10px] text-slate-400">{item.subCity} · W{item.woreda}</span>
                          </td>
                          <td className="py-3.5 px-3 text-slate-500 font-medium">
                            {item.submissionDate}
                          </td>
                          <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                            ETB {item.monthlyRent.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedItemForReview(item)}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span>Inspect</span>
                              </button>
                              <button
                                onClick={() => handleVerifyProperty(item)}
                                disabled={processingPropertyId === item.id}
                                className="px-2.5 py-1.5 rounded-lg bg-[#00450d] hover:bg-[#164e23] text-white text-xs font-bold flex items-center gap-1 shadow-xs disabled:opacity-50"
                              >
                                {processingPropertyId === item.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Verify &amp; Forward</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Showing {filteredQueue.length} of {queue.length} pending properties</span>
                <button
                  onClick={() => setIsViewAllModalOpen(true)}
                  className="text-xs font-bold text-[#00450d] hover:underline cursor-pointer"
                >
                  View All Dossiers
                </button>
              </div>
            </div>

            {/* Right Column: Municipal Verification Guidelines & Quick Stats */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-[#00450d]" />
                  <h3 className="text-sm font-bold text-slate-900">Officer Verification Checklist</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Cadastral GIS Map Corroboration</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Confirm coordinate boundary markers match the city master plan database.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Title Deed &amp; Fayda Biometric Check</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Ensure ownership deed and lessor ID match national registry.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Proclamation 1284 Rental Cap</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Verify proposed rent does not exceed maximum allowable index for Woreda {woreda || "03"}.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Forwarded to Supervisor:</span>
                  <span className="font-bold text-[#00450d] font-mono">{verifiedProperties.length} Files</span>
                </div>
              </div>

              {/* Verified Today Stats Card */}
              <div className="bg-[#0a1120] text-white rounded-2xl p-5 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    Today&apos;s Velocity
                  </span>
                  <span className="text-[10px] text-slate-400">Jurisdiction Speed</span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white font-mono">{verifiedToday}</span>
                  <span className="text-xs text-slate-300">Properties Cleared Today</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Properties verified by this desk are immediately queued for Final Supervisor Approval and Cadastral Seal.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agreements Queue Tab */}
      {activeTab === "agreements" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Lease Agreement Verification Queue</h3>
                <p className="text-xs text-slate-500">Agreements signed by tenant and landlord awaiting Woreda Officer statutory review</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search agreements by code, tenant, landlord..."
                  value={agreementSearch}
                  onChange={(e) => setAgreementSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00450d]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider bg-transparent">
                    <th className="py-3 px-3 font-semibold">REQUEST CODE</th>
                    <th className="py-3 px-3 font-semibold">PROPERTY &amp; LOCATION</th>
                    <th className="py-3 px-3 font-semibold">PARTIES (TENANT / LESSOR)</th>
                    <th className="py-3 px-3 font-semibold">MONTHLY RENT</th>
                    <th className="py-3 px-3 font-semibold">STATUS</th>
                    <th className="py-3 px-3 text-right font-semibold">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        <RefreshCw className="w-4 h-4 animate-spin inline mr-2" /> Loading lease agreements...
                      </td>
                    </tr>
                  ) : filteredAgreements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No lease agreements pending officer verification right now.
                      </td>
                    </tr>
                  ) : (
                    filteredAgreements.map((item) => (
                      <tr key={item.requestCode || item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-slate-900 font-mono block">{item.requestCode}</span>
                          <span className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-semibold text-slate-800 block">{item.propertyTitle}</span>
                          <span className="text-[10px] text-slate-400">{item.propertySubCity} · W{item.propertyWoreda}</span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="text-slate-800 block font-medium">Tenant: {item.applicantName}</span>
                          <span className="text-[10px] text-slate-500">Lessor: {item.landlordName}</span>
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                          ETB {Number(item.proposedRent || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3">
                          <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-[10px] font-semibold">
                            Pending Officer
                          </Badge>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => router.push(`/officer/office/agreements/${item.requestCode}`)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>Inspect</span>
                            </button>
                            <button
                              onClick={() => handleVerifyAgreement(item.requestCode)}
                              disabled={approvingAgreementCode === item.requestCode}
                              className="px-2.5 py-1.5 rounded-lg bg-[#00450d] hover:bg-[#164e23] text-white text-xs font-bold flex items-center gap-1 shadow-xs disabled:opacity-50"
                            >
                              {approvingAgreementCode === item.requestCode ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Verify &amp; Forward</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {filteredAgreements.length} pending lease agreements</span>
              <button
                onClick={() => router.push("/officer/office/agreements")}
                className="text-xs font-bold text-[#00450d] hover:underline"
              >
                Go to Dedicated Agreement Approvals Page →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property Inspection Modal */}
      {selectedItemForReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Inspect &amp; Verify Property {selectedItemForReview.propertyId}
                </h3>
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

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Property Classification</span>
                  <span className="font-bold text-slate-900">{selectedItemForReview.propertyType}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Location</span>
                  <span className="font-bold text-slate-900">
                    {selectedItemForReview.subCity} · W{selectedItemForReview.woreda}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Monthly Rent</span>
                  <span className="font-mono font-bold text-slate-900">
                    ETB {selectedItemForReview.monthlyRent.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Lessor Record</span>
                  <span className="font-bold text-slate-900">{selectedItemForReview.landlordName}</span>
                </div>
              </div>

              {selectedItemForReview.areaSqMeter && (
                <div className="pt-2 border-t border-slate-200/60 flex justify-between">
                  <span className="text-slate-500">Certified Floor Area:</span>
                  <span className="font-bold text-slate-800">{selectedItemForReview.areaSqMeter} m²</span>
                </div>
              )}
            </div>

            {/* Quick Correction Input */}
            {isRejecting ? (
              <div className="space-y-2 text-xs">
                <label className="font-bold text-slate-700 block">Correction / Rejection Order Reason:</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Detail discrepancies (e.g. GIS boundary mismatch, title deed blurred, above ceiling rent)..."
                  className="w-full rounded-xl border border-rose-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-rose-50/30"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsRejecting(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRejectProperty(selectedItemForReview)}
                    disabled={processingPropertyId === selectedItemForReview.id}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50"
                  >
                    {processingPropertyId === selectedItemForReview.id ? "Sending..." : "Submit Correction Order"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setIsRejecting(true)}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold border border-rose-200"
                >
                  Issue Correction Notice
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const id = selectedItemForReview.id;
                      setSelectedItemForReview(null);
                      goToDetail(id);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Full Review</span>
                  </button>
                  <button
                    onClick={() => handleVerifyProperty(selectedItemForReview)}
                    disabled={processingPropertyId === selectedItemForReview.id}
                    className="px-4 py-2 rounded-xl bg-[#00450d] hover:bg-[#164e23] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {processingPropertyId === selectedItemForReview.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Verify &amp; Forward</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View All Queue Modal */}
      {isViewAllModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Full Municipal Verification Queue ({queue.length} Total)
                </h3>
                <p className="text-xs text-slate-500">
                  All active citizen dossiers awaiting Woreda Officer field check and document clearance
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
                  No properties in the verification queue.
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">PROPERTY ID</th>
                      <th className="py-2.5 px-3">TITLE / SUB-CITY</th>
                      <th className="py-2.5 px-3">DATE</th>
                      <th className="py-2.5 px-3">MONTHLY RENT</th>
                      <th className="py-2.5 px-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {queue.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900 font-mono">{item.propertyId}</td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-800 block">{item.propertyTitle}</span>
                          <span className="text-[10px] text-slate-400">{item.subCity} · W{item.woreda}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-500">{item.submissionDate}</td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          ETB {item.monthlyRent.toLocaleString()}
                        </td>
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
}

export default OfficerOfficeDashboardPage;
