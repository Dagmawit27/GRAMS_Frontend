"use client";
import React, { useState } from "react";
import { useCitizenData } from "@/hooks/useCitizenData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  MapPin,
  User,
  Calendar,
  FileText,
  Eye,
  FileCheck,
  Check,
  X,
  ExternalLink,
} from "lucide-react";

export const OfficerPropertyVerificationsPage: React.FC = () => {
  const { handleNavigate } = useCitizenData();

  // Selected dossier for approval
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("PRP-2023-0891");

  // Checklist items state
  const [chkOwnership, setChkOwnership] = useState<boolean>(true);
  const [chkCadastral, setChkCadastral] = useState<boolean>(true);
  const [chkTaxClearance, setChkTaxClearance] = useState<boolean>(true);
  const [chkSafety, setChkSafety] = useState<boolean>(false);
  const [supervisorNote, setSupervisorNote] = useState<string>(
    "Title deed verified against sub-city registry volume 44, page 120. Boundary coordinates checked against municipal master plan."
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleApprove = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setActionSuccess("Property PRP-2023-0891 officially approved and recorded in the national municipal register!");
      setTimeout(() => {
        handleNavigate("officer-dashboard");
      }, 1800);
    }, 900);
  };

  const handleReject = () => {
    const reason = prompt("Enter return reason for Officer Field Re-check:", "Discrepancy in plot dimension");
    if (reason) {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setActionSuccess(`Property returned to Officer with note: "${reason}"`);
        setTimeout(() => {
          handleNavigate("officer-dashboard");
        }, 1800);
      }, 700);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavigate("officer-dashboard")}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Property Approval: PRP-2023-0891
              </h1>
              <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100 font-bold border-amber-300 text-[10px] tracking-wider uppercase">
                Awaiting Supervisor Approval
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified by Officer Martha K. on Oct 24, 2023 14:32 EAT • Bole Sub-City, Woreda 03
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            disabled={isProcessing}
            className="h-9 text-xs font-semibold text-red-700 border-red-200 hover:bg-red-50"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            <span>Return to Officer</span>
          </Button>

          <Button
            size="sm"
            onClick={handleApprove}
            disabled={isProcessing || !chkOwnership || !chkCadastral || !chkTaxClearance}
            className="h-9 text-xs font-semibold bg-[#00450d] hover:bg-[#164e23] text-white shadow-sm"
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            <span>{isProcessing ? "Recording..." : "Approve & Register"}</span>
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main 2-Column Content Grid (Matches Image 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Property Details & Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <img
                src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80"
                alt="Property Snapshot"
                className="w-full sm:w-48 h-36 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
              />
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold uppercase tracking-wider">
                    Residential - Detached
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Parcel #ET-AA-BOL-03-9912</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  Modern 4-Bedroom Villa with G+1 Compound
                </h3>
                <p className="text-xs text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>House No. 442, Woreda 03, Bole Sub-City, Addis Ababa</span>
                </p>
                <div className="grid grid-cols-3 gap-3 pt-2 text-xs border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Total Area</span>
                    <span className="font-bold text-slate-800">450 m²</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Built Year</span>
                    <span className="font-bold text-slate-800">2021</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Rooms / Bath</span>
                    <span className="font-bold text-slate-800">5 Bed • 4 Bath</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Owner & Sub-City Verification Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Registered Landlord / Owner
                </span>
                <p className="font-bold text-slate-900 text-sm">Abebe Bikila Gebremichael</p>
                <p className="text-slate-600">National ID (Fayda): ET-NID-88219412</p>
                <p className="text-slate-600">Phone: +251 91 122 3344</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Field Verification Officer
                </span>
                <p className="font-bold text-slate-900 text-sm">Martha Kebede (Officer ID: OFF-094)</p>
                <p className="text-slate-600">Inspection Timestamp: Oct 24, 2023 - 14:32</p>
                <p className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Physical On-Site Inspection Complete</span>
                </p>
              </div>
            </div>
          </div>

          {/* Attached Legal Documents (Image 4) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#00450d]" />
                <span>Verified Legal Attachments (3 files)</span>
              </h3>
              <span className="text-xs text-slate-400">All files cryptographically hashed</span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-50 text-red-700 flex items-center justify-center font-bold">
                    PDF
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Title_Deed_Original_Scan_Vol44_P120.pdf</p>
                    <p className="text-[10px] text-slate-400">4.2 MB • Scanned directly from Bole Registry</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert("Displaying certified Title Deed high-resolution viewer...")}
                  className="h-8 text-xs font-semibold gap-1 text-slate-700"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </Button>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                    JPG
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Owner_National_ID_Front_Back.jpg</p>
                    <p className="text-[10px] text-slate-400">1.8 MB • Fayda Biometric Match Confirmed</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert("Displaying Fayda National ID image match...")}
                  className="h-8 text-xs font-semibold gap-1 text-slate-700"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </Button>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    PDF
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Tax_Clearance_Certificate_2023.pdf</p>
                    <p className="text-[10px] text-slate-400">920 KB • Ministry of Revenues Digital Seal</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert("Displaying certified Tax Clearance document...")}
                  className="h-8 text-xs font-semibold gap-1 text-slate-700"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Supervisor Final Decision Checklist (Image 4) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Supervisor Final Verification</h3>
              <ShieldCheck className="w-4 h-4 text-[#00450d]" />
            </div>

            {/* Checklist */}
            <div className="space-y-3 text-xs">
              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={chkOwnership}
                  onChange={(e) => setChkOwnership(e.target.checked)}
                  className="mt-0.5 accent-[#00450d] rounded"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Title Deed Authenticity</span>
                  <span className="text-[11px] text-slate-500">Ownership confirmed in sub-city land archive</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={chkCadastral}
                  onChange={(e) => setChkCadastral(e.target.checked)}
                  className="mt-0.5 accent-[#00450d] rounded"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Cadastral Boundary Map</span>
                  <span className="text-[11px] text-slate-500">GPS plot coordinates verified in municipal GIS</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={chkTaxClearance}
                  onChange={(e) => setChkTaxClearance(e.target.checked)}
                  className="mt-0.5 accent-[#00450d] rounded"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Property Tax Clearance</span>
                  <span className="text-[11px] text-slate-500">No outstanding municipal property levies</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={chkSafety}
                  onChange={(e) => setChkSafety(e.target.checked)}
                  className="mt-0.5 accent-[#00450d] rounded"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Building Safety Certification</span>
                  <span className="text-[11px] text-slate-500">Compliant with urban structural standard (Optional)</span>
                </div>
              </label>
            </div>

            {/* Supervisor Internal Notes */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-800 block">Supervisor Approval Note / Comments</label>
              <textarea
                value={supervisorNote}
                onChange={(e) => setSupervisorNote(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00450d]"
                placeholder="Add official supervisor approval note..."
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Button
                onClick={handleApprove}
                disabled={isProcessing || !chkOwnership || !chkCadastral || !chkTaxClearance}
                className="w-full h-10 bg-[#00450d] hover:bg-[#164e23] text-white font-bold text-xs uppercase tracking-wider"
              >
                {isProcessing ? "Processing..." : "Approve & Register Property"}
              </Button>

              <Button
                variant="outline"
                onClick={handleReject}
                disabled={isProcessing}
                className="w-full h-10 text-xs font-bold text-red-700 border-red-200 hover:bg-red-50 uppercase tracking-wider"
              >
                Return for Re-Verification
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerPropertyVerificationsPage;
