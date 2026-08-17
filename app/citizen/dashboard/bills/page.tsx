"use client";

import React, { useState } from "react";
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
  Eye
} from "lucide-react";

import { useCitizenData } from "@/hooks/useCitizenData";

interface BillsPageProps {
  receipts?: Receipt[];
  onViewReceipt?: (receipt: Receipt) => void;
}

export const BillsPage: React.FC<BillsPageProps> = (props) => {
  const context = useCitizenData();
  const receipts = props.receipts || context.receipts;
  const onViewReceipt = props.onViewReceipt || ((rec) => context.setViewingReceipt(rec));
  const [selectedYear, setSelectedYear] = useState<string>("2024");
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPaidThisYear = receipts.reduce((sum, r) => sum + r.amount, 0);

  const filteredReceipts = receipts.filter((rec) => {
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
      {/* Header Bar */}
      <div className="pb-2 border-b border-slate-200/60">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Bills & Receipts
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          View and download your official Ethiopian Government housing tax and rent receipts.
        </p>
      </div>

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
              <option value="Bole Apt 4B">Bole Apt 4B</option>
              <option value="Kazanchis Office 12">Kazanchis Office 12</option>
              <option value="CMC Summit Villa">CMC Summit Villa</option>
              <option value="Piassa Commercial">Piassa Commercial</option>
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
                paginatedReceipts.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell className="text-xs text-slate-600 font-medium">
                      {rec.date}
                    </TableCell>

                    <TableCell className="font-mono font-semibold text-xs text-slate-900">
                      {rec.receiptCode}
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
                        onClick={() => onViewReceipt(rec)}
                        className="text-xs h-7 font-medium gap-1 px-2.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
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
