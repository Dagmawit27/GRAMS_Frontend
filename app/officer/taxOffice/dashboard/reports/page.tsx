"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TaxOfficerLayout } from "../layout-tax";
import {
  FileText,
  Download,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Share2,
  Eye,
  Search,
  Filter,
  ShieldCheck,
  Building,
  QrCode,
  FileCheck2,
  Briefcase,
  AlertTriangle,
  ChevronDown,
  Info
} from "lucide-react";

export default function TaxReportsPage() {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [fiscalPeriod, setFiscalPeriod] = useState("2016 E.C. (Current Tax Year)");
  const [subCityScope, setSubCityScope] = useState("All Addis Ababa (11 Sub-Cities)");
  const [taxCategory, setTaxCategory] = useState("Schedule 'B' Rental Income");
  const [complianceStandard, setComplianceStandard] = useState("Form MOR-SCHB-2016");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Monthly collection trajectory (Ethiopian Calendar months)
  // Mes, Tik, Hid, Tah, Tir, Yak, Meg, Mia, Gin, Sen (peak), Ham, Neh
  const monthlyData = [
    { month: "Mes", actual: 28, target: 35 },
    { month: "Tik", actual: 32, target: 35 },
    { month: "Hid", actual: 39, target: 40 },
    { month: "Tah", actual: 44, target: 42 },
    { month: "Tir", actual: 36, target: 40 },
    { month: "Yak", actual: 42, target: 42 },
    { month: "Meg", actual: 48, target: 45 },
    { month: "Mia", actual: 45, target: 45 },
    { month: "Gin", actual: 49, target: 50 },
    { month: "Sen", actual: 58.2, target: 52, isPeak: true },
    { month: "Ham", actual: 39, target: 40 },
    { month: "Neh", actual: 22, target: 30 },
  ];

  // Recent generated reports table items (Image 4)
  const recentReports = [
    {
      id: "rep-1",
      title: "Schedule B Bole Sub-City Annual Consolidated Roll",
      ref: "REF: FDRE-MOR-2016-BL-0089",
      generatedDate: "28 Sene 2016 (05 Jul 2024)",
      generatedTime: "14:32 EAT",
      officer: "Dawit M.",
      officerTitle: "SR. TAX ASSESSOR #409",
      jurisdiction: "Bole Woredas 01-14",
      size: "4.8 MB (PDF/A)",
      status: "QR VALID"
    },
    {
      id: "rep-2",
      title: "Kirkos Commercial Leases Default & Penalty Gazetted Notice",
      ref: "REF: FDRE-MOR-2016-DEF-104",
      generatedDate: "26 Sene 2016 (03 Jul 2024)",
      generatedTime: "10:15 EAT",
      officer: "Dawit M.",
      officerTitle: "SR. TAX ASSESSOR #409",
      jurisdiction: "Kirkos Sub-City",
      size: "2.1 MB (PDF)",
      status: "QR VALID",
      isWarning: true
    },
    {
      id: "rep-3",
      title: "Cadastre vs TIN Cross-Audit Registry (Addis Ababa Urban Core)",
      ref: "REF: FDRE-XAUD-2016-CAD-77",
      generatedDate: "22 Sene 2016 (29 Jun 2024)",
      generatedTime: "16:45 EAT",
      officer: "Dawit M.",
      officerTitle: "SR. TAX ASSESSOR #409",
      jurisdiction: "City-Wide (11 Sub-Cities)",
      size: "18.6 MB (ZIP)",
      status: "QR VALID"
    },
    {
      id: "rep-4",
      title: "Woreda Stamp Duty Remittance Clearance Schedule (Yeka)",
      ref: "REF: FDRE-STAMP-2016-YK-412",
      generatedDate: "19 Sene 2016 (26 Jun 2024)",
      generatedTime: "09:20 EAT",
      officer: "Dawit M.",
      officerTitle: "SR. TAX ASSESSOR #409",
      jurisdiction: "Yeka Woredas 01-13",
      size: "1.4 MB (XLSX)",
      status: "QR VALID"
    }
  ];

  return (
    <TaxOfficerLayout activeNav="tax-reports">
      <div className="space-y-6">
        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-[#00450d] rounded-lg text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-slate-500 hover:text-slate-800">
              Dismiss
            </button>
          </div>
        )}

        {/* HERO TITLE & EXPORT BUTTONS (Image 4) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-[#00450d] text-[10px] font-bold rounded">
                OFFICIAL REVENUE DOCUMENT
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Compliance Standard: MOR-DIR-2016-B
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Official Revenue & Compliance Reporting
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl">
              Rental Income Tax (Schedule 'B') municipal yield, woreda remittances, and inter-agency cross-audit registry.
            </p>
          </div>

          {/* Action Export Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => showToast("Compiling Official Ministry PDF Report (FDRE Ministry of Revenues)...")}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#00450d] hover:bg-[#063b0e] text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Official Ministry PDF</span>
            </button>

            <button
              onClick={() => showToast("Preparing Central Audit Package archive (ZIP, 48.2 MB)...")}
              className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-lg text-xs font-semibold shadow-2xs transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download Central Audit Package (ZIP)</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-lg text-xs font-semibold shadow-2xs transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Gazetted</span>
            </button>
          </div>
        </div>

        {/* REPORT QUERY & PARAMETER SCOPE CARD (Image 4) */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Report Query & Parameter Scope</span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Parameters Lock On Generation
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Fiscal Period
              </label>
              <select
                value={fiscalPeriod}
                onChange={(e) => setFiscalPeriod(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option>2016 E.C. (Current Tax Year)</option>
                <option>2015 E.C. (Prior Fiscal Year)</option>
                <option>2014 E.C. (Historical Audit)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Sub-City / Woreda Scope
              </label>
              <select
                value={subCityScope}
                onChange={(e) => setSubCityScope(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option>All Addis Ababa (11 Sub-Cities)</option>
                <option>Bole Sub-City (Commercial Cluster)</option>
                <option>Kirkos Sub-City (Central Business)</option>
                <option>Yeka Sub-City</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Tax Category
              </label>
              <select
                value={taxCategory}
                onChange={(e) => setTaxCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option>Schedule 'B' Rental Income</option>
                <option>Commercial Property Surcharge</option>
                <option>Stamp Duty on Leases</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Output Compliance Standard
              </label>
              <select
                value={complianceStandard}
                onChange={(e) => setComplianceStandard(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option>Form MOR-SCHB-2016</option>
                <option>FDRE Audit Protocol 4.1</option>
                <option>Woreda Remittance Summary v2</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4 SUMMARY STAT CARDS (Image 4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: RENTAL TAX YIELD */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="uppercase tracking-wider text-[10px] font-bold text-slate-600">
                Rental Tax Yield (Schedule B)
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                92% of Target
              </span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-black text-slate-900">394.1M</span>
              <span className="text-xs font-bold text-slate-500">ETB</span>
            </div>
            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              Goal: 428.0M ETB • Remaining: 33.9M ETB
            </div>
          </div>

          {/* Card 2: YEAR-OVER-YEAR GROWTH */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="uppercase tracking-wider text-[10px] font-bold text-slate-600">
                Year-Over-Year Growth
              </span>
              <span className="text-[11px] font-bold text-emerald-800">
                ↗ +18.4%
              </span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-black text-slate-900">+61.2M</span>
              <span className="text-xs font-bold text-slate-500">ETB vs 2015 E.C.</span>
            </div>
            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              Highest acceleration in commercial lease declaration formalization.
            </div>
          </div>

          {/* Card 3: AVERAGE EFFECTIVE TAX RATE */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="uppercase tracking-wider text-[10px] font-bold text-slate-600">
                Average Effective Tax Rate
              </span>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                Statutory Bracket
              </span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-black text-slate-900">21.3%</span>
              <span className="text-xs text-slate-500 font-medium">Gross Yield / Declared</span>
            </div>
            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              Standard progressive tax scale applied (10% min to 35% ceiling).
            </div>
          </div>

          {/* Card 4: DIGITAL RECEIPTS ISSUED */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="uppercase tracking-wider text-[10px] font-bold text-slate-600">
                Digital Receipts Issued
              </span>
              <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">
                Telebirr & CBE
              </span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-black text-slate-900">98,420</span>
              <span className="text-xs text-slate-500 font-medium">Receipts</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-medium pt-1 border-t border-slate-100 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>99.4% instant bank settlement parity</span>
            </div>
          </div>
        </div>

        {/* 2-COLUMN ANALYTICS: Monthly Trajectory (Left) & Sub-city / Category Split (Right) (Image 4) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Monthly Tax Collection Trajectory (Ethiopian Calendar) (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Monthly Tax Collection Trajectory (Ethiopian Calendar)
                </h3>
                <p className="text-xs text-slate-500">
                  2016 E.C. Fiscal Months (Meskerem through Nehase) in Millions ETB
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-[#00450d] rounded-2xs" />
                  <span className="text-slate-600">Actual</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-slate-300 rounded-2xs" />
                  <span className="text-slate-600">Target</span>
                </div>
              </div>
            </div>

            {/* Custom Bar Visualization matching Ethiopian Months from screenshot */}
            <div className="pt-4 pb-2">
              <div className="h-44 flex items-end justify-between gap-2 px-2 border-b border-slate-200">
                {monthlyData.map((d, idx) => {
                  const maxVal = 65;
                  const barHeightPct = (d.actual / maxVal) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {d.isPeak && (
                        <span className="text-[10px] font-bold text-slate-800 absolute -top-4 font-mono">
                          {d.actual}
                        </span>
                      )}
                      <div className="w-full flex items-end justify-center h-36">
                        <div
                          className={`w-full max-w-[20px] rounded-t-sm transition-all duration-300 ${
                            d.isPeak
                              ? "bg-[#00450d]"
                              : "bg-[#0b531f] hover:bg-[#073915]"
                          }`}
                          style={{ height: `${barHeightPct}%` }}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-semibold ${
                          d.isPeak ? "text-slate-900 font-bold" : "text-slate-500"
                        }`}
                      >
                        {d.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-600">
              <span className="text-slate-500">
                Primary filing spike observed in Sene (End of Ethiopian Fiscal Year reconciliation).
              </span>
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                Audited Compliance: 98.7%
              </span>
            </div>
          </div>

          {/* RIGHT: Sub-City Revenue Contribution & Category Ratio (5 cols) (Image 4) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Box 1: Sub-City Revenue Contribution */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Sub-City Revenue Contribution
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Addis Ababa
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between font-semibold text-slate-800 mb-1">
                    <span>Bole Sub-City</span>
                    <span className="font-bold">165.5M ETB (42%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-[#00450d] h-2 rounded-full" style={{ width: "42%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-800 mb-1">
                    <span>Kirkos Sub-City</span>
                    <span className="font-bold">82.7M ETB (21%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-[#00450d] h-2 rounded-full" style={{ width: "21%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-800 mb-1">
                    <span>Yeka Sub-City</span>
                    <span className="font-bold">63.0M ETB (16%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-[#00450d] h-2 rounded-full" style={{ width: "16%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-800 mb-1">
                    <span>Arada, Lideta, Nifas Silk & Others</span>
                    <span className="font-bold">82.9M ETB (21%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-[#00450d] h-2 rounded-full" style={{ width: "21%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Category Distribution Ratio (Image 4) */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Category Distribution Ratio
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Volume Split
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-950 text-white rounded-lg space-y-1">
                  <div className="text-[10px] uppercase font-bold text-emerald-300">
                    Commercial Units
                  </div>
                  <div className="text-xl font-black">68.4%</div>
                  <div className="text-[10px] text-slate-300">269.5M ETB</div>
                </div>

                <div className="p-3 bg-slate-100 text-slate-900 rounded-lg space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500">
                    Residential Leases
                  </div>
                  <div className="text-xl font-black">31.6%</div>
                  <div className="text-[10px] text-slate-600">124.6M ETB</div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Commercial properties account for 68.4% of declared values with 94.2% e-receipt adoption.
              </p>
            </div>
          </div>
        </div>

        {/* 4 STANDARD MINISTRY REPORT TEMPLATES (Image 4) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Standard Ministry Report Templates
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Pre-formatted Government Frameworks
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Template 1 */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                    FORM MOR-SCHB-2016
                  </span>
                  <FileText className="w-4 h-4 text-slate-400" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Schedule B Annual Municipal Rental Income Tax Summary
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Full statutory reconciliation of landlords, declared lease values, exemptions, and net collected revenue.
                </p>
              </div>
              <button
                onClick={() => showToast("Generating Schedule B Annual Municipal Summary...")}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Generate Template</span>
              </button>
            </div>

            {/* Template 2 */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded">
                    LEGAL ENFORCEMENT
                  </span>
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Delinquent Landlord Default Registry & Enforcement Roll
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Gazetted notice listing non-compliant properties, accrued interest penalties, and impending lease freeze orders.
                </p>
              </div>
              <button
                onClick={() => showToast("Generating Delinquent Default Registry...")}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Generate Template</span>
              </button>
            </div>

            {/* Template 3 */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                    MUDH & WOREDA
                  </span>
                  <Building className="w-4 h-4 text-slate-400" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Woreda Stamp Duty & Escrow Fee Remittance Reconciliation
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Cross-clearing report linking sub-city revenue accounts to local woreda administrative treasury disbursements.
                </p>
              </div>
              <button
                onClick={() => showToast("Generating Woreda Stamp Duty Reconciliation...")}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Generate Template</span>
              </button>
            </div>

            {/* Template 4 */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                    CADASTRE CAD-LINK
                  </span>
                  <Share2 className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Inter-Agency Cross-Audit (Land Registry vs. Revenue Authority)
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Identifies unregistered commercial leasehold titles by comparing municipal GIS mapping to declared TIN accounts.
                </p>
              </div>
              <button
                onClick={() => showToast("Generating Inter-Agency Cross-Audit Matrix...")}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Generate Template</span>
              </button>
            </div>
          </div>
        </div>

        {/* RECENT GENERATED OFFICIAL REPORTS & GAZETTED FILINGS TABLE (Image 4) */}
        <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Recent Generated Official Reports & Gazetted Filings
              </h3>
              <p className="text-xs text-slate-500">
                Ledger records cryptographically signed and stored on central government repositories.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Filter Status:</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded">
                All Certified
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/90 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Report Title / Document Reference</th>
                  <th className="py-3 px-4">Generated Date</th>
                  <th className="py-3 px-4">Officer in Charge</th>
                  <th className="py-3 px-4">Jurisdiction</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Digital Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentReports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${rep.isWarning ? "text-amber-600" : "text-[#00450d]"}`} />
                        <div>
                          <div className="font-bold text-slate-900">{rep.title}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{rep.ref}</div>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{rep.generatedDate}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{rep.generatedTime}</div>
                    </td>

                    {/* Officer */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{rep.officer}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{rep.officerTitle}</div>
                    </td>

                    {/* Jurisdiction */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold">
                        {rep.jurisdiction}
                      </span>
                    </td>

                    {/* Size */}
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {rep.size}
                    </td>

                    {/* Verification */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-bold text-[10px]">
                        <QrCode className="w-3 h-3 text-emerald-600" />
                        <span>{rep.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => showToast(`Downloading ${rep.title}...`)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => showToast(`Share link copied for ${rep.title}`)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                          title="Share"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => showToast(`Previewing ${rep.title} in government PDF viewer`)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>Showing 4 of 42 Gazetted Reports (Fiscal Year 2016 E.C.)</div>
            <div className="flex items-center gap-1">
              <button className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded text-xs font-medium cursor-not-allowed">
                Previous
              </button>
              <button className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM METADATA BAR (Image 4) */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00450d]" />
            <span>
              Federal Democratic Republic of Ethiopia Ministry of Revenues • Central Reporting Engine v4.12
            </span>
          </div>
          <div className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
            Confidential Internal Record • Woreda & Ministry Authorized Access Only
          </div>
        </div>
      </div>
    </TaxOfficerLayout>
  );
}
