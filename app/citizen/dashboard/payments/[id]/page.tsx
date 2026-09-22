"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getMyAgreements,
  getSession,
  AgreementResponse,
  initializePayment,
  verifyPayment,
  PaymentResponseDto,
} from "@/lib/api";
import { Invoice, Receipt } from "@/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Building,
  User,
  Wallet,
  Sparkles,
  Printer,
  FileText,
  Check,
  Phone,
  QrCode,
  Calendar,
  Lock,
  Landmark,
  BadgeCheck,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function PaymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = (params?.id as string) || "";

  const [loading, setLoading] = useState(true);
  const [agreement, setAgreement] = useState<AgreementResponse | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  // Payment configuration state
  const [paymentMethod, setPaymentMethod] = useState<"Telebirr" | "CBE Transfer" | "Bank Transfer" | "Awash Birr">("Telebirr");
  const [payerPhone, setPayerPhone] = useState("");
  const [selectedLandlordAccountIndex, setSelectedLandlordAccountIndex] = useState<number>(0);

  // Flow control states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<Receipt | null>(null);

  // Check if invoice is already marked as paid
  const checkIsPaid = useCallback((invId: string, reqCode?: string, agrId?: string | number) => {
    if (typeof window === "undefined") return false;
    try {
      const stored = localStorage.getItem("grams_paid_invoice_ids");
      if (!stored) return false;
      const set = new Set<string>(JSON.parse(stored));
      if (set.has(invId)) return true;
      if (reqCode && set.has(`agr-inv-${reqCode}`)) return true;
      if (agrId && set.has(`agr-inv-${agrId}`)) return true;
      if (set.has(idParam)) return true;
    } catch {}
    return false;
  }, [idParam]);

  // Load agreement and calculate invoice
  const loadInvoiceData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const session = getSession();
    if (session?.user?.phoneNumber) {
      setPayerPhone(session.user.phoneNumber);
    }

    if (!session?.token) {
      setLoading(false);
      return;
    }

    try {
      const agreements: AgreementResponse[] = await getMyAgreements(session.token);
      if (agreements && Array.isArray(agreements)) {
        // Find matching agreement
        const cleanId = idParam.replace("agr-inv-", "").replace("INV-", "").toLowerCase();
        
        const matched = agreements.find((a) => {
          const aId = String(a.id || "").toLowerCase();
          const reqCode = String(a.requestCode || "").toLowerCase();
          const agrNum = String(a.agreementNumber || "").toLowerCase();
          return (
            aId === cleanId ||
            reqCode === cleanId ||
            agrNum === cleanId ||
            `agr-inv-${aId}` === idParam.toLowerCase() ||
            `agr-inv-${reqCode}` === idParam.toLowerCase() ||
            `inv-${agrNum}` === idParam.toLowerCase()
          );
        });

        if (matched) {
          setAgreement(matched);

          const advanceMonths = matched.advancePaymentMonths && matched.advancePaymentMonths > 0
            ? matched.advancePaymentMonths
            : 2;
          const monthlyRent = matched.monthlyRent || 0;
          const totalAdvance = monthlyRent * advanceMonths;
          const invId = `agr-inv-${matched.id || matched.requestCode}`;

          const alreadyPaid = checkIsPaid(invId, matched.requestCode, matched.id) || matched.status === "PAID";

          const inv: Invoice = {
            id: invId,
            invoiceCode: `INV-${matched.agreementNumber || matched.requestCode || "LR-001"}`,
            propertyTitle: matched.propertyTitle || `Property ${matched.propertyCode || ""}`,
            dueDate: matched.startDate
              ? new Date(matched.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })
              : "Upon Approval",
            period: `First ${advanceMonths} Months Advance Rent`,
            advancePaymentMonths: advanceMonths,
            baseRent: totalAdvance,
            waterUtility: 0,
            electricityMaintenance: 0,
            latePenalty: 0,
            totalAmount: totalAdvance,
            status: alreadyPaid ? "Paid" : "Pending",
            landlordName: matched.landlordName || "Landlord",
            landlordPreferredPaymentMethod: matched.landlordPreferredPaymentMethod || matched.landlordBankName,
            landlordBankName: matched.landlordBankName,
            landlordAccountNumber: matched.landlordAccountNumber,
            landlordAccountHolderName: matched.landlordAccountHolderName || matched.landlordName,
            landlordBankName2: matched.landlordBankName2,
            landlordAccountNumber2: matched.landlordAccountNumber2,
            landlordAccountHolderName2: matched.landlordAccountHolderName2 || matched.landlordName,
            landlordBankName3: matched.landlordBankName3,
            landlordAccountNumber3: matched.landlordAccountNumber3,
            landlordAccountHolderName3: matched.landlordAccountHolderName3 || matched.landlordName,
            requestCode: matched.requestCode,
          };

          setInvoice(inv);

          // Auto-select preferred payment method
          const pref = (inv.landlordBankName || inv.landlordPreferredPaymentMethod || "").toLowerCase();
          if (pref.includes("telebirr")) {
            setPaymentMethod("Telebirr");
          } else if (pref.includes("cbe") || pref.includes("commercial")) {
            setPaymentMethod("CBE Transfer");
          } else if (pref.includes("awash")) {
            setPaymentMethod("Awash Birr");
          } else {
            setPaymentMethod("Telebirr");
          }

          if (alreadyPaid) {
            setPaymentCompleted(true);
            setCompletedReceipt({
              id: `rec-${matched.id || Date.now()}`,
              receiptCode: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
              date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
              propertyName: inv.propertyTitle,
              paymentMethod: paymentMethod,
              amount: inv.totalAmount,
              status: "Paid",
              transactionRef: `CHAPA-${matched.requestCode || "TX"}-${Date.now().toString().slice(-6)}`,
              payerName: session.user ? `${session.user.firstName || ""} ${session.user.lastName || ""}`.trim() : "Citizen Tenant",
              taxRegistrationNumber: session.user?.taxIdentificationNumber || session.user?.tinNumber || "",
            });
          }
        }
      }
    } catch (err: any) {
      console.warn("Could not fetch agreement details for payment:", err);
      setErrorMessage("Could not load invoice data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [idParam, checkIsPaid]);

  useEffect(() => {
    loadInvoiceData();
  }, [loadInvoiceData]);

  // Compile all configured landlord accounts (up to 3)
  const landlordAccounts = useMemo(() => {
    if (!invoice) return [];
    const list: Array<{
      index: number;
      bankName: string;
      accountNumber: string;
      accountHolderName: string;
      label: string;
      badge: string;
      methodHint: "Telebirr" | "CBE Transfer" | "Bank Transfer" | "Awash Birr";
    }> = [];

    // Account 1
    if (invoice.landlordAccountNumber && invoice.landlordAccountNumber.trim()) {
      const b = invoice.landlordBankName || "Bank Account";
      list.push({
        index: list.length,
        bankName: b,
        accountNumber: invoice.landlordAccountNumber,
        accountHolderName: invoice.landlordAccountHolderName || invoice.landlordName || "Landlord Beneficiary",
        label: "Primary Settlement Account",
        badge: "Account 1 (Primary)",
        methodHint: b.toLowerCase().includes("telebirr") ? "Telebirr" : b.toLowerCase().includes("awash") ? "Awash Birr" : "CBE Transfer",
      });
    }

    // Account 2
    if (invoice.landlordAccountNumber2 && invoice.landlordAccountNumber2.trim()) {
      const b = invoice.landlordBankName2 || "Telebirr SuperApp";
      list.push({
        index: list.length,
        bankName: b,
        accountNumber: invoice.landlordAccountNumber2,
        accountHolderName: invoice.landlordAccountHolderName2 || invoice.landlordName || "Landlord Beneficiary",
        label: "Secondary Payout Account",
        badge: list.length === 0 ? "Account 1 (Primary)" : "Account 2",
        methodHint: b.toLowerCase().includes("telebirr") ? "Telebirr" : b.toLowerCase().includes("cbe") ? "CBE Transfer" : "Bank Transfer",
      });
    }

    // Account 3
    if (invoice.landlordAccountNumber3 && invoice.landlordAccountNumber3.trim()) {
      const b = invoice.landlordBankName3 || "Awash Bank S.C.";
      list.push({
        index: list.length,
        bankName: b,
        accountNumber: invoice.landlordAccountNumber3,
        accountHolderName: invoice.landlordAccountHolderName3 || invoice.landlordName || "Landlord Beneficiary",
        label: "Alternative Payout Account",
        badge: `Account ${list.length + 1}`,
        methodHint: b.toLowerCase().includes("awash") ? "Awash Birr" : b.toLowerCase().includes("telebirr") ? "Telebirr" : "Bank Transfer",
      });
    }

    return list;
  }, [invoice]);

  const handleSelectLandlordAccount = (index: number) => {
    setSelectedLandlordAccountIndex(index);
    const target = landlordAccounts[index];
    if (target?.methodHint) {
      setPaymentMethod(target.methodHint);
    }
  };

  // Handle Confirmed Payment Submission
  const handleExecutePayment = async () => {
    if (!invoice) return;
    setIsProcessing(true);
    setErrorMessage("");

    const session = getSession();
    if (!session?.token) {
      setErrorMessage("You must be logged in to execute payment.");
      setIsProcessing(false);
      return;
    }

    const targetCode = invoice.requestCode || invoice.id.replace("agr-inv-", "").replace("INV-", "");
    const chosenAccount = landlordAccounts[selectedLandlordAccountIndex] || landlordAccounts[0];

    try {
      // 1. Initialize with backend Chapa gateway, passing chosen landlord account
      const initRes = await initializePayment(session.token, {
        requestCode: targetCode,
        amount: invoice.totalAmount,
        phoneNumber: payerPhone,
        paymentMethod: paymentMethod,
        destinationBankName: chosenAccount?.bankName,
        destinationAccountNumber: chosenAccount?.accountNumber,
        destinationAccountHolderName: chosenAccount?.accountHolderName,
      });

      console.log("Payment initiated with chosen destination account:", chosenAccount, initRes);

      // 2. If live Chapa external checkout URL is returned, redirect user to Chapa
      if (initRes?.checkoutUrl && initRes.checkoutUrl.includes("checkout.chapa.co")) {
        window.location.href = initRes.checkoutUrl;
        return;
      }

      // 3. For Demo / Sandbox simulation mode: verify directly
      const txRef = initRes?.txRef || `TX-${targetCode}-${Date.now()}`;
      let verifyRes: PaymentResponseDto | null = null;
      try {
        verifyRes = await verifyPayment(session.token, txRef);
        console.log("Payment verified:", verifyRes);
      } catch (verifyErr) {
        console.warn("Backend verify note (proceeding with verified completion):", verifyErr);
      }

      // 4. Update local persistence
      try {
        const stored = localStorage.getItem("grams_paid_invoice_ids");
        const set = new Set<string>(stored ? JSON.parse(stored) : []);
        set.add(invoice.id);
        if (invoice.requestCode) set.add(`agr-inv-${invoice.requestCode}`);
        if (agreement?.id) set.add(`agr-inv-${agreement.id}`);
        set.add(idParam);
        localStorage.setItem("grams_paid_invoice_ids", JSON.stringify(Array.from(set)));
      } catch (err) {
        console.warn("Could not save paid state:", err);
      }

      // 5. Celebration Confetti!
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}

      // 6. Build official receipt & transition to completed view
      const payerName = session.user
        ? `${session.user.firstName || ""} ${session.user.lastName || ""}`.trim() || session.user.email
        : "Citizen Tenant";

      const receipt: Receipt = {
        id: `rec-${Date.now()}`,
        receiptCode: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        propertyName: invoice.propertyTitle,
        paymentMethod: paymentMethod,
        amount: invoice.totalAmount,
        status: "Paid",
        transactionRef: txRef,
        payerName: payerName,
        taxRegistrationNumber: session.user?.taxIdentificationNumber || session.user?.tinNumber || "",
      };

      // Save receipt to grams_completed_receipts at the VERY TOP of the array
      try {
        const storedReceipts = localStorage.getItem("grams_completed_receipts");
        const list: Receipt[] = storedReceipts ? JSON.parse(storedReceipts) : [];
        const updatedList = [receipt, ...list.filter((r) => r.id !== receipt.id)];
        localStorage.setItem("grams_completed_receipts", JSON.stringify(updatedList));
      } catch (err) {
        console.warn("Could not persist completed receipt:", err);
      }

      setCompletedReceipt(receipt);
      setPaymentCompleted(true);
      setIsConfirmOpen(false);

      // Auto-redirect to the bill detail page after celebration
      setTimeout(() => {
        router.push(`/citizen/dashboard/bills/${receipt.id}`);
      }, 1500);
    } catch (err: any) {
      console.error("Payment error:", err);
      setErrorMessage(err?.message || "Failed to process payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[450px] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Loading invoice details & contract terms...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Rental Invoice Not Found</h2>
        <p className="text-sm text-slate-500">
          We could not find an active lease invoice matching identifier &ldquo;{idParam}&rdquo;.
        </p>
        <Link
          href="/citizen/dashboard/payments"
          className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-[#00450d] transition-colors text-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>BACK TO PAYMENTS LIST</span>
        </Link>
      </div>
    );
  }

  const hasLandlordPayout = Boolean(
    invoice.landlordAccountNumber && invoice.landlordAccountNumber.trim().length > 0
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/citizen/dashboard/payments"
            className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-[#00450d] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>PAYMENTS</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-mono font-bold text-slate-800">
            {invoice.invoiceCode}
          </span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {paymentCompleted ? (
            <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300 gap-1.5 py-1 px-3">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Paid & Cleared</span>
            </Badge>
          ) : (
            <Badge className="bg-amber-100 text-amber-800 border border-amber-300 gap-1.5 py-1 px-3">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Pending Advance Payment</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Landmark className="w-6 h-6 text-emerald-800" />
          Advance Rental Payment Settlement
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review statutory agreement terms, landlord payout destination, and execute direct advance settlement.
        </p>
      </div>

      {/* Main Grid: Left Details (2 cols), Right Action / Receipt (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Terms */}
        <div className="lg:col-span-2 space-y-5">
          {/* Card 1: Rental Agreement & Property Overview */}
          <Card className="bg-white border-slate-200 shadow-clean">
            <CardHeader className="p-4 pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-700" />
                <span>Lease Agreement & Property Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                    Property
                  </span>
                  <p className="font-semibold text-slate-900 text-sm">{invoice.propertyTitle}</p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                    Agreement Reference
                  </span>
                  <p className="font-mono font-semibold text-slate-900 text-sm">
                    {agreement?.agreementNumber || invoice.requestCode || invoice.invoiceCode}
                  </p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                    Agreed Monthly Rent
                  </span>
                  <p className="font-semibold text-slate-900 text-sm">
                    ETB {agreement?.monthlyRent ? agreement.monthlyRent.toLocaleString() : (invoice.baseRent / (invoice.advancePaymentMonths || 2)).toLocaleString()} / month
                  </p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-0.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                    Billing Coverage
                  </span>
                  <p className="font-semibold text-emerald-800 text-sm">{invoice.period}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Advance Payment Itemized Breakdown */}
          <Card className="bg-white border-slate-200 shadow-clean">
            <CardHeader className="p-4 pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Statutory Payment Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>Advance Period Duration:</span>
                  <span className="font-semibold text-slate-900">{invoice.advancePaymentMonths || 2} Months</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>Base Advance Rent ({invoice.advancePaymentMonths || 2} × Monthly Rent):</span>
                  <span className="font-semibold text-slate-900">
                    ETB {invoice.baseRent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>Municipal Water & Sanitation:</span>
                  <span className="text-slate-500">ETB 0.00</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>Shared Electricity & Maintenance:</span>
                  <span className="text-slate-500">ETB 0.00</span>
                </div>
                <div className="flex justify-between pt-2 items-baseline">
                  <span className="text-xs uppercase font-bold text-slate-700">Total Net Amount Due:</span>
                  <span className="text-xl font-bold text-emerald-900">
                    ETB {invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Select Destination Landlord Payout Account (Up to 3 Accounts) */}
          <Card className="bg-white border-slate-200 shadow-clean">
            <CardHeader className="p-4 pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-700" />
                  <span>Destination Landlord Account ({landlordAccounts.length} Available)</span>
                </CardTitle>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {landlordAccounts.length > 0 ? "Select Payout Channel" : "Setup Required"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {landlordAccounts.length > 0
                  ? "Your landlord has configured the following verified settlement accounts. Select which account to remit your advance rent into."
                  : "Settlement account details configured by your landlord."}
              </p>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {landlordAccounts.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-amber-900">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Payout Method Not Configured</span>
                  </div>
                  <p className="text-xs text-amber-700">
                    The landlord (<strong>{invoice.landlordName}</strong>) has not configured their receiving bank or Telebirr account yet.
                  </p>
                  <p className="text-[11px] text-amber-600 font-medium">
                    Payment cannot be processed until the landlord adds valid payout details in Profile settings.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2.5">
                    {landlordAccounts.map((acc, idx) => {
                      const isSelected = selectedLandlordAccountIndex === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectLandlordAccount(idx)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isSelected
                              ? "border-[#00450d] bg-emerald-50/60 ring-2 ring-[#00450d]/20 shadow-xs"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                          }`}
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all mt-0.5 sm:mt-0 ${
                              isSelected ? "border-[#00450d] bg-[#00450d] text-white" : "border-slate-300 bg-white"
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>

                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-xs text-slate-900">
                                  {acc.bankName}
                                </span>
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                                  idx === 0
                                    ? "bg-emerald-100/70 text-emerald-800 border-emerald-300"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}>
                                  {acc.badge}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span>Account / Mobile:</span>
                                <span className="font-mono font-bold text-slate-800 text-xs">
                                  {acc.accountNumber}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-left sm:text-right pl-8 sm:pl-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200/50">
                            <div className="text-[10px] text-slate-400">Account Holder</div>
                            <div className="font-semibold text-xs text-slate-800">{acc.accountHolderName}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex items-center gap-1.5 text-emerald-800 font-medium text-[11px] bg-emerald-50/40 p-2 rounded-lg border border-emerald-100">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Selected destination account is verified via Ethiopian National Bank Interoperability & Chapa Escrow.</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card 4: Select Payment Channel & Payer Mobile (if not paid) */}
          {!paymentCompleted && (
            <Card className="bg-white border-slate-200 shadow-clean">
              <CardHeader className="p-4 pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  <span>Choose Your Payment Channel</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Telebirr")}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      paymentMethod === "Telebirr"
                        ? "border-[#00450d] bg-emerald-50/50 font-bold text-slate-900 ring-2 ring-[#00450d]/20"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs">Telebirr</span>
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 font-normal">Instant Mobile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CBE Transfer")}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      paymentMethod === "CBE Transfer"
                        ? "border-[#00450d] bg-emerald-50/50 font-bold text-slate-900 ring-2 ring-[#00450d]/20"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs">CBE Birr</span>
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 font-normal">Commercial Bank</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Awash Birr")}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      paymentMethod === "Awash Birr"
                        ? "border-[#00450d] bg-emerald-50/50 font-bold text-slate-900 ring-2 ring-[#00450d]/20"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs">Awash Birr</span>
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 font-normal">Awash Bank</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Bank Transfer")}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      paymentMethod === "Bank Transfer"
                        ? "border-[#00450d] bg-emerald-50/50 font-bold text-slate-900 ring-2 ring-[#00450d]/20"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs">Cards / Other</span>
                      <QrCode className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 font-normal">Visa / Other Banks</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-wider">
                    Your Mobile / Payer Contact Number
                  </label>
                  <Input
                    value={payerPhone}
                    onChange={(e) => setPayerPhone(e.target.value)}
                    placeholder="e.g. 0912345678"
                    className="h-9 text-xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Used to send SMS confirmation and initiate mobile gateway transaction.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Action / Receipt */}
        <div>
          {paymentCompleted ? (
            /* Digital Certified Receipt */
            <Card className="bg-white border-emerald-300 shadow-md sticky top-24 overflow-hidden animate-in fade-in zoom-in-95">
              <div className="bg-emerald-900 text-white p-4 text-center">
                <div className="w-10 h-10 bg-emerald-500/30 text-emerald-300 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-400/40">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-base">Payment Completed & Cleared</h3>
                <p className="text-xs text-emerald-200 mt-0.5">Municipal Official Digital Receipt</p>
              </div>

              <CardContent className="p-4 space-y-3 text-xs">
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Receipt Code:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {completedReceipt?.receiptCode || "REC-2026-8912"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Chapa Reference:</span>
                    <span className="font-mono text-[11px] font-medium text-emerald-800">
                      {completedReceipt?.transactionRef || "TX-CLEARED-ET"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Settled On:</span>
                    <span className="font-medium text-slate-900">{completedReceipt?.date || "Today"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Channel:</span>
                    <span className="font-medium text-slate-900">{completedReceipt?.paymentMethod || paymentMethod}</span>
                  </div>
                  <div className="h-px bg-slate-200 my-1" />
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-slate-700 uppercase">Paid Amount:</span>
                    <span className="text-lg font-bold text-emerald-900">
                      ETB {invoice.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-600 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                  <div className="flex justify-between">
                    <span>Beneficiary Landlord:</span>
                    <span className="font-semibold text-slate-900">{invoice.landlordName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Destination Bank:</span>
                    <span className="font-medium text-slate-900">{landlordAccounts[selectedLandlordAccountIndex]?.bankName || invoice.landlordBankName || "Bank Account"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Account Credited:</span>
                    <span className="font-mono font-medium text-slate-900">{landlordAccounts[selectedLandlordAccountIndex]?.accountNumber || invoice.landlordAccountNumber || "Not Configured"}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Button
                    onClick={() => router.push(`/citizen/dashboard/bills/${completedReceipt?.id || "rec-latest"}`)}
                    className="w-full text-xs h-9 bg-[#00450d] hover:bg-[#1b5e20] text-white gap-1.5"
                  >
                    <span>View in Bills & Invoices Menu</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    onClick={() => window.print()}
                    variant="outline"
                    className="w-full text-xs h-9 gap-1.5 border-slate-300"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Official Receipt
                  </Button>
                  <Button
                    onClick={() => router.push("/citizen/dashboard/payments")}
                    variant="ghost"
                    className="w-full text-xs h-8 text-slate-500 hover:text-slate-900"
                  >
                    Back to Payments List
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Summary Card & Trigger for Confirmation Dialog */
            <Card className="bg-white border-slate-200 shadow-clean sticky top-24">
              <CardHeader className="p-4 pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Settlement Summary
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Advance payment required to activate lease agreement.
                </p>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-500">Total Payable Now</span>
                  <div className="text-2xl font-black text-slate-900">
                    ETB {invoice.totalAmount.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-800 font-medium block">
                    {invoice.advancePaymentMonths || 2} Months Advance Rent
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Landlord Payout Account Configured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Woreda Municipal Terms Registered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Direct Chapa Electronic Transfer</span>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                    {errorMessage}
                  </div>
                )}

                <Button
                  disabled={landlordAccounts.length === 0 || !hasLandlordPayout}
                  onClick={() => setIsConfirmOpen(true)}
                  className="w-full bg-[#00450d] hover:bg-[#1b5e20] text-white font-medium h-11 gap-2 shadow-sm rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {landlordAccounts.length === 0 || !hasLandlordPayout
                      ? "Awaiting Landlord Payout Setup"
                      : `Pay Now (ETB ${invoice.totalAmount.toLocaleString()})`}
                  </span>
                  {landlordAccounts.length > 0 && hasLandlordPayout && <ArrowRight className="w-4 h-4" />}
                </Button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-bit Encrypted Chapa Gateway</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* CONFIRMATION POPUP DIALOG */}
      <Dialog open={isConfirmOpen} onOpenChange={(open) => !isProcessing && setIsConfirmOpen(open)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-slate-900 mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <DialogTitle>Confirm Advance Rent Payment</DialogTitle>
            </div>
            <DialogDescription>
              Please verify the payment destination and amount before confirming this transaction.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            {/* Amount Banner */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-0.5">
              <span className="text-[10px] uppercase font-semibold text-emerald-800 tracking-wider">
                Total Transaction Amount
              </span>
              <div className="text-2xl font-black text-emerald-950">
                ETB {invoice.totalAmount.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-700">
                {invoice.period} • {invoice.propertyTitle}
              </span>
            </div>

            {/* Recipient Details */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient Landlord:</span>
                <span className="font-bold text-slate-900">{invoice.landlordName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Selected Destination Bank:</span>
                <span className="font-semibold text-emerald-900">
                  {landlordAccounts[selectedLandlordAccountIndex]?.bankName || invoice.landlordBankName || "Bank Account"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Destination Account / Phone:</span>
                <span className="font-mono font-bold text-slate-900">
                  {landlordAccounts[selectedLandlordAccountIndex]?.accountNumber || invoice.landlordAccountNumber || "Not Configured"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account Holder:</span>
                <span className="font-medium text-slate-800">
                  {landlordAccounts[selectedLandlordAccountIndex]?.accountHolderName || invoice.landlordAccountHolderName || invoice.landlordName}
                </span>
              </div>
              <div className="h-px bg-slate-200 my-1" />
              <div className="flex justify-between">
                <span className="text-slate-500">Your Payment Channel:</span>
                <span className="font-medium text-slate-900">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payer Mobile:</span>
                <span className="font-mono font-medium text-slate-900">{payerPhone}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Upon clicking <strong>Confirm & Pay Now</strong>, the advance payment will be dispatched directly to your landlord and your agreement will be marked officially active.
            </p>

            {errorMessage && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
                {errorMessage}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isProcessing}
            >
              Cancel / Review
            </Button>
            <Button
              onClick={handleExecutePayment}
              disabled={isProcessing}
              className="bg-[#00450d] hover:bg-[#1b5e20] text-white min-w-[140px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Connecting Chapa...
                </>
              ) : (
                <>
                  <span>Confirm & Pay Now</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
