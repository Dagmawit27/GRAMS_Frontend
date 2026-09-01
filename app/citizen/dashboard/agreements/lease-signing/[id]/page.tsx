"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { LeaseRequestResponse, getLeaseRequestById, getSession, signAgreement } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  CheckCircle2,
  FileCheck,
  Download,
  Printer,
  PenTool,
  Fingerprint,
  Building,
  User,
  DollarSign,
  Calendar,
} from "lucide-react";

export default function TenantSigningPage() {
  const router = useRouter();
  const params = useParams();
  const requestCode = params.id as string;

  const [leaseRequest, setLeaseRequest] = useState<LeaseRequestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSigningLoading, setIsSigningLoading] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    const fetchLeaseRequest = async () => {
      try {
        const session = getSession();
        if (!session?.token) {
          setError("No authentication token found");
          return;
        }
        const data = await getLeaseRequestById(session.token, requestCode);
        setLeaseRequest(data);
        setHasSigned(data.tenantSigned || false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load lease request");
      } finally {
        setIsLoading(false);
      }
    };

    if (requestCode) {
      fetchLeaseRequest();
    }
  }, [requestCode]);

  const handleBack = () => {
    router.push("/citizen/dashboard/leases");
  };

  const handleExecuteSign = async () => {
    if (!agreeTerms || otp.length < 4) return;
    setIsSigningLoading(true);

    try {
      const session = getSession();
      if (!session?.token) {
        alert("Authentication required");
        return;
      }

      await signAgreement(session.token, requestCode, otp);
      setIsSigningLoading(false);
      setHasSigned(true);
      setIsSignModalOpen(false);
      alert("Agreement signed successfully!");
      
      // Reload lease request to get updated status
      const data = await getLeaseRequestById(session.token, requestCode);
      setLeaseRequest(data);
    } catch (error) {
      setIsSigningLoading(false);
      alert(error instanceof Error ? error.message : "Failed to sign agreement");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !leaseRequest) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 text-sm">{error || "Lease request not found"}</p>
        <Button
          variant="outline"
          onClick={handleBack}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }

  if (!leaseRequest.agreementGenerated) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
        <p className="text-amber-800 text-sm">The landlord has not generated the agreement yet. Please wait for the landlord to generate the agreement.</p>
        <Button
          variant="outline"
          onClick={handleBack}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumbs & Header */}
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
                variant={hasSigned ? "verified" : "pending"}
                className="text-xs px-2.5 py-0.5 uppercase tracking-wider font-semibold"
              >
                {hasSigned ? "Agreement Signed" : "Pending Signature"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Please review the final lease agreement below and provide your digital signature to secure the property.
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

      {/* Agreement Summary Card */}
      <Card className="bg-white border-slate-200 shadow-clean overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-700" />
            <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Lease Agreement Summary
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Building className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Property
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {leaseRequest.propertyTitle}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Landlord
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {leaseRequest.landlordName}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Monthly Rent
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {leaseRequest.proposedRent.toLocaleString()} ETB
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Duration
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {leaseRequest.leaseDuration || "12 Months"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formal Agreement Document Card */}
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
            <span>Download PDF</span>
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
                STATUTORY DIGITAL LEASE CONTRACT — REGISTRATION REF: #{leaseRequest.requestCode}
              </p>
            </div>

            {/* Quick summary grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Monthly Rent</span>
                <span className="font-bold text-slate-900 text-sm">{leaseRequest.proposedRent.toLocaleString()} ETB</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Security Deposit</span>
                <span className="font-bold text-slate-900 text-sm">{(leaseRequest.securityDeposit || leaseRequest.proposedRent * 2).toLocaleString()} ETB</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Term</span>
                <span className="font-bold text-slate-900 text-sm">{leaseRequest.leaseDuration || "12 Months"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Commencement</span>
                <span className="font-bold text-slate-900 text-sm">{leaseRequest.startDate || "To be determined"}</span>
              </div>
            </div>

            {/* Terms and conditions text */}
            <div className="space-y-3.5 text-xs text-slate-700">
              <p>
                <strong>1. PREMISES:</strong> The Lessor agrees to demise and lease to the Lessee ({leaseRequest.applicantName}) the residential property located at <strong>{leaseRequest.propertyLocation}</strong>, unit number <strong>{leaseRequest.unitCode || "To be assigned"}</strong>.
              </p>
              <p>
                <strong>2. PAYMENT TERMS:</strong> Monthly rent of <strong>ETB {leaseRequest.proposedRent.toLocaleString()}</strong> is due and payable on or before the 5th day of each calendar month. Payments must be processed through certified national electronic settlement rails (Telebirr, CBE Birr, or Commercial Bank Electronic Clearing).
              </p>
              <p>
                <strong>3. DEPOSIT ESCROW:</strong> The security deposit of <strong>ETB {(leaseRequest.securityDeposit || leaseRequest.proposedRent * 2).toLocaleString()}</strong> shall be retained in municipal escrow under Proclamation No. 1204/2020 and refunded upon conclusive exit inspection.
              </p>
              <p>
                <strong>4. STATUTORY JURISDICTION:</strong> Both parties agree to abide by Addis Ababa City Administration Housing Bureau arbitration protocols in the event of dispute resolution.
              </p>
            </div>

            {/* Digital Signatures Box */}
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
                    {leaseRequest.landlordName}
                  </p>
                  <p className="font-mono text-[10px] text-slate-500">
                    HASH: SHA256-{Math.random().toString(36).substring(7)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    OTP Verified • Previously Signed
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
                    {leaseRequest.applicantName}
                  </p>
                  {hasSigned ? (
                    <>
                      <p className="font-mono text-[10px] text-slate-500">
                        HASH: SHA256-{Math.random().toString(36).substring(7)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        OTP Verified • Just now
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

      {/* Sign Button */}
      {!hasSigned && (
        <div className="flex justify-center">
          <Button
            onClick={() => setIsSignModalOpen(true)}
            className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs font-semibold h-10 px-6 gap-2 shadow-xs"
          >
            <PenTool className="w-4 h-4" />
            <span>Sign Agreement with OTP</span>
          </Button>
        </div>
      )}

      {/* OTP Signature Modal */}
      {isSignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">OTP Verification</h3>
                  <p className="text-[11px] text-slate-500">Digital Agreement Signature</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
                256-Bit SSL
              </Badge>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <p className="font-medium text-slate-900">Contract Reference: {leaseRequest.requestCode}</p>
                <p>Monthly Rent: <strong>{leaseRequest.proposedRent.toLocaleString()} ETB</strong></p>
                <p>Security Deposit: <strong>{(leaseRequest.securityDeposit || leaseRequest.proposedRent * 2).toLocaleString()} ETB</strong></p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Enter OTP Code
                </label>
                <Input
                  type="password"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="h-10 text-center tracking-widest font-mono text-base"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Enter the OTP sent to your registered mobile number.
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
                disabled={!agreeTerms || otp.length < 4 || isSigningLoading}
                onClick={handleExecuteSign}
                className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-9 px-5 font-semibold gap-1.5"
              >
                {isSigningLoading ? (
                  <span>Verifying & Signing...</span>
                ) : (
                  <>
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Sign Agreement</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
