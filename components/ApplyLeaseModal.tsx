"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Property, LeaseRequest } from "@/types/index";
import { FileText, CheckCircle2, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";

interface ApplyLeaseModalProps {
  open: boolean;
  onClose: () => void;
  property: Property | null;
  onApplySuccess: (newRequest: LeaseRequest) => void;
}

export const ApplyLeaseModal: React.FC<ApplyLeaseModalProps> = ({
  open,
  onClose,
  property,
  onApplySuccess,
}) => {
  const [applicantName, setApplicantName] = useState("Dagmawit Mesfin");
  const [nationalId, setNationalId] = useState("ET-NID-0091823");
  const [occupation, setOccupation] = useState("Senior Urban Planner - MoUD");
  const [proposedRent, setProposedRent] = useState(property ? String(property.price) : "25000");
  const [moveInDate, setMoveInDate] = useState("2024-11-01");
  const [leaseMonths, setLeaseMonths] = useState("12");
  const [isDone, setIsDone] = useState(false);

  if (!property) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDone(true);

    try {
      confetti({ particleCount: 60, spread: 60 });
    } catch (e) {}

    const newReq: LeaseRequest = {
      id: `req-${Date.now()}`,
      requestCode: `RA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      propertyTitle: property.title,
      propertyLocation: property.location,
      role: "Tenant App",
      counterpartyName: applicantName,
      proposedRent: parseFloat(proposedRent) || property.price,
      status: "Pending Review",
      dateSubmitted: new Date().toISOString().split("T")[0],
      notes: `Applied for ${leaseMonths} months lease. Occupation: ${occupation}. Move-in: ${moveInDate}.`
    };

    setTimeout(() => {
      onApplySuccess(newReq);
      setIsDone(false);
      onClose();
    }, 1600);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-slate-900 mb-1">
            <FileText className="w-4 h-4 text-slate-500" />
            <DialogTitle>Apply for Government Lease</DialogTitle>
          </div>
          <DialogDescription>
            Submit an official tenancy application for <span className="font-semibold text-slate-900">{property.title}</span>.
          </DialogDescription>
        </DialogHeader>

        {isDone ? (
          <div className="py-5 text-center space-y-2.5 animate-in fade-in">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Application Submitted</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your application has been routed to the property landlord and logged with the GRAMS housing desk for expedited review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Applicant Name
                </label>
                <Input
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  National ID (Fayda / Kebele)
                </label>
                <Input
                  required
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Occupation / Employer
                </label>
                <Input
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Offer Rent (ETB / Month)
                </label>
                <Input
                  type="number"
                  required
                  value={proposedRent}
                  onChange={(e) => setProposedRent(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Preferred Move-in Date
                </label>
                <Input
                  type="date"
                  required
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Lease Duration
                </label>
                <select
                  value={leaseMonths}
                  onChange={(e) => setLeaseMonths(e.target.value)}
                  className="w-full h-8.5 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="6">6 Months</option>
                  <option value="12">12 Months (1 Year)</option>
                  <option value="24">24 Months (2 Years)</option>
                  <option value="36">36 Months (3 Years)</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg flex items-start gap-2 text-xs text-slate-600 border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                By clicking submit, your citizen credentials will be verified against the National Digital ID system and matched with housing security standards.
              </span>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-1">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="default" className="bg-[#00450d] hover:bg-[#1b5e20]">
                Submit Application
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

