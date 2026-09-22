"use client";
import React, { useState } from "react";
import { useCitizenData } from "@/hooks/useCitizenData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  User,
  Calendar,
  DollarSign,
  Building,
  Check,
  X,
  Eye,
  AlertCircle,
} from "lucide-react";

export const OfficerAgreementVerificationsPage: React.FC = () => {
  const { handleNavigate } = useCitizenData();

  // Checklist states (Image 3)
  const [chkTerms, setChkTerms] = useState<boolean>(true);
  const [chkIdentity, setChkIdentity] = useState<boolean>(true);
  const [chkRentCap, setChkRentCap] = useState<boolean>(true);
  const [chkDigitalSignatures, setChkDigitalSignatures] = useState<boolean>(true);
  const [officerNotes, setOfficerNotes] = useState<string>(
    "Landlord and tenant national ID biometrics verified with Fayda API. Rent index falls within allowable sub-city tier guidelines."
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleForwardToSupervisor = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setActionSuccess("Agreement AGR-4402 successfully verified and forwarded to Woreda Supervisor!");
      setTimeout(() => {
        handleNavigate("officer-dashboard");
      }, 1800);
    }, 900);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleNavigate("officer-dashboard")}
            className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-[#00450d] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>OFFICER DASHBOARD</span>
          </button>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-mono font-bold text-slate-800">
            AGR-4402
          </span>
        </div>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Agreement Verification: AGR-4402
            </h1>
            <Badge className="bg-sky-100 text-sky-900 hover:bg-sky-100 font-bold border-sky-300 text-[10px] tracking-wider uppercase">
              Under Initial Verification
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Submitted on Oct 24, 2023 • Property: WRD-9921 • Bole Sub-City Woreda 03
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("Requesting clarification from Landlord...")}
            className="h-9 text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50"
          >
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            <span>Request Info</span>
          </Button>

          <Button
            size="sm"
            onClick={handleForwardToSupervisor}
            disabled={isProcessing || !chkTerms || !chkIdentity || !chkRentCap || !chkDigitalSignatures}
            className="h-9 text-xs font-semibold bg-[#00450d] hover:bg-[#164e23] text-white shadow-sm"
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            <span>{isProcessing ? "Forwarding..." : "Forward to Supervisor"}</span>
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main 2-Column Grid (Image 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Agreement Overview & Parties */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agreement Financial & Term Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#00450d]" />
              <span>Rental Agreement Terms & Financials</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Monthly Rent</span>
                <span className="text-base font-extrabold text-[#00450d]">12,500 ETB</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Lease Duration</span>
                <span className="text-base font-extrabold text-slate-900">12 Months</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Security Deposit</span>
                <span className="text-base font-extrabold text-slate-900">25,000 ETB</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Start Date</span>
                <span className="text-base font-extrabold text-slate-900">Nov 01, 2023</span>
              </div>
            </div>

            {/* Parties Involved (Image 3) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Landlord Box */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    LESSOR / LANDLORD
                  </span>
                  <span className="text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Signed
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900">Abebe Kebede Gebre</p>
                <p className="text-slate-500">ID: ET-982-441 • Fayda Verified</p>
                <p className="text-slate-500">Phone: +251 91 123 4567</p>
                <p className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-100">
                  Sig: 0x8a92b...e3f1 (Oct 24, 09:15)
                </p>
              </div>

              {/* Tenant Box */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    LESSEE / TENANT
                  </span>
                  <span className="text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Signed
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900">Sara Tekle Haile</p>
                <p className="text-slate-500">ID: ET-772-115 • Fayda Verified</p>
                <p className="text-slate-500">Phone: +251 92 881 9900</p>
                <p className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-100">
                  Sig: 0x4f12a...99b2 (Oct 24, 11:42)
                </p>
              </div>
            </div>
          </div>

          {/* Certified PDF Agreement Preview */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Standard Government Lease Agreement Document</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert("Downloading certified legal lease agreement PDF...")}
                className="h-8 text-xs font-semibold gap-1 text-slate-700"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Full Screen PDF</span>
              </Button>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-serif space-y-2">
              <p className="font-bold text-center text-slate-900 font-sans uppercase tracking-wider text-[11px]">
                FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA • STANDARD RESIDENTIAL LEASE CONTRACT
              </p>
              <p>
                This Residential Lease Agreement is entered into on 24th October 2023 between the Lessor <strong>Abebe Kebede Gebre</strong> and Lessee <strong>Sara Tekle Haile</strong> regarding Property <strong>WRD-9921</strong> located in Addis Ababa, Bole Sub-City, Woreda 03, House No. 442.
              </p>
              <p>
                The agreed monthly rental rate is <strong>12,500 ETB</strong> payable on or before the 1st day of each calendar month via the national digital payment gateway. Both parties agree to standard municipal dispute mediation mechanisms.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Validity Checklist (Image 3) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Officer Verification Checklist</h3>
              <ShieldCheck className="w-4 h-4 text-[#00450d]" />
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={chkTerms}
                  onChange={(e) => setChkTerms(e.target.checked)}
                  className="mt-0.5 accent-[#00450d] rounded"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Compliance with Rental Proclamation</span>
                  <span className="text-[11px] text-slate-500">Lease terms adhere to national rental code</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={chkIdentity}
                  onChange={(e) => setChkIdentity(e.target.checked)}
                  className="mt-0.5 accent-[#00450d] rounded"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Identity Verification</span>
                  <span className="text-[11px] text-slate-500">Both Landlord & Tenant Fayda IDs authenticated</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={chkRentCap}
                  onChange={(e) => setChkRentCap(e.target.checked)}
                  className="mt-0.5 accent-[#00450d] rounded"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Municipal Rent Assessment</span>
                  <span className="text-[11px] text-slate-500">Amount within certified woreda bracket</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={chkDigitalSignatures}
                  onChange={(e) => setChkDigitalSignatures(e.target.checked)}
                  className="mt-0.5 accent-[#00450d] rounded"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Digital Cryptographic Signatures</span>
                  <span className="text-[11px] text-slate-500">Valid timestamped signatures on file</span>
                </div>
              </label>
            </div>

            {/* Officer Notes */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-800 block">Verification Remarks</label>
              <textarea
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00450d]"
                placeholder="Enter remarks for supervisor..."
              />
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Button
                onClick={handleForwardToSupervisor}
                disabled={isProcessing || !chkTerms || !chkIdentity || !chkRentCap || !chkDigitalSignatures}
                className="w-full h-10 bg-[#00450d] hover:bg-[#164e23] text-white font-bold text-xs uppercase tracking-wider"
              >
                {isProcessing ? "Processing..." : "Forward to Supervisor"}
              </Button>

              <Button
                variant="outline"
                onClick={() => alert("Requesting amendments from parties...")}
                disabled={isProcessing}
                className="w-full h-10 text-xs font-bold text-amber-700 border-amber-200 hover:bg-amber-50 uppercase tracking-wider"
              >
                Request Contract Amendments
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerAgreementVerificationsPage;
