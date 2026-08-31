import React, { useState, useEffect } from "react";
import { LeaseRequestResponse, getMyLeaseRequests, cancelLeaseRequest, getSession } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Plus
} from "lucide-react";
import { useRouter } from "next/navigation";

export const TenantLeaseRequestsView: React.FC = () => {
  const router = useRouter();
  const [leaseRequests, setLeaseRequests] = useState<LeaseRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "action" | "pending" | "declined">("all");

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

  const handleWithdrawLeaseRequest = async (requestCode: string) => {
    try {
      const session = getSession();
      if (!session?.token) return;
      await cancelLeaseRequest(session.token, requestCode);
      setLeaseRequests(leaseRequests.filter((r) => r.requestCode !== requestCode));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to withdraw request");
    }
  };

  const handleNavigate = (path: string) => {
    router.push(`/citizen/dashboard/${path}`);
  };

  const handleOpenTenantSigning = (req: LeaseRequestResponse) => {
    router.push(`/citizen/dashboard/agreements/lease-signing/${req.requestCode}`);
  };

  // Get tenant-specific requests
  const tenantRequests = leaseRequests;

  const actionRequiredCount = tenantRequests.filter((r) => r.status === "APPROVED").length;
  const pendingCount = tenantRequests.filter((r) => r.status === "PENDING").length;
  const declinedCount = tenantRequests.filter((r) => r.status === "REJECTED").length;

  const filteredRequests = tenantRequests.filter((r) => {
    if (activeFilter === "action") return r.status === "APPROVED";
    if (activeFilter === "pending") return r.status === "PENDING";
    if (activeFilter === "declined") return r.status === "REJECTED";
    return true;
  });

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
      </div>

      {/* Requests List (Matching Screenshot 3) */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
            No lease requests found in this category.
          </div>
        ) : (
          filteredRequests.map((req, index) => {
            const isReadyToSign = req.status === "APPROVED";
            const isAwaiting = req.status === "PENDING";
            const isDeclined = req.status === "REJECTED";

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

                    {isAwaiting && (
                      <Button
                        variant="outline"
                        onClick={() => handleWithdrawLeaseRequest(req.id)}
                        className="text-xs h-8 text-rose-600 border-rose-200 hover:bg-rose-50 font-medium"
                      >
                        Withdraw Request
                      </Button>
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
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TenantLeaseRequestsView;
