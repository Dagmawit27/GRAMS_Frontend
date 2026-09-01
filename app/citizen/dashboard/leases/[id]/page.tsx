"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getLeaseRequestById, getSession, LeaseRequestResponse, cancelLeaseRequest } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Building,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  FileText,
  User,
  Phone,
  Mail
} from "lucide-react";

export default function LeaseRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const requestCode = params.id as string;
  
  const [leaseRequest, setLeaseRequest] = useState<LeaseRequestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    const fetchLeaseRequest = async () => {
      try {
        if (!requestCode) {
          setError("Request code not provided");
          return;
        }

        const session = getSession();
        if (!session?.token) {
          setError("No authentication token found");
          return;
        }

        const data = await getLeaseRequestById(session.token, requestCode);
        setLeaseRequest(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load lease request");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaseRequest();
  }, [requestCode]);

  const getStatusBadge = (status: string, agreementGenerated?: boolean) => {
    if (status === "APPROVED" && !agreementGenerated) {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border border-blue-200 text-xs font-semibold">
          <Clock className="w-3 h-3 mr-1" />
          Pending Landlord Agreement
        </Badge>
      );
    }
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border border-amber-200 text-xs font-semibold">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border border-rose-200 text-xs font-semibold">
            <XCircle className="w-3 h-3 mr-1" />
            Declined
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 border border-slate-200 text-xs font-semibold">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 border border-slate-200 text-xs font-semibold">
            {status}
          </Badge>
        );
    }
  };

  const handleWithdraw = async () => {
    if (!leaseRequest) return;
    
    setIsWithdrawing(true);
    try {
      const session = getSession();
      if (!session?.token) {
        alert("Authentication required");
        return;
      }
      await cancelLeaseRequest(session.token, leaseRequest.requestCode);
      setIsWithdrawDialogOpen(false);
      alert("Lease request withdrawn successfully");
      router.push("/citizen/dashboard/leases");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to withdraw request");
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 text-sm">{error}</p>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }

  if (!leaseRequest) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
        <p className="text-slate-600 text-sm">Lease request not found</p>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lease Request Details</h1>
          <p className="text-sm text-slate-500">Request Code: {leaseRequest.requestCode}</p>
        </div>
      </div>

      {/* Status Card */}
      <Card className="bg-white border-slate-200 shadow-clean">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusBadge(leaseRequest.status, leaseRequest.agreementGenerated)}
              <span className="text-sm text-slate-500">
                Applied on {new Date(leaseRequest.createdAt).toLocaleDateString()}
              </span>
            </div>
            {leaseRequest.reviewedAt && (
              <span className="text-sm text-slate-500">
                Reviewed on {new Date(leaseRequest.reviewedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          {leaseRequest.status === "PENDING" && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Button
                variant="destructive"
                onClick={() => setIsWithdrawDialogOpen(true)}
                className="text-xs h-8"
              >
                Withdraw Request
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card className="bg-white border-slate-200 shadow-clean overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-600" />
            Property Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Property Image */}
          {leaseRequest.propertyImage && (
            <div className="w-full h-48 rounded-lg overflow-hidden bg-slate-100">
              <img
                src={leaseRequest.propertyImage}
                alt={leaseRequest.propertyTitle}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div>
            <h3 className="text-base font-bold text-slate-900">{leaseRequest.propertyTitle}</h3>
            <p className="text-sm text-slate-500 mt-1">{leaseRequest.propertyCode}</p>
            {leaseRequest.unitCode && (
              <p className="text-sm text-slate-500">Unit: {leaseRequest.unitCode}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">
                {leaseRequest.propertyLocation || "Address not specified"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">
                {leaseRequest.propertyType || "Residential"}
              </span>
            </div>
            {leaseRequest.area && (
              <div className="flex items-center gap-2 text-sm">
                <Building className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">
                  {leaseRequest.area} sq meters
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-900">
                {leaseRequest.proposedRent.toLocaleString()} ETB / month
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">
                Security Deposit: {(leaseRequest.securityDeposit || leaseRequest.proposedRent * 2).toLocaleString()} ETB
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">
                Lease Duration: {leaseRequest.leaseDurationMonths} months
              </span>
            </div>
            {leaseRequest.startDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">
                  Start Date: {new Date(leaseRequest.startDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {leaseRequest.endDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">
                  End Date: {new Date(leaseRequest.endDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Landlord Information */}
      <Card className="bg-white border-slate-200 shadow-clean">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            Landlord Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 font-medium">{leaseRequest.landlordName}</span>
          </div>
          {leaseRequest.landlordEmail && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{leaseRequest.landlordEmail}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applicant Notes */}
      {leaseRequest.applicantNotes && (
        <Card className="bg-white border-slate-200 shadow-clean">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Your Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 leading-relaxed">{leaseRequest.applicantNotes}</p>
          </CardContent>
        </Card>
      )}

      {/* Landlord Remarks */}
      {leaseRequest.landlordRemarks && (
        <Card className="bg-white border-slate-200 shadow-clean">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              Landlord Remarks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 leading-relaxed">{leaseRequest.landlordRemarks}</p>
          </CardContent>
        </Card>
      )}

      {/* Status-specific message */}
      {leaseRequest.status === "PENDING" && (
        <Card className="bg-amber-50 border-amber-200 shadow-clean">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900">Awaiting Landlord Review</p>
                <p className="text-xs text-amber-800 mt-1">
                  Your lease request is currently being reviewed by the landlord. You will be notified once a decision is made.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {leaseRequest.status === "APPROVED" && !leaseRequest.agreementGenerated && (
        <Card className="bg-blue-50 border-blue-200 shadow-clean">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Pending Landlord Agreement</p>
                <p className="text-xs text-blue-800 mt-1">
                  Your request has been approved. The landlord is currently generating the agreement. You will be notified when it's ready for signing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {leaseRequest.status === "APPROVED" && leaseRequest.agreementGenerated && (
        <Card className="bg-emerald-50 border-emerald-200 shadow-clean">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-900">Request Approved</p>
                <p className="text-xs text-emerald-800 mt-1">
                  Your lease request has been approved by the landlord. Please proceed with the agreement signing process.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {leaseRequest.status === "REJECTED" && (
        <Card className="bg-rose-50 border-rose-200 shadow-clean">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-rose-900">Request Declined</p>
                <p className="text-xs text-rose-800 mt-1">
                  Your lease request has been declined by the landlord. Please review the landlord's remarks above and consider submitting a new request for a different property.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Withdraw Confirmation Dialog */}
      <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <DialogContent onClose={() => setIsWithdrawDialogOpen(false)} className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>Confirm Withdraw Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to withdraw this lease request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-4">
            <Button variant="outline" onClick={() => setIsWithdrawDialogOpen(false)} disabled={isWithdrawing}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleWithdraw}
              disabled={isWithdrawing}
            >
              {isWithdrawing ? "Withdrawing..." : "Withdraw Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
