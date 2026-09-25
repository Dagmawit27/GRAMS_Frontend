"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LeaseRequestResponse, getLeaseRequestsByStatus, getSession } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";
import { sseManager } from "@/lib/sseManager";

export default function OfficerAgreementReviewsPage() {
  const router = useRouter();
  const [leaseRequests, setLeaseRequests] = useState<LeaseRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const itemsPerPage = 15;

  const fetchLeaseRequests = async () => {
    try {
      const session = getSession();
      if (!session?.token) {
        setError("Authentication required. Please log in.");
        return;
      }
      const data = await getLeaseRequestsByStatus(session.token, "UNDER_VERIFICATION");
      setLeaseRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lease requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaseRequests();
  }, []);

  // SSE connection for real-time notifications on UNDER_VERIFICATION agreements
  useEffect(() => {
    const session = getSession();
    if (!session?.token) return;

    const woreda = session.user?.woreda;
    const email = session.user?.email;

    if (woreda) {
      console.log(`OfficerAgreements: Subscribing to woreda-officer-${woreda}`);
      sseManager.connect(`woreda-officer-${woreda}`);
    }
    if (email) {
      console.log(`OfficerAgreements: Subscribing to ${email}`);
      sseManager.connect(email);
    }

    const unsubscribe = sseManager.onNotification((notification) => {
      console.log("OfficerAgreementsPage: Received SSE notification:", notification);
      if (
        notification.module === "LEASE" ||
        notification.type === "TASK_PENDING_FOR_OFFICER" ||
        notification.type === "LEASE_REQUEST_SIGNED" ||
        notification.type === "LEASE_REQUEST_STATUS_CHANGED"
      ) {
        console.log("OfficerAgreementsPage: Reloading UNDER_VERIFICATION agreements...");
        setTimeout(() => {
          fetchLeaseRequests();
          setToastMessage("New lease agreement under verification received!");
          setTimeout(() => setToastMessage(null), 4000);
        }, 500);
      }
    });

    return () => {
      unsubscribe();
      if (woreda) sseManager.disconnect(`woreda-officer-${woreda}`);
      if (email) sseManager.disconnect(email);
    };
  }, []);

  const totalPages = Math.ceil(leaseRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = leaseRequests.slice(startIndex, endIndex);

  const handleViewDetail = (requestCode: string) => {
    router.push(`/officer/office/agreements/${requestCode}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-100">
        <div className="flex items-center justify-between pb-2">
          <div className="space-y-2">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Card className="bg-white border-slate-200 shadow-2xs overflow-hidden">
          <CardContent className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-20 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 text-sm font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Real-time Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-950 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#00450d]" />
            Agreement Reviews
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Lease agreements signed by both parties, pending Woreda Officer verification
          </p>
        </div>
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 font-bold border-amber-300 text-xs px-3 py-1">
          {leaseRequests.length} Pending Verification
        </Badge>
      </div>

      {/* Table Card */}
      <Card className="border-slate-200 shadow-clean">
        <CardContent className="p-0">
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
                  Signed Date
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
                    No lease requests currently pending verification.
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
                    <TableCell className="text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {req.tenantSignedAt
                            ? new Date(req.tenantSignedAt).toLocaleDateString()
                            : new Date(req.landlordSignedAt || req.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 font-bold border-amber-300 text-[10px] uppercase tracking-wider">
                        Under Verification
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleViewDetail(req.requestCode)}
                        className="h-8 text-xs font-semibold bg-[#00450d] hover:bg-[#1b5e20] text-white cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Verify
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
