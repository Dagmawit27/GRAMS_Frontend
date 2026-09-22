"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LeaseRequestResponse, getLeaseRequestsByStatus, approveLeaseRequest, getSession } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Building,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { sseManager } from "@/lib/sseManager";

export default function SupervisorAgreementApprovalsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"PENDING_SUPERVISOR_APPROVAL" | "SUPERVISOR_APPROVED">("PENDING_SUPERVISOR_APPROVAL");
  const [leaseRequests, setLeaseRequests] = useState<LeaseRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [approvingCode, setApprovingCode] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchLeaseRequests = async (statusToFetch = activeTab) => {
    setIsLoading(true);
    try {
      const session = getSession();
      if (!session?.token) {
        setError("Authentication required. Please log in.");
        return;
      }
      const data = await getLeaseRequestsByStatus(session.token, statusToFetch);
      setLeaseRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lease requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaseRequests(activeTab);
  }, [activeTab]);

  // SSE subscription for supervisor real-time agreement updates
  useEffect(() => {
    const session = getSession();
    if (!session?.token) return;

    const woreda = session.user?.woreda;
    const email = session.user?.email;

    if (woreda) {
      sseManager.connect(`woreda-supervisor-${woreda}`);
    }
    if (email) {
      sseManager.connect(email);
    }

    const unsubscribe = sseManager.onNotification((notification) => {
      console.log("SupervisorAgreementsPage: Received SSE notification:", notification);
      if (
        notification.module === "LEASE" ||
        notification.type === "TASK_PENDING_FOR_OFFICER" ||
        notification.type === "LEASE_REQUEST_STATUS_CHANGED" ||
        notification.type === "LEASE_REQUEST_VERIFIED" ||
        notification.type === "AGREEMENT_APPROVED"
      ) {
        console.log("SupervisorAgreementsPage: Reloading agreements on SSE event...");
        setTimeout(() => {
          fetchLeaseRequests(activeTab);
          setActionSuccess("Agreement updates received!");
          setTimeout(() => setActionSuccess(null), 4000);
        }, 500);
      }
    });

    return () => {
      unsubscribe();
      if (woreda) sseManager.disconnect(`woreda-supervisor-${woreda}`);
      if (email) sseManager.disconnect(email);
    };
  }, [activeTab]);

  const handleQuickApprove = async (requestCode: string) => {
    setApprovingCode(requestCode);
    try {
      const session = getSession();
      if (!session?.token) {
        setError("Authentication required");
        return;
      }
      await approveLeaseRequest(session.token, requestCode);
      setActionSuccess(`Agreement ${requestCode} has been officially approved and activated!`);
      // Refresh list
      await fetchLeaseRequests(activeTab);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve agreement");
    } finally {
      setApprovingCode(null);
    }
  };

  const handleViewDetail = (requestCode: string) => {
    router.push(`/officer/supervisor/agreements/${requestCode}`);
  };

  const getStatusBadge = (status: string) => {
    if (status === "SUPERVISOR_APPROVED" || status === "APPROVED") {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 font-bold border-emerald-200 text-[10px] uppercase tracking-wider">
          <CheckCircle2 className="w-3 h-3 mr-1 inline text-emerald-600" />
          Approved
        </Badge>
      );
    }
    if (status === "PENDING_SUPERVISOR_APPROVAL") {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 font-bold border-blue-200 text-[10px] uppercase tracking-wider">
          <ShieldCheck className="w-3 h-3 mr-1 inline text-blue-600" />
          Verified
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 font-bold border-amber-200 text-[10px] uppercase tracking-wider">
        <Clock className="w-3 h-3 mr-1 inline text-amber-600" />
        {status}
      </Badge>
    );
  };

  const totalPages = Math.ceil(leaseRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = leaseRequests.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-amber-600" />
            Agreement Approvals
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Agreements verified by Woreda Officers awaiting final Supervisor signature & municipal registration
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => { setActiveTab("PENDING_SUPERVISOR_APPROVAL"); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "PENDING_SUPERVISOR_APPROVAL"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Verified / Pending ({activeTab === "PENDING_SUPERVISOR_APPROVAL" ? leaseRequests.length : "•"})
          </button>
          <button
            onClick={() => { setActiveTab("SUPERVISOR_APPROVED"); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "SUPERVISOR_APPROVED"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Approved ({activeTab === "SUPERVISOR_APPROVED" ? leaseRequests.length : "•"})
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-sm font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-950 text-sm font-bold shadow-xs">
          {error}
        </div>
      )}

      {/* Table Card */}
      <Card className="border-slate-200 shadow-clean">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b border-slate-200">
                  <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Request Code
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Property
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Tenant
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Landlord
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Monthly Rent
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-700 uppercase tracking-wider text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                      {activeTab === "PENDING_SUPERVISOR_APPROVAL"
                        ? "No lease requests currently pending supervisor approval."
                        : "No approved lease requests found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((req) => (
                    <TableRow key={req.requestCode} className="border-b border-slate-100 hover:bg-slate-50">
                      <TableCell className="text-xs font-mono font-medium text-slate-700">
                        {req.requestCode}
                      </TableCell>
                      <TableCell className="text-xs text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold">{req.propertyTitle}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {req.propertyCode}
                          {req.unitCode && ` • Unit: ${req.unitCode}`}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{req.applicantName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{req.landlordName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-900">
                        {req.proposedRent?.toLocaleString()} ETB
                      </TableCell>
                      <TableCell className="text-xs">
                        {getStatusBadge(req.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(req.requestCode)}
                            className="h-8 text-xs font-medium border-slate-300 hover:bg-slate-50"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            View
                          </Button>
                          {req.status === "PENDING_SUPERVISOR_APPROVAL" && (
                            <Button
                              size="sm"
                              disabled={approvingCode === req.requestCode}
                              onClick={() => handleQuickApprove(req.requestCode)}
                              className="h-8 text-xs font-semibold bg-[#00450d] hover:bg-[#1b5e20] text-white"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              {approvingCode === req.requestCode ? "Approving..." : "Approve"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Showing {startIndex + 1} to {Math.min(endIndex, leaseRequests.length)} of {leaseRequests.length} requests
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 text-xs font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Previous
            </Button>
            <div className="text-xs text-slate-700 font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-8 text-xs font-medium"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
