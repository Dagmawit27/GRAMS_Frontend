"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TaxOfficerLayout } from "../layout-tax";
import {
  User,
  ShieldCheck,
  FileCheck2,
  Download,
  CheckCircle2,
  Clock,
  Building,
  AlertTriangle,
  ArrowRight,
  Plus,
  Eye,
  FileText,
  Calendar,
  AlertCircle,
  HelpCircle,
  Search,
  Check,
  Send,
  Printer,
  ChevronRight,
  ChevronDown
} from "lucide-react";

export default function TaxAssessmentsPage() {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [attestationChecked, setAttestationChecked] = useState(true);
  const [selectedLeaseDetail, setSelectedLeaseDetail] = useState<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const registeredLeases = [
    {
      id: "lease-1",
      propertyCode: "Bole Atlas Unit 4B",
      gramsId: "GRAMS-2023-8812",
      tenantName: "Dagmawit Mesfin",
      tenantTin: "TIN: 0092817263",
      category: "Residential",
      monthlyRent: "25,000 ETB",
      annualGross: "300,000 ETB",
      bankingMatch: "12/12 CBE Deposits",
      bankingVerified: true
    },
    {
      id: "lease-2",
      propertyCode: "Bole Atlas Retail Unit 1",
      gramsId: "GRAMS-2022-4109",
      tenantName: "Abebe Kebede (Pharma)",
      tenantTin: "TIN: 0019203941",
      category: "Commercial",
      monthlyRent: "30,000 ETB",
      annualGross: "360,000 ETB",
      bankingMatch: "Withholding Remitted",
      bankingVerified: true
    },
    {
      id: "lease-3",
      propertyCode: "Bole Atlas Unit 2A (Storage)",
      gramsId: "GRAMS-2024-0193",
      tenantName: "Selamawit Bekele",
      tenantTin: "TIN: 0077281944",
      category: "Commercial Storage",
      monthlyRent: "5,000 ETB",
      annualGross: "60,000 ETB",
      bankingMatch: "Telebirr Verified",
      bankingVerified: true
    }
  ];

  return (
    <TaxOfficerLayout activeNav="tax-assessments">
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

        {/* BREADCRUMB / SESSION BAR (Image 3) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200 gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link href="/officer/taxOfficer/dashboard/ledger" className="hover:text-slate-800">
              Tax Ledger
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="hover:text-slate-800">Landlord Profiles</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-900">
              Kibrom Tadesse (TIN: 0048291048)
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Secure Audit Session #9812-EC</span>
            </div>
            <span className="text-slate-300">|</span>
            <div>Last Synchronized: Today, 11:24 EAT</div>
          </div>
        </div>

        {/* LANDLORD PROFILE HEADER CARD (Image 3) */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Left: Avatar & Identity details */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                <User className="w-7 h-7 text-slate-600" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                    Kibrom Tadesse Woldemariam
                  </h1>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Active Taxpayer
                  </span>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold rounded flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    Tax Clearance: Pending Clearance 2016 E.C.
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600 pt-1">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Tax Identification (TIN)
                    </div>
                    <div className="font-mono font-bold text-slate-900">
                      0048291048
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      National ID (Fayda)
                    </div>
                    <div className="font-mono font-bold text-slate-900">
                      ET-982-441
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Jurisdiction / Location
                    </div>
                    <div className="font-semibold text-slate-900">
                      Sub-city: Bole | Woreda: 03
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Registered Phone
                    </div>
                    <div className="font-mono font-semibold text-slate-900">
                      +251 91 142 8893
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Assigned Tax Officer Box */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs min-w-[240px] space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                <span>Assigned Tax Officer</span>
                <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded font-mono">
                  BRANCH 01
                </span>
              </div>
              <div className="font-bold text-slate-900">
                Alemayehu G. (ID: 0402)
              </div>
              <div className="text-slate-500 text-[11px]">
                Bole Sub-City Revenue Office
              </div>
              <div className="pt-1 text-[11px] flex items-center justify-between border-t border-slate-200">
                <span className="text-slate-500">Audit Status:</span>
                <span className="font-semibold text-[#00450d]">In Assessment</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6 SCHEDULE 'B' METRIC CARDS (Image 3) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Card 1: GROSS ANNUAL RENT */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Gross Annual Rent
            </div>
            <div className="text-[11px] text-slate-500">
              Across 3 active leases
            </div>
            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-xl font-black text-slate-900">720,000</span>
              <span className="text-[11px] font-bold text-slate-500">ETB</span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between">
              <span>Monthly Avg:</span>
              <span className="font-bold text-slate-700">60,000 ETB</span>
            </div>
          </div>

          {/* Card 2: ALLOWABLE DEDUCTIONS */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Allowable Deductions
            </div>
            <div className="text-[11px] text-slate-500">
              50% Statutory (No Books)
            </div>
            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-xl font-black text-slate-900">360,000</span>
              <span className="text-[11px] font-bold text-slate-500">ETB</span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between">
              <span>Proclamation No. 979/2016</span>
              <span className="font-semibold text-slate-700">Art. 15(2)</span>
            </div>
          </div>

          {/* Card 3: NET TAXABLE INCOME */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Net Taxable Income
            </div>
            <div className="text-[11px] text-slate-500">
              Schedule 'B' Base
            </div>
            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-xl font-black text-slate-900">360,000</span>
              <span className="text-[11px] font-bold text-slate-500">ETB</span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between">
              <span>Assessment Basis:</span>
              <span className="font-bold text-emerald-800">100% Taxable</span>
            </div>
          </div>

          {/* Card 4: SCHEDULE 'B' LIABILITY */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Schedule 'B' Liability
            </div>
            <div className="text-[11px] text-slate-500">
              Progressive Rate Scale
            </div>
            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-xl font-black text-[#00450d]">99,750</span>
              <span className="text-[11px] font-bold text-slate-500">ETB</span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between">
              <span>Effective Rate:</span>
              <span className="font-bold text-slate-900">27.7% Net</span>
            </div>
          </div>

          {/* Card 5: WITHHOLDING REMITTED */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Withholding Remitted
            </div>
            <div className="text-[11px] text-slate-500">
              Institutional Tenants
            </div>
            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-xl font-black text-blue-700">45,000</span>
              <span className="text-[11px] font-bold text-slate-500">ETB</span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between">
              <span>Receipts Verified:</span>
              <span className="font-bold text-blue-900">2 Receipts</span>
            </div>
          </div>

          {/* Card 6: NET BALANCE DUE */}
          <div className="bg-white border-2 border-red-200/80 rounded-xl p-3.5 shadow-2xs space-y-1 bg-red-50/10">
            <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
              Net Balance Due
            </div>
            <div className="text-[11px] text-slate-500">
              Immediate Payable
            </div>
            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-xl font-black text-slate-900">54,750</span>
              <span className="text-[11px] font-bold text-slate-500">ETB</span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between">
              <span>Due by Nehasie 30</span>
              <span className="font-bold text-red-600">Unpaid</span>
            </div>
          </div>
        </div>

        {/* 2-COLUMN MAIN BODY: Registered Leases (Left) & Actions/Notes (Right) (Image 3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Registered Leases & Rental Agreements (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-emerald-800" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Registered Leases & Rental Agreements (GRAMS System)
                    </h3>
                    <div className="text-xs text-slate-500">3 Leases Registered</div>
                  </div>
                </div>

                <button
                  onClick={() => showToast("Linking additional registered lease from Addis Ababa Cadastre...")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-xs font-semibold shadow-2xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Link New Lease</span>
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200/90 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Property / Unit Code</th>
                      <th className="py-3 px-4">Tenant Name & TIN</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Monthly Rent</th>
                      <th className="py-3 px-4">Annual Gross</th>
                      <th className="py-3 px-4">Banking Match</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {registeredLeases.map((lease) => (
                      <tr key={lease.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Property / Unit Code */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">
                            {lease.propertyCode}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {lease.gramsId}
                          </div>
                        </td>

                        {/* Tenant Name & TIN */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">
                            {lease.tenantName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {lease.tenantTin}
                          </div>
                        </td>

                        {/* Category Tag */}
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold">
                            {lease.category}
                          </span>
                        </td>

                        {/* Monthly Rent */}
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                          {lease.monthlyRent}
                        </td>

                        {/* Annual Gross */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {lease.annualGross}
                        </td>

                        {/* Banking Match Verification */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{lease.bankingMatch}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedLeaseDetail(lease)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                            title="Inspect Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Aggregated Summary Bar (Image 3) */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="uppercase tracking-wider text-[11px] text-slate-500">
                  Aggregate Gross Annual Declared:
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-base text-slate-900 font-black font-mono">
                    720,000 ETB
                  </span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    All 3 Contracts Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Official Actions & Officer Notes (4 cols) (Image 3) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Box 1: Official Actions & Issuance */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Official Actions & Issuance
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Execute statutory notices or issue formal revenue documents for Fiscal Year 2016 E.C.
              </p>

              <div className="space-y-2">
                {/* 1. Issue Official Notice of Assessment */}
                <button
                  onClick={() => showToast("Official Notice of Assessment issued & dispatched to taxpayer via SMS/Post.")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0a481e] hover:bg-[#073917] text-white rounded-lg font-bold text-xs shadow-sm transition-all"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Issue Official Notice of Assessment</span>
                </button>

                {/* 2. Generate Tax Clearance (PDF) */}
                <button
                  onClick={() => showToast("Tax Clearance Certificate (Form TC-16) compiled with QR Security Code.")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-lg font-semibold text-xs shadow-2xs transition-all"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>Generate Tax Clearance (PDF)</span>
                </button>

                {/* 3. Request Woreda Field Inspection */}
                <button
                  onClick={() => showToast("Woreda field inspection task dispatched to Woreda 03 Compliance Officers.")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-lg font-semibold text-xs shadow-2xs transition-all"
                >
                  <Search className="w-4 h-4 text-slate-600" />
                  <span>Request Woreda Field Inspection</span>
                </button>

                {/* 4. Apply Delinquency Penalty */}
                <button
                  onClick={() => showToast("Statutory 10% late-filing penalty & interest added to account ledger.")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Apply Delinquency Penalty</span>
                </button>
              </div>

              {/* Statutory Attestation Checkbox */}
              <div className="pt-3 border-t border-slate-100">
                <label className="flex items-start gap-2 text-[11px] text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attestationChecked}
                    onChange={(e) => setAttestationChecked(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#00450d] focus:ring-emerald-600"
                  />
                  <span>
                    I attest that this Schedule 'B' determination conforms with Art. 15 of Proclamation 979/2016 and supporting banking evidence.
                  </span>
                </label>
              </div>
            </div>

            {/* Box 2: Officer Notes & Log (Image 3) */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-700" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Officer Notes & Log
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">4 Entries</span>
              </div>

              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Add Case Memorandum
              </div>

              <div className="space-y-2">
                <textarea
                  rows={2}
                  placeholder="Enter administrative memo or verification remark..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => showToast("Memorandum appended to audit history.")}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-semibold shadow-2xs"
                  >
                    Save Memo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TaxOfficerLayout>
  );
}
