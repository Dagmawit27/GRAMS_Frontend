"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Landmark,
  FileText,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Clock,
  Calendar,
  Download,
  Printer,
  ExternalLink,
  ArrowRight,
  X,
  Sparkles,
  Building,
  CreditCard,
  Receipt,
  FileCheck2,
  Info,
  RefreshCw,
  HelpCircle,
  AlertTriangle,
  Scale,
  Check,
  Layers,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getSession,
  getRentalTaxSummary,
  settleAnnualRentalTax,
  updateUserProfile,
  TaxSummaryResponse,
  AgreementTaxBreakdown,
  MonthlyTaxAccrual,
  TaxSettlementResponse,
} from "@/lib/api";

export const TaxPageSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-100">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center justify-between pb-1">
        <Skeleton className="h-5 w-72" />
        <Skeleton className="h-6 w-28 rounded-lg" />
      </div>

      {/* Hero Banner Skeleton */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-80" />
              <Skeleton className="h-4 w-96 max-w-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-44 rounded-xl" />
        </div>
      </div>

      {/* 4 Tax Metrics Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="w-8 h-8 rounded-xl" />
            </div>
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>

      {/* Tabs & Table Skeleton */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-clean overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-8 w-32 rounded-xl" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((j) => (
            <div key={j} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function TaxRecordPage() {
  const [loading, setLoading] = useState(true);
  const [taxSummary, setTaxSummary] = useState<TaxSummaryResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"agreements" | "monthly" | "schedule">("agreements");

  // Summer Tax Settlement Modal States
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [settlementMethod, setSettlementMethod] = useState("telebirr");
  const [payerPhone, setPayerPhone] = useState("");
  const [isSubmittingSettlement, setIsSubmittingSettlement] = useState(false);
  const [settlementSuccess, setSettlementSuccess] = useState<TaxSettlementResponse | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // TIN Registration / Update Modal States
  const [isTinModalOpen, setIsTinModalOpen] = useState(false);
  const [tinInput, setTinInput] = useState("");
  const [isSavingTin, setIsSavingTin] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveTin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tinInput || tinInput.trim().length < 8) {
      showToast("Please enter a valid 10-digit TIN number.");
      return;
    }
    const session = getSession();
    if (!session?.token) {
      showToast("Session expired. Please log in.");
      return;
    }
    setIsSavingTin(true);
    try {
      await updateUserProfile(session.token, { tinNumber: tinInput.trim() });
      showToast("✓ TIN successfully registered & linked to Schedule B rental tax!");
      setIsTinModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to update TIN.");
    } finally {
      setIsSavingTin(false);
    }
  };

  const loadData = async () => {
    const session = getSession();
    if (!session?.token) {
      setLoading(false);
      return;
    }

    setPayerPhone(session.user?.phoneNumber || "+251 92 884 1920");

    try {
      setLoading(true);
      const data = await getRentalTaxSummary(session.token);
      setTaxSummary(data);
    } catch (err: any) {
      console.error("Failed to load tax summary:", err);
      showToast("Failed to load tax data. Please try again.");
      setTaxSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSettleTax = async () => {
    const session = getSession();
    if (!session?.token) return;

    if (!taxSummary?.tinNumber || taxSummary.tinNumber.includes("Pending")) {
      showToast("Statutory Requirement: Please register your 10-digit TIN number before completing annual tax settlement.");
      setIsSettlementModalOpen(false);
      setIsTinModalOpen(true);
      return;
    }

    try {
      setIsSubmittingSettlement(true);
      const res = await settleAnnualRentalTax(session.token, {
        amount: taxSummary?.totalEstimatedAnnualTax || 5800,
        paymentMethod: settlementMethod === "telebirr" ? "Telebirr SuperApp" : "CBE Birr / Bank Transfer",
        payerPhoneNumber: payerPhone,
        taxpayerTin: taxSummary?.tinNumber || "TIN: 0092817263",
        fiscalYear: taxSummary?.fiscalYear || "EFY 2018",
      });

      setSettlementSuccess(res);
      showToast("✓ Annual Schedule B Rental Income Tax successfully remitted to Ministry of Revenues!");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to settle tax.");
    } finally {
      setIsSubmittingSettlement(false);
    }
  };

  const isCleared =
    taxSummary?.filingStatus === "SETTLED_CLEARED" ||
    taxSummary?.filingStatus === "CLEARED" ||
    Boolean(taxSummary?.clearanceCertificateNumber) ||
    Boolean(settlementSuccess);

  const certNumber =
    settlementSuccess?.clearanceCertificateNumber ||
    taxSummary?.clearanceCertificateNumber ||
    "MOR-REV-2026-8812";

  if (loading && !taxSummary) {
    return <TaxPageSkeleton />;
  }

  return (
    <div className="space-y-6 pb-16 font-sans antialiased text-slate-800 text-[13px]">
     

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-[#00450d] rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 2. OFFICIAL HERO BANNER: FISCAL YEAR & SUMMER SETTLEMENT WINDOW       */}
      {/* --------------------------------------------------------------------- 
      <div className="bg-gradient-to-r from-[#00450d] via-[#06380c] to-[#0b2710] text-white p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0 mt-0.5">
              <Landmark className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black tracking-tight">
                  Rental Income Tax Records (Schedule B / ሰንጠረዥ «ለ»)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[11px] font-mono font-bold">
                  {taxSummary?.fiscalYear || "EFY 2018 (2025/2026 G.C.)"}
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
                Addis Ababa City Revenues Administration & Ministry of Revenues (MOR) statutory rental tax declaration.
                Rental revenue is counted month-by-month and the accumulated annual tax is paid during the summer window (Hamle – Nehase).
              </p>
            </div>
          </div> */}

          {/* Action Button
          <div className="shrink-0 flex items-center gap-2.5">
            {isCleared ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs font-bold text-emerald-100">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Cleared & Settled ({certNumber})</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSettlementModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-900" />
                <span>Pay Annual Rental Tax (Summer MOR)</span>
              </button>
            )}
          </div>
        </div>*/}

        {/* Status Strip 
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-100/90">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>
              <strong>Summer Filing Window:</strong> Hamle 1 – Nehase 30 • Deadline: {taxSummary?.summerFilingDeadline || "Nehase 30, 2018 E.C."}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-emerald-200 flex-wrap">
            <span>Taxpayer: <strong>{taxSummary?.taxpayerName}</strong></span>
            <span className="text-emerald-400/50">•</span>
            <span className="font-mono bg-white/10 px-2 py-0.5 rounded font-bold">
              {taxSummary?.tinNumber || "TIN: Pending"}
            </span>
            <span className="text-emerald-400/50">•</span>
            <span className="bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded font-semibold text-white">
              {taxSummary?.totalAgreementsCount || taxSummary?.agreements?.length || 0} Active Contract(s) ({(taxSummary?.totalContractedMonthlyRent || 0).toLocaleString()} ETB/mo)
            </span>
            <button
              type="button"
              onClick={() => {
                const current = taxSummary?.tinNumber && !taxSummary.tinNumber.includes("Pending")
                  ? taxSummary.tinNumber.replace(/TIN:\s*/} {/* , "")
                  : "";
                setTinInput(current);
                setIsTinModalOpen(true);
              }}
              className="px-2 py-0.5 bg-white/20 hover:bg-white text-white hover:text-slate-900 text-[10px] font-bold rounded transition-colors"
            >
              {taxSummary?.tinNumber && !taxSummary.tinNumber.includes("Pending") ? "Update TIN" : "Register TIN"}
            </button>
          </div>
        </div>
      </div>*/}

      {/* Missing / Pending TIN Alert Banner */}
      {(!taxSummary?.tinNumber || taxSummary.tinNumber.includes("Pending")) && (
        <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="block text-xs font-black text-amber-950 uppercase tracking-tight">
                  Taxpayer Identification Number (TIN) Required
                </span>
                <span className="px-1.5 py-0.5 bg-amber-200/80 text-amber-950 rounded text-[9px] font-bold uppercase">
                  Statutory Prerequisite
                </span>
              </div>
              <span className="block text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                Under Proclamation No. 979/2016, a verified 10-digit TIN is required before paying annual rental tax and generating your official Ministry of Revenues tax clearance certificate.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                setTinInput("");
                setIsTinModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[#00450d] hover:bg-[#06380c] text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
            >
              Register TIN Now
            </button>
            <Link
              href="/citizen/dashboard/profile"
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors"
            >
              Bank & TIN Settings
            </Link>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 3. SIX STATUTORY TAX LEDGER KPI CARDS                                */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Card 1: All Active Agreements & Monthly Contracted Rent */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              All Active Contracts
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
              <Layers className="w-4 h-4 text-emerald-700" />
            </div>
          </div>
          <div className="pt-1">
            <div className="text-xl font-black text-slate-900 font-mono leading-none">
              {(taxSummary?.totalContractedMonthlyRent || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">ETB/mo</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {taxSummary?.totalAgreementsCount || taxSummary?.agreements?.length || 0} active agreement(s)
            </p>
            <div className="text-[10px] text-emerald-700 font-semibold mt-1">
              Projected: {(taxSummary?.projectedAnnualGrossIncome || 0).toLocaleString()} ETB/yr
            </div>
          </div>
        </div>

        {/* Card 2: Cumulative Cash Rental Income (Collected) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              Cash Collected
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center">
              <Building className="w-4 h-4 text-teal-700" />
            </div>
          </div>
          <div className="pt-1">
            <div className="text-xl font-black text-slate-900 font-mono leading-none">
              {(taxSummary?.totalGrossRentalIncome || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">ETB</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {taxSummary?.totalMonthsPaid || 0} month(s) paid
            </p>
            <div className="text-[10px] text-slate-400 mt-1">
              Cash-basis declared
            </div>
          </div>
        </div>

        {/* Card 3: 50% Statutory Expense Allowance (Article 15) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              50% Statutory Relief
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
            </div>
          </div>
          <div className="pt-1">
            <div className="text-xl font-black text-emerald-700 font-mono leading-none">
              - {(((taxSummary?.totalGrossRentalIncome || 0) * 0.50)).toLocaleString()} <span className="text-xs font-bold text-slate-500">ETB</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Taxable: {(((taxSummary?.totalGrossRentalIncome || 0) * 0.50)).toLocaleString()} ETB
            </p>
            <div className="text-[10px] text-emerald-600 mt-1">
              50% deduction (Art. 15)
            </div>
          </div>
        </div>

        {/* Card 4: Accrued Schedule B Tax Liability */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              Accrued Tax
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center">
              <Landmark className="w-4 h-4 text-amber-700" />
            </div>
          </div>
          <div className="pt-1">
            <div className="text-xl font-black text-[#00450d] font-mono leading-none">
              {(taxSummary?.totalEstimatedAnnualTax || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">ETB</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {taxSummary?.taxBracketPercentage ?? 0}% Bracket Rate
            </p>
            <div className="text-[10px] text-slate-400 mt-1">
              Effective: {taxSummary?.effectiveTaxRate?.toFixed(1) || 0}%
            </div>
          </div>
        </div>

        {/* Card 5: Net Income After Tax */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              Net After Tax
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-blue-700" />
            </div>
          </div>
          <div className="pt-1">
            <div className="text-xl font-black text-blue-700 font-mono leading-none">
              {(taxSummary?.netIncomeAfterTax || 0).toLocaleString()} <span className="text-xs font-bold text-slate-500">ETB</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Gains minus accrued tax
            </p>
            <div className="text-[10px] text-blue-600 mt-1">
              Retained landlord profit
            </div>
          </div>
        </div>

        {/* Card 6: Settlement Status */}
        <div className={`border rounded-xl p-4 shadow-2xs space-y-2 ${isCleared ? "bg-emerald-50/50 border-emerald-300" : "bg-white border-slate-200"}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              MOR Status
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isCleared ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
              {isCleared ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : <Clock className="w-4 h-4 text-amber-700" />}
            </div>
          </div>
          <div className="pt-1">
            <div className={`text-base font-black leading-tight ${isCleared ? "text-emerald-800" : "text-amber-800"}`}>
              {isCleared ? "Cleared & Settled" : "Accruing Monthly"}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {isCleared ? `Ref: ${certNumber}` : "Summer MOR Window"}
            </p>
            <div className="text-[10px] text-slate-400 mt-1">
              {taxSummary?.fiscalYear || "EFY 2018"}
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 4. STATUTORY SCHEDULE B PROCLAMATION CARD (AMHARIC & ENGLISH)        */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3.5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#00450d] border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-5 h-5 text-[#00450d]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-slate-900">
              በኢትዮጵያ የገቢ ግብር አዋጅ መሠረት የቤት ኪራይ ገቢ ግብር ተመን (Schedule «B» / ሰንጠረዥ «ለ»)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              በኢትዮጵያ የገቢ ግብር አዋጅ ቁጥር 979/2008 እና ማሻሻያ አዋጅ ቁጥር 1395/2017 መሠረት፣ የቤት ኪራይ ገቢ በ«ሰንጠረዥ ለ» (Schedule B) ስር
              የሚመደብ ሲሆን፣ አከራዮች በየወሩ ከሚሰበስቡት ኪራይ ተደምሮ በበጀት ዓመቱ ማብቂያ በክረምት (ከሐምሌ 1 እስከ ነሐሴ 30) ለመንግሥት ግብር የመክፈል ግዴታ አለባቸው።
            </p>
          </div>
        </div>

        {/* Schedule B Bracket Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 text-xs">
          <div className={`p-2.5 rounded-xl text-center space-y-0.5 ${taxSummary?.taxBracketPercentage === 0 ? "bg-emerald-50 border border-emerald-200 ring-1 ring-emerald-300" : "bg-white border border-slate-200"}`}>
            <span className={`block text-[10px] font-bold uppercase ${taxSummary?.taxBracketPercentage === 0 ? "text-emerald-800" : "text-slate-400"}`}>እስከ 24,000 ብር</span>
            <span className={`block text-base font-black font-mono ${taxSummary?.taxBracketPercentage === 0 ? "text-emerald-800" : "text-slate-900"}`}>0%</span>
            <span className={`block text-[10px] ${taxSummary?.taxBracketPercentage === 0 ? "text-emerald-700" : "text-slate-500"}`}>ግብር ነፃ</span>
          </div>

          <div className={`p-2.5 rounded-xl text-center space-y-0.5 ${taxSummary?.taxBracketPercentage === 15 ? "bg-emerald-50 border border-emerald-200 ring-1 ring-emerald-300" : "bg-white border border-slate-200"}`}>
            <span className={`block text-[10px] font-bold uppercase ${taxSummary?.taxBracketPercentage === 15 ? "text-emerald-800" : "text-slate-400"}`}>24,001 - 48,000</span>
            <span className={`block text-base font-black font-mono ${taxSummary?.taxBracketPercentage === 15 ? "text-emerald-800" : "text-slate-900"}`}>15%</span>
            <span className={`block text-[10px] ${taxSummary?.taxBracketPercentage === 15 ? "text-emerald-700" : "text-slate-500"}`}>መቀነሻ 3,600 ብር</span>
          </div>

          <div className={`p-2.5 rounded-xl text-center space-y-0.5 ${taxSummary?.taxBracketPercentage === 20 ? "bg-emerald-50 border border-emerald-200 ring-1 ring-emerald-300" : "bg-white border border-slate-200"}`}>
            <span className={`block text-[10px] font-bold uppercase ${taxSummary?.taxBracketPercentage === 20 ? "text-emerald-800" : "text-slate-400"}`}>48,001 - 84,000</span>
            <span className={`block text-base font-black font-mono ${taxSummary?.taxBracketPercentage === 20 ? "text-emerald-800" : "text-slate-900"}`}>20%</span>
            <span className={`block text-[10px] ${taxSummary?.taxBracketPercentage === 20 ? "text-emerald-700" : "text-slate-500"}`}>መቀነሻ 6,000 ብር</span>
          </div>

          <div className={`p-2.5 rounded-xl text-center space-y-0.5 ${taxSummary?.taxBracketPercentage === 25 ? "bg-emerald-50 border border-emerald-200 ring-1 ring-emerald-300" : "bg-white border border-slate-200"}`}>
            <span className={`block text-[10px] font-bold uppercase ${taxSummary?.taxBracketPercentage === 25 ? "text-emerald-800" : "text-slate-400"}`}>84,001 - 120,000</span>
            <span className={`block text-base font-black font-mono ${taxSummary?.taxBracketPercentage === 25 ? "text-emerald-800" : "text-slate-900"}`}>25%</span>
            <span className={`block text-[10px] ${taxSummary?.taxBracketPercentage === 25 ? "text-emerald-700" : "text-slate-500"}`}>መቀነሻ 10,200 ብር</span>
          </div>

          <div className={`p-2.5 rounded-xl text-center space-y-0.5 ${taxSummary?.taxBracketPercentage === 30 ? "bg-emerald-50 border border-emerald-200 ring-1 ring-emerald-300" : "bg-white border border-slate-200"}`}>
            <span className={`block text-[10px] font-bold uppercase ${taxSummary?.taxBracketPercentage === 30 ? "text-emerald-800" : "text-slate-400"}`}>120,001 - 168,000</span>
            <span className={`block text-base font-black font-mono ${taxSummary?.taxBracketPercentage === 30 ? "text-emerald-800" : "text-slate-900"}`}>30%</span>
            <span className={`block text-[10px] ${taxSummary?.taxBracketPercentage === 30 ? "text-emerald-700" : "text-slate-500"}`}>መቀነሻ 16,200 ብር</span>
          </div>

          <div className={`p-2.5 rounded-xl text-center space-y-0.5 ${taxSummary?.taxBracketPercentage === 35 ? "bg-emerald-50 border border-emerald-200 ring-1 ring-emerald-300" : "bg-white border border-slate-200"}`}>
            <span className={`block text-[10px] font-bold uppercase ${taxSummary?.taxBracketPercentage === 35 ? "text-emerald-800" : "text-slate-400"}`}>ከ 168,000 በላይ</span>
            <span className={`block text-base font-black font-mono ${taxSummary?.taxBracketPercentage === 35 ? "text-emerald-800" : "text-slate-900"}`}>35%</span>
            <span className={`block text-[10px] ${taxSummary?.taxBracketPercentage === 35 ? "text-emerald-700" : "text-slate-500"}`}>መቀነሻ 24,600 ብር</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
          <span>* የሕግ ሰውነት ያላቸው ድርጅቶች/ተቋማት ከጠቅላላ የኪራይ ገቢያቸው ላይ ቋሚ 30% ጠፍጣፋ ግብር (Flat 30%) ይከፍላሉ።</span>
          <span className="font-semibold text-[#00450d]">የገቢዎች ሚኒስቴር / MOR</span>
        </div>

        {/* Proclamation Principles: 50% Deduction, Multi-Contract Aggregation & 30% Corporate Rate */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-200">
          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>50% Statutory Relief (አንቀጽ 15(5)(ለ))</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Under Proclamation No. 979/2016 Article 15(5)(b), individual landlords without accounting books receive an automatic 50% gross deduction for depreciation and maintenance. Tax applies only to the remaining 50%.
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#00450d]">
              <Layers className="w-3.5 h-3.5 text-[#00450d]" />
              <span>Multi-Contract Aggregation (የኪራይ ውሎች ድምር)</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Rental tax is assessed per taxpayer, not per unit. When new active agreements are registered, their contracted rents and collected revenues are automatically combined into your consolidated Schedule B ledger.
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Building className="w-3.5 h-3.5 text-slate-600" />
              <span>Flat 30% Corporate Tax (የድርጅት ቋሚ ተመን)</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Bodies and corporate entities pay a flat 30% rental tax on net rental income. Progressive brackets (0% – 35%) apply strictly to individual citizen landlords.
            </p>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 5. TABS: AGREEMENT ACCRUAL VS MONTH-BY-MONTH ACCRUAL                  */}
      {/* --------------------------------------------------------------------- */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("agreements")}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === "agreements"
              ? "bg-[#00450d] text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Agreement-by-Agreement Breakdown ({taxSummary?.agreements?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("monthly")}
          className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === "monthly"
              ? "bg-[#00450d] text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Month-by-Month Accumulation (12 Ethiopian Months)</span>
        </button>
      </div>

      {/* TAB 1: AGREEMENT-BY-AGREEMENT TABLE */}
      {activeTab === "agreements" && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Registered Rental Agreements & Multi-Contract Aggregation
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#00450d] text-[10px] font-bold font-mono">
                  {taxSummary?.totalAgreementsCount || taxSummary?.agreements?.length || 0} Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Every active agreement and completed payment is aggregated to determine your combined monthly rent and annual tax tier.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-500">Combined Monthly Rent</div>
                <div className="text-sm font-black text-slate-900">
                  {(taxSummary?.totalContractedMonthlyRent || 0).toLocaleString()} ETB/mo
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-500">Projected Annual Gross</div>
                <div className="text-sm font-black text-[#00450d]">
                  {(taxSummary?.projectedAnnualGrossIncome || 0).toLocaleString()} ETB/yr
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Agreement & Property</th>
                  <th className="py-3 px-4">Tenant / Payer</th>
                  <th className="py-3 px-4">Monthly Rent</th>
                  <th className="py-3 px-4">Months Counted</th>
                  <th className="py-3 px-4">Gross Income</th>
                  <th className="py-3 px-4">Accrued Tax</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(taxSummary?.agreements || []).map((agr: AgreementTaxBreakdown) => (
                  <tr key={agr.agreementId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 font-mono">
                        {agr.agreementNumber || agr.requestCode}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {agr.propertyTitle} ({agr.propertyCode})
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{agr.tenantName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{agr.tenantTin}</div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {agr.monthlyRent ? `${agr.monthlyRent.toLocaleString()} ETB` : "-"}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{agr.monthsCounted} Month{agr.monthsCounted > 1 ? "s" : ""}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-black text-slate-900">
                      {agr.grossIncome ? `${agr.grossIncome.toLocaleString()} ETB` : "0 ETB"}
                    </td>

                    <td className="py-3 px-4 font-mono font-black text-[#00450d]">
                      {agr.accruedTaxContribution ? `${agr.accruedTaxContribution.toLocaleString()} ETB` : "0 ETB"}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>Tax Accruing</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/citizen/dashboard/agreements/active/${agr.agreementNumber || agr.requestCode}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#00450d] hover:underline"
                      >
                        <span>View Contract</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MONTH-BY-MONTH ACCUMULATION TIMELINE */}
      {activeTab === "monthly" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Month-by-Month Accumulation & Summer Settlement Window
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ethiopian rental income tax is tracked across all 12 Ethiopian months. During Hamle (ሐምሌ) and Nehase (ነሐሴ), the total sum is payable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {(taxSummary?.monthlyAccruals || []).map((m: MonthlyTaxAccrual, idx: number) => (
              <div
                key={m.ethiopianMonth}
                className={`p-3.5 rounded-xl border transition-all ${
                  m.isSummerSettlementMonth
                    ? "bg-amber-50/40 border-amber-300 ring-1 ring-amber-200"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">
                        {m.ethiopianMonth}
                      </h4>
                      <span className="text-[10px] text-slate-400 block">
                        {m.gregorianMonth}
                      </span>
                    </div>
                  </div>

                  {m.isSummerSettlementMonth && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Summer Window
                    </span>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Monthly Revenue</span>
                    <strong className="text-slate-800 font-bold">
                      {m.rentalIncome ? `${m.rentalIncome.toLocaleString()} ETB` : "—"}
                    </strong>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-sans">Accrued Tax</span>
                    <strong className="text-[#00450d] font-bold">
                      {m.accruedTax ? `${m.accruedTax.toLocaleString()} ETB` : "—"}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 6. SUMMER SETTLEMENT MODAL (CHAPA / TELEBIRR / CBE SIMULATOR)         */}
      {/* --------------------------------------------------------------------- */}
      {isSettlementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center border border-amber-200">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Remit Annual Rental Income Tax
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Ministry of Revenues (MOR) • EFY 2018 Summer Settlement
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSettlementModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Assessment Breakdown Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Taxpayer Legal Name:</span>
                <strong className="text-slate-900">{taxSummary?.taxpayerName}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Taxpayer Identification (TIN):</span>
                {taxSummary?.tinNumber && !taxSummary.tinNumber.includes("Pending") ? (
                  <strong className="text-slate-900 font-mono">{taxSummary.tinNumber}</strong>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettlementModalOpen(false);
                      setTinInput("");
                      setIsTinModalOpen(true);
                    }}
                    className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                  >
                    <span>⚠️ TIN Required (Click to Enter)</span>
                  </button>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Declared Gross Rental Income:</span>
                <strong className="text-slate-900 font-mono">
                  {(taxSummary?.totalGrossRentalIncome || 0).toLocaleString()} ETB
                </strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 text-sm font-bold">
                <span className="text-[#00450d]">Total Schedule B Tax Due:</span>
                <span className="text-[#00450d] font-mono font-black">
                  {(taxSummary?.totalEstimatedAnnualTax || 5800).toLocaleString()} ETB
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Select Remittance Channel
              </label>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSettlementMethod("telebirr")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    settlementMethod === "telebirr"
                      ? "border-[#00450d] bg-emerald-50/40 ring-1 ring-[#00450d]"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="font-bold text-slate-900">Telebirr SuperApp</div>
                  <span className="text-[10px] text-slate-500">Instant USSD / Mobile</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettlementMethod("cbe")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    settlementMethod === "cbe"
                      ? "border-[#00450d] bg-emerald-50/40 ring-1 ring-[#00450d]"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="font-bold text-slate-900">CBE Birr / Chapa</div>
                  <span className="text-[10px] text-slate-500">Commercial Bank Gateway</span>
                </button>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mt-2">
                  Contact Mobile Number for Electronic Receipt (SMS)
                </label>
                <input
                  type="text"
                  value={payerPhone}
                  onChange={(e) => setPayerPhone(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSettlementModalOpen(false)}
                className="px-3.5 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSettleTax}
                disabled={isSubmittingSettlement}
                className="px-4 py-2 bg-[#00450d] hover:bg-[#06380c] text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingSettlement ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing MOR Remittance...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm & Pay {(taxSummary?.totalEstimatedAnnualTax || 5800).toLocaleString()} ETB</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 7. OFFICIAL MOR CLEARANCE CERTIFICATE POPUP                           */}
      {/* --------------------------------------------------------------------- */}
      {settlementSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#00450d] border border-emerald-300 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8 text-[#00450d]" />
              </div>
              <h2 className="text-lg font-black text-slate-900">
                Official Rental Tax Clearance Certificate
              </h2>
              <p className="text-xs text-slate-500">
                Federal Democratic Republic of Ethiopia • Ministry of Revenues
              </p>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Certificate No:</span>
                <strong className="text-emerald-900 font-black">{settlementSuccess.clearanceCertificateNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Taxpayer Name:</span>
                <strong className="text-slate-900">{settlementSuccess.taxpayerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">TIN Number:</span>
                <strong className="text-slate-900">{settlementSuccess.taxpayerTin}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax Schedule:</span>
                <strong className="text-slate-900">Schedule B (Rental Income)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Remitted:</span>
                <strong className="text-[#00450d] font-black">{settlementSuccess.amountPaid.toLocaleString()} ETB</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Settlement Date:</span>
                <strong className="text-slate-900">{new Date(settlementSuccess.settledAt).toLocaleString()}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
              <button
                type="button"
                onClick={() => setSettlementSuccess(null)}
                className="px-4 py-2 bg-[#00450d] text-white text-xs font-bold rounded-xl hover:bg-[#06380c]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TIN REGISTRATION / UPDATE MODAL                                       */}
      {/* ===================================================================== */}
      {isTinModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#00450d] text-white flex items-center justify-center shrink-0">
                  <Scale className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Register Taxpayer Identification (TIN)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Ministry of Revenues Schedule B Rental Tax Registry
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTinModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTin} className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">Federal Income Tax Proclamation No. 979/2016</span>
                <span>
                  All residential lessors receiving rental income are required to hold a registered 10-digit TIN to validate declaration filings and issuance of Ministry Clearance Certificates.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  10-Digit TIN Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tinInput}
                  onChange={(e) => setTinInput(e.target.value)}
                  placeholder="e.g. 0092817263"
                  maxLength={12}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono font-black text-slate-900 tracking-wider focus:outline-none focus:ring-2 focus:ring-[#00450d]"
                  autoFocus
                />
                <p className="text-[10px] text-slate-400">
                  Enter the 10 numerical digits found on your Ethiopian Ministry of Revenues TIN certificate or card.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <Link
                  href="/citizen/dashboard/profile"
                  className="text-xs font-semibold text-[#00450d] hover:underline"
                >
                  Manage in Bank Settings
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTinModalOpen(false)}
                    className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingTin}
                    className="px-4 py-1.5 bg-[#00450d] hover:bg-[#06380c] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                  >
                    {isSavingTin ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Save & Link TIN</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
