"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCitizenData } from "@/hooks/useCitizenData";
import { LeaseRequestResponse, getLandlordLeaseRequests, getMyLeaseRequests, getSession } from "@/lib/api";
import { sseManager } from "@/lib/sseManager";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Building, FileText, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { UnauthorizedAccess } from "@/components/UnauthorizedAccess";

/**
 * /citizen/dashboard/agreements/pending
 * Shows approved agreements waiting for woreda officer verification and supervisor approval
 */
export default function PendingAgreementsPage() {
  const { userRole } = useCitizenData();
  const router = useRouter();
  const [leaseRequests, setLeaseRequests] = useState<LeaseRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLeaseRequests = useCallback(async () => {
    try {
      const session = getSession();
      if (!session?.token) {
        setError("No authentication token found");
        setIsLoading(false);
        return;
      }

      let landlordData: LeaseRequestResponse[] = [];
      try {
        landlordData = await getLandlordLeaseRequests(session.token);
      } catch (err) {
        console.warn("Could not fetch landlord lease requests:", err);
      }

      let myData: LeaseRequestResponse[] = [];
      try {
        myData = await getMyLeaseRequests(session.token);
      } catch (err) {
        console.warn("Could not fetch applicant lease requests:", err);
      }

      const mergedMap = new Map<string, LeaseRequestResponse>();
      landlordData.forEach((r) => mergedMap.set(r.requestCode, r));
      myData.forEach((r) => {
        if (!mergedMap.has(r.requestCode)) {
          mergedMap.set(r.requestCode, r);
        }
      });

      setLeaseRequests(Array.from(mergedMap.values()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lease requests");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaseRequests();
  }, [fetchLeaseRequests]);

  // SSE connection for real-time lease request notifications
  useEffect(() => {
    const session = getSession();
    const userEmail = session?.user?.email;
    const userId = session?.user?.id;
    if (!userEmail && !userId) return;

    if (userEmail) {
      console.log("Pending agreements page: Connecting to SSE with email:", userEmail);
      sseManager.connect(userEmail.trim());
      sseManager.connect(userEmail.trim().toLowerCase());
    }
    if (userId) {
      sseManager.connect(userId.trim());
    }

    // Listen for notifications
    const unsubscribe = sseManager.onNotification((notification: any) => {
      console.log("Pending agreements page: Received SSE notification:", notification);
      
      const nType = (notification.type || "").toUpperCase();
      if (
        notification.module === 'LEASE' ||
        nType === 'AGREEMENT_REQUESTED' ||
        nType === 'LEASE_REQUEST_SIGNED' ||
        nType === 'LEASE_REQUEST_VERIFIED' ||
        nType === 'LEASE_REQUEST_APPROVED' ||
        nType === 'AGREEMENT_APPROVED' ||
        nType === 'AGREEMENT_SIGNED' ||
        nType === 'LEASE_REQUEST_STATUS_CHANGED'
      ) {
        console.log("Lease event received, reloading pending agreements...");
        setTimeout(() => {
          fetchLeaseRequests();
        }, 300);
      }
    });

    return () => {
      console.log("Cleaning up SSE listener in pending agreements");
      unsubscribe();
    };
  }, [fetchLeaseRequests]);

  // Redirect tenants to their lease page
  useEffect(() => {
    if (userRole === "tenant") {
      router.push("/citizen/dashboard/leases");
    }
  }, [userRole, router]);

  // Helper to render appropriate status badge based on user requirements:
  // - If both parties signed -> Under Verification
  // - If officer verified -> Verified
  // - If supervisor approved -> Approved
  const getStatusBadge = (req: LeaseRequestResponse) => {
    if (req.status === "SUPERVISOR_APPROVED" || req.status === "APPROVED") {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-semibold px-2.5 py-0.5 uppercase tracking-wider">
          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
          Approved
        </Badge>
      );
    }
    if (req.status === "PENDING_SUPERVISOR_APPROVAL") {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border border-blue-200 text-[11px] font-semibold px-2.5 py-0.5 uppercase tracking-wider">
          <ShieldCheck className="w-3 h-3 mr-1 text-blue-600" />
          Verified
        </Badge>
      );
    }
    if (req.status === "UNDER_VERIFICATION" || (req.landlordSigned && req.tenantSigned)) {
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border border-amber-200 text-[11px] font-semibold px-2.5 py-0.5 uppercase tracking-wider">
          <Clock className="w-3 h-3 mr-1 text-amber-600" />
          Under Verification
        </Badge>
      );
    }
    if (req.landlordSigned && !req.tenantSigned) {
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border border-purple-200 text-[11px] font-semibold px-2.5 py-0.5 uppercase tracking-wider">
          <Clock className="w-3 h-3 mr-1 text-purple-600" />
          Awaiting Tenant Signature
        </Badge>
      );
    }
    if (!req.landlordSigned && req.tenantSigned) {
      return (
        <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border border-orange-200 text-[11px] font-semibold px-2.5 py-0.5 uppercase tracking-wider">
          <Clock className="w-3 h-3 mr-1 text-orange-600" />
          Awaiting Landlord Signature
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border border-amber-200 text-[11px] font-semibold px-2.5 py-0.5 uppercase tracking-wider">
        <Clock className="w-3 h-3 mr-1 text-amber-600" />
        Pending Signature
      </Badge>
    );
  };

  // Filter approved agreements waiting for woreda verification or approval (approved agreements move to Active Agreements)
  const pendingAgreements = leaseRequests.filter(
    (r) =>
      r.status === "LANDLORD_APPROVED" ||
      r.status === "UNDER_VERIFICATION" ||
      r.status === "PENDING_SUPERVISOR_APPROVAL" ||
      r.status === "SUPERVISOR_APPROVED" ||
      r.status === "APPROVED"
  );

  // Show access denied for non-landlord users
  if (userRole === "tenant") {
    return <UnauthorizedAccess requiredRole="landlord" currentRole="tenant" path="/citizen/dashboard/agreements/pending" />;
  }

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
    <div className="space-y-6 animate-in fade-in duration-150">
      <Card className="bg-white border-slate-200 shadow-clean overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">REQUEST ID</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PROPERTY</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">TENANT</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">MONTHLY RENT</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingAgreements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-400">
                    No pending agreements.
                  </TableCell>
                </TableRow>
              ) : (
                pendingAgreements.map((req, index) => (
                  <TableRow
                    key={req.requestCode}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => router.push(`/citizen/dashboard/agreements/pending/${req.requestCode}`)}
                  >
                    <TableCell className="font-mono font-medium text-xs text-slate-900">
                      #{index + 1}
                    </TableCell>

                    <TableCell>
                      <div>
                        <span className="font-semibold text-xs text-slate-900 block">
                          {req.propertyTitle}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          {req.propertyCode}
                          {req.unitCode && ` • Unit: ${req.unitCode}`}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs font-medium text-slate-900">
                      {req.applicantName}
                    </TableCell>

                    <TableCell className="font-semibold text-xs text-slate-900">
                      {req.proposedRent.toLocaleString()} ETB
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(req)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pendingAgreements.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900">
              <p className="font-semibold mb-1">Agreement Verification Process</p>
              <p className="leading-relaxed">
                These agreements have been approved by you and are now being verified by woreda officers. 
                Once verified by the officer and approved by the supervisor, they will move to Active Agreements.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
