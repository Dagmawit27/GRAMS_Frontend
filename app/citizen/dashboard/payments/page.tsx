"use client";

import React, { useState } from "react";
import { Invoice } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  CreditCard,
  Search,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Zap,
  Droplets
} from "lucide-react";

import { useCitizenData } from "@/hooks/useCitizenData";

interface PaymentsPageProps {
  invoices?: Invoice[];
  onOpenPayInvoice?: (invoice: Invoice) => void;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = (props) => {
  const context = useCitizenData();
  const invoices = props.invoices || context.invoices;
  const onOpenPayInvoice = props.onOpenPayInvoice || ((inv) => context.setPayingInvoice(inv));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
    invoices[0]?.id || ""
  );

  const selectedInvoice =
    invoices.find((i) => i.id === selectedInvoiceId) || invoices[0];

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "Overdue":
        return <Badge variant="overdue" className="text-[10px]">Overdue</Badge>;
      case "Pending":
        return <Badge variant="pending" className="text-[10px]">Pending</Badge>;
      case "Future":
        return <Badge variant="active" className="text-[10px]">Scheduled</Badge>;
      case "Paid":
        return <Badge variant="verified" className="text-[10px]">Paid</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/60">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Payments
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Review outstanding municipal housing invoices and settle payments securely.
        </p>
      </div>

      {/* Main Grid: Left Table (2 cols), Right Breakdown (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Outstanding Invoices Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-white border-slate-200 shadow-clean">
            <CardHeader className="p-4 pb-3 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Outstanding & Upcoming Invoices
                </CardTitle>
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8.5 h-8 text-xs"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount (ETB)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                        No invoices match your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const isSelected = selectedInvoice?.id === inv.id;
                      return (
                        <TableRow
                          key={inv.id}
                          onClick={() => setSelectedInvoiceId(inv.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? "bg-slate-50 font-medium" : "hover:bg-slate-50/50"
                          }`}
                        >
                          <TableCell className="font-mono font-semibold text-xs text-slate-900">
                            {inv.invoiceCode}
                          </TableCell>
                          <TableCell className="text-xs font-medium text-slate-900">
                            {inv.propertyTitle}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">{inv.dueDate}</TableCell>
                          <TableCell className="font-semibold text-xs text-slate-900">
                            ETB {inv.totalAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(inv.status)}</TableCell>
                          <TableCell className="text-right">
                            {inv.status !== "Paid" ? (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenPayInvoice(inv);
                                }}
                                className="h-7 px-3 text-xs bg-[#00450d] hover:bg-[#1b5e20] text-white font-medium"
                              >
                                Pay Now
                              </Button>
                            ) : (
                              <span className="text-xs text-emerald-700 font-semibold flex items-center justify-end gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Cleared
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Payment Breakdown Card */}
        <div>
          {selectedInvoice ? (
            <Card className="bg-white border-slate-200 shadow-clean sticky top-24">
              <CardHeader className="p-5 pb-3.5 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Invoice Breakdown
                    </span>
                    <CardTitle className="text-base font-semibold text-slate-900 mt-0.5">
                      {selectedInvoice.invoiceCode}
                    </CardTitle>
                  </div>
                  {getStatusBadge(selectedInvoice.status)}
                </div>
                <p className="text-xs text-slate-600 mt-1">{selectedInvoice.propertyTitle}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Due: {selectedInvoice.dueDate}</span>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-3.5">
                {/* Cost Items */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Base Rent ({selectedInvoice.period})</span>
                    <span className="font-semibold text-slate-900">
                      ETB {selectedInvoice.baseRent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-slate-400" />
                      Water Utility
                    </span>
                    <span className="font-semibold text-slate-900">
                      ETB {selectedInvoice.waterUtility.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-slate-400" />
                      Electricity & Maintenance
                    </span>
                    <span className="font-semibold text-slate-900">
                      ETB {selectedInvoice.electricityMaintenance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {selectedInvoice.latePenalty > 0 && (
                    <div className="flex justify-between items-center text-rose-600">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Late Penalty (5%)
                      </span>
                      <span className="font-bold">
                        ETB {selectedInvoice.latePenalty.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  {/* Total Due Banner */}
                  <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="text-xs font-semibold uppercase text-slate-500">Total Due</span>
                    <span className="text-xl font-bold text-slate-900">
                      ETB {selectedInvoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Pay Action Button */}
                <div className="pt-2">
                  {selectedInvoice.status !== "Paid" ? (
                    <Button
                      onClick={() => onOpenPayInvoice(selectedInvoice)}
                      className="w-full bg-[#00450d] hover:bg-[#1b5e20] text-white font-medium h-10 gap-2 shadow-xs rounded-lg"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Pay Now Securely</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-lg text-center font-medium text-xs flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Invoice Settled & Cleared</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 justify-center pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified via National Treasury System</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-6 text-center text-xs text-slate-400 bg-white border-slate-200">
              Select an invoice from the table to view payment breakdown.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
