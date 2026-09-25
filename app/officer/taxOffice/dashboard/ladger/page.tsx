"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TaxOfficerLayout } from "../layout-tax";
import {
  Search,
  Filter,
  Download,
  Send,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Building,
  RotateCcw,
  Check,
  ChevronDown,
  Layers,
  ArrowUpDown,
  FileSpreadsheet,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const TaxLedgerSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-100">
      {/* Header & KPI Summary Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-7 w-80" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex items-center gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-2xs space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <Skeleton className="h-9 w-72 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden p-4 space-y-3">
        {[1, 2, 3, 4, 5, 6].map((j) => (
          <div key={j} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};

interface LandlordRecord {
  id: string;
  initials: string;
  name: string;
  nationalId: string;
  tin: string;
  isTinVerified: boolean;
  propertiesCount: string;
  unitsDescription: string;
  grossRentalRevenue: string;
  grossRentalSource: string;
  assessedTax: string;
  taxRateNote: string;
  paidBalance: string;
  paidSubNote: string;
  complianceStatus: "Fully Paid" | "Overdue Notice #2" | "Discrepancy Flagged" | "Pending Review" | "Partially Paid (Inst 1/2)";
  complianceBadgeStyle: string;
  category: "all" | "compliant" | "pending" | "delinquent" | "audit";
}

const INITIAL_RECORDS: LandlordRecord[] = [
  {
    id: "rec-1",
    initials: "KT",
    name: "Kibrom Tadesse Wolde",
    nationalId: "NAT-ID: ET-AA-092-4819",
    tin: "0048291048",
    isTinVerified: true,
    propertiesCount: "3 Properties",
    unitsDescription: "12 Residential Units",
    grossRentalRevenue: "ETB 1,840,000.00",
    grossRentalSource: "Declared (GRAMS)",
    assessedTax: "ETB 524,000.00",
    taxRateNote: "Rate: 35% statutory",
    paidBalance: "ETB 524,000.00",
    paidSubNote: "Bal: ETB 0.00",
    complianceStatus: "Fully Paid",
    complianceBadgeStyle: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    category: "compliant"
  },
  {
    id: "rec-2",
    initials: "AA",
    name: "Aster Aweke Mengesha",
    nationalId: "NAT-ID: ET-AA-011-9302",
    tin: "0019284711",
    isTinVerified: true,
    propertiesCount: "1 Commercial Plaza",
    unitsDescription: "16 Office / Retail Units",
    grossRentalRevenue: "ETB 4,600,000.00",
    grossRentalSource: "Declared (GRAMS)",
    assessedTax: "ETB 1,490,000.00",
    taxRateNote: "Schedule 'B' Assessment",
    paidBalance: "ETB 0.00",
    paidSubNote: "Bal: ETB 1,490,000.00",
    complianceStatus: "Overdue Notice #2",
    complianceBadgeStyle: "bg-red-50 text-red-700 border border-red-200 font-bold",
    category: "delinquent"
  },
  {
    id: "rec-3",
    initials: "BT",
    name: "Bekele Tadesse Gebre",
    nationalId: "NAT-ID: ET-AA-045-8120",
    tin: "0084729103",
    isTinVerified: true,
    propertiesCount: "2 Properties",
    unitsDescription: "8 Mixed Units",
    grossRentalRevenue: "ETB 980,000.00",
    grossRentalSource: "Bank Record: 2.1M ETB",
    assessedTax: "ETB 265,000.00",
    taxRateNote: "Schedule 'B' (Understated)",
    paidBalance: "ETB 265,000.00",
    paidSubNote: "Discrepancy Under Investigation",
    complianceStatus: "Discrepancy Flagged",
    complianceBadgeStyle: "bg-amber-50 text-amber-800 border border-amber-200 font-bold",
    category: "audit"
  },
  {
    id: "rec-4",
    initials: "TH",
    name: "Tigist Haile Mariam",
    nationalId: "NAT-ID: ET-AA-073-5194",
    tin: "0091823740",
    isTinVerified: false,
    propertiesCount: "1 Property",
    unitsDescription: "4 Residential Units",
    grossRentalRevenue: "ETB 720,000.00",
    grossRentalSource: "Self-Reported Return",
    assessedTax: "ETB 186,000.00",
    taxRateNote: "Calculated Estimate",
    paidBalance: "ETB 0.00",
    paidSubNote: "Awaiting Voucher",
    complianceStatus: "Pending Review",
    complianceBadgeStyle: "bg-slate-100 text-slate-700 border border-slate-200",
    category: "pending"
  },
  {
    id: "rec-5",
    initials: "DY",
    name: "Dawit Yohannes Kassa",
    nationalId: "NAT-ID: ET-AA-033-9118",
    tin: "0032910482",
    isTinVerified: true,
    propertiesCount: "4 Properties",
    unitsDescription: "22 Commercial Units",
    grossRentalRevenue: "ETB 8,450,000.00",
    grossRentalSource: "Declared (GRAMS)",
    assessedTax: "ETB 2,820,000.00",
    taxRateNote: "Installment Plan Approved",
    paidBalance: "ETB 1,410,000.00",
    paidSubNote: "Rem: ETB 1,410,000.00",
    complianceStatus: "Partially Paid (Inst 1/2)",
    complianceBadgeStyle: "bg-emerald-50 text-emerald-900 border border-emerald-200",
    category: "compliant"
  },
];

export default function LandlordTaxLedgerPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "compliant" | "pending" | "delinquent" | "audit">("all");
  const [subCityFilter, setSubCityFilter] = useState("All Sub-Cities (Addis Ababa)");
  const [taxStatusFilter, setTaxStatusFilter] = useState("All Statuses");
  const [rentalCategoryFilter, setRentalCategoryFilter] = useState("All Categories");
  const [fiscalYearFilter, setFiscalYearFilter] = useState("2016 E.C. (Current Tax Year)");
  const [selectedIds, setSelectedIds] = useState<string[]>(["rec-1", "rec-2", "rec-3", "rec-4", "rec-5"]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredRecords = INITIAL_RECORDS.filter((rec) => {
    if (activeTab === "all") return true;
    return rec.category === activeTab;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map((r) => r.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [isReady, setIsReady] = useState(false);
  React.useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <TaxOfficerLayout activeNav="tax-landlord-ledger">
        <TaxLedgerSkeleton />
      </TaxOfficerLayout>
    );
  }

  return (
    <TaxOfficerLayout activeNav="tax-landlord-ledger">
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

        {/* BREADCRUMB & PAGE TITLE (Image 2) */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
              <span>Federal Tax Administration</span>
              <span>/</span>
              <span>Rental Properties</span>
              <span>/</span>
              <span className="text-[#00450d] font-extrabold">Schedule 'B' Compliance</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              Landlord Tax Assessment & Compliance Ledger
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
              Authorized administrative register of real property owners, reported rental valuations, statutory liabilities, and revenue reconciliation.
            </p>
          </div>

          {/* Top 3 KPI Badges (Image 2) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-2xs text-left">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Assessed Total
              </div>
              <div className="text-base font-black text-slate-900">
                ETB 412.8M
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-2xs text-left">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Collected (YTD)
              </div>
              <div className="text-base font-black text-emerald-800">
                ETB 348.2M
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-2xs text-left">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Delinquent Deficit
              </div>
              <div className="text-base font-black text-red-600">
                ETB 64.6M
              </div>
            </div>
          </div>
        </div>

        {/* TABS (Image 2: All Landlords 14,820 | Compliant/Paid 11,490 | Pending Assessment 1,840 | Delinquent 848 | Audit Discrepancies 642) */}
        <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "all"
                ? "border-[#00450d] text-[#00450d] font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>All Landlords</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px]">
              14,820
            </span>
          </button>

          <button
            onClick={() => setActiveTab("compliant")}
            className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "compliant"
                ? "border-[#00450d] text-[#00450d] font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Compliant / Paid</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px]">
              11,490
            </span>
          </button>

          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "pending"
                ? "border-[#00450d] text-[#00450d] font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Pending Assessment</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px]">
              1,840
            </span>
          </button>

          <button
            onClick={() => setActiveTab("delinquent")}
            className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "delinquent"
                ? "border-[#00450d] text-[#00450d] font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Delinquent</span>
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-bold">
              848
            </span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "audit"
                ? "border-[#00450d] text-[#00450d] font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Audit Discrepancies</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
              642
            </span>
          </button>
        </div>

        {/* FILTER TOOLBAR (Image 2) */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-1 min-w-[280px]">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Sub-City / Woreda
              </label>
              <select
                value={subCityFilter}
                onChange={(e) => setSubCityFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option>All Sub-Cities (Addis Ababa)</option>
                <option>Bole Sub-City</option>
                <option>Kirkos Sub-City</option>
                <option>Yeka Sub-City</option>
                <option>Arada Sub-City</option>
                <option>Lideta Sub-City</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Tax Status
              </label>
              <select
                value={taxStatusFilter}
                onChange={(e) => setTaxStatusFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option>All Statuses</option>
                <option>Compliant (Paid)</option>
                <option>Delinquent / Overdue</option>
                <option>Under Discrepancy Audit</option>
                <option>Pending Assessment</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Rental Category
              </label>
              <select
                value={rentalCategoryFilter}
                onChange={(e) => setRentalCategoryFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option>All Categories</option>
                <option>Residential Leases</option>
                <option>Commercial Plaza / Offices</option>
                <option>Mixed Use</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Fiscal Assessment Year
              </label>
              <select
                value={fiscalYearFilter}
                onChange={(e) => setFiscalYearFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option>2016 E.C. (Current Tax Year)</option>
                <option>2015 E.C. (Audited)</option>
                <option>2014 E.C. (Archived)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 sm:pt-0 self-end">
            <button
              onClick={() => showToast("Filters applied to Landlord Tax Ledger.")}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#00450d] hover:bg-[#07390e] text-white rounded-lg font-semibold text-xs transition-all shadow-2xs"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </button>
            <button
              onClick={() => {
                setSubCityFilter("All Sub-Cities (Addis Ababa)");
                setTaxStatusFilter("All Statuses");
                setRentalCategoryFilter("All Categories");
                setFiscalYearFilter("2016 E.C. (Current Tax Year)");
                showToast("Filters reset.");
              }}
              className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* LEDGER DATA TABLE (Image 2) */}
        <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/90 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredRecords.length && filteredRecords.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-[#00450d] focus:ring-emerald-600"
                    />
                  </th>
                  <th className="py-3 px-4">Landlord Name & National ID</th>
                  <th className="py-3 px-4">TIN & Verification</th>
                  <th className="py-3 px-4">Properties / Units</th>
                  <th className="py-3 px-4">Gross Rental Revenue</th>
                  <th className="py-3 px-4">Assessed Tax (Sched B)</th>
                  <th className="py-3 px-4">Paid & Balance</th>
                  <th className="py-3 px-4">Compliance Status</th>
                  <th className="py-3 px-4 text-right">Administrative</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((item) => {
                  const isChecked = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isChecked ? "bg-emerald-50/20" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(item.id)}
                          className="rounded border-slate-300 text-[#00450d] focus:ring-emerald-600"
                        />
                      </td>

                      {/* Landlord Name & NAT-ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                            {item.initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {item.nationalId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* TIN & Verification Badge */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="font-mono font-bold text-slate-800 text-[11px]">
                            {item.tin}
                          </div>
                          {item.isTinVerified ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>TIN Verified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[10px]">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>TIN Pending</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Properties / Units */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {item.propertiesCount}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.unitsDescription}
                        </div>
                      </td>

                      {/* Gross Rental Revenue */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 font-mono">
                          {item.grossRentalRevenue}
                        </div>
                        <div className={`text-[11px] font-medium ${item.grossRentalSource.includes("Bank") ? "text-red-600 font-bold" : "text-slate-500"}`}>
                          {item.grossRentalSource}
                        </div>
                      </td>

                      {/* Assessed Tax */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 font-mono">
                          {item.assessedTax}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.taxRateNote}
                        </div>
                      </td>

                      {/* Paid & Balance */}
                      <td className="py-3.5 px-4">
                        <div className={`font-bold font-mono ${item.paidBalance === "ETB 0.00" ? "text-red-600" : "text-slate-900"}`}>
                          {item.paidBalance}
                        </div>
                        <div
                          className={`text-[11px] font-semibold ${
                            item.paidSubNote.includes("Investigation")
                              ? "text-amber-700"
                              : item.paidSubNote.includes("Bal: ETB 0.00")
                              ? "text-emerald-700"
                              : "text-slate-500"
                          }`}
                        >
                          {item.paidSubNote}
                        </div>
                      </td>

                      {/* Compliance Status Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold ${item.complianceBadgeStyle}`}>
                          {item.complianceStatus}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => router.push("/officer/taxOfficer/dashboard/assessments")}
                            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-md text-xs font-semibold shadow-2xs transition-colors"
                          >
                            View Profile
                          </button>
                          {item.complianceStatus.includes("Notice") && (
                            <button
                              onClick={() => showToast(`Notice #2 re-sent to ${item.name}`)}
                              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold shadow-2xs transition-colors"
                            >
                              Notice #2
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* BATCH ACTIONS FOOTER (Image 2) */}
          <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Batch Actions:
              </span>
              <span className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-800 font-semibold text-[11px]">
                {selectedIds.length} landlords selected
              </span>
              <button
                onClick={toggleSelectAll}
                className="text-[#00450d] hover:underline font-bold text-xs"
              >
                Select All 14,820
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast("Exporting selected landlords as CSV/Excel...")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-md text-xs font-semibold transition-all shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV / Excel</span>
              </button>

              <button
                onClick={() => showToast(`Sent bulk SMS reminder to ${selectedIds.length} landlords via Telebirr gateway.`)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-md text-xs font-semibold transition-all shadow-2xs"
              >
                <Send className="w-3.5 h-3.5 text-slate-500" />
                <span>Send Bulk SMS Reminders</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00450d] hover:bg-[#07390e] text-white rounded-md text-xs font-bold transition-all shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Assessment Roll</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </TaxOfficerLayout>
  );
}
