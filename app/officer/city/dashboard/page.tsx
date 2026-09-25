"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  FileText,
  Clock,
  AlertCircle,
  AlertTriangle,
  Scale,
  Compass,
  Coins,
  ShieldAlert,
  Flame,
  Gavel,
  ExternalLink,
  ChevronRight,
  Filter,
  Download,
  Eye,
  Check,
  X,
  FileCheck2,
  Calendar,
  Sparkles,
  MapPin,
  RefreshCw,
  Printer,
  Share2,
  ArrowUpRight,
  Info,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// =========================================================================
// TYPES & DATASETS
// =========================================================================
export interface SubCityMatrixRecord {
  id: string;
  name: string;
  woredas: number;
  registeredUnits: number;
  maxUnitsCapacity: number;
  certifiedTitleDeeds: number;
  certifiedRate: number; // %
  avgUnitRent: number; // ETB / mo
  freezeCompliance: number; // %
  remandedFiles: number;
  leadAuditorStatus: "FULLY VALIDATED" | "AUDIT REVIEW" | "AUDITOR FLAGGED";
  flagReason?: string;
  leadAuditor: string;
  lastAuditDate: string;
}

export const SUB_CITIES_BENCHMARKING: SubCityMatrixRecord[] = [
  {
    id: "sc-bole",
    name: "Bole",
    woredas: 14,
    registeredUnits: 34820,
    maxUnitsCapacity: 40000,
    certifiedTitleDeeds: 29150,
    certifiedRate: 83.7,
    avgUnitRent: 28400,
    freezeCompliance: 99.2,
    remandedFiles: 42,
    leadAuditorStatus: "FULLY VALIDATED",
    leadAuditor: "Ato Kassa Hailu",
    lastAuditDate: "Today at 08:30 EAT",
  },
  {
    id: "sc-kirkos",
    name: "Kirkos",
    woredas: 11,
    registeredUnits: 26400,
    maxUnitsCapacity: 30000,
    certifiedTitleDeeds: 22700,
    certifiedRate: 86.0,
    avgUnitRent: 24100,
    freezeCompliance: 98.8,
    remandedFiles: 31,
    leadAuditorStatus: "FULLY VALIDATED",
    leadAuditor: "W/ro Selamawit D.",
    lastAuditDate: "Today at 09:15 EAT",
  },
  {
    id: "sc-yeka",
    name: "Yeka",
    woredas: 13,
    registeredUnits: 21950,
    maxUnitsCapacity: 26000,
    certifiedTitleDeeds: 18200,
    certifiedRate: 82.9,
    avgUnitRent: 18900,
    freezeCompliance: 98.4,
    remandedFiles: 58,
    leadAuditorStatus: "AUDIT REVIEW",
    flagReason: "Pending parcel cross-match for Woreda 07 lease agreements",
    leadAuditor: "Ato Ermias Bekele",
    lastAuditDate: "Yesterday at 17:00 EAT",
  },
  {
    id: "sc-arada",
    name: "Arada",
    woredas: 10,
    registeredUnits: 14300,
    maxUnitsCapacity: 16000,
    certifiedTitleDeeds: 12650,
    certifiedRate: 88.5,
    avgUnitRent: 16500,
    freezeCompliance: 99.1,
    remandedFiles: 19,
    leadAuditorStatus: "FULLY VALIDATED",
    leadAuditor: "Ato Mulatu Tesfaye",
    lastAuditDate: "Today at 07:45 EAT",
  },
  {
    id: "sc-lideta",
    name: "Lideta",
    woredas: 10,
    registeredUnits: 12850,
    maxUnitsCapacity: 15000,
    certifiedTitleDeeds: 11200,
    certifiedRate: 87.2,
    avgUnitRent: 15200,
    freezeCompliance: 98.0,
    remandedFiles: 27,
    leadAuditorStatus: "AUDIT REVIEW",
    flagReason: "Commercial space renewal escalation audit underway",
    leadAuditor: "W/ro Tigist Abera",
    lastAuditDate: "Today at 10:20 EAT",
  },
  {
    id: "sc-nifas-silk",
    name: "Nifas Silk-Lafto",
    woredas: 15,
    registeredUnits: 24100,
    maxUnitsCapacity: 28000,
    certifiedTitleDeeds: 19800,
    certifiedRate: 82.2,
    avgUnitRent: 19400,
    freezeCompliance: 97.8,
    remandedFiles: 64,
    leadAuditorStatus: "AUDIT REVIEW",
    flagReason: "Inter-woreda demarcation verification queue",
    leadAuditor: "Ato Yohannes T.",
    lastAuditDate: "2 days ago",
  },
  {
    id: "sc-gullele",
    name: "Gullele",
    woredas: 11,
    registeredUnits: 11200,
    maxUnitsCapacity: 14000,
    certifiedTitleDeeds: 9450,
    certifiedRate: 84.4,
    avgUnitRent: 13800,
    freezeCompliance: 99.4,
    remandedFiles: 12,
    leadAuditorStatus: "FULLY VALIDATED",
    leadAuditor: "W/ro Hiwot Negash",
    lastAuditDate: "Today at 11:00 EAT",
  },
  {
    id: "sc-addis-ketema",
    name: "Addis Ketema",
    woredas: 10,
    registeredUnits: 18650,
    maxUnitsCapacity: 25000,
    certifiedTitleDeeds: 13200,
    certifiedRate: 70.8,
    avgUnitRent: 17200,
    freezeCompliance: 95.2,
    remandedFiles: 94,
    leadAuditorStatus: "AUDITOR FLAGGED",
    flagReason: "ETB 4.2M statutory stamp duty discrepancy under inquiry",
    leadAuditor: "Senait Mamo (Tax Branch)",
    lastAuditDate: "Today at 06:15 EAT",
  },
  {
    id: "sc-akaki-kaliti",
    name: "Akaki Kaliti",
    woredas: 13,
    registeredUnits: 9480,
    maxUnitsCapacity: 12000,
    certifiedTitleDeeds: 7920,
    certifiedRate: 83.5,
    avgUnitRent: 11600,
    freezeCompliance: 98.9,
    remandedFiles: 15,
    leadAuditorStatus: "FULLY VALIDATED",
    leadAuditor: "Ato Getu Assefa",
    lastAuditDate: "Yesterday at 15:30 EAT",
  },
  {
    id: "sc-kolfe-keranio",
    name: "Kolfe Keranio",
    woredas: 15,
    registeredUnits: 16200,
    maxUnitsCapacity: 22000,
    certifiedTitleDeeds: 12800,
    certifiedRate: 79.0,
    avgUnitRent: 12900,
    freezeCompliance: 96.8,
    remandedFiles: 71,
    leadAuditorStatus: "AUDITOR FLAGGED",
    flagReason: "Uncertified informal lease clusters identified in Woreda 12",
    leadAuditor: "Ato Fikadu Lemma",
    lastAuditDate: "Today at 08:00 EAT",
  },
  {
    id: "sc-lemi-kura",
    name: "Lemi Kura",
    woredas: 12,
    registeredUnits: 14300,
    maxUnitsCapacity: 18000,
    certifiedTitleDeeds: 11400,
    certifiedRate: 79.7,
    avgUnitRent: 14100,
    freezeCompliance: 97.6,
    remandedFiles: 48,
    leadAuditorStatus: "AUDIT REVIEW",
    flagReason: "New residential expansion parcel digitisation in progress",
    leadAuditor: "W/ro Rahel Zewde",
    lastAuditDate: "Yesterday at 12:45 EAT",
  },
];

