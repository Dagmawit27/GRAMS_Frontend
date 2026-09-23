"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Receipt } from "@/types";
import { getSession, getMyPayments, getMyAgreements } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Receipt as ReceiptIcon,
  Printer,
  Download,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Building,
  User,
  Wallet,
  Calendar,
  Star,
  FileText,
  ExternalLink,
} from "lucide-react";

export default function BillDetailPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = (params?.id as string) || "";

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!idParam) {
      setLoading(false);
      return;
    }

    async function resolveReceipt() {
      const paramLower = idParam.toLowerCase();

      const matchesReceipt = (r: Receipt) => {
        return (
          r.id?.toLowerCase() === paramLower ||
          r.receiptCode?.toLowerCase() === paramLower ||
          r.transactionRef?.toLowerCase() === paramLower ||
          idParam.includes(r.id) ||
          (r.id && paramLower.includes(r.id.toLowerCase()))
        );
      };

      // 1. Check localStorage for dynamically generated paid receipts
      try {
        const stored = localStorage.getItem("grams_completed_receipts");
        if (stored) {
          const list: Receipt[] = JSON.parse(stored);
          if (Array.isArray(list)) {
            const found = list.find(matchesReceipt);
            if (found) {
              if (isMounted) {
                setReceipt(found);
                setLoading(false);
              }
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Could not read stored receipts:", err);
      }

      // 2. Query backend payments if session exists
      const session = getSession();
      const token = session?.token;
      if (token) {
        try {
          const payments = await getMyPayments(token);
          if (Array.isArray(payments)) {
            for (const p of payments) {
              if (p.status === "COMPLETED") {
                const recId = `rec-${p.txRef || p.id}`;
                const receiptCode = `REC-${p.agreementNumber || p.requestCode || (p.txRef ? p.txRef.slice(-6) : "PAID")}`;
                const txRef = p.txRef || "";

                if (
                  recId.toLowerCase() === paramLower ||
                  receiptCode.toLowerCase() === paramLower ||
                  txRef.toLowerCase() === paramLower ||
                  String(p.id).toLowerCase() === paramLower ||
                  (p.requestCode && p.requestCode.toLowerCase() === paramLower) ||
                  (p.agreementNumber && p.agreementNumber.toLowerCase() === paramLower)
                ) {
                  const formattedDate = p.paymentDate
                    ? new Date(p.paymentDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })
                    : p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })
                    : new Date().toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      });

                  const defaultPayerName = session?.user
                    ? `${session.user.firstName || ""} ${session.user.lastName || ""}`.trim() || session.user.email
                    : "Citizen Tenant";

                  const mappedReceipt: Receipt = {
                    id: recId,
                    receiptCode: receiptCode,
                    date: formattedDate,
                    propertyName: p.propertyTitle || `Leased Property ${p.requestCode || ""}`,
                    paymentMethod: (p.paymentMethod || "Telebirr") as any,
                    amount: p.amount || 0,
                    status: "Paid",
                    transactionRef: txRef,
                    payerName: p.tenantName || defaultPayerName,
                    taxRegistrationNumber:
                      session?.user?.taxIdentificationNumber || session?.user?.tinNumber || "",
                  };

                  if (isMounted) {
                    setReceipt(mappedReceipt);
                    setLoading(false);
                  }
                  return;
                }
              }
            }
          }
        } catch (err) {
          console.warn("Could not query backend payments for bill detail:", err);
        }

        // 3. Query backend agreements if not found in payments
        try {
          const agrs = await getMyAgreements(token);
          if (Array.isArray(agrs)) {
            let paidIdsSet = new Set<string>();
            try {
              const storedPaid = localStorage.getItem("grams_paid_invoice_ids");
              if (storedPaid) paidIdsSet = new Set(JSON.parse(storedPaid));
            } catch {}

            for (const a of agrs) {
              const isSettled =
                a.status === "PAID" ||
                paidIdsSet.has(a.id) ||
                paidIdsSet.has(`agr-inv-${a.id}`) ||
                paidIdsSet.has(a.requestCode) ||
                paidIdsSet.has(`agr-inv-${a.requestCode}`);

              if (isSettled) {
                const recId = `rec-${a.requestCode || a.id}`;
                const receiptCode = `REC-${a.agreementNumber || a.requestCode}`;
                const txRef = `ET-RENT-${a.requestCode}`;

                if (
                  recId.toLowerCase() === paramLower ||
                  receiptCode.toLowerCase() === paramLower ||
                  txRef.toLowerCase() === paramLower ||
                  String(a.id).toLowerCase() === paramLower ||
                  (a.requestCode && a.requestCode.toLowerCase() === paramLower) ||
                  (a.agreementNumber && a.agreementNumber.toLowerCase() === paramLower)
                ) {
                  const advMonths = a.advancePaymentMonths && a.advancePaymentMonths > 0 ? a.advancePaymentMonths : 2;
                  const totalAmount = (a.monthlyRent || 0) * advMonths;

                  const formattedDate = a.startDate
                    ? new Date(a.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })
                    : new Date().toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      });

                  const mappedReceipt: Receipt = {
                    id: recId,
                    receiptCode: receiptCode,
                    date: formattedDate,
                    propertyName: a.propertyTitle || `Property ${a.propertyCode || ""}`,
                    paymentMethod: (a.landlordPreferredPaymentMethod || "Telebirr") as any,
                    amount: totalAmount,
                    status: "Paid",
                    transactionRef: txRef,
                    payerName:
                      a.tenantName ||
                      (session?.user ? `${session.user.firstName || ""} ${session.user.lastName || ""}`.trim() : "Citizen Tenant"),
                    taxRegistrationNumber:
                      session?.user?.taxIdentificationNumber || session?.user?.tinNumber || "",
                  };

                  if (isMounted) {
                    setReceipt(mappedReceipt);
                    setLoading(false);
                  }
                  return;
                }
              }
            }
          }
        } catch (err) {
          console.warn("Could not query backend agreements for bill detail:", err);
        }
      }

      if (isMounted) {
        setReceipt(null);
        setLoading(false);
      }
    }

    resolveReceipt();

    return () => {
      isMounted = false;
    };
  }, [idParam]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="text-sm text-slate-500 font-medium">Loading official receipt...</p>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
          <ReceiptIcon className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Receipt Not Found</h2>
        <p className="text-sm text-slate-500">
          We could not find an official receipt matching identifier &ldquo;{idParam}&rdquo;.
        </p>
        <Link
          href="/citizen/dashboard/bills"
          className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-[#00450d] transition-colors text-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>BACK TO BILLS & INVOICES</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/citizen/dashboard/bills"
            className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-[#00450d] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>BILLS & INVOICES</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-mono font-bold text-slate-800">
            {receipt.receiptCode}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-8 gap-1.5 text-xs text-slate-700 border-slate-300"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Receipt
          </Button>
          <Button
            size="sm"
            onClick={handlePrint}
            className="h-8 gap-1.5 text-xs bg-[#00450d] hover:bg-[#1b5e20] text-white"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Official Printable Receipt Paper Container */}
      <Card className="bg-white border-slate-200 shadow-md overflow-hidden print:shadow-none print:border-none">
        {/* Receipt Header Banner */}
        <div className="bg-[#00380a] text-white p-6 relative overflow-hidden">
          <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none">
            <Star className="w-48 h-48 fill-current text-white" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center text-xs font-bold border border-emerald-400/40">
                  ★
                </div>
                <span className="text-xs uppercase tracking-widest font-semibold text-emerald-200">
                  FDRE HOUSING & REVENUE ADMINISTRATION
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Official Electronic Rent Receipt
              </h1>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Addis Ababa City Municipal Housing Registry & Treasury Bureau
              </p>
            </div>

            <div className="sm:text-right bg-white/10 p-3 rounded-xl border border-white/20 backdrop-blur-xs">
              <span className="text-[10px] uppercase font-semibold text-emerald-200 block">
                Official Receipt No.
              </span>
              <span className="font-mono text-base font-bold text-white tracking-wider">
                {receipt.receiptCode}
              </span>
              <div className="flex items-center sm:justify-end gap-1 text-[10px] text-emerald-300 mt-0.5 font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>PAID & RECORDED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Body */}
        <CardContent className="p-6 sm:p-8 space-y-6 text-xs text-slate-800">
          {/* Main Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-200">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Payment Date & Time
              </span>
              <p className="font-semibold text-slate-900 text-sm">{receipt.date}</p>
              <span className="text-[11px] text-slate-500">Certified Instant Clearing</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Chapa / Transaction Reference
              </span>
              <p className="font-mono font-bold text-emerald-800 text-sm">{receipt.transactionRef}</p>
              <span className="text-[11px] text-slate-500">Direct Gateway Clearing</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Payer / Tenant Citizen
              </span>
              <p className="font-semibold text-slate-900 text-sm">{receipt.payerName}</p>
              <span className="text-[11px] text-slate-500 font-mono">TIN: {receipt.taxRegistrationNumber}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Payment Channel
              </span>
              <p className="font-semibold text-slate-900 text-sm">{receipt.paymentMethod}</p>
              <span className="text-[11px] text-slate-500">Ethiopian Digital Payment Switch</span>
            </div>
          </div>

          {/* Property & Coverage Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Lease Property & Advance Rent Coverage
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Leased Property:</span>
                <span className="font-bold text-slate-900">{receipt.propertyName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Payment Coverage:</span>
                <span className="font-medium text-emerald-800">First 2 Months Advance Rent</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Municipal Lease Status:</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80 text-[11px]">
                  Registered & Active
                </span>
              </div>
            </div>
          </div>

          {/* Financial Settlement Card */}
          <div className="bg-emerald-50/60 p-5 rounded-xl border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                Total Advance Rent Settled
              </span>
              <span className="text-[11px] text-emerald-700">
                Directly transferred to Landlord verified bank/wallet destination
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950">
              ETB {receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Official Security Stamp & Signature Seal */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-800 block">Government Audited & Certified</span>
                <span className="text-[10px] text-slate-400">
                  Electronic stamp verified with Ethiopian Revenue Authorities
                </span>
              </div>
            </div>

            <div className="text-center sm:text-right font-mono text-[10px] text-slate-400">
              <div>STAMP: ET-MIN-REV-2026</div>
              <div>ID: GRAMS-REC-{receipt.id.slice(-8)}</div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-slate-50 p-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2 justify-between print:hidden">
          <Link
            href="/citizen/dashboard/bills"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#00450d] transition-colors py-2 px-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Bills & Invoices</span>
          </Link>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/citizen/dashboard/agreements/active")}
              className="text-xs text-emerald-800 border-emerald-300 hover:bg-emerald-50 flex-1 sm:flex-none"
            >
              View Active Agreements
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="text-xs bg-[#00450d] hover:bg-[#1b5e20] text-white flex-1 sm:flex-none gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Receipt
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
