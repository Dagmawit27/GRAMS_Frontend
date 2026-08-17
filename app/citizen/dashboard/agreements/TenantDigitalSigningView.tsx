import React, { useState } from "react";
import { LeaseRequest } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Download,
  Printer,
  PenTool,
  Lock,
  Stamp,
  Fingerprint,
  Info
} from "lucide-react";
import { useCitizenData } from "@/hooks/useCitizenData";

interface TenantDigitalSigningViewProps {
  request: LeaseRequest;
}

export const TenantDigitalSigningView: React.FC<TenantDigitalSigningViewProps> = ({ request }) => {
  const {
    setActiveAgreementView,
    setSelectedLeaseRequest,
    handleSignAgreementByTenant,
  } = useCitizenData();

  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [faydaPin, setFaydaPin] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSigningLoading, setIsSigningLoading] = useState(false);
  const [hasSigned, setHasSigned] = useState(request.tenantSigned || false);

  const handleBack = () => {
    setActiveAgreementView('list');
    setSelectedLeaseRequest(null);
  };

  const handleExecuteSign = () => {
    if (!agreeTerms || faydaPin.length < 4) return;
    setIsSigningLoading(true);

    setTimeout(() => {
      setIsSigningLoading(false);
      setHasSigned(true);
      setIsSignModalOpen(false);
      handleSignAgreementByTenant(request);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumbs & Header (Matching Screenshot 4) */}
      <div>
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors mb-2 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to My Lease Requests</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 pb-4 border-b border-slate-200/70">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Digital Signature Required
              </h2>
              <Badge
                variant={hasSigned ? "active" : "pending"}
                className="text-xs px-2.5 py-0.5 uppercase tracking-wider font-semibold"
              >
                {hasSigned ? "Agreement Activated" : "Pending Signatures"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Please review the final lease agreement below. Both parties must sign digitally to activate the tenancy.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="text-xs h-9 gap-1.5 border-slate-200 text-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Draft</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Two Participant Status Cards (Matching Screenshot 4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tenant Status Card */}
        <Card className={`border shadow-clean transition-all ${
          hasSigned ? "bg-emerald-50/40 border-emerald-200" : "bg-white border-slate-200"
        }`}>
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                TENANT
              </span>
              <h4 className="font-bold text-sm text-slate-900">
                Dagmawit Mesfin
              </h4>
              <p className="text-xs text-slate-500">
                {hasSigned ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Signed & Verified with Fayda National ID
                  </span>
                ) : (
                  "Action required: Review contract and provide digital signature"
                )}
              </p>
            </div>

            {hasSigned ? (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs px-3 py-1 font-bold">
                SIGNED
              </Badge>
            ) : (
              <Button
                onClick={() => setIsSignModalOpen(true)}
                className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs font-semibold h-9 px-4 gap-1.5 shrink-0 shadow-xs"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Sign Agreement</span>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Landlord Status Card */}
        <Card className="bg-emerald-50/40 border border-emerald-200 shadow-clean">
          <CardContent className="p-4 flex items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                LANDLORD
              </span>
              <h4 className="font-bold text-sm text-slate-900">
                {request.landlordName || "Kibrom Tadesse"}
              </h4>
              <p className="text-xs text-slate-500">
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Signed on {request.landlordSignedDate || "Oct 24, 2023, 14:30 EAT"}
                </span>
              </p>
            </div>

            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs px-3 py-1 font-bold">
              SIGNED
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Formal Agreement Document Card (Matching Screenshot 4) */}
      <Card className="bg-white border-slate-200 shadow-clean overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-700" />
            <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Legally Binding Residential Tenancy Agreement
            </CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs h-8 gap-1.5 text-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Certified PDF</span>
          </Button>
        </CardHeader>

        <CardContent className="p-5 sm:p-8 bg-slate-50/50">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 max-w-4xl mx-auto shadow-xs space-y-6 text-xs text-slate-800 leading-relaxed font-sans">
            {/* Header & Seal */}
            <div className="text-center pb-4 border-b border-slate-200 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA
              </p>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                GOVERNMENT RENTAL ADMINISTRATION & MONITORING SYSTEM (GRAMS)
              </h3>
              <p className="text-xs font-semibold text-emerald-800">
                STATUTORY DIGITAL LEASE CONTRACT — REGISTRATION REF: #{request.requestCode}
              </p>
            </div>

            {/* Quick summary grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Monthly Rent</span>
                <span className="font-bold text-slate-900 text-sm">{request.proposedRent.toLocaleString()} ETB</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Security Deposit</span>
                <span className="font-bold text-slate-900 text-sm">{(request.securityDeposit || request.proposedRent * 2).toLocaleString()} ETB</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Term</span>
                <span className="font-bold text-slate-900 text-sm">{request.leaseDuration || "12 Months"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Commencement</span>
                <span className="font-bold text-slate-900 text-sm">{request.startDate || "01 Nov, 2023"}</span>
              </div>
            </div>

            {/* Terms and conditions text */}
            <div className="space-y-3.5 text-xs text-slate-700">
              <p>
                <strong>1. PREMISES:</strong> The Lessor ({request.landlordName || "Kibrom Tadesse"}) agrees to demise and lease to the Lessee (Dagmawit Mesfin) the residential property located at <strong>{request.propertyLocation}</strong>, unit number <strong>{request.unitNumber || "Unit 4B, 4th Floor"}</strong>.
              </p>
              <p>
                <strong>2. PAYMENT TERMS:</strong> Monthly rent of <strong>ETB {request.proposedRent.toLocaleString()}</strong> is due and payable on or before the 5th day of each calendar month. Payments must be processed through certified national electronic settlement rails (Telebirr, CBE Birr, or Commercial Bank Electronic Clearing).
              </p>
              <p>
                <strong>3. DEPOSIT ESCROW:</strong> The security deposit of <strong>ETB {(request.securityDeposit || request.proposedRent * 2).toLocaleString()}</strong> shall be retained in municipal escrow under Proclamation No. 1204/2020 and refunded upon conclusive exit inspection.
              </p>
              <p>
                <strong>4. STATUTORY JURISDICTION:</strong> Both parties agree to abide by Addis Ababa City Administration Housing Bureau arbitration protocols in the event of dispute resolution.
              </p>
            </div>

            {/* Digital Signatures Box (Matching Screenshot 4) */}
            <div className="pt-6 border-t border-slate-200">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-3">
                CERTIFIED DIGITAL SIGNATURES & CRYPTOGRAPHIC SEALS
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Landlord Stamp */}
                <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      LANDLORD SIGNATURE
                    </span>
                    <span className="bg-emerald-200/80 text-emerald-900 font-bold text-[9px] px-1.5 py-0.5 rounded">
                      SEALED
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-xs">
                    {request.landlordName || "Kibrom Tadesse"}
                  </p>
                  <p className="font-mono text-[10px] text-slate-500">
                    HASH: {request.landlordSignatureHash || "8f9a2b71c4d9e032"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    IP: {request.landlordIpAddress || "196.189.44.12"} • {request.landlordSignedDate || "Oct 24, 2023, 14:30 EAT"}
                  </p>
                </div>

                {/* Tenant Stamp */}
                <div className={`border rounded-xl p-3.5 space-y-1.5 transition-all ${
                  hasSigned
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-dashed border-amber-300 bg-amber-50/40"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      TENANT SIGNATURE
                    </span>
                    <span className={`font-bold text-[9px] px-1.5 py-0.5 rounded ${
                      hasSigned
                        ? "bg-emerald-200/80 text-emerald-900"
                        : "bg-amber-200 text-amber-900"
                    }`}>
                      {hasSigned ? "SEALED" : "PENDING"}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-xs">
                    Dagmawit Mesfin
                  </p>
                  {hasSigned ? (
                    <>
                      <p className="font-mono text-[10px] text-slate-500">
                        HASH: SHA256-4c919d8a01f8
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Fayda National ID Verified • Just now
                      </p>
                    </>
                  ) : (
                    <p className="text-[10px] text-amber-800 font-medium">
                      Awaiting your digital confirmation to finalize the contract.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fayda Electronic Signature Modal */}
      {isSignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Fayda National e-Sign</h3>
                  <p className="text-[11px] text-slate-500">Digital Tenancy Contract Execution</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
                256-Bit SSL
              </Badge>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <p className="font-medium text-slate-900">Contract Reference: {request.requestCode}</p>
                <p>Monthly Rent: <strong>{request.proposedRent.toLocaleString()} ETB</strong></p>
                <p>Security Deposit: <strong>{(request.securityDeposit || request.proposedRent * 2).toLocaleString()} ETB</strong></p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Enter Fayda Security PIN / OTP
                </label>
                <Input
                  type="password"
                  maxLength={6}
                  value={faydaPin}
                  onChange={(e) => setFaydaPin(e.target.value)}
                  placeholder="Enter 4 or 6 digit PIN (e.g. 1234)"
                  className="h-10 text-center tracking-widest font-mono text-base"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  A verification timestamp will be recorded to your national citizen profile.
                </p>
              </div>

              <label className="flex items-start gap-2 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-600">
                  I hereby confirm that I have read and agree to all terms in this digital tenancy agreement under Ethiopian law.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSignModalOpen(false)}
                className="text-xs h-9 text-slate-700"
              >
                Cancel
              </Button>
              <Button
                disabled={!agreeTerms || faydaPin.length < 4 || isSigningLoading}
                onClick={handleExecuteSign}
                className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-9 px-5 font-semibold gap-1.5"
              >
                {isSigningLoading ? (
                  <span>Signing & Verifying...</span>
                ) : (
                  <>
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Authorize & Sign</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDigitalSigningView;
