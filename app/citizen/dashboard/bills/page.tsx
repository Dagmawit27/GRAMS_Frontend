"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Receipt } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Receipt as ReceiptIcon,
  Search,
  Printer,
  ChevronLeft,
  ChevronRight,
  Eye,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import {
  getMyAgreements,
  getMyPayments,
  getSession,
  AgreementResponse,
  PaymentResponseDto,
} from "@/lib/api";
import { sseManager } from "@/lib/sseManager";

interface BillsPageProps {
  receipts?: Receipt[];
  onViewReceipt?: (receipt: Receipt) => void;
}

export const BillsPage: React.FC<BillsPageProps> = (props) => {
  const router = useRouter();

  // Load dynamically created payment receipts from backend & localStorage
  const [completedReceipts, setCompletedReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReceipts = useCallback(async () => {
    const session = getSession();
    const token = session?.token;
    const seen = new Set<string>();
    const receiptsList: Receipt[] = [];

    const addReceipt = (rec: Receipt) => {
      if (!rec || !rec.id) return;
      const key1 = rec.id.toLowerCase();
      const key2 = rec.receiptCode?.toLowerCase();
      const key3 = rec.transactionRef?.toLowerCase();
      if (key1 && seen.has(key1)) return;
      if (key2 && seen.has(key2)) return;
      if (key3 && seen.has(key3)) return;

      if (key1) seen.add(key1);
      if (key2) seen.add(key2);
      if (key3) seen.add(key3);
      receiptsList.push(rec);
    };

    // 1. Load from localStorage (grams_completed_receipts)
    try {
      const stored = localStorage.getItem("grams_completed_receipts");
      if (stored) {
        const parsed: Receipt[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((r) => addReceipt(r));
        }
      }
    } catch {}

    // 2. Fetch from backend getMyPayments
    if (token) {
      try {
        const payments = await getMyPayments(token);
        if (Array.isArray(payments)) {
          payments.forEach((p) => {
            if (p.status === "COMPLETED") {
              const recId = `rec-${p.txRef || p.id}`;
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

              const receipt: Receipt = {
                id: recId,
                receiptCode: `REC-${p.agreementNumber || p.requestCode || (p.txRef ? p.txRef.slice(-6) : "PAID")}`,
                date: formattedDate,
                propertyName: p.propertyTitle || `Leased Property ${p.requestCode || ""}`,
                paymentMethod: (p.paymentMethod || "Telebirr") as any,
                amount: p.amount || 0,
                status: "Paid",
                transactionRef: p.txRef,
                payerName: p.tenantName || defaultPayerName,
                taxRegistrationNumber:
                  session?.user?.taxIdentificationNumber || session?.user?.tinNumber || "",
              };
              addReceipt(receipt);
            }
          });
        }
      } catch (err) {
        console.warn("Could not fetch backend payments:", err);
      }

      // 3. Fetch from backend getMyAgreements to include any settled agreements
      try {
        const agrs = await getMyAgreements(token);
        if (Array.isArray(agrs)) {
          let paidIdsSet = new Set<string>();
          try {
            const storedPaid = localStorage.getItem("grams_paid_invoice_ids");
            if (storedPaid) paidIdsSet = new Set(JSON.parse(storedPaid));
          } catch {}

          agrs.forEach((a) => {
            const isSettled =
              a.status === "PAID" ||
              paidIdsSet.has(a.id) ||
              paidIdsSet.has(`agr-inv-${a.id}`) ||
              paidIdsSet.has(a.requestCode) ||
              paidIdsSet.has(`agr-inv-${a.requestCode}`);

            if (isSettled) {
              const recId = `rec-${a.requestCode || a.id}`;
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

              const receipt: Receipt = {
                id: recId,
                receiptCode: `REC-${a.agreementNumber || a.requestCode}`,
                date: formattedDate,
                propertyName: a.propertyTitle || `Property ${a.propertyCode || ""}`,
                paymentMethod: (a.landlordPreferredPaymentMethod || "Telebirr") as any,
                amount: totalAmount,
                status: "Paid",
                transactionRef: `ET-RENT-${a.requestCode}`,
                payerName:
                  a.tenantName ||
                  (session?.user ? `${session.user.firstName || ""} ${session.user.lastName || ""}`.trim() : "Citizen Tenant"),
                taxRegistrationNumber:
                  session?.user?.taxIdentificationNumber || session?.user?.tinNumber || "",
              };
              addReceipt(receipt);
            }
          });
        }
      } catch (err) {
        console.warn("Could not check agreements for receipts:", err);
      }
    }

    setCompletedReceipts(receiptsList);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  // Real-time synchronization on payment events
  useEffect(() => {
    const session = getSession();
    if (!session?.user?.email) return;

    sseManager.connect(session.user.email);
    const unsubscribeNotification = sseManager.onNotification((notification) => {
      if (
        notification.type === "PAYMENT_COMPLETED" ||
        notification.type === "RENT_PAYMENT_COMPLETED" ||
        notification.type === "RENT_PAYMENT_RECEIVED" ||
        notification.module === "PAYMENT" ||
        notification.message?.toLowerCase().includes("payment")
      ) {
        fetchReceipts();
      }
    });

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "grams_completed_receipts" || e.key === "grams_paid_invoice_ids") {
        fetchReceipts();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      unsubscribeNotification();
      window.removeEventListener("storage", handleStorage);
    };
  }, [fetchReceipts]);

  // Only use props.receipts if explicitly passed, otherwise use strictly completedReceipts (NO MOCK DATA)
  const combinedReceipts = useMemo(() => {
    if (props.receipts && props.receipts.length > 0) {
      return props.receipts;
    }
    return completedReceipts;
  }, [completedReceipts, props.receipts]);

  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Extract all unique properties for filter
  const propertyOptions = useMemo(() => {
    return Array.from(new Set(combinedReceipts.map((r) => r.propertyName))).filter(Boolean);
  }, [combinedReceipts]);

  // Extract all unique years dynamically from receipts
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    const currentYear = new Date().getFullYear().toString();
    years.add(currentYear);
    combinedReceipts.forEach((r) => {
      const match = r.date?.match(/\b(20\d\d)\b/);
      if (match) {
        years.add(match[1]);
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [combinedReceipts]);

  const totalPaidAmount = useMemo(() => {
    return combinedReceipts
      .filter((r) => selectedYear === "all" || r.date.includes(selectedYear))
      .reduce((sum, r) => sum + (r.amount || 0), 0);
  }, [combinedReceipts, selectedYear]);

  const filteredReceipts = useMemo(() => {
    return combinedReceipts.filter((rec) => {
      const matchYear = selectedYear === "all" || rec.date.includes(selectedYear);
      const matchProp =
        selectedProperty === "all" ||
        rec.propertyName.toLowerCase().includes(selectedProperty.toLowerCase());
      const matchSearch =
        rec.receiptCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.transactionRef.toLowerCase().includes(searchQuery.toLowerCase());

      return matchYear && matchProp && matchSearch;
    });
  }, [combinedReceipts, selectedYear, selectedProperty, searchQuery]);

  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage) || 1;
  const paginatedReceipts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReceipts.slice(start, start + itemsPerPage);
  }, [filteredReceipts, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      

      {/* Summary KPI Banner */}
      <Card className="bg-white border-slate-200 shadow-clean">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
              <ReceiptIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {selectedYear === "all" ? "Total Paid (All Time)" : `Total Paid in ${selectedYear}`}
              </span>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                ETB {totalPaidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Official receipts recorded with FDRE Housing &amp; Revenues clearance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              disabled={combinedReceipts.length === 0}
              className="text-xs gap-1.5 h-8 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter Controls Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-clean flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 shadow-2xs cursor-pointer"
            >
              <option value="all">All Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase">Property:</span>
            <select
              value={selectedProperty}
              onChange={(e) => {
                setSelectedProperty(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 shadow-2xs cursor-pointer"
            >
              <option value="all">All Properties</option>
              {propertyOptions.map((prop) => (
                <option key={prop} value={prop}>
                  {prop}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search receipt code, ref..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-8.5 h-8 text-xs"
          />
        </div>
      </div>

      {/* Receipts Table or Empty State */}
      {combinedReceipts.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
            <ReceiptIcon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">No Paid Bills or Receipts Yet</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              You do not have any paid rental bills or completed payment receipts on record. When you complete advance rent settlements, official electronic receipts will be recorded and displayed here.
            </p>
          </div>
          <div className="pt-2">
            <Button
              onClick={() => router.push("/citizen/dashboard/payments")}
              className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-8 px-4 font-bold cursor-pointer gap-1.5 shadow-xs"
            >
              <span>View Bills to Pay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <Card className="bg-white border-slate-200 shadow-clean">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Receipt Code</TableHead>
                  <TableHead>Property Name</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Amount (ETB)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReceipts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-xs text-slate-400">
                      <div>No receipts found matching the selected filter.</div>
                      {(selectedYear !== "all" || selectedProperty !== "all" || searchQuery) && (
                        <button
                          onClick={() => {
                            setSelectedYear("all");
                            setSelectedProperty("all");
                            setSearchQuery("");
                          }}
                          className="mt-2 text-emerald-800 font-semibold underline text-xs cursor-pointer block mx-auto"
                        >
                          Clear filters and view all receipts
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedReceipts.map((rec, idx) => {
                    const isNew = idx === 0 && currentPage === 1;

                    return (
                      <TableRow
                        key={rec.id}
                        onClick={() => router.push(`/citizen/dashboard/bills/${rec.id}`)}
                        className={`cursor-pointer transition-colors hover:bg-slate-50/80 ${
                          isNew ? "bg-emerald-50/30 font-medium" : ""
                        }`}
                      >
                        <TableCell className="text-xs text-slate-600 font-medium">
                          {rec.date}
                        </TableCell>

                        <TableCell className="font-mono font-semibold text-xs text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{rec.receiptCode}</span>
                            {isNew && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-300">
                                <Sparkles className="w-2.5 h-2.5 text-emerald-700" />
                                Latest Paid
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-xs font-medium text-slate-900">
                          {rec.propertyName}
                        </TableCell>

                        <TableCell className="text-xs text-slate-600">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium text-slate-700">
                            {rec.paymentMethod}
                          </span>
                        </TableCell>

                        <TableCell className="font-semibold text-xs text-slate-900">
                          ETB {rec.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>

                        <TableCell>
                          <Badge variant="verified" className="text-[10px]">
                            Paid
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/citizen/dashboard/bills/${rec.id}`);
                            }}
                            className="text-xs h-7 font-medium gap-1 px-2.5 hover:bg-emerald-50 hover:text-emerald-800 border-slate-200 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Receipt
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Showing {filteredReceipts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredReceipts.length)} of {filteredReceipts.length} receipts
                </span>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="h-7 w-7 p-0 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  <span className="px-2 font-medium text-slate-700 text-xs">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="h-7 w-7 p-0 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BillsPage;
