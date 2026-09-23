import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LeaseRequestResponse } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Check,
  X,
  MapPin,
  Building,
  User,
  ShieldCheck,
  Phone,
  Mail,
  Briefcase,
  Calendar,
  CreditCard,
  FileText,
  Printer
} from "lucide-react";
import { acceptLeaseRequest, declineLeaseRequest, getSession } from "@/lib/api";

interface LandlordReviewDetailsViewProps {
  request: LeaseRequestResponse | any;
}

export const LandlordReviewDetailsView: React.FC<LandlordReviewDetailsViewProps> = ({ request }) => {
  const router = useRouter();

  const [isDeclining, setIsDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(request.status);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);

  const handleBack = () => {
    router.push('/citizen/dashboard/agreements/new');
  };

  const handleConfirmDecline = async () => {
    const session = getSession();
    if (!session?.token) {
      alert("Authentication required");
      return;
    }

    setIsSubmitting(true);
    try {
      await declineLeaseRequest(session.token, request.requestCode, declineReason);
      setCurrentStatus("REJECTED");
      setIsDeclining(false);
      setDeclineReason("");
      router.push('/citizen/dashboard/agreements/new');
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to decline lease request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccept = () => {
    setIsAcceptDialogOpen(true);
  };

  const handleConfirmAccept = async () => {
    const session = getSession();
    if (!session?.token) {
      alert("Authentication required");
      return;
    }

    setIsSubmitting(true);
    try {
      await acceptLeaseRequest(session.token, request.requestCode);
      setCurrentStatus("LANDLORD_APPROVED");
      setIsAcceptDialogOpen(false);
      router.push(`/citizen/dashboard/agreements/pending/${request.requestCode}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to accept lease request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back Navigation Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-[#00450d] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>AGREEMENTS</span>
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="font-mono font-bold text-slate-800">
              {request.requestCode}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 pb-4 border-b border-slate-200/70">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Agreement {request.requestCode}
              </h2>
              <Badge
                variant={currentStatus === "LANDLORD_APPROVED" ? "verified" : currentStatus === "REJECTED" ? "rejected" : "pending"}
                className="text-xs px-2.5 py-0.5 uppercase tracking-wider font-semibold"
              >
                {currentStatus === "LANDLORD_APPROVED" ? "Approved" : currentStatus === "REJECTED" ? "Rejected" : "Pending Review"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Submitted on {new Date(request.createdAt).toLocaleDateString()}</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
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

      {/* Top 2 Cards: Property Details & Tenant Information (Matching Screenshot 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Card: Property Details */}
        <Card className="bg-white border-slate-200 shadow-clean overflow-hidden">
          <div className="relative h-44 w-full overflow-hidden bg-slate-100">
            <img
              src={
                request.propertyImages?.[0] || request.propertyImage ||
                "https://lh3.googleusercontent.com/aida-public/AB6AXuArZM8eccqrTxsJgQGwrJ9QdADLY41kgOvV3jzwXGn16dj5ogp9Z4MXSSZi-vq4D1_T1QkfKp9Ds7ueGwa3pSV7KomN4uiFrhUl2SHywD6J6oIvRLsmWNXwZngHiVFOTxbAAj31SuxMaN27rZD65OyNS5KSgJCXepQqV3TiMmcCwBODUSyNOIBG_DRAZDJDeOA9zSw0COPkh474PN-PSeniepcpIHYXDZUtnPrcDrBuSbOaztsZ3PQ-Ww"
              }
              alt={request.propertyTitle}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3">
              <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">
                {request.propertyType || "Residential"}
              </span>
            </div>
          </div>
          <CardContent className="p-4 space-y-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {request.propertyTitle}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {request.propertyLocation}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Unit Number</span>
                <span className="font-semibold text-slate-900 text-xs mt-0.5 block">
                  {request.unitCode || request.unitNumber || "N/A"}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Area</span>
                <span className="font-semibold text-slate-900 text-xs mt-0.5 block">
                  {request.area || 0} Sq Meters
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Card: Tenant Information (Matching Screenshot 2) */}
        <Card className="bg-white border-slate-200 shadow-clean flex flex-col justify-between">
          <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Tenant Information
            </CardTitle>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Verified Citizen
            </span>
          </CardHeader>

          <CardContent className="p-4 space-y-4 flex-1 flex flex-col justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#00450d] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                {request.applicantName?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || "AG"}
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">
                  {request.applicantName}
                </h4>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                    Fayda ID: {request.applicantNationalId || "N/A"}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone
                </span>
                <span className="font-semibold text-slate-900">{request.applicantPhone || "N/A"}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
                </span>
                <span className="font-medium text-slate-900">{request.applicantEmail || "N/A"}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Employment / Organization
                </span>
                <span className="font-medium text-slate-900 text-right">
                  {request.applicantEmployment || "N/A"}
                </span>
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-2.5 text-xs text-emerald-900 flex items-center justify-between">
              <span className="font-medium">National Housing Registry Trust Score:</span>
              <span className="font-bold text-emerald-800">98% / 100 (Tier 1 Verified)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section: Proposed Lease Terms (Matching Screenshot 2) */}
      <Card className="bg-white border-slate-200 shadow-clean">
        <CardHeader className="p-4 pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Proposed Lease Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Monthly Rent
              </span>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {request.proposedRent.toLocaleString()} ETB
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Payable monthly via Telebirr / CBE</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Advance Rent
              </span>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {(request.securityDeposit || request.proposedRent * 2).toLocaleString()} ETB
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Initial Advance Payment</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Lease Duration
              </span>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {request.leaseDuration || `${request.leaseDurationMonths} Months`}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Starting {new Date(request.startDate).toLocaleDateString()} – Ending {new Date(request.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      

      {/* Decline Dialog Modal */}
      {isDeclining && currentStatus === "PENDING" && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-rose-800 font-semibold text-sm">
            <X className="w-4 h-4" />
            <span>Specify Reason for Declining Request</span>
          </div>
          <textarea
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="e.g. Unit currently reserved for long-term tenant or maintenance scheduled..."
            className="w-full p-2.5 bg-white border border-rose-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeclining(false)}
              className="text-xs h-8"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDecline}
              className="text-xs h-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Declining..." : "Confirm Decline"}
            </Button>
          </div>
        </div>
      )}

      {/* Actions Footer (Matching Screenshot 2) */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-clean">
        <Button
          variant="outline"
          onClick={handleBack}
          className="text-xs h-9 px-4 text-slate-700"
        >
          Back
        </Button>

        <div className="flex items-center gap-3">
          {currentStatus === "PENDING" ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsDeclining(true)}
                className="text-xs h-9 px-4 text-rose-600 hover:bg-rose-50 border-rose-200 font-semibold"
                disabled={isSubmitting}
              >
                Decline Request
              </Button>

              <Button
                onClick={handleAccept}
                className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-9 px-5 font-semibold gap-1.5 shadow-xs"
                disabled={isSubmitting}
              >
                <Check className="w-4 h-4" />
                <span>Accept Agreement</span>
              </Button>
            </>
          ) : currentStatus === "LANDLORD_APPROVED" ? (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 px-5 font-semibold gap-1.5 shadow-xs"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Agreement</span>
            </Button>
          ) : (
            <span className="text-xs text-slate-500 font-medium">Request has been rejected</span>
          )}
        </div>
      </div>

      {/* Accept Agreement Confirmation Dialog */}
      <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
        <DialogContent onClose={() => setIsAcceptDialogOpen(false)} className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>Confirm Accept Agreement</DialogTitle>
            <DialogDescription>
              Are you sure you want to accept this lease request? This will approve the agreement and notify the tenant.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-4">
            <Button variant="outline" onClick={() => setIsAcceptDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              className="bg-[#00450d] hover:bg-[#1b5e20] text-white"
              onClick={handleConfirmAccept}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Accepting..." : "Accept Agreement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandlordReviewDetailsView;