export const SUB_CITY_PILLS = [
  "City-Wide (All 11 Sub-Cities)",
  "Bole",
  "Kirkos",
  "Yeka",
  "Arada",
  "Lideta",
  "Nifas Silk-Lafto",
  "Gullele",
  "Addis Ketema",
  "Akaki Kaliti",
  "Kolfe Keranio",
  "Lemi Kura",
];

export default function CityDashboardPage() {
  const [selectedSubCityPill, setSelectedSubCityPill] = useState("City-Wide (All 11 Sub-Cities)");
  const [chartTimeframe, setChartTimeframe] = useState<"6m" | "1y" | "all">("6m");
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(3); // Default Tikimt (index 3)

  // Table filtering and search
  const [tableSearch, setTableSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Injunction actions state
  const [inj1Resolved, setInj1Resolved] = useState(false);
  const [inj2Dispatched, setInj2Dispatched] = useState(false);
  const [inj3Summoned, setInj3Summoned] = useState(false);

  // Interactive modal dialogs
  const [dossierModalSubCity, setDossierModalSubCity] = useState<SubCityMatrixRecord | null>(null);
  const [gisModalOpen, setGisModalOpen] = useState(false);
  const [taxLedgerModalOpen, setTaxLedgerModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Telemetry chart data points (Hamle -> Tahsas)
  const telemetryData = [
    { month: "Hamle", approved: 24200, flagged: 1820 },
    { month: "Nehase", approved: 28400, flagged: 1450 },
    { month: "Meskerem", approved: 32100, flagged: 1610 },
    { month: "Tikimt", approved: 38400, flagged: 1240 }, // Current active cycle
    { month: "Hidar", approved: 43900, flagged: 1080 },
    { month: "Tahsas", approved: 48250, flagged: 980 },
  ];

  // Filtered benchmarking data
  const filteredBenchmarkData = useMemo(() => {
    return SUB_CITIES_BENCHMARKING.filter((item) => {
      // Sub-city pill filter
      if (
        selectedSubCityPill !== "City-Wide (All 11 Sub-Cities)" &&
        item.name.toLowerCase() !== selectedSubCityPill.toLowerCase()
      ) {
        return false;
      }
      // Status filter
      if (statusFilter !== "ALL" && item.leadAuditorStatus !== statusFilter) {
        return false;
      }
      // Text search
      if (tableSearch.trim()) {
        const query = tableSearch.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.leadAuditor.toLowerCase().includes(query) ||
          (item.flagReason && item.flagReason.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [selectedSubCityPill, statusFilter, tableSearch]);

  // CSV Export Functionality
  const handleExportCSV = () => {
    const headers = [
      "Sub-City",
      "Woredas",
      "Registered Units",
      "Certified Title Deeds",
      "Certification Rate (%)",
      "Average Unit Rent (ETB)",
      "Rent Freeze Compliance (%)",
      "Remanded Audit Files",
      "Lead Auditor Status",
      "Lead Auditor",
      "Last Audit Date",
    ];

    const rows = filteredBenchmarkData.map((sc) => [
      `"${sc.name}"`,
      sc.woredas,
      sc.registeredUnits,
      sc.certifiedTitleDeeds,
      sc.certifiedRate,
      sc.avgUnitRent,
      sc.freezeCompliance,
      sc.remandedFiles,
      `"${sc.leadAuditorStatus}"`,
      `"${sc.leadAuditor}"`,
      `"${sc.lastAuditDate}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Addis_Ababa_SubCity_Benchmarking_Audit_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Audit matrix successfully exported to CSV.");
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#00450d] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-emerald-500 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-emerald-200 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. JURISDICTION FILTER BAR & FISCAL CYCLE INDICATOR                        */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        {/* Scrollable Sub-City Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
          {SUB_CITY_PILLS.map((pill) => {
            const isActive = selectedSubCityPill === pill;
            return (
              <button
                key={pill}
                onClick={() => setSelectedSubCityPill(pill)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all select-none ${
                  isActive
                    ? "bg-[#00450d] text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
                }`}
              >
                {pill}
              </button>
            );
          })}
        </div>

        {/* Fiscal Cycle Indicator */}
        <div className="shrink-0 flex items-center gap-2 self-end lg:self-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-[#00450d] border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Tikimt 2017 E.C. (OCT 2024) - CYCLE ACTIVE
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FIVE EXECUTIVE KEY PERFORMANCE INDICATORS (CARDS)                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* CARD 1: TOTAL REGISTERED TENANCIES */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">TOTAL REGISTERED TENANCIES</span>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">184,250</span>
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +14.2% vs Q2
              </span>
            </div>
          </div>
          {/* Sparkline Curve */}
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-end justify-between">
            <span className="text-[10px] text-slate-400 font-medium">92.1% of Annual Quota</span>
            <svg className="w-20 h-5 overflow-visible" viewBox="0 0 80 20" fill="none">
              <path
                d="M 0 16 Q 20 14, 40 9 T 80 2"
                fill="none"
                stroke="#00450d"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="80" cy="2" r="2.5" fill="#00450d" />
            </svg>
          </div>
        </div>

        {/* CARD 2: CADASTRAL PARCELS CERTIFIED */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">CADASTRAL PARCELS CERTIFIED</span>
              <Building2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">64,820</span>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                84.2% Match
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-medium flex items-center justify-between">
            <span>Bole: 18.4k</span>
            <span className="text-slate-300">•</span>
            <span>Kirkos: 12.1k</span>
            <span className="text-slate-300">•</span>
            <span>Yeka: 9.8k</span>
          </div>
        </div>

        {/* CARD 3: MUNICIPAL RENTAL REVENUE */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">MUNICIPAL RENTAL REVENUE</span>
              <Coins className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">ETB 1.42 B</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                +18.4% YoY
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">Statutory 2% Stamp Duty</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded">
              <Check className="w-2.5 h-2.5" /> On Target
            </span>
          </div>
        </div>

        {/* CARD 4: RENT FREEZE COMPLIANCE */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">RENT FREEZE COMPLIANCE</span>
              <Scale className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">98.6%</span>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                Proc. 1284
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">Cap Breaches Flagged</span>
            <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              <TrendingDown className="w-3 h-3 mr-0.5" />
              -0.4% from peak
            </span>
          </div>
        </div>

        {/* CARD 5: INTER-AGENCY SLA VELOCITY */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">INTER-AGENCY SLA VELOCITY</span>
              <Zap className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">1.8 Days</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                +0.3d faster
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">Fed. Urban Land Bank</span>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
              GovNet API
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TELEMETRY CHART & REGULATORY MILESTONES (2/3 + 1/3 GRID)                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Inflow & Regulatory Telemetry */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#00450d]" />
                  Municipal Inflow & Regulatory Interventions Telemetry
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time stream of lease registrations, automated rent-freeze validations, and remanded audit cases.
                </p>
              </div>

              {/* Timeframe & Legend */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00450d]" />
                    Approved Submissions
                  </span>
                  <span className="flex items-center gap-1 ml-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Remanded / Flagged
                  </span>
                </div>
                <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setChartTimeframe("6m")}
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                      chartTimeframe === "6m" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                    }`}
                  >
                    6 Months
                  </button>
                  <button
                    onClick={() => setChartTimeframe("1y")}
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                      chartTimeframe === "1y" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                    }`}
                  >
                    1 Year
                  </button>
                </div>
              </div>
            </div>

            {/* SVG Telemetry Chart */}
            <div className="relative mt-4 h-56 w-full select-none">
              <svg className="w-full h-full" viewBox="0 0 760 210" preserveAspectRatio="none">
                <defs>
                  {/* Approved Green Gradient */}
                  <linearGradient id="telemetryApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00450d" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#00450d" stopOpacity="0.0" />
                  </linearGradient>
                  {/* Flagged Amber Gradient */}
                  <linearGradient id="telemetryFlagged" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Horizontal Gridlines */}
                {[0, 45, 90, 135, 180].map((y, idx) => (
                  <g key={y}>
                    <line x1="50" y1={y} x2="740" y2={y} stroke="#f1f5f9" strokeDasharray="3 3" />
                    <text x="35" y={y + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
                      {idx === 0 ? "50k" : idx === 1 ? "40k" : idx === 2 ? "30k" : idx === 3 ? "20k" : "10k"}
                    </text>
                  </g>
                ))}

                {/* Approved Area Fill */}
                <path
                  d="M 50 180 
                     L 50 108 
                     C 120 95, 180 84, 250 78 
                     C 320 72, 380 58, 450 48 
                     C 520 38, 580 24, 650 16 
                     L 740 12 
                     L 740 180 Z"
                  fill="url(#telemetryApproved)"
                />

                {/* Approved Line Stroke */}
                <path
                  d="M 50 108 
                     C 120 95, 180 84, 250 78 
                     C 320 72, 380 58, 450 48 
                     C 520 38, 580 24, 650 16 
                     L 740 12"
                  fill="none"
                  stroke="#00450d"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Flagged Area Fill */}
                <path
                  d="M 50 180 
                     L 50 164 
                     C 120 168, 180 166, 250 167 
                     C 320 169, 380 171, 450 173 
                     C 520 174, 580 176, 650 177 
                     L 740 178 
                     L 740 180 Z"
                  fill="url(#telemetryFlagged)"
                />

                {/* Flagged Line Stroke */}
                <path
                  d="M 50 164 
                     C 120 168, 180 166, 250 167 
                     C 320 169, 380 171, 450 173 
                     C 520 174, 580 176, 650 177 
                     L 740 178"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Month Indicators & Interactive Columns */}
                {telemetryData.map((d, index) => {
                  const x = 50 + index * 138;
                  const isHovered = hoveredMonthIndex === index;
                  return (
                    <g
                      key={d.month}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredMonthIndex(index)}
                    >
                      {/* Vertical highlight line */}
                      {isHovered && (
                        <line
                          x1={x}
                          y1="10"
                          x2={x}
                          y2="180"
                          stroke="#00450d"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                          opacity="0.6"
                        />
                      )}
                      {/* Approved Dot */}
                      <circle
                        cx={x}
                        cy={index === 0 ? 108 : index === 1 ? 92 : index === 2 ? 78 : index === 3 ? 48 : index === 4 ? 28 : 12}
                        r={isHovered ? "5" : "3.5"}
                        fill="#00450d"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      {/* Flagged Dot */}
                      <circle
                        cx={x}
                        cy={index === 0 ? 164 : index === 1 ? 166 : index === 2 ? 167 : index === 3 ? 173 : index === 4 ? 175 : 178}
                        r={isHovered ? "4" : "2.5"}
                        fill="#f59e0b"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      {/* X Label */}
                      <text
                        x={x}
                        y="200"
                        textAnchor="middle"
                        className={`text-[11px] font-semibold transition-colors ${
                          isHovered ? "fill-[#00450d] font-bold" : "fill-slate-500"
                        }`}
                      >
                        {d.month}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Hover Tooltip Box */}
              {hoveredMonthIndex !== null && (
                <div
                  className="absolute top-2 pointer-events-none bg-slate-900 text-white rounded-lg px-3 py-2 text-xs shadow-xl border border-slate-700 transition-all duration-150"
                  style={{
                    left: `${Math.min(Math.max(10, 5 + hoveredMonthIndex * 16), 72)}%`,
                  }}
                >
                  <div className="font-bold text-emerald-400 border-b border-slate-800 pb-1 mb-1">
                    {telemetryData[hoveredMonthIndex].month} 2017 E.C.
                  </div>
                  <div className="flex items-center justify-between gap-4 text-slate-300 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Approved:
                    </span>
                    <span className="font-bold text-white">
                      {telemetryData[hoveredMonthIndex].approved.toLocaleString()} units
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-slate-300 text-[11px] mt-0.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Flagged:
                    </span>
                    <span className="font-bold text-amber-300">
                      {telemetryData[hoveredMonthIndex].flagged.toLocaleString()} files
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Real-time Inflow Rate: <strong className="text-slate-800 ml-1">428 registrations / hour</strong>
            </span>
            <span>Automated Audit Rejection Rate: 2.1%</span>
          </div>
        </div>

        {/* Right Column (1 Col): Regulatory Milestones & Dispute Interventions */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Card A: Regulatory Milestone */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00450d]">
                  REGULATORY MILESTONE
                </span>
                <Sparkles className="w-4 h-4 text-[#00450d]" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                200,000 Verified Tenancies Q4 Target
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                15,750 units remaining to reach mandatory municipal registry milestone under Proclamation 1284.
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Progress: 184,250 / 200,000</span>
                <span className="text-[#00450d] font-bold">92.1%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                <div
                  className="bg-[#00450d] h-2.5 rounded-full transition-all duration-500"
                  style={{ width: "92.1%" }}
                />
              </div>
              <div className="text-[11px] text-slate-400 font-medium pt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                Projected Milestone Completion: <strong>18 Tahsas 2017 E.C.</strong>
              </div>
            </div>
          </div>

          {/* Card B: Dispute Interventions */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                  DISPUTE INTERVENTIONS
                </span>
                <Scale className="w-4 h-4 text-amber-600" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                Active Algorithmic Flag Breakdown
              </h4>
            </div>

            <div className="mt-3 space-y-2.5">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-600 font-medium">Rent Ceiling Breaches</span>
                <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  1,420
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-600 font-medium">Landlord Eviction Appeals</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  680
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-600 font-medium">Cadastral Boundary Conflicts</span>
                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  312
                </span>
              </div>
            </div>

            <button
              onClick={() => showToast("Navigating to all 2,412 active injunction records...")}
              className="mt-3 w-full text-center text-xs font-bold text-[#00450d] hover:underline flex items-center justify-center gap-1"
            >
              <span>View All 2,412 Active Injunctions</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. SUB-CITY COMPARATIVE MATRIX & AUDITED BENCHMARKING TABLE                */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Sub-City Comparative Matrix & Audited Benchmarking
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Aggregated statutory data across all 11 Addis Ababa Sub-Cities. Updated hourly via Woreda sync nodes.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter sub-city or auditor..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00450d] focus:bg-white"
              />
            </div>

            {/* Filter Metrics Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterModalOpen(true)}
              className="h-8 gap-1.5 text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter Metrics</span>
              {statusFilter !== "ALL" && (
                <span className="w-2 h-2 rounded-full bg-[#00450d]" />
              )}
            </Button>

            {/* Export CSV Button */}
            <Button
              size="sm"
              onClick={handleExportCSV}
              className="h-8 gap-1.5 text-xs font-semibold bg-[#00450d] hover:bg-[#00380a] text-white"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>

        {/* Benchmarking Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">SUB-CITY</th>
                <th className="py-3 px-4">REGISTERED UNITS</th>
                <th className="py-3 px-4">CERTIFIED TITLE DEEDS</th>
                <th className="py-3 px-4">AVG UNIT RENT</th>
                <th className="py-3 px-4">FREEZE COMPLIANCE</th>
                <th className="py-3 px-4">REMANDED FILES</th>
                <th className="py-3 px-4">LEAD AUDITOR STATUS</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredBenchmarkData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No sub-cities match the current search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredBenchmarkData.map((sc) => {
                  const percentOfTarget = Math.round((sc.registeredUnits / sc.maxUnitsCapacity) * 100);

                  return (
                    <tr
                      key={sc.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setDossierModalSubCity(sc)}
                    >
                      {/* Sub-City Name & Woreda count */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-[#00450d] transition-colors">
                          {sc.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {sc.woredas} Woredas Active
                        </div>
                      </td>

                      {/* Registered Units + Progress */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">
                          {sc.registeredUnits.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-[#00450d] h-1.5 rounded-full"
                              style={{ width: `${percentOfTarget}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {percentOfTarget}%
                          </span>
                        </div>
                      </td>

                      {/* Certified Title Deeds */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">
                          {sc.certifiedTitleDeeds.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {sc.certifiedRate}% verified
                        </div>
                      </td>

                      {/* Avg Unit Rent */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        ETB {sc.avgUnitRent.toLocaleString()}
                        <span className="text-[10px] text-slate-400 font-normal"> / mo</span>
                      </td>

                      {/* Freeze Compliance */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            sc.freezeCompliance >= 98.5
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : sc.freezeCompliance >= 97.0
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-rose-50 text-rose-800 border border-rose-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              sc.freezeCompliance >= 98.5
                                ? "bg-emerald-600"
                                : sc.freezeCompliance >= 97.0
                                ? "bg-amber-600"
                                : "bg-rose-600"
                            }`}
                          />
                          {sc.freezeCompliance}%
                        </span>
                      </td>

                      {/* Remanded Files */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold ${
                            sc.remandedFiles > 50
                              ? "text-rose-600 font-bold"
                              : sc.remandedFiles > 25
                              ? "text-amber-700"
                              : "text-slate-600"
                          }`}
                        >
                          {sc.remandedFiles} files
                        </span>
                      </td>

                      {/* Lead Auditor Status Badge */}
                      <td className="py-3.5 px-4">
                        {sc.leadAuditorStatus === "FULLY VALIDATED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-700" />
                            FULLY VALIDATED
                          </span>
                        )}
                        {sc.leadAuditorStatus === "AUDIT REVIEW" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-700" />
                            AUDIT REVIEW
                          </span>
                        )}
                        {sc.leadAuditorStatus === "AUDITOR FLAGGED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-100 text-rose-900 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-700" />
                            AUDITOR FLAGGED
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDossierModalSubCity(sc);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-[#00450d] hover:bg-emerald-50 rounded-md border border-emerald-200/80 transition-colors inline-flex items-center gap-1"
                        >
                          <span>Audit Dossier</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. THREE URGENT INJUNCTION & INTERVENTION CARDS                           */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            Priority Executive Injunctions & Algorithmic Flags
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Immediate Director-General sign-off required under Proclamation 1284/2016 Articles 14-19.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* INJUNCTION 1: RENT CEILING BREACH */}
          <div
            className={`bg-white rounded-xl border p-5 shadow-2xs flex flex-col justify-between transition-all ${
              inj1Resolved
                ? "border-emerald-300 bg-emerald-50/20"
                : "border-rose-200/90 hover:border-rose-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                    inj1Resolved
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-rose-100 text-rose-800 border-rose-200"
                  }`}
                >
                  {inj1Resolved ? "INJUNCTION ACTIVE" : "URGENT INJUNCTION"}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Bole W03</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                Rent Ceiling Breach - Bole Woreda 03
              </h4>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                Parcel ID: AA-BOL-03-8812
              </p>
              <div className="mt-3 p-2.5 rounded-lg bg-rose-50/60 border border-rose-100 text-xs text-slate-700">
                Registered rate of <strong>ETB 65,000/mo</strong> violates the statutory freeze cap (ETB 42,000/mo). Excess breach: <strong>+54.7%</strong>.
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                Landlord: Ato Getachew Tessema • Tenant: W/ro Martha Haile
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setInj1Resolved(true);
                  showToast("Statutory Freeze Injunction #INJ-2024-8812 issued to Bole Woreda 03.");
                }}
                disabled={inj1Resolved}
                className="flex-1 h-8 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:bg-emerald-600 disabled:opacity-100"
              >
                {inj1Resolved ? "Injunction Issued" : "Issue Freeze Injunction"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const boleData = SUB_CITIES_BENCHMARKING.find((s) => s.id === "sc-bole");
                  if (boleData) setDossierModalSubCity(boleData);
                }}
                className="h-8 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Review Dossier
              </Button>
            </div>
          </div>

          {/* INJUNCTION 2: SURVEYOR INTERLOCK */}
          <div
            className={`bg-white rounded-xl border p-5 shadow-2xs flex flex-col justify-between transition-all ${
              inj2Dispatched
                ? "border-emerald-300 bg-emerald-50/20"
                : "border-amber-200/90 hover:border-amber-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                    inj2Dispatched
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-amber-100 text-amber-800 border-amber-200"
                  }`}
                >
                  {inj2Dispatched ? "UNIT EN ROUTE" : "SURVEYOR INTERLOCK"}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Kirkos W08</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                Cadastral Boundary Conflict - Kirkos Woreda 08
              </h4>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                Parcel ID: AA-KIR-08-0192
              </p>
              <div className="mt-3 p-2.5 rounded-lg bg-amber-50/60 border border-amber-100 text-xs text-slate-700">
                GIS overlay detects <strong>14.8m² spatial overlap</strong> with the Federal Road Authority Reserve Corridor.
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                Lead Surveyor: Eng. Dawit Alemu • Confidence: 99.4%
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setInj2Dispatched(true);
                  showToast("Emergency GIS Cadastre Field Unit dispatched to Kirkos Woreda 08.");
                }}
                disabled={inj2Dispatched}
                className="flex-1 h-8 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white disabled:bg-emerald-600 disabled:opacity-100"
              >
                {inj2Dispatched ? "Unit Dispatched" : "Dispatch Cadastre Unit"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGisModalOpen(true)}
                className="h-8 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                View GIS Map
              </Button>
            </div>
          </div>

          {/* INJUNCTION 3: REVENUE AUDIT */}
          <div
            className={`bg-white rounded-xl border p-5 shadow-2xs flex flex-col justify-between transition-all ${
              inj3Summoned
                ? "border-emerald-300 bg-emerald-50/20"
                : "border-blue-200/90 hover:border-blue-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                    inj3Summoned
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-blue-100 text-blue-800 border-blue-200"
                  }`}
                >
                  {inj3Summoned ? "SUMMONS ISSUED" : "REVENUE AUDIT"}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Addis Ketema W05</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                Unremitted Stamp Duty - Addis Ketema Woreda 05
              </h4>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                Commercial Registry Node AK-05
              </p>
              <div className="mt-3 p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-slate-700">
                Discrepancy of <strong>ETB 4.2M</strong> in statutory 2% lease stamp duties over the past 45 billing days.
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                Senior Auditor: Senait Mamo (Tax Branch)
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setInj3Summoned(true);
                  showToast("Statutory Executive Summons #TX-AK05-992 served to Woreda Tax Chief.");
                }}
                disabled={inj3Summoned}
                className="flex-1 h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:bg-emerald-600 disabled:opacity-100"
              >
                {inj3Summoned ? "Summons Served" : "Summon Woreda Tax Chief"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTaxLedgerModalOpen(true)}
                className="h-8 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Audit Ledger
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. ENTERPRISE SYSTEM STATUS BAR                                           */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200/90 px-4 py-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold text-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Enterprise Node 101 (Bole Central Facility)
          </span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-slate-600 hidden sm:inline">High-Availability Tier-III Clustered</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00450d]" />
            Proclamation Protocol 1284/2016 Active
          </span>
          <span className="text-slate-400">
            Last Synced: <strong>12 seconds ago</strong> (Live Webhook) • 11/11 Sub-Cities Online
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: SUB-CITY AUDIT DOSSIER                                           */}
      {/* ========================================================================= */}
      <Dialog open={!!dossierModalSubCity} onOpenChange={(open) => !open && setDossierModalSubCity(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-slate-900">
              <FileCheck2 className="w-5 h-5 text-[#00450d]" />
              Executive Audit Dossier: {dossierModalSubCity?.name} Sub-City
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Full statutory verification ledger and compliance certification breakdown.
            </DialogDescription>
          </DialogHeader>

          {dossierModalSubCity && (
            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Woredas</span>
                  <span className="text-base font-bold text-slate-900">{dossierModalSubCity.woredas}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Registered Units</span>
                  <span className="text-base font-bold text-slate-900">
                    {dossierModalSubCity.registeredUnits.toLocaleString()}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Certified Deeds</span>
                  <span className="text-base font-bold text-slate-900">
                    {dossierModalSubCity.certifiedTitleDeeds.toLocaleString()} ({dossierModalSubCity.certifiedRate}%)
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Freeze Compliance</span>
                  <span className="text-base font-bold text-emerald-700">
                    {dossierModalSubCity.freezeCompliance}%
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-semibold text-slate-700">
                  <span>Lead Auditor in Charge:</span>
                  <span className="text-slate-900">{dossierModalSubCity.leadAuditor}</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-slate-700">
                  <span>Audit Timestamp:</span>
                  <span className="text-slate-900">{dossierModalSubCity.lastAuditDate}</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-slate-700">
                  <span>Status:</span>
                  <span className="font-bold text-[#00450d]">{dossierModalSubCity.leadAuditorStatus}</span>
                </div>
                {dossierModalSubCity.flagReason && (
                  <div className="pt-2 border-t border-slate-200 text-rose-700">
                    <strong>Auditor Finding:</strong> {dossierModalSubCity.flagReason}
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed">
                Under Article 21 of the Addis Ababa Tenancy Administration Proclamation No. 1284/2016, this dossier reflects real-time synchronisation across the Federal Urban Land Bank and Municipal Property Registration Database.
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDossierModalSubCity(null)}
              className="text-xs"
            >
              Close Dossier
            </Button>
            <Button
              size="sm"
              onClick={() => {
                showToast(`Auditor endorsement sealed for ${dossierModalSubCity?.name}.`);
                setDossierModalSubCity(null);
              }}
              className="text-xs bg-[#00450d] hover:bg-[#00380a] text-white"
            >
              Confirm Auditor Endorsement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: GIS MAP OVERLAY                                                  */}
      {/* ========================================================================= */}
      <Dialog open={gisModalOpen} onOpenChange={setGisModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-slate-900">
              <Compass className="w-5 h-5 text-amber-600" />
              Cadastral GIS Map: Kirkos Woreda 08 (AA-KIR-08-0192)
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              High-resolution spatial overlay depicting the 14.8m² reserve corridor conflict.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Simulated GIS Vector Canvas */}
            <div className="relative w-full h-64 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center p-4">
              <svg className="w-full h-full" viewBox="0 0 400 200">
                {/* Grid */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="400" height="200" fill="url(#grid)" />

                {/* Federal Road Corridor */}
                <polygon
                  points="20,160 380,60 380,95 20,195"
                  fill="#f59e0b"
                  fillOpacity="0.25"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
                <text x="210" y="115" fill="#f59e0b" fontSize="9" fontWeight="bold">
                  Federal Road Reserve Corridor (ERA-R8)
                </text>

                {/* Registered Parcel AA-KIR-08-0192 */}
                <polygon
                  points="140,40 280,30 295,120 155,130"
                  fill="#00450d"
                  fillOpacity="0.4"
                  stroke="#22c55e"
                  strokeWidth="2"
                />
                <text x="175" y="80" fill="#ffffff" fontSize="10" fontWeight="bold">
                  Parcel AA-KIR-08-0192
                </text>

                {/* Overlap Zone */}
                <polygon
                  points="215,95 295,120 280,90 240,88"
                  fill="#ef4444"
                  fillOpacity="0.7"
                  stroke="#ef4444"
                  strokeWidth="2"
                />
                <circle cx="255" cy="100" r="4" fill="#ef4444" className="animate-ping" />
              </svg>

              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded text-[10px] text-amber-300 border border-amber-500/30">
                Overlap: 14.8m² (Coordinate: 9°00&apos;42.1&quot;N 38°45&apos;22.4&quot;E)
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1 text-slate-700">
              <div className="font-semibold text-slate-900">Surveyor Assessment:</div>
              <div>Boundary overlap verified with Ethiopian Mapping Authority Geodetic Benchmark 410. Recommendation: Adjust boundary coordinates to match Proclamation 1284 road reservation margin.</div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setGisModalOpen(false)}>
              Close Map
            </Button>
            <Button
              size="sm"
              onClick={() => {
                showToast("Demarcation injunction forwarded to Kirkos Land Administration.");
                setGisModalOpen(false);
              }}
              className="bg-[#00450d] hover:bg-[#00380a] text-white"
            >
              Forward Boundary Correction Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 3: TAX AUDIT LEDGER                                                 */}
      {/* ========================================================================= */}
      <Dialog open={taxLedgerModalOpen} onOpenChange={setTaxLedgerModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-slate-900">
              <Coins className="w-5 h-5 text-blue-600" />
              Statutory Tax Ledger: Addis Ketema Woreda 05
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Unremitted 2% stamp duty audit breakdown for fiscal quarter Q3.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 text-slate-800 space-y-1">
              <div className="font-bold text-blue-900">Total Statutory Discrepancy: ETB 4,215,800.00</div>
              <div className="text-[11px] text-slate-600">
                Computed from 312 registered commercial lease agreements between Meskerem 1 and Tikimt 15, 2017 E.C.
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase">
                  <tr>
                    <th className="py-2 px-3">Batch Reference</th>
                    <th className="py-2 px-3">Lease Units</th>
                    <th className="py-2 px-3">Expected Duty</th>
                    <th className="py-2 px-3">Remitted</th>
                    <th className="py-2 px-3 text-right">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  <tr>
                    <td className="py-2 px-3 font-mono">BATCH-AK05-901</td>
                    <td className="py-2 px-3">120 Commercial</td>
                    <td className="py-2 px-3 font-mono">ETB 1,850,000</td>
                    <td className="py-2 px-3 font-mono text-amber-700">ETB 450,000</td>
                    <td className="py-2 px-3 font-mono font-bold text-rose-600 text-right">-ETB 1,400,000</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono">BATCH-AK05-902</td>
                    <td className="py-2 px-3">94 Commercial</td>
                    <td className="py-2 px-3 font-mono">ETB 1,420,000</td>
                    <td className="py-2 px-3 font-mono text-amber-700">ETB 0</td>
                    <td className="py-2 px-3 font-mono font-bold text-rose-600 text-right">-ETB 1,420,000</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono">BATCH-AK05-903</td>
                    <td className="py-2 px-3">98 Mixed Use</td>
                    <td className="py-2 px-3 font-mono">ETB 1,600,000</td>
                    <td className="py-2 px-3 font-mono text-amber-700">ETB 204,200</td>
                    <td className="py-2 px-3 font-mono font-bold text-rose-600 text-right">-ETB 1,395,800</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setTaxLedgerModalOpen(false)}>
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => {
                showToast("Freeze placed on Addis Ketema W05 Stamp Duty Account.");
                setTaxLedgerModalOpen(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Order Immediate Account Freeze
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 4: FILTER METRICS MODAL                                             */}
      {/* ========================================================================= */}
      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-slate-900">
              <SlidersHorizontal className="w-5 h-5 text-[#00450d]" />
              Filter Sub-City Metrics
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Refine the audited benchmarking table by auditor status and sub-city.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">
                Lead Auditor Status:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["ALL", "FULLY VALIDATED", "AUDIT REVIEW", "AUDITOR FLAGGED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                      statusFilter === st
                        ? "bg-[#00450d] text-white border-[#00450d]"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatusFilter("ALL");
                setSelectedSubCityPill("City-Wide (All 11 Sub-Cities)");
                setTableSearch("");
                setIsFilterModalOpen(false);
              }}
            >
              Reset Filters
            </Button>
            <Button
              size="sm"
              onClick={() => setIsFilterModalOpen(false)}
              className="bg-[#00450d] hover:bg-[#00380a] text-white"
            >
              Apply Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
