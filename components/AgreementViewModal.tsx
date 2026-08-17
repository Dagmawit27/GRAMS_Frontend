"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RentalAgreement } from "@/types/index";
import { FileText, Printer, CheckCircle, MapPin, Download } from "lucide-react";

interface AgreementViewModalProps {
  open: boolean;
  onClose: () => void;
  agreement: RentalAgreement | null;
}

export const AgreementViewModal: React.FC<AgreementViewModalProps> = ({
  open,
  onClose,
  agreement,
}) => {
  if (!agreement) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900">
              <FileText className="w-4 h-4 text-slate-500" />
              <DialogTitle>Official Tenancy Contract</DialogTitle>
            </div>
            <Badge variant={agreement.status === "Active" ? "active" : "expired"}>
              {agreement.status}
            </Badge>
          </div>
          <DialogDescription>
            Contract Reference: <span className="font-mono font-semibold text-slate-900">{agreement.agreementCode}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 text-xs text-slate-900">
          {/* Header Summary */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-900">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{agreement.propertyTitle}</span>
            </div>
            <p className="text-xs text-slate-500">{agreement.propertyLocation}</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tenant</span>
                <span className="font-medium text-slate-900">{agreement.counterpartyName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Monthly Rent</span>
                <span className="font-semibold text-slate-900">ETB {agreement.monthlyRent.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Lease Period</span>
                <span className="font-medium text-slate-900">{agreement.startDate} – {agreement.endDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Security Deposit</span>
                <span className="font-medium text-slate-900">ETB {agreement.depositAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Legal Clauses */}
          <div className="border border-slate-200 rounded-lg p-3.5 space-y-2.5 bg-white">
            <h5 className="font-semibold text-xs uppercase tracking-wider text-slate-900">
              1. Statutory Tenancy Terms & Conditions
            </h5>
            <p className="text-slate-600 leading-relaxed">
              This residential/commercial lease agreement is entered into pursuant to the Ethiopian Rental and Housing Proclamation under the supervision of the Ministry of Urban Development and Housing. Both parties agree that rental payments shall be remitted through the official GRAMS digital portal.
            </p>

            <h5 className="font-semibold text-xs uppercase tracking-wider text-slate-900">
              2. Special Stipulations
            </h5>
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
              {agreement.termsSummary}
            </p>

            <h5 className="font-semibold text-xs uppercase tracking-wider text-slate-900">
              3. Municipal Audit & Tax Registration
            </h5>
            <p className="text-slate-600 leading-relaxed">
              The lessor and lessee acknowledge that this agreement constitutes a legally binding instrument enforceable in Ethiopian municipal courts and recorded with the Addis Ababa City Administration Revenue Bureau.
            </p>
          </div>

          {/* Signatures & Certification */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Lessor (Landlord)</span>
              <p className="font-semibold text-xs text-slate-900">Dagmawit Mesfin</p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-mono">
                <CheckCircle className="w-3 h-3 text-emerald-600" /> Digital Signature Verified
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Lessee (Tenant)</span>
              <p className="font-semibold text-xs text-slate-900">{agreement.counterpartyName}</p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-mono">
                <CheckCircle className="w-3 h-3 text-emerald-600" /> Digital Signature Verified
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-3.5">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.print()}
            className="gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Agreement
          </Button>
          <Button
            variant="default"
            onClick={onClose}
            className="bg-[#00450d] hover:bg-[#1b5e20] gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

