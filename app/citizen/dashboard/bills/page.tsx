"use client";

import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";

import { useCitizenData } from "@/hooks/useCitizenData";
import { getMyAgreements, getSession, AgreementResponse } from "@/lib/api";

interface BillsPageProps {
  receipts?: Receipt[];
  onViewReceipt?: (receipt: Receipt) => void;
}

export const BillsPage: React.FC<BillsPageProps> = (props) => {
  const router = useRouter();
  const context = useCitizenData();

  // Load dynamically created payment receipts from localStorage
  const [completedReceipts, setCompletedReceipts] = useState<Receipt[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("grams_completed_receipts");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [];
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("grams_completed_receipts");
      if (stored) setCompletedReceipts(JSON.parse(stored));
    } catch {}

    // Also fetch any backend agreements in PAID status and ensure they appear in Bills & Invoices
    const session = getSession();
    if (session?.token) {
      getMyAgreements(session.token)
        .then((agrs) => {
          if (Array.isArray(agrs)) {
            const paidAgrs = agrs.filter((a) => a.status === "PAID");
            if (paidAgrs.length > 0) {
              setCompletedReceipts((prev) => {
                const seen = new Set(prev.map((r) => r.id));
                const added: Receipt[] = [];
                paidAgrs.forEach((a) => {
                  const recId = `rec-${a.requestCode}`;
                  if (!seen.has(recId)) {
                    seen.add(recId);
                    const advMonths = a.advancePaymentMonths || 2;
                    added.push({
                      id: recId,
                      receiptCode: `REC-${a.agreementNumber || a.requestCode}`,
                      date: a.startDate
                        ? new Date(a.startDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
                        : new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
                      propertyName: a.propertyTitle || `Property ${a.propertyCode || ""}`,
                      paymentMethod: (a.landlordPreferredPaymentMethod || "Telebirr") as any,
                      amount: (a.monthlyRent || 0) * advMonths,
                      status: "Paid",
                      transactionRef: `ET-RENT-${a.requestCode}`,
                      payerName: a.tenantName || "Citizen Tenant",
                      taxRegistrationNumber: "ET-TIN-00892418",
                    });
                  }
                });
                return [...added, ...prev];
              });
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  // Combine receipts, placing newly completed receipts at the VERY TOP
  const combinedReceipts = useMemo(() => {
    const base = props.receipts || context.receipts;
    const seen = new Set<string>();
    const result: Receipt[] = [];

    // 1. Newly completed receipts ALWAYS AT THE TOP
    completedReceipts.forEach((r) => {
      if (!seen.has(r.id)) {
        seen.add(r.id);
        result.push(r);
      }
    });

    // 2. Base / Mock receipts
    base.forEach((r) => {
      if (!seen.has(r.id)) {
        seen.add(r.id);
        result.push(r);
      }
    });

    return result;
  }, [completedReceipts, props.receipts, context.receipts]);

  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Extract all unique properties for filter
  const propertyOptions = useMemo(() => {
    return Array.from(new Set(combinedReceipts.map((r) => r.propertyName))).filter(Boolean);
  }, [combinedReceipts]);

  const currentYearStr = new Date().getFullYear().toString();
  const totalPaidThisYear = useMemo(() => {
    return combinedReceipts
      .filter((r) => r.date.includes(currentYearStr) || selectedYear === "all")
      .reduce((sum, r) => sum + r.amount, 0);
  }, [combinedReceipts, currentYearStr, selectedYear]);

  const filteredReceipts = combinedReceipts.filter((rec) => {
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

  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage) || 1;
  const paginatedReceipts = filteredReceipts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      

      {/* Summary KPI Banner */}
      <Card className="bg-white border-slate-200 shadow-clean">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <ReceiptIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Paid In 2024
              </span>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                ETB {totalPaidThisYear.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                All payments recorded with Ministry of Revenues clearance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="text-xs gap-1.5 h-8"
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
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 shadow-2xs"
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="all">All Years</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase">Property:</span>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 shadow-2xs"
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8.5 h-8 text-xs"
          />
        </div>
      </div>

      {/* Receipts Table */}
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
                  <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-400">
                    No receipts found for the selected filter.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedReceipts.map((rec) => {
                  const isNew = completedReceipts.some((c) => c.id === rec.id);

                  return (
                    <TableRow
                      key={rec.id}
                      onClick={() => router.push(`/citizen/dashboard/bills/${rec.id}`)}
                      className={`cursor-pointer transition-colors hover:bg-slate-50/80 ${
                        isNew ? "bg-emerald-50/40 font-medium" : ""
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
                          className="text-xs h-7 font-medium gap-1 px-2.5 hover:bg-emerald-50 hover:text-emerald-800 border-slate-200"
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
                className="h-7 w-7 p-0"
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
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillsPage;
