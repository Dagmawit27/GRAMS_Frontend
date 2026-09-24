"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TaxOfficerLayout } from "./layout-tax";
import {
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Download,
  RefreshCw,
  Filter,
  CheckCircle2,
  FileText,
  TrendingUp,
  AlertTriangle,
  Building,
  Check,
  ChevronDown,
  Info,
  Sliders,
  Send,
  ExternalLink,
  Lock,
  Search,
} from "lucide-react";

export default function TaxOfficerDashboardPage() {
  const router = useRouter();

  // Sub-city compliance progress
  const subCityProgress = [
    {
      name: "Bole Sub-City (Commercial & High-Value Residential)",
      collected: 164.2,
      target: 185.0,
      percentage: "88.7%",
    },
    {
      name: "Yeka Sub-City",
      collected: 82.5,
      target: 102.0,
      percentage: "80.8%",
    },
    {
      name: "Kirkos Sub-City (Financial District & Kazanchis)",
      collected: 76.8,
      target: 90.0,
      percentage: "85.3%",
    },
    {
      name: "Arada Sub-City (Piazza & Traditional Commercial)",
      collected: 41.2,
      target: 65.0,
      percentage: "63.3%",
    },
    {
      name: "Lideta Sub-City",
      collected: 29.4,
      target: 42.0,
      percentage: "70.0%",
    },
  ];

  // Progressive Tax Bracket Data (Amendment Proclamation No. 1395/2017 E.C.)
  const taxBrackets = [
    { range: "0 - 24,000 ETB", rate: "EXEMPT (0%)", count: "2,840 landlords", color: "bg-slate-400" },
    { range: "24,001 - 48,000 ETB", rate: "15% BRACKET", count: "3,120 landlords", color: "bg-emerald-400" },
    { range: "48,001 - 84,000 ETB", rate: "20% BRACKET", count: "3,890 landlords", color: "bg-emerald-500" },
    { range: "84,001 - 120,000 ETB", rate: "25% BRACKET", count: "2,450 landlords", color: "bg-emerald-600" },
    { range: "120,001 - 168,000 ETB", rate: "30% BRACKET", count: "1,670 landlords", color: "bg-emerald-700" },
    { range: "> 168,000 ETB/yr", rate: "35% MAXIMUM", count: "1,280 landlords", color: "bg-[#00450d]" },
  ];

  // Discrepancy Queue Items (exact match to Image 1)
  const [discrepancyQueue, setDiscrepancyQueue] = useState([
    {
      id: "disc-1",
      name: "Alemayehu Tadesse Commercial Properties",
      subDetails: "Bole Medhanealem Mall Complex #4",
      tin: "0048192841",
      location: "Bole, Woreda 03",
      category: "Under-declared rental value",
      declaredValue: "85,000 ETB/mo filed",
      gramsBenchmark: "240,000 ETB/mo GRAMS lease",
      taxGap: "651,000 ETB",
      status: "action_needed"
    },
    {
      id: "disc-2",
      name: "Sara Hailu Real Estate Holdings",
      subDetails: "Kazanchis Commercial Center Bldg B",
      tin: "0019483921",
      location: "Kirkos, Woreda 08",
      category: "Unregistered tenant sublease",
      declaredValue: "4 Leases reported",
      gramsBenchmark: "9 Active Subleases identified",
      taxGap: "418,200 ETB",
      status: "action_needed"
    },
    {
      id: "disc-3",
      name: "Yonas Kebede & Partners",
      subDetails: "Hayahulet Multi-tenant Warehouse 12",
      tin: "0092837411",
      location: "Yeka, Woreda 11",
      category: "Under-declared rental value",
      declaredValue: "40,000 ETB/mo filed",
      gramsBenchmark: "135,000 ETB/mo Bank proof",
      taxGap: "399,000 ETB",
      status: "action_needed"
    },
    {
      id: "disc-4",
      name: "Mesfin Wolde Giorgis",
      subDetails: "Piazza Heritage Commercial Villa",
      tin: "[INVALID TIN]",
      location: "Arada, Woreda 02",
      category: "Missing TIN verification",
      declaredValue: "Direct Cash Receipt",
      gramsBenchmark: "No digital TIN linked",
      taxGap: "210,000 ETB",
      status: "action_needed"
    },
    {
      id: "disc-5",
      name: "Bethel Multi-Service Complex Ltd",
      subDetails: "Lideta Condominium Commercial Strip 04",
      tin: "0073619283",
      location: "Lideta, Woreda 05",
      category: "Under-declared rental value",
      declaredValue: "18,000 ETB/mo filed",
      gramsBenchmark: "55,000 ETB/mo Sub-city audit",
      taxGap: "155,400 ETB",
      status: "action_needed"
    },
  ]);

  const [filterType, setFilterType] = useState("all");
  const [filterWoreda, setFilterWoreda] = useState("all");
  const [batchActionNotice, setBatchActionNotice] = useState<string | null>(null);

  const handleIssueBatchDemand = () => {
    setBatchActionNotice("Batch statutory tax demand letters queued for 642 non-compliant accounts.");
    setTimeout(() => setBatchActionNotice(null), 4000);
  };

  const handleReconcile = () => {
    setBatchActionNotice("Initiating live inter-agency ledger reconciliation with GRAMS & CBE Bank Feeds...");
    setTimeout(() => setBatchActionNotice("Fiscal reconciliation verified. 4 new discrepancies identified."), 2000);
  };

  return (
    <TaxOfficerLayout activeNav="tax-dashboard">
      <div className="space-y-6">
        {batchActionNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-[#00450d] rounded-lg text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{batchActionNotice}</span>
            </div>
            <button onClick={() => setBatchActionNotice(null)} className="text-slate-500 hover:text-slate-800">
              Dismiss
            </button>
          </div>
        )}

        {/* TOP BANNER & ACTION HEADER (Exact Match to Image 1) */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-slate-600" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  Fiscal Year 2016 E.C. (2023/2024 G.C.) - Quarter 4 Assessment Cycle
                </h1>
                <span className="px-2 py-0.5 bg-[#00450d] text-white text-[11px] font-bold rounded">
                  Statutory Window Open
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ethiopian Ministry of Revenues • Schedule 'B' Proclamation No. 979/2016 Enforcement • Reconciled with Government Real Estate Asset Management System (GRAMS)
              </p>
            </div>
          </div>

          {/* Action Button Group */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleIssueBatchDemand}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#00450d] hover:bg-[#073c10] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Issue Batch Tax Demands</span>
            </button>
            <button
              onClick={handleReconcile}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg shadow-2xs transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Run Fiscal Reconciliation</span>
            </button>
            <button
              onClick={() => router.push("/officer/taxOfficer/dashboard/reports")}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg shadow-2xs transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Ministry Summary</span>
            </button>
          </div>
        </div>

        {/* 4 SUMMARY STAT CARDS (Image 1) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: TOTAL ASSESSED TAX */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="uppercase tracking-wider text-[11px] font-bold text-slate-600">
                Total Assessed Tax
              </span>
              <span className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                ↑ +14.2% YoY
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 tracking-tight">482.6M</span>
              <span className="text-xs font-bold text-slate-500">ETB</span>
            </div>
            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between">
              <span>Assessment target: 510.0M ETB (94.6% paced)</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-700">
              Gross Contract Value <span className="font-bold text-slate-900">1.62B ETB</span>
            </div>
          </div>

          {/* Card 2: COLLECTED TO DATE */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="uppercase tracking-wider text-[11px] font-bold text-slate-600">
                Collected to Date
              </span>
              <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                81.6% Rate
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 tracking-tight">394.1M</span>
              <span className="text-xs font-bold text-slate-500">ETB</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-[#00450d] h-2 rounded-full" style={{ width: "81.6%" }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Treasury Inflow Q4</span>
              <span className="font-bold text-emerald-800">+62.4M ETB this month</span>
            </div>
          </div>

          {/* Card 3: ACTIVE LANDLORDS */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="uppercase tracking-wider text-[11px] font-bold text-slate-600">
                Active Landlords
              </span>
              <Building className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              14,820
            </div>
            <div className="text-[11px] text-slate-500">
              Registered properties: 22,410 units
            </div>
            <div className="text-[11px] text-slate-600 font-medium pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>Coverage</span>
              <span className="font-bold text-slate-900">11 Sub-Cities • 118 Woredas</span>
            </div>
          </div>

          {/* Card 4: FLAGGED & DISCREPANT */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="uppercase tracking-wider text-[11px] font-bold text-red-600">
                Flagged & Discrepant
              </span>
              <span className="text-[10px] font-extrabold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                URGENT AUDIT
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-red-600 tracking-tight">642</span>
              <span className="text-xs text-slate-600 font-semibold">Accounts</span>
            </div>
            <div className="text-[11px] text-red-600 font-semibold">
              28.4M ETB estimated revenue gap
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span>Audit Queue Resolution</span>
              <span className="font-bold text-slate-900">34 Cases Closed Today</span>
            </div>
          </div>
        </div>

        {/* TWO-COLUMN ANALYTICS SECTION (Image 1) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Compliance & Revenue Collection by Sub-City */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Compliance & Revenue Collection by Sub-City
                </h3>
                <p className="text-xs text-slate-500">
                  Target vs. Realized Assessment for Key Addis Ababa Sub-Cities (FY 2016 E.C.)
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-[#00450d] rounded-2xs" />
                  <span className="text-slate-600 font-medium">Collected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-slate-200 rounded-2xs" />
                  <span className="text-slate-600 font-medium">Remaining Target</span>
                </div>
              </div>
            </div>

            {/* Sub-city Bar Rows */}
            <div className="space-y-3.5 pt-2">
              {subCityProgress.map((item, idx) => {
                const pct = (item.collected / item.target) * 100;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800">{item.name}</span>
                      <span className="text-slate-900 font-bold">
                        {item.collected}M / {item.target}M ETB{" "}
                        <span className="text-slate-500 font-normal">({item.percentage})</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                      <div
                        className="bg-[#00450d] h-2.5 rounded-l-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                      <div
                        className="bg-slate-200 h-2.5 rounded-r-full"
                        style={{ width: `${100 - pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom summary indicator */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Cumulative regional efficiency index</span>
              <span className="font-bold text-emerald-900">
                Grade A- (Standard Compliance Level)
              </span>
            </div>
          </div>

          {/* Right Column (5 cols): Schedule 'B' Bracket Distribution */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Schedule 'B' Bracket Distribution
                </h3>
                <p className="text-xs text-slate-500">
                  Proclamation 979/2016 Progressive Tax Scale
                </p>
              </div>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>

            {/* Brackets List */}
            <div className="space-y-2.5 pt-1">
              {taxBrackets.map((bracket, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded-md hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${bracket.color}`} />
                    <span className="font-medium text-slate-800">{bracket.range}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {bracket.rate}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {bracket.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Maximum bracket accounts for 44.2% of assessed Schedule 'B' revenue.</span>
              <button
                onClick={() => router.push("/officer/taxOfficer/dashboard/assessments")}
                className="text-[#00450d] hover:underline font-bold text-xs flex items-center gap-1 shrink-0"
              >
                <span>Scale Rules</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* PRIORITY ACTION QUEUE & DISCREPANCY ALERTS (Image 1) */}
        <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
          {/* Header & Filter Controls */}
          <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Priority Action Queue & Discrepancy Alerts
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                  GRAMS System Cross-Check
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Discrepancies identified between registered tenancy leases in the City Land Bank/GRAMS portal and filed Schedule 'B' tax returns.
              </p>
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="all">All Discrepancy Types</option>
                <option value="under_declared">Under-declared rental value</option>
                <option value="unregistered_sublease">Unregistered subleases</option>
                <option value="missing_tin">Missing TIN verification</option>
              </select>

              <select
                value={filterWoreda}
                onChange={(e) => setFilterWoreda(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="all">All Woredas</option>
                <option value="bole">Bole (All)</option>
                <option value="kirkos">Kirkos (All)</option>
                <option value="yeka">Yeka (All)</option>
                <option value="arada">Arada (All)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/90 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Landlord Legal Entity / Name</th>
                  <th className="py-3 px-4">TIN</th>
                  <th className="py-3 px-4">Sub-City & Woreda</th>
                  <th className="py-3 px-4">Discrepancy Category</th>
                  <th className="py-3 px-4">Declared vs. GRAMS Benchmark</th>
                  <th className="py-3 px-4">Estimated Tax Gap</th>
                  <th className="py-3 px-4 text-right">Enforcement Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {discrepancyQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Entity Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900">{item.name}</div>
                          <div className="text-[11px] text-slate-500">{item.subDetails}</div>
                        </div>
                      </div>
                    </td>

                    {/* TIN */}
                    <td className="py-3 px-4">
                      <span
                        className={`font-mono text-[11px] ${
                          item.tin.includes("INVALID")
                            ? "text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded"
                            : "text-slate-700"
                        }`}
                      >
                        {item.tin}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {item.location}
                    </td>

                    {/* Discrepancy Category Tag */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[10px] font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{item.category}</span>
                      </span>
                    </td>

                    {/* Declared vs Benchmark */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{item.declaredValue}</div>
                      <div className="text-[11px] text-red-600 font-medium">{item.gramsBenchmark}</div>
                    </td>

                    {/* Tax Gap */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-red-600 font-mono">
                        {item.taxGap}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => router.push("/officer/taxOfficer/dashboard/assessments")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#00450d] hover:bg-[#06380e] text-white rounded-md text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                      >
                        <Search className="w-3 h-3" />
                        <span>Audit File</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing <span className="font-bold text-slate-900">1 - 5</span> of{" "}
              <span className="font-bold text-slate-900">642</span> discrepant tax files across Addis Ababa jurisdictions
            </div>
            <div className="flex items-center gap-1">
              <button className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded text-xs font-medium cursor-not-allowed">
                Previous
              </button>
              <button className="px-2.5 py-1 bg-[#00450d] text-white rounded text-xs font-bold">
                1
              </button>
              <button className="px-2.5 py-1 hover:bg-slate-100 text-slate-700 rounded text-xs font-medium">
                2
              </button>
              <button className="px-2.5 py-1 hover:bg-slate-100 text-slate-700 rounded text-xs font-medium">
                3
              </button>
              <span className="px-1 text-slate-400">...</span>
              <button className="px-2.5 py-1 hover:bg-slate-100 text-slate-700 rounded text-xs font-medium">
                129
              </button>
              <button className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM STATUTORY NOTE CARDS (Image 1) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-[#00450d] font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Statutory Reference</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Federal Tax Administration Proclamation No. 979/2016 Article 15 (Schedule 'B' Rental Income). Deductions limited to 50% for maintenance if books of accounts are not officially maintained.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-4 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-[#00450d] font-bold text-xs">
              <RefreshCw className="w-4 h-4" />
              <span>GRAMS Cross-Index Sync</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Last automated synchronisation completed at <span className="font-bold text-slate-800">04:30 AM EAT</span>. 3,812 lease contracts validated against commercial registry title deeds.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-4 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-[#00450d] font-bold text-xs">
              <Lock className="w-4 h-4" />
              <span>Assessor Integrity Seal</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              All enforcement notices and tax demand assessments are encrypted under Ethiopian Federal Revenue e-Tax standard RFC-822 with immutable audit trail.
            </p>
          </div>
        </div>
      </div>
    </TaxOfficerLayout>
  );
}
