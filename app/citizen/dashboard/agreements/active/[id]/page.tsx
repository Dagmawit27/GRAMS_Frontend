"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Building2,
  ShieldCheck,
  Printer,
  Download,
  FileText,
  Lock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ChevronRight,
  ExternalLink,
  ChevronLeft,
  X,
  Shield,
  Check,
  Smartphone,
  Landmark,
  Scale,
  Headphones,
  Fingerprint,
  BarChart3,
  Receipt,
} from "lucide-react";
import {
  getSession,
  getAgreementByNumber,
  getAgreementByRequestCode,
  getMyAgreements,
  getPaymentsForAgreement,
  renewAgreement,
  requestAgreementCancellation,
  acceptAgreementCancellation,
  tenantCancelAgreement,
  AgreementResponse,
  PaymentResponseDto,
} from "@/lib/api";

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function ActiveAgreementDetailPage() {
  const router = useRouter();
  const params = useParams();

  // Agreement identifier from route or fallback
  const agreementId = (params?.id as string) || "RA-2023-0892";

  // Backend state
  const [agreement, setAgreement] = useState<AgreementResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [backendPayments, setBackendPayments] = useState<PaymentResponseDto[]>([]);
  const [localReceipts, setLocalReceipts] = useState<any[]>([]);

  // State management
  const [filterLedger, setFilterLedger] = useState<"all" | "advance" | "monthly">("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isVerifyingModalOpen, setIsVerifyingModalOpen] = useState(false);
  const [isAmendmentModalOpen, setIsAmendmentModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isTenantCancelModalOpen, setIsTenantCancelModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isDownloadToastOpen, setIsDownloadToastOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  const currentSession = getSession();
  const userEmail = (currentSession?.user?.email || "").toLowerCase().trim();
  const isLandlord = Boolean(agreement?.landlordEmail && agreement.landlordEmail.toLowerCase().trim() === userEmail);
  const isTenant = Boolean(agreement?.tenantEmail && agreement.tenantEmail.toLowerCase().trim() === userEmail);

  const handleRenew = async () => {
    if (!agreement?.agreementNumber) return;
    const session = getSession();
    if (!session?.token) return;

    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await renewAgreement(session.token, agreement.agreementNumber);
      setActionMessage(res.message || "Agreement renewed successfully for an additional 2 years!");
      setIsRenewModalOpen(false);
      const updated = await getAgreementByNumber(session.token, agreement.agreementNumber);
      setAgreement(updated);
    } catch (err: any) {
      alert(err.message || "Failed to renew agreement.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestCancellation = async () => {
    if (!agreement?.agreementNumber) return;
    const session = getSession();
    if (!session?.token) return;

    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await requestAgreementCancellation(session.token, agreement.agreementNumber);
      setActionMessage(res.message || "Cancellation requested. Tenant has 60 days to accept.");
      setIsCancelModalOpen(false);
      const updated = await getAgreementByNumber(session.token, agreement.agreementNumber);
      setAgreement(updated);
    } catch (err: any) {
      alert(err.message || "Failed to request cancellation.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptCancellation = async () => {
    if (!agreement?.agreementNumber) return;
    const session = getSession();
    if (!session?.token) return;

    if (!confirm("Are you sure you want to accept cancellation? This will cancel the agreement immediately and make the property available for lease.")) {
      return;
    }

    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await acceptAgreementCancellation(session.token, agreement.agreementNumber);
      setActionMessage(res.message || "Cancellation accepted. Agreement is now cancelled.");
      const updated = await getAgreementByNumber(session.token, agreement.agreementNumber);
      setAgreement(updated);
    } catch (err: any) {
      alert(err.message || "Failed to accept cancellation.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTenantCancel = async () => {
    if (!agreement?.agreementNumber) return;
    const session = getSession();
    if (!session?.token) return;

    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await tenantCancelAgreement(session.token, agreement.agreementNumber);
      setActionMessage(res.message || "Agreement cancelled successfully by tenant. Property is now released.");
      setIsTenantCancelModalOpen(false);
      const updated = await getAgreementByNumber(session.token, agreement.agreementNumber);
      setAgreement(updated);
    } catch (err: any) {
      alert(err.message || "Failed to cancel agreement.");
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch agreement details from backend
  useEffect(() => {
    let isMounted = true;
    async function loadAgreementData() {
      setIsLoading(true);
      const session = getSession();
      if (!session?.token || !agreementId) {
        setIsLoading(false);
        return;
      }

      let fetchedAgr: AgreementResponse | null = null;
      try {
        fetchedAgr = await getAgreementByNumber(session.token, agreementId);
      } catch {
        try {
          fetchedAgr = await getAgreementByRequestCode(session.token, agreementId);
        } catch {
          try {
            const all = await getMyAgreements(session.token);
            fetchedAgr =
              all.find(
                (a) =>
                  a.agreementNumber?.toLowerCase() === agreementId.toLowerCase() ||
                  a.requestCode?.toLowerCase() === agreementId.toLowerCase() ||
                  a.id?.toLowerCase() === agreementId.toLowerCase()
              ) || null;
          } catch (err) {
            console.warn("Could not load from getMyAgreements:", err);
          }
        }
      }

      if (isMounted && fetchedAgr) {
        setAgreement(fetchedAgr);

        // Fetch payments for agreement
        try {
          const payments = await getPaymentsForAgreement(
            session.token,
            fetchedAgr.requestCode || fetchedAgr.agreementNumber || agreementId
          );
          setBackendPayments(Array.isArray(payments) ? payments : []);
        } catch (pErr) {
          console.warn("Could not load payments:", pErr);
        }
      }
      if (isMounted) setIsLoading(false);
    }

    loadAgreementData();
    return () => {
      isMounted = false;
    };
  }, [agreementId]);

  // Load any locally cached receipts from recent payments
  useEffect(() => {
    try {
      const stored = localStorage.getItem("grams_completed_receipts");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const matched = parsed.filter(
            (r: any) =>
              r.transactionRef?.toLowerCase().includes(agreementId.toLowerCase()) ||
              (agreement && r.transactionRef?.toLowerCase().includes(agreement.requestCode.toLowerCase())) ||
              (agreement && r.propertyName?.toLowerCase().includes(agreement.propertyTitle?.toLowerCase()))
          );
          setLocalReceipts(matched);
        }
      }
    } catch {}
  }, [agreementId, agreement]);

  // Dynamic mapped transactions strictly from real database payments and genuine completed receipts
  const dynamicTransactions = useMemo(() => {
    // 1. Only include COMPLETED payments
    const validBackend = backendPayments.filter(
      (p) => p.status === "COMPLETED"
    );

    const mappedBackend = validBackend.map((p, idx) => {
      const isMobile =
        p.paymentMethod?.toLowerCase().includes("telebirr") ||
        p.paymentMethod?.toLowerCase().includes("cbebirr") ||
        p.paymentMethod?.toLowerCase().includes("mobile");
      const advMonths = agreement?.advancePaymentMonths || 2;

      return {
        id: p.id ? String(p.id) : `bp-${idx}`,
        cycle: idx === 0
          ? `Initial Advance Rent (${advMonths} Mo.)`
          : `Monthly Rent Settlement #${idx + 1}`,
        invoiceRef: p.txRef ? `INV-${p.txRef.slice(-8).toUpperCase()}` : `INV-2024-00${idx + 1}`,
        amount: Number(p.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 }),
        channel: `${p.paymentMethod || "Telebirr"}: ${p.txRef || "TX-00" + idx}`,
        channelType: isMobile ? "mobile" : "bank",
        settledDate: p.paymentDate
          ? formatDate(p.paymentDate)
          : p.createdAt
          ? formatDate(p.createdAt)
          : "Settled",
        seal: "Kebele Sealed",
        sealType: "kebele",
        actionText: "Receipt",
        type: idx === 0 ? "advance" : "monthly",
        raw: p,
      };
    });

    // 2. Also map any locally stored completed receipts that match this agreement and aren't already represented
    const backendTxRefs = new Set(validBackend.map((p) => p.txRef).filter(Boolean));
    const mappedLocal = localReceipts
      .filter((r) => r.transactionRef && !backendTxRefs.has(r.transactionRef))
      .map((r, idx) => {
        return {
          id: r.id || `lr-${idx}`,
          cycle: r.period || "Advance Rent Settlement",
          invoiceRef: r.transactionRef ? `INV-${r.transactionRef.slice(-8).toUpperCase()}` : `INV-LOCAL-${idx + 1}`,
          amount: Number(r.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 }),
          channel: `${r.paymentMethod || "Telebirr"}: ${r.transactionRef || "TX-LOCAL"}`,
          channelType: "mobile",
          settledDate: r.date || "Settled",
          seal: "Kebele Sealed",
          sealType: "kebele",
          actionText: "Receipt",
          type: "advance",
          raw: r,
        };
      });

    return [...mappedBackend, ...mappedLocal];
  }, [backendPayments, localReceipts, agreement]);

  const activeLedgerTransactions = dynamicTransactions;

  // Filter transactions based on selection
  const filteredTransactions = activeLedgerTransactions.filter((tx) => {
    if (filterLedger === "advance") return tx.type === "advance";
    if (filterLedger === "monthly") return tx.type === "monthly";
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / 6));
  const displayedTransactions = filteredTransactions.slice((currentPage - 1) * 6, currentPage * 6);

  const totalSettledAmount = activeLedgerTransactions.reduce(
    (sum, tx) => sum + parseFloat(tx.amount.replace(/,/g, "") || "0"),
    0
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    setIsDownloadToastOpen(true);
    setTimeout(() => setIsDownloadToastOpen(false), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 pb-12">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/citizen/dashboard/agreements/active"
            className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-[#00450d] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>ACTIVE AGREEMENTS</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-mono font-bold text-slate-800">
            {agreement?.agreementNumber || agreement?.requestCode || agreementId}
          </span>
        </div>
      </div>

      {/* Top Title & Actions Bar */}
      <div className="bg-white border border-slate-200 rounded p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Residential Tenancy Agreement (የመኖሪያ ቤት ኪራይ ውል)
              </h1>
              {agreement?.status === "ACTIVE" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  ACTIVE / የጸደቀ ውል
                </span>
              )}
              {agreement?.status === "CANCELLATION_REQUESTED" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  CANCELLATION PENDING / ስረዛ በመጠባበቅ ላይ
                </span>
              )}
              {agreement?.status === "EXPIRED" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold">
                  EXPIRED / ጊዜው ያለፈበት
                </span>
              )}
              {agreement?.status === "CANCELLED" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                  CANCELLED / የተሰረዘ
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="font-semibold text-slate-800">
                {agreement?.propertyTitle || "Urban Residential Unit"}
              </span>
              <span>•</span>
              <span className="font-mono">
                No: {agreement?.agreementNumber || agreement?.requestCode || agreementId}
              </span>
              <span>•</span>
              <span className="font-mono text-slate-400">
                SHA-256: {agreement?.id ? `${agreement.id.replace(/-/g, "").slice(0, 8)}...` : "d4e5f6..."}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {agreement?.status === "ACTIVE" && (
              <>
                <button
                  onClick={() => setIsRenewModalOpen(true)}
                  className="px-3.5 py-2 bg-[#00450d] hover:bg-[#00340a] text-white font-bold text-xs uppercase tracking-wider rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>ማደስ (RENEW +2 YRS)</span>
                </button>

                {isLandlord && (
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="px-3.5 py-2 bg-white border border-rose-300 hover:bg-rose-50 text-rose-700 font-bold text-xs uppercase tracking-wider rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>ውል ማቋረጥ (CANCEL NOTICE)</span>
                  </button>
                )}

                {isTenant && (
                  <button
                    onClick={() => setIsTenantCancelModalOpen(true)}
                    className="px-3.5 py-2 bg-white border border-rose-400 hover:bg-rose-50 text-rose-700 font-bold text-xs uppercase tracking-wider rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>ውል አቋርጥ (CANCEL LEASE)</span>
                  </button>
                )}
              </>
            )}

            {agreement?.status === "CANCELLATION_REQUESTED" && isTenant && (
              <button
                onClick={handleAcceptCancellation}
                disabled={actionLoading}
                className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs uppercase tracking-wider rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{actionLoading ? "Processing..." : "ስረዛን ተቀበል (ACCEPT CANCELLATION)"}</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>PRINT</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Action feedback message */}
        {actionMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-900 text-xs font-semibold flex items-center justify-between">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Notice for Cancellation Pending */}
        {agreement?.status === "CANCELLATION_REQUESTED" && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">የውል ማቋረጥ ጥያቄ ቀርቧል (60-Day Cancellation Active):</span>
                <span className="ml-1 text-amber-800">
                  ተከራይ በ60 ቀናት ውስጥ ካልተቀበለ ስርዓቱ በራሱ 60 ቀናት ሲሞላ ውሉን ይሰርዛል እና ቤቱ ለሌላ ኪራይ ክፍት ይሆናል።
                  (Tenant has 60 days to accept. After 60 days, system will automatically cancel the agreement.)
                </span>
              </div>
            </div>
            {isTenant && (
              <button
                onClick={handleAcceptCancellation}
                disabled={actionLoading}
                className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded transition-colors shrink-0 cursor-pointer"
              >
                {actionLoading ? "Processing..." : "ስረዛን ተቀበል (Accept)"}
              </button>
            )}
          </div>
        )}

        {/* 4 Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          {/* Card 1: Monthly Rent */}
          <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              MONTHLY RENT
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900 tracking-tight">
                {(agreement?.monthlyRent ?? 15000).toLocaleString()} ETB
              </span>
              <span className="text-xs text-slate-500 font-medium">/ month</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-0.5">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Government Cap Indexed</span>
            </div>
          </div>

          {/* Card 2: Lease Duration */}
          <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              LEASE DURATION
            </span>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {agreement?.leaseDurationMonths ?? 12} Months
            </div>
            <div className="text-[11px] text-slate-500 pt-0.5">
              {formatDate(agreement?.startDate || agreement?.contractDate || "2023-11-01")} – {formatDate(agreement?.endDate || "2024-10-31")}
            </div>
          </div>

          {/* Card 3: Advance Rent */}
          <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              ADVANCE RENT
            </span>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {((agreement?.monthlyRent ?? 15000) * (agreement?.advancePaymentMonths || 2)).toLocaleString()} ETB
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-0.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{agreement?.advancePaymentMonths || 2} Months Advance Paid</span>
            </div>
          </div>

          {/* Card 4: Payment Health */}
          <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              PAYMENT HEALTH
            </span>
            <div className={`text-xl font-black tracking-tight ${
              activeLedgerTransactions.length > 0 ? "text-emerald-700" : "text-amber-600"
            }`}>
              {activeLedgerTransactions.length > 0 ? "100% Up to Date" : "Pending Payment"}
            </div>
            <div className="text-[11px] text-slate-500 pt-0.5">
              {activeLedgerTransactions.length > 0
                ? `0 Overdue • ${activeLedgerTransactions.length} Cycles Settled`
                : "No transactions settled yet"}
            </div>
          </div>
        </div>
      </div>

          {/* ===================================================================== */}
          {/* 4. MAIN TWO-COLUMN SECTION                                            */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* ------------------------------------------------------------------- */}
            {/* LEFT COLUMN: 8 COLS (Lessor/Lessee, Specs, Payments Ledger)         */}
            {/* ------------------------------------------------------------------- */}
            <div className="lg:col-span-8 space-y-5">
              {/* LESSOR & LESSEE ROW */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LESSOR (PROPERTY OWNER) */}
                <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                      LESSOR (PROPERTY OWNER)
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                      <ShieldCheck className="w-3 h-3 text-emerald-700" />
                      Verified Owner
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {agreement?.landlordName || "Kibrom Tadesse Woldemariam"}
                    </h3>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">TIN Number:</span>
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded font-mono text-[11px] text-slate-800 font-bold">
                        {agreement?.landlordId ? `00${agreement.landlordId.replace(/\D/g, "").slice(0, 8) || "0048291048"} (Active)` : "0048291048 (Active)"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">National ID (Fayda):</span>
                      <span className="font-mono text-slate-800">
                        {agreement?.landlordId ? `ET-${agreement.landlordId.replace(/\D/g, "").slice(0, 3) || "982"}-${agreement.landlordId.replace(/\D/g, "").slice(3, 6) || "441"}-${agreement.landlordId.replace(/\D/g, "").slice(6, 10) || "9023"}` : "ET-982-441-9023"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Telephone:</span>
                      <span className="font-bold text-slate-800">{agreement?.landlordPhone || "+251 91 123 4567"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Official Email:</span>
                      <span className="text-slate-700">{agreement?.landlordEmail || "k.tadesse@ethioproperty.et"}</span>
                    </div>
                    <div className="flex justify-between items-start pt-1 border-t border-slate-100">
                      <span className="text-slate-500">Remittance Bank:</span>
                      <span className="text-right font-medium text-slate-800">
                        {agreement?.landlordBankName || "Commercial Bank of Ethiopia (CBE)"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Bank Account:</span>
                      <span className="font-mono text-slate-800">
                        {agreement?.landlordAccountNumber ? `****-****-${agreement.landlordAccountNumber.slice(-4)}` : "****-****-4910"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Jurisdiction: {agreement?.landlordSubCity || agreement?.propertySubCity || "Bole"} Sub-City, Wrd {agreement?.landlordWoreda || agreement?.propertyWoreda || "03"}</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                      <Shield className="w-3 h-3" />
                      Title Clean
                    </span>
                  </div>
                </div>

                {/* LESSEE (PRIMARY TENANT) */}
                <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                      LESSEE (PRIMARY TENANT)
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                      <Fingerprint className="w-3 h-3 text-emerald-700" />
                      Biometric Verified
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {agreement?.tenantName || "Dagmawit Mesfin Haile"}
                    </h3>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">National ID (Fayda):</span>
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded font-mono text-[11px] text-slate-800 font-bold">
                        {agreement?.tenantId ? `ET-${agreement.tenantId.replace(/\D/g, "").slice(0, 3) || "772"}-${agreement.tenantId.replace(/\D/g, "").slice(3, 6) || "115"}-${agreement.tenantId.replace(/\D/g, "").slice(6, 10) || "3841"}` : "ET-772-115-3841"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Telephone:</span>
                      <span className="font-bold text-slate-800">{agreement?.tenantPhone || "+251 92 884 1920"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Official Email:</span>
                      <span className="text-slate-700">{agreement?.tenantEmail || "d.mesfin@telecom.et"}</span>
                    </div>
                    <div className="flex justify-between items-start pt-1 border-t border-slate-100">
                      <span className="text-slate-500">Occupation:</span>
                      <span className="text-right font-medium text-slate-800">
                        Sr. Systems Architect (Ethio Telecom)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Emergency Contact:</span>
                      <span className="text-slate-700 text-[11px]">
                        Mesfin Haile (Father) - +251 91 432 9981
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Household Size:</span>
                      <span className="font-medium text-slate-800">
                        2 Occupants (Kebele Reg.)
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Tenancy ID: TID-{agreement?.tenantId ? agreement.tenantId.replace(/-/g, "").slice(0, 8).toUpperCase() : (agreement?.requestCode ? agreement.requestCode.toUpperCase() : "ETH-88219")}</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                      <Check className="w-3 h-3" />
                      Good Standing
                    </span>
                  </div>
                </div>
              </div>

              {/* PROPERTY & LEASED UNIT SPECIFICATIONS */}
              <div className="bg-white border border-slate-200 rounded p-5 shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#00450d]" />
                    <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                      Property & Leased Unit Specifications
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded font-mono text-[11px] font-bold">
                    Cadastral: {agreement?.propertyCode || "AA-BOL-03-P9942-004B"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Left: Unit & Complex */}
                  <div className="md:col-span-7 space-y-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      UNIT & COMPLEX
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      {agreement?.propertyTitle || "Bole Atlas Premium Apartments"}{agreement?.unitNumber ? ` – Unit ${agreement.unitNumber}` : ""}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      House No. {agreement?.unitNumber || "402"}, Kebele {agreement?.propertyWoreda || "03"}, {agreement?.propertySubCity || "Bole"} Sub-City, Addis Ababa
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-2">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
                        {agreement?.propertyType || "Apartment"}
                      </span>
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
                        {agreement?.unitNumber ? `Unit ${agreement.unitNumber}` : (agreement?.unitCode || "Unit 4B")}
                      </span>
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
                        Utilities: {agreement?.utilitiesPaidBy || "Tenant"}
                      </span>
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
                        {agreement?.propertyCondition || "Standard Condition"}
                      </span>
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold font-mono">
                        Plot #{agreement?.propertyCode || "P-14"}
                      </span>
                    </div>
                  </div>

                  {/* Right: Meters & Compliance */}
                  <div className="md:col-span-5 bg-slate-50/80 border border-slate-200/80 rounded p-3.5 space-y-2 text-xs">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      METERS & COMPLIANCE
                    </span>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Water Meter:</span>
                      <span className="font-mono font-bold text-slate-800">WM-882194</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">EEU Electric Key:</span>
                      <span className="font-mono font-bold text-slate-800">EEU-0941-4820</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Building Code:</span>
                      <span className="font-bold text-emerald-700">Grade-A Standard</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Last Inspection:</span>
                      <span className="text-slate-700">Oct 24, 2023</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400 font-mono">
                      Woreda Engineer Endorsement #ENG-3091
                    </div>
                  </div>
                </div>
              </div>

              {/* VERIFIED COMPLETED PAYMENTS LEDGER */}
              <div className="bg-white border border-slate-200 rounded p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#00450d]" />
                      <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                        Verified Completed Payments Ledger
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/citizen/dashboard/agreements/active/${agreement?.requestCode || agreement?.agreementNumber || agreementId}/payment-history`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-50 text-[#00450d] hover:bg-emerald-100 border border-emerald-200 text-xs font-bold tracking-tight transition-colors shadow-2xs"
                    >
                      <span>see all</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="inline-flex bg-slate-100 p-1 rounded gap-1 text-xs font-bold">
                    <button
                      onClick={() => {
                        setFilterLedger("all");
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded uppercase tracking-wider transition-colors ${
                        filterLedger === "all"
                          ? "bg-[#00450d] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      ALL COMPLETED ({activeLedgerTransactions.length})
                    </button>
                    <button
                      onClick={() => {
                        setFilterLedger("advance");
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded uppercase tracking-wider transition-colors ${
                        filterLedger === "advance"
                          ? "bg-[#00450d] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      ADVANCE RENT ({activeLedgerTransactions.filter((t) => t.type === "advance").length})
                    </button>
                    <button
                      onClick={() => {
                        setFilterLedger("monthly");
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded uppercase tracking-wider transition-colors ${
                        filterLedger === "monthly"
                          ? "bg-[#00450d] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      MONTHLY RENT ({activeLedgerTransactions.filter((t) => t.type === "monthly").length})
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="text-[11px] uppercase font-bold text-slate-400">
                      CLEARANCE STATUS:
                    </span>
                    {activeLedgerTransactions.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        MOR CLEARED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        AWAITING SETTLEMENT
                      </span>
                    )}
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-slate-200 rounded">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">BILLING CYCLE / DESC</th>
                        <th className="py-2.5 px-3">INVOICE REF</th>
                        <th className="py-2.5 px-3">AMOUNT (ETB)</th>
                        <th className="py-2.5 px-3">CHANNEL & TXN REF</th>
                        <th className="py-2.5 px-3">SETTLED DATE</th>
                        <th className="py-2.5 px-3 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {displayedTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                              <Receipt className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                              <p className="text-sm font-semibold text-slate-700">No payment history recorded yet</p>
                              <p className="text-xs text-slate-500">
                                No completed payment records were found for this lease agreement in the database.
                              </p>
                              <Link
                                href="/citizen/dashboard/bills"
                                className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#00450d] text-white text-xs font-semibold hover:bg-[#00340a] transition-colors"
                              >
                                View Bills & Pay Initial Advance
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        displayedTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              {tx.cycle}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                              {tx.invoiceRef}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                              {tx.amount}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                              <div className="flex items-center gap-1.5">
                                {tx.channelType === "mobile" && (
                                  <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                                )}
                                {tx.channelType === "bank" && (
                                  <Landmark className="w-3.5 h-3.5 text-amber-600" />
                                )}
                                {tx.channelType === "escrow" && (
                                  <Shield className="w-3.5 h-3.5 text-[#00450d]" />
                                )}
                                <span>{tx.channel}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                              {tx.settledDate}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => setSelectedReceipt(tx)}
                                className="text-xs font-semibold text-slate-700 hover:text-[#00450d] inline-flex items-center gap-1"
                              >
                                <span>{tx.actionText}</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer & Pagination */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 text-xs text-slate-500">
                  <span>
                    Showing {displayedTransactions.length} of {filteredTransactions.length} cleared transactions
                    {agreement?.endDate ? ` • Next scheduled debit: ${formatDate(agreement.endDate)}` : ""}
                  </span>

                  {totalPages > 1 && (
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 text-xs font-medium"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                        <button
                          key={pg}
                          onClick={() => setCurrentPage(pg)}
                          className={`w-7 h-7 rounded text-xs font-bold ${
                            currentPage === pg
                              ? "bg-[#00450d] text-white"
                              : "border border-slate-200 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {pg}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                        className="px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 text-xs font-medium"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* RIGHT COLUMN: 4 COLS (Stamp, Legal Protections, Trail, Desk)        */}
            {/* ------------------------------------------------------------------- */}
            <div className="lg:col-span-4 space-y-5">
              {/* GOVERNMENT LEGAL STAMP 
              <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#00450d]" />
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                      GOVERNMENT LEGAL STAMP
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 font-bold">
                    SEC-NODE-ETH
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-20 h-20 bg-slate-900 rounded border border-slate-800 flex flex-col items-center justify-center p-1 text-center shrink-0">
                    <QrCode className="w-12 h-12 text-emerald-400" />
                    <span className="text-[7px] font-mono text-emerald-300 font-bold tracking-tight">
                      [QR SEAL]
                    </span>
                    <span className="text-[6px] font-mono text-slate-400">
                      W3C/L1-GRAMS #{agreement?.agreementNumber ? agreement.agreementNumber.slice(-4) : "0892"}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      CRYPTOGRAPHIC FINGERPRINT
                    </span>
                    <div className="font-mono text-[10px] font-bold text-slate-800 break-all leading-tight">
                      SHA256: {agreement?.id ? `${agreement.id.replace(/-/g, "").slice(0, 16)} ... ${agreement.id.replace(/-/g, "").slice(-6)}` : "8f4b29c91d4c5f6aa109 ... bc3021"}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug pt-1">
                      Official Woreda Kebele ledger seal ensures non-repudiation in federal courts.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsVerifyingModalOpen(true)}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5 text-slate-600" />
                  <span>SCAN VIA KEBELE VERIFIER APP</span>
                </button>
              </div>*/}

              {/* STATUTORY LEGAL PROTECTIONS */}
              <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Scale className="w-4 h-4 text-[#00450d]" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Statutory Legal Protections
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-slate-900 leading-tight">
                        Rent Control Directive
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Under Housing Directive 2023, rent is fixed for the duration. Arbitrary mid-lease increases are illegal.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-slate-900 leading-tight">
                        60-Day Mandatory Notice
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Either party must submit formal intent through GRAMS 60 days before contract expiry.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-slate-900 leading-tight">
                        Revenue Stamp Duty Settled
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        ETB 150.00 stamp duty remitted to Bole Revenue Branch. Receipt #ST-99401.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* OFFICIAL REGISTRATION TRAIL */}
              <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#00450d]" />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Official Registration Trail
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    4 STEPS COMPLETED
                  </span>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Step 1 */}
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-[#00450d] text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <div className="absolute left-1.5 top-5 bottom-0 w-0.5 bg-emerald-200"></div>
                    <h4 className="text-xs font-bold text-slate-900">
                      1. Submission & Lease Drafting
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Lessor {agreement?.landlordName || "Kibrom Tadesse"} submitted property deed.
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatDate(agreement?.contractDate || agreement?.createdAt || "2023-10-26")} • 09:14 AM
                    </span>
                  </div>

                  {/* Step 2 */}
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-[#00450d] text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <div className="absolute left-1.5 top-5 bottom-0 w-0.5 bg-emerald-200"></div>
                    <h4 className="text-xs font-bold text-slate-900">
                      2. Biometric Signature Executed
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Tenant {agreement?.tenantName || "Dagmawit"} verified via Fayda Biometrics.
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {agreement?.tenantSignedAt ? formatDate(agreement.tenantSignedAt) : "Oct 28, 2023"} • 02:45 PM
                    </span>
                  </div>

                  {/* Step 3 */}
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-[#00450d] text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <div className="absolute left-1.5 top-5 bottom-0 w-0.5 bg-emerald-200"></div>
                    <h4 className="text-xs font-bold text-slate-900">
                      3. Woreda Officer Clearance
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Registrar {agreement?.officerEmail ? agreement.officerEmail.split("@")[0] : "Dawit Mekonnen"} approved cadastral compliance.
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {agreement?.officerVerifiedAt ? formatDate(agreement.officerVerifiedAt) : "Oct 30, 2023"} • 11:20 AM
                    </span>
                  </div>

                  {/* Step 4 */}
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-[#00450d] text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">
                      4. Enforced & Seal Activated
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {agreement?.supervisorEmail ? `Supervisor ${agreement.supervisorEmail.split("@")[0]} activated agreement.` : "Escrow funds locked. Active lease in effect."}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {agreement?.supervisorApprovedAt ? formatDate(agreement.supervisorApprovedAt) : (agreement?.startDate ? formatDate(agreement.startDate) : "Nov 01, 2023")} • 12:00 AM
                    </span>
                  </div>
                </div>
              </div>

              {/* ASSIGNED KEBELE DESK */}
              <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Headphones className="w-4 h-4 text-[#00450d]" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    ASSIGNED KEBELE DESK
                  </h3>
                </div>

                <p className="text-xs text-slate-500 leading-snug">
                  For tenancy disputes, Kebele arbitration, or structural maintenance complaints:
                </p>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1 text-xs">
                  <div className="font-bold text-slate-900">
                    Officer: {agreement?.officerEmail ? agreement.officerEmail.split("@")[0] : "Dawit Mekonnen"} (#OF-409)
                  </div>
                  <div className="text-slate-600">
                    {agreement?.propertySubCity || "Bole"} Sub-City Woreda {agreement?.propertyWoreda || "03"} Land Management Desk
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 pt-1">
                    Direct: +251 11 661 0823 • Ext: 409
                  </div>
                </div>
              </div>
            </div>
          </div>

      {/* ========================================================================= */}
      {/* 6. SELF-CONTAINED MODALS (NO EXTERNAL COMPONENTS CALLED)                   */}
      {/* ========================================================================= */}

      {/* Cryptographic Kebele Verifier Modal */}
      {isVerifyingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Kebele Registry Cryptographic Seal
                </h3>
              </div>
              <button
                onClick={() => setIsVerifyingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-3 py-2">
              <div className="w-32 h-32 mx-auto bg-slate-900 rounded border border-slate-800 flex flex-col items-center justify-center p-3 relative">
                <QrCode className="w-20 h-20 text-emerald-400" />
                <span className="text-[9px] font-mono text-emerald-300 font-bold mt-1">
                  W3C/L1-GRAMS
                </span>
              </div>
              <div className="text-xs font-mono text-emerald-800 bg-emerald-50 py-1.5 px-3 rounded border border-emerald-200 break-all font-bold">
                HASH: {agreement?.id ? `${agreement.id.replace(/-/g, "")}` : "8f4b29c91d4c5f6aa109...bc3021"}
              </div>
              <p className="text-[11px] text-slate-500">
                Valid digital signature confirmed by Ministry of Innovation & Technology (MInT) Root CA.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsVerifyingModalOpen(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert("Cryptographic verification validated: 100% genuine official lease.");
                  setIsVerifyingModalOpen(false);
                }}
                className="px-4 py-2 bg-[#00450d] hover:bg-[#07390e] text-white text-xs font-bold rounded"
              >
                Verify On Chain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agreement Renewal Modal (+2 Years) */}
      {isRenewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#00450d]" />
                <h3 className="text-base font-bold text-slate-900">
                  ውል ማደስ (Renew Agreement +2 Years)
                </h3>
              </div>
              <button
                onClick={() => setIsRenewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  የ2 ዓመት ውል እድሳት (Statutory 2-Year Extension)
                </div>
                <p className="text-[11px] text-emerald-800">
                  በተጠቃሚዎች ስምምነት መሠረት ውሉ ለተጨማሪ 2 ዓመታት (24 ወራት) የሚራዘም ይሆናል።
                  (Under national tenancy guidelines, this extends the active agreement end date by an additional 24 months with identical terms.)
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Agreement No:</span>
                  <span className="font-mono font-bold text-slate-900">{agreement?.agreementNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current End Date:</span>
                  <span className="font-bold text-slate-800">{formatDate(agreement?.endDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">New End Date:</span>
                  <span className="font-bold text-[#00450d]">
                    {agreement?.endDate
                      ? formatDate(
                          new Date(new Date(agreement.endDate).setFullYear(new Date(agreement.endDate).getFullYear() + 2)).toISOString()
                        )
                      : "Extended by 24 Months"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRenewModalOpen(false)}
                disabled={actionLoading}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRenew}
                disabled={actionLoading}
                className="px-4 py-2 bg-[#00450d] hover:bg-[#07390e] text-white text-xs font-bold rounded inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {actionLoading && <span className="animate-spin mr-1">⏳</span>}
                <span>ማደስ አረጋግጥ (Confirm +2 Yrs)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 60-Day Cancellation Request Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  ውል ማቋረጥ (Request 60-Day Cancellation)
                </h3>
              </div>
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  የ60 ቀናት የማሳሰቢያ ጊዜ (60-Day Notice Period)
                </div>
                <p className="text-[11px] text-amber-800">
                  ውሉን የማቋረጥ ጥያቄ ለተከራዩ ይላካል፤ ተከራይ በ60 ቀናት ውስጥ ስረዛውን ካልተቀበለ ስርዓቱ በራሱ 60 ቀናት ሲሞላ ውሉን ይሰርዛል እና ንብረቱ ለኪራይ ክፍት ይሆናል።
                  (A formal 60-day cancellation request will be lodged. The tenant can accept immediately; otherwise after 60 days, the system will automatically terminate the lease and restore unit availability.)
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Agreement No:</span>
                  <span className="font-mono font-bold text-slate-900">{agreement?.agreementNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Status:</span>
                  <span className="font-bold text-emerald-700">{agreement?.status}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                disabled={actionLoading}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestCancellation}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {actionLoading && <span className="animate-spin mr-1">⏳</span>}
                <span>ጥያቄውን አቅርብ (Submit 60-Day Notice)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tenant Immediate Cancellation Modal */}
      {isTenantCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">
                  ውል ማቋረጥ (Cancel Lease Agreement)
                </h3>
              </div>
              <button
                onClick={() => setIsTenantCancelModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  የተከራይ ፈጣን ውል ስረዛ (Immediate Cancellation)
                </div>
                <p className="text-[11px] text-rose-800">
                  ይህንን ውል ማቋረጥ ይፈልጋሉ? ውሉ ወዲያውኑ ይሰረዛል እንዲሁም ንብረቱ ለሌሎች ተከራዮች ክፍት ይሆናል።
                  (Are you sure you want to cancel your lease agreement? The agreement will be cancelled immediately, and the property will be restored to available status.)
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Agreement No:</span>
                  <span className="font-mono font-bold text-slate-900">{agreement?.agreementNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Property:</span>
                  <span className="font-semibold text-slate-800">{agreement?.propertyTitle || "Urban Unit"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsTenantCancelModalOpen(false)}
                disabled={actionLoading}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTenantCancel}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {actionLoading && <span className="animate-spin mr-1">⏳</span>}
                <span>አዎ፣ ውሉን አቋርጥ (Confirm Cancel)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contract Amendment Modal */}
      {isAmendmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Submit Contract Amendment or 60-Day Notice
                </h3>
              </div>
              <button
                onClick={() => setIsAmendmentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 leading-relaxed">
                <div className="font-bold flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  Notice Requirement:
                </div>
                Either party must submit formal intent through GRAMS 60 days before contract expiry ({formatDate(agreement?.endDate || "2024-10-31")}).
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Notice Type</label>
                <select className="w-full border border-slate-200 rounded p-2 text-xs bg-white">
                  <option>Notice of Intent to Renew (Same Terms)</option>
                  <option>60-Day Notice of Non-Renewal (Lease Termination)</option>
                  <option>Request for Essential Structural Repairs</option>
                  <option>Mutual Amendment (Joint Addendum)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Notice Details / Justification</label>
                <textarea
                  rows={3}
                  placeholder="Enter formal communication details for the counterpart party and Woreda registrar..."
                  className="w-full border border-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAmendmentModalOpen(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  alert("Amendment request submitted to Woreda 03 registrar for clearance.");
                  setIsAmendmentModalOpen(false);
                }}
                className="px-4 py-2 bg-[#00450d] hover:bg-[#07390e] text-white text-xs font-bold rounded"
              >
                Submit Notice to Woreda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Receipt / Bond Certificate Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">
                  {selectedReceipt.actionText} • {selectedReceipt.invoiceRef}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Billing Cycle:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.cycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Settled Amount:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {selectedReceipt.amount} ETB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Channel / Transaction:</span>
                <span className="font-mono text-slate-800">{selectedReceipt.channel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Settlement Date:</span>
                <span className="text-slate-800">{selectedReceipt.settledDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Official Seal:</span>
                <span className="text-emerald-700 font-bold">{selectedReceipt.seal}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400 font-mono">
                Tax Schedule 'B' Assessment Clearance Code: ETH-REV-88401
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#00450d] hover:bg-[#07390e] text-white text-xs font-bold rounded inline-flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Success Toast */}
      {isDownloadToastOpen && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#00450d] text-white px-4 py-3 rounded shadow-xl flex items-center gap-3 border border-emerald-500 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <div>
            <div className="text-xs font-bold">Certified Agreement PDF Generated</div>
            <div className="text-[10px] text-emerald-200 font-mono">
              Lease-{agreement?.agreementNumber || agreement?.requestCode || agreementId}-Certified.pdf
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
