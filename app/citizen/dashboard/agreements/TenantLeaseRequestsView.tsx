import React, { useState, useEffect } from "react";
import { LeaseRequestResponse, getMyLeaseRequests, cancelLeaseRequest, getSession, deleteLeaseRequest } from "@/lib/api";
import { sseManager } from "@/lib/sseManager";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MapPin,
  Building,
  MoreVertical,
  Search,
  Plus,
  Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";

export const TenantLeaseRequestsView: React.FC = () => {
  const router = useRouter();
  const [leaseRequests, setLeaseRequests] = useState<LeaseRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "action" | "pending" | "declined" | "cancelled">("all");
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [requestCodeToWithdraw, setRequestCodeToWithdraw] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [requestCodeToDelete, setRequestCodeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchLeaseRequests = async () => {
      try {
        const session = getSession();
        if (!session?.token) {
          setError("No authentication token found");
          return;
        }
        const data = await getMyLeaseRequests(session.token);
        setLeaseRequests(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load lease requests");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaseRequests();
  }, []);

  // SSE connection for real-time lease status updates
  useEffect(() => {
    const session = getSession();
    const tenantUserId = session?.user?.email;
    const userId = session?.user?.id;
    if (!tenantUserId && !userId) return;

    if (tenantUserId) {
      console.log("TenantLeaseRequestsView: Using global SSE manager for email:", tenantUserId);
      sseManager.connect(tenantUserId.trim());
      sseManager.connect(tenantUserId.trim().toLowerCase());
    }
    if (userId) {
      sseManager.connect(userId.trim());
    }

    // Listen for notifications
    const unsubscribe = sseManager.onNotification((notification: any) => {
      console.log("TenantLeaseRequestsView: Received SSE notification:", notification);
      
      // If notification is about lease status change, signing, verification, approval, or cancellation, reload
      const nType = (notification.type || "").toUpperCase();
      if (
        notification.module === 'LEASE' ||
        nType === 'AGREEMENT_REQUESTED' ||
        nType === 'LEASE_REQUEST_SIGNED' ||
        nType === 'LEASE_REQUEST_VERIFIED' ||
        nType === 'LEASE_REQUEST_APPROVED' ||
        nType === 'AGREEMENT_APPROVED' ||
        nType === 'AGREEMENT_SIGNED' ||
        nType === 'LEASE_REQUEST_STATUS_CHANGED' ||
        nType === 'LEASE_REQUEST_CANCELLED'
      ) {
        console.log("TenantLeaseRequestsView: Lease status changed, reloading...");
        setTimeout(() => {
          const currentSession = getSession();
          if (currentSession?.token) {
            getMyLeaseRequests(currentSession.token)
              .then((data) => {
                setLeaseRequests(data);
              })
              .catch((err) => {
                console.error("Failed to reload lease requests:", err);
              });
          }
        }, 300);
      }
    });

    return () => {
      console.log("TenantLeaseRequestsView: Cleaning up SSE listener");
      unsubscribe();
    };
  }, []);

  const handleWithdrawLeaseRequest = async (requestCode: string) => {
    setRequestCodeToWithdraw(requestCode);
    setIsWithdrawDialogOpen(true);
  };

  const handleConfirmWithdraw = async () => {
    if (!requestCodeToWithdraw) return;

    setIsWithdrawing(true);
    try {
      const session = getSession();
      if (!session?.token) {
        alert("Authentication required");
        return;
      }
      await cancelLeaseRequest(session.token, requestCodeToWithdraw);
      setLeaseRequests(leaseRequests.filter((r) => r.requestCode !== requestCodeToWithdraw));
      setIsWithdrawDialogOpen(false);
      setRequestCodeToWithdraw(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to withdraw request");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleDeleteLeaseRequest = async (requestCode: string) => {
    setRequestCodeToDelete(requestCode);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!requestCodeToDelete) return;

    setIsDeleting(true);
    try {
      const session = getSession();
      if (!session?.token) {
        alert("Authentication required");
        return;
      }
      await deleteLeaseRequest(session.token, requestCodeToDelete);
      setLeaseRequests(leaseRequests.filter((r) => r.requestCode !== requestCodeToDelete));
      setIsDeleteDialogOpen(false);
      setRequestCodeToDelete(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete request");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNavigate = (path: string) => {
    router.push(`/citizen/dashboard/${path}`);
  };

  const handleOpenTenantSigning = (req: LeaseRequestResponse) => {
    router.push(`/citizen/dashboard/agreements/lease-signing/${req.requestCode}`);
  };

  const handleOpenDetail = (req: LeaseRequestResponse) => {
    router.push(`/citizen/dashboard/leases/${req.requestCode}`);
  };

  // Get tenant-specific requests (approved agreements move to Active Agreements)
  const tenantRequests = leaseRequests.filter(
    (r) => r.status !== "SUPERVISOR_APPROVED" && r.status !== "APPROVED"
  );

  const actionRequiredCount = tenantRequests.filter((r) => r.status === "LANDLORD_APPROVED").length;
  const pendingCount = tenantRequests.filter((r) => r.status === "PENDING").length;
  const declinedCount = tenantRequests.filter((r) => r.status === "REJECTED").length;
  const cancelledCount = tenantRequests.filter((r) => r.status === "CANCELLED").length;

  const filteredRequests = tenantRequests.filter((r) => {
    if (activeFilter === "action") return r.status === "LANDLORD_APPROVED";
    if (activeFilter === "pending") return r.status === "PENDING";
    if (activeFilter === "declined") return r.status === "REJECTED";
    if (activeFilter === "cancelled") return r.status === "CANCELLED";
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-in fade-in duration-100">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white border-slate-200 shadow-2xs overflow-hidden">
            <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-60" />
                  <Skeleton className="h-3.5 w-36" />
                </div>
              </div>
              <div className="flex items-center gap-3 self-end md:self-center">
                <Skeleton className="h-9 w-28 rounded-xl" />
                <Skeleton className="h-9 w-28 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs / Pills (Matching Screenshot 3) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
            activeFilter === "all"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          All ({tenantRequests.length})
        </button>

        <button
          onClick={() => setActiveFilter("action")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
            activeFilter === "action"
              ? "bg-emerald-800 text-white"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <span>Action Required</span>
          {actionRequiredCount > 0 && (
            <span className="bg-emerald-600 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {actionRequiredCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveFilter("pending")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
            activeFilter === "pending"
              ? "bg-amber-700 text-white"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <span>Pending</span>
          {pendingCount > 0 && (
            <span className="bg-amber-600 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveFilter("declined")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
            activeFilter === "declined"
              ? "bg-rose-700 text-white"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <span>Declined</span>
          {declinedCount > 0 && (
            <span className="bg-rose-600 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {declinedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveFilter("cancelled")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
            activeFilter === "cancelled"
              ? "bg-slate-700 text-white"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <span>Cancelled</span>
          {cancelledCount > 0 && (
            <span className="bg-slate-600 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {cancelledCount}
            </span>
          )}
        </button>
      </div>

      {/* Requests List (Matching Screenshot 3) */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
            No lease requests found in this category.
          </div>
        ) : (
          filteredRequests.map((req, index) => {
            const isReadyToSign = req.status === "LANDLORD_APPROVED" && !req.landlordSigned;
            const isLandlordSigned = req.status === "LANDLORD_APPROVED" && req.landlordSigned === true && req.tenantSigned === false;
            const isBothSigned = req.landlordSigned === true && req.tenantSigned === true;
            const isUnderVerification = req.status === "UNDER_VERIFICATION";
            const isPendingSupervisorApproval = req.status === "PENDING_SUPERVISOR_APPROVAL";
            const isFullyApproved = req.status === "SUPERVISOR_APPROVED";
            const isAwaiting = req.status === "PENDING";
            const isDeclined = req.status === "REJECTED";
            const isCancelled = req.status === "CANCELLED";

            return (
              <Card
                key={req.requestCode}
                className="bg-white border-slate-200 shadow-clean hover:border-slate-300 transition-all overflow-hidden"
              >
                <CardContent className="p-4 sm:p-5 space-y-4">
                  {/* Card Header Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {isReadyToSign && (
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 uppercase tracking-wider">
                          READY TO SIGN
                        </Badge>
                      )}
                      {isLandlordSigned && (
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border border-purple-200 text-[11px] font-bold px-2.5 py-0.5 uppercase tracking-wider">
                          LANDLORD SIGNED
                        </Badge>
                      )}
                      {isBothSigned && (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border border-blue-200 text-[11px] font-bold px-2.5 py-0.5 uppercase tracking-wider">
                          BOTH SIGNED
                        </Badge>
                      )}
                      {isUnderVerification && (
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border border-amber-200 text-[11px] font-bold px-2.5 py-0.5 uppercase tracking-wider">
                          UNDER VERIFICATION
                        </Badge>
                      )}
                      {isPendingSupervisorApproval && (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border border-blue-200 text-[11px] font-bold px-2.5 py-0.5 uppercase tracking-wider">
                          VERIFIED
                        </Badge>
                      )}
                      {isFullyApproved && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border border-green-200 text-[11px] font-bold px-2.5 py-0.5 uppercase tracking-wider">
                          APPROVED
                        </Badge>
                      )}
                      {isAwaiting && (
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border border-amber-200 text-[11px] font-bold px-2.5 py-0.5 uppercase tracking-wider">
                          AWAITING LANDLORD APPROVAL
                        </Badge>
                      )}
                      {isDeclined && (
                        <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border border-rose-200 text-[11px] font-bold px-2.5 py-0.5 uppercase tracking-wider">
                          REQUEST DECLINED
                        </Badge>
                      )}
                      {isCancelled && (
                        <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 border border-slate-200 text-[11px] font-bold px-2.5 py-0.5 uppercase tracking-wider">
                          CANCELLED
                        </Badge>
                      )}

                      <span className="text-[11px] text-slate-400 font-mono">
                        {req.propertyCode}
                      </span>
                    </div>

                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Applied: {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Main Property & Rent info row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    <div className="md:col-span-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {req.propertyTitle}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {req.propertyCode}
                        {req.unitCode && ` • Unit: ${req.unitCode}`}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        <strong>Landlord:</strong> {req.landlordName} &nbsp;•&nbsp; <strong>Lease Term:</strong> {req.leaseDurationMonths} Months
                      </p>
                    </div>

                    <div className="md:text-right flex md:flex-col justify-between items-start md:items-end">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                          Monthly Rent
                        </span>
                        <span className="text-lg font-extrabold text-slate-900">
                          {req.proposedRent.toLocaleString()} ETB
                        </span>
                        <span className="text-xs text-slate-400"> / Month</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Notes Boxes */}
                  {isReadyToSign && (
                    <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        Your request has been approved. Please review and digitally sign the agreement to secure the property.
                      </p>
                    </div>
                  )}

                  {isLandlordSigned && (
                    <div className="bg-purple-50/80 border border-purple-200/80 rounded-xl p-3 text-xs text-purple-900 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        The landlord has signed the agreement. Please review and sign the agreement to finalize the lease.
                      </p>
                    </div>
                  )}

                  {isAwaiting && (
                    <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        The landlord is reviewing your application. You will be notified once a decision is made.
                      </p>
                    </div>
                  )}

                  {isDeclined && (
                    <div className="bg-rose-50/80 border border-rose-200/80 rounded-xl p-3 text-xs text-rose-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider text-rose-800">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>NOTE FROM LANDLORD</span>
                      </div>
                      <p className="leading-relaxed text-slate-700 italic">
                        &quot;{req.landlordRemarks || "Thank you for your interest. Unfortunately, we have decided to proceed with another applicant."}&quot;
                      </p>
                    </div>
                  )}

                  {isCancelled && (
                    <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-700 flex items-start gap-2.5">
                      <XCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        This request has been cancelled by you.
                      </p>
                    </div>
                  )}

                  {/* Bottom Action Buttons */}
                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                    {isReadyToSign && (
                      <Button
                        onClick={() => handleOpenTenantSigning(req)}
                        className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs font-semibold h-9 px-4 gap-2 shadow-xs"
                      >
                        <span>Review & Sign Agreement</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}

                    {isLandlordSigned && (
                      <Button
                        onClick={() => handleOpenTenantSigning(req)}
                        className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold h-9 px-4 gap-2 shadow-xs"
                      >
                        <span>View & Sign Agreement</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}

                    {(isBothSigned || isUnderVerification || isPendingSupervisorApproval || isFullyApproved) && (
                      <Button
                        onClick={() => handleOpenTenantSigning(req)}
                        className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold h-9 px-4 gap-2 shadow-xs"
                      >
                        <span>View Detail</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}

                    {isAwaiting && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => handleOpenDetail(req)}
                          className="text-xs h-8 text-slate-700 font-medium"
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleWithdrawLeaseRequest(req.requestCode)}
                          className="text-xs h-8 text-rose-600 border-rose-200 hover:bg-rose-50 font-medium"
                        >
                          Withdraw Request
                        </Button>
                      </>
                    )}

                    {isDeclined && (
                      <Button
                        variant="outline"
                        onClick={() => handleNavigate("search")}
                        className="text-xs h-8 text-slate-700 font-medium"
                      >
                        Browse Similar Properties
                      </Button>
                    )}

                    {isCancelled && (
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteLeaseRequest(req.requestCode)}
                        className="text-xs h-8 text-rose-600 border-rose-200 hover:bg-rose-50 font-medium gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Request</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

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
              onClick={handleConfirmWithdraw}
              disabled={isWithdrawing}
            >
              {isWithdrawing ? "Withdrawing..." : "Withdraw Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent onClose={() => setIsDeleteDialogOpen(false)} className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>Confirm Delete Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this cancelled lease request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantLeaseRequestsView;
