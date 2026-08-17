"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Receipt } from "@/types/index";
import { Receipt as ReceiptIcon, Printer, Download, Star, CheckCircle, ShieldCheck } from "lucide-react";

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  receipt: Receipt | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  open,
  onClose,
  receipt,
}) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-lg print:border-none print:shadow-none">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900">
              <ReceiptIcon className="w-4 h-4 text-slate-500" />
              <DialogTitle>Official Treasury Receipt</DialogTitle>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-semibold uppercase tracking-wider">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              PAID & CLEARED
            </div>
          </div>
          <DialogDescription>
            Government Rental Management System (GRAMS) Digital Electronic Receipt
          </DialogDescription>
        </DialogHeader>

        {/* Printable Receipt Paper Container */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-3.5 my-2 text-slate-900 relative overflow-hidden">
          {/* Government Watermark Emblem */}
          <div className="absolute right-3 bottom-3 opacity-3 pointer-events-none">
            <Star className="w-44 h-44 fill-current text-slate-900" />
          </div>

          {/* Receipt Header */}
          <div className="flex justify-between items-start pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                  ★
                </div>
                <h4 className="font-bold text-sm text-slate-900 tracking-wide">
                  FDRE HOUSING ADMINISTRATION
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Addis Ababa City Municipal Rental Bureau
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Receipt Number</span>
              <span className="font-mono text-xs font-semibold text-slate-900">{receipt.receiptCode}</span>
            </div>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Payment Date</span>
              <span className="font-medium text-slate-900">{receipt.date}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Transaction Ref</span>
              <span className="font-mono font-medium text-slate-900">{receipt.transactionRef}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Payer / Citizen</span>
              <span className="font-medium text-slate-900">{receipt.payerName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tax Payer TIN</span>
              <span className="font-mono font-medium text-slate-900">{receipt.taxRegistrationNumber}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Property Description</span>
              <span className="font-medium text-slate-900">{receipt.propertyName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Payment Channel</span>
              <span className="font-medium text-slate-900">{receipt.paymentMethod}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Audited Status</span>
              <span className="font-semibold text-emerald-700">Tax Verified & Recorded</span>
            </div>
          </div>

          {/* Amount Paid Bar */}
          <div className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between items-baseline shadow-2xs">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Total Amount Paid</span>
            <span className="text-lg font-bold text-slate-900">
              ETB {receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Stamp & Security Seal */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Digital Security Verification: VALID</span>
            </div>
            <span className="font-mono">GRAMS-ET-SEC-{receipt.id.slice(-6)}</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="secondary" onClick={handlePrint} className="gap-1.5">
            <Printer className="w-3.5 h-3.5" />
            Print Receipt
          </Button>
          <Button
            variant="default"
            onClick={onClose}
            className="bg-[#00450d] hover:bg-[#1b5e20] gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Save as PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
