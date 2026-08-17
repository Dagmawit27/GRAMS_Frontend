"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Property, RentalAgreement } from "@/types/index";
import { FileText, CheckCircle2, ShieldCheck } from "lucide-react";

interface NewAgreementModalProps {
  open: boolean;
  onClose: () => void;
  properties: Property[];
  onCreateAgreement: (agreement: RentalAgreement) => void;
}

export const NewAgreementModal: React.FC<NewAgreementModalProps> = ({
  open,
  onClose,
  properties,
  onCreateAgreement,
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0]?.id || "");
  const [tenantName, setTenantName] = useState("");
  const [tenantIdNumber, setTenantIdNumber] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("15000");
  const [depositMonths, setDepositMonths] = useState("2");
  const [startDate, setStartDate] = useState("2024-10-01");
  const [durationYears, setDurationYears] = useState("1");
  const [customTerms, setCustomTerms] = useState("Standard residential lease agreement complying with Ministry of Urban Development and Housing directives.");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName.trim()) return;

    const prop = properties.find((p) => p.id === selectedPropertyId) || properties[0];
    const rent = parseFloat(monthlyRent) || 15000;
    const dep = rent * (parseInt(depositMonths, 10) || 2);
    const start = new Date(startDate);
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + (parseInt(durationYears, 10) || 1));

    const newAgr: RentalAgreement = {
      id: `agr-${Date.now()}`,
      agreementCode: `AG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      propertyTitle: prop ? prop.title : "Custom Unit",
      propertyLocation: prop ? prop.location : "Addis Ababa",
      counterpartyName: tenantName,
      counterpartyInitials: tenantName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "TN",
      counterpartyRole: "Tenant",
      startDate: start.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      endDate: end.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      monthlyRent: rent,
      status: "Active",
      depositAmount: dep,
      termsSummary: customTerms
    };

    onCreateAgreement(newAgr);
    onClose();
    // Reset form
    setTenantName("");
    setTenantIdNumber("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-slate-900 mb-1">
            <FileText className="w-4 h-4 text-slate-500" />
            <DialogTitle>Draft New Rental Agreement</DialogTitle>
          </div>
          <DialogDescription>
            Register an official government-backed tenancy contract in the GRAMS national ledger.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                Select Property
              </label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full h-8.5 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                Tenant Full Name
              </label>
              <Input
                required
                placeholder="e.g. Ato. Bekele Tola"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                Tenant National ID / Kebele ID
              </label>
              <Input
                placeholder="ET-NID-8821094"
                value={tenantIdNumber}
                onChange={(e) => setTenantIdNumber(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                Agreed Monthly Rent (ETB)
              </label>
              <Input
                type="number"
                required
                min={1000}
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                Security Deposit (Months)
              </label>
              <select
                value={depositMonths}
                onChange={(e) => setDepositMonths(e.target.value)}
                className="w-full h-8.5 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="1">1 Month</option>
                <option value="2">2 Months</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                Lease Duration
              </label>
              <select
                value={durationYears}
                onChange={(e) => setDurationYears(e.target.value)}
                className="w-full h-8.5 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="1">1 Year</option>
                <option value="2">2 Years</option>
                <option value="3">3 Years</option>
                <option value="5">5 Years</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                Lease Commencement Date
              </label>
              <Input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                Contractual Terms & Conditions
              </label>
              <textarea
                rows={3}
                value={customTerms}
                onChange={(e) => setCustomTerms(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg flex items-start gap-2.5 text-xs text-slate-600 border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              This agreement will be registered with the Addis Ababa City Housing Administration and granted legal enforceability under Ethiopian rental proclamation.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="default" className="bg-[#00450d] hover:bg-[#1b5e20]">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Register Agreement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

