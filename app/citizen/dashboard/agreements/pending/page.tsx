"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCitizenData } from "@/hooks/useCitizenData";
import { LeaseRequestResponse, getLandlordLeaseRequests, getSession } from "@/lib/api";
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
import { Building, FileText, CheckCircle2, Clock } from "lucide-react";

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

  useEffect(() => {
    const fetchLeaseRequests = async () => {
      try {
        const session = getSession();
        if (!session?.token) {
          setError("No authentication token found");
          return;
        }
        const data = await getLandlordLeaseRequests(session.token);
        setLeaseRequests(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load lease requests");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaseRequests();
  }, []);

  // Redirect tenants to their lease page
  useEffect(() => {
    if (userRole === "tenant") {
      router.push("/citizen/dashboard/leases");
    }
  }, [userRole, router]);

  // Filter approved agreements waiting for woreda verification
  const pendingAgreements = leaseRequests.filter(
    (r) => r.status === "APPROVED"
  );

  // Show access denied for non-landlord users
  if (userRole === "tenant") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-800 text-sm font-medium">Access Denied: This page is for landlords only</p>
      </div>
    );
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-slate-200/70">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Pending Agreements
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Agreements approved by landlord, awaiting woreda officer verification and supervisor approval.
          </p>
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-clean overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CardTitle className="text-base font-semibold text-slate-900">
              Awaiting Woreda Verification
            </CardTitle>
            <span className="bg-amber-50 text-amber-700 border border-amber-200/80 text-[11px] font-semibold px-2 py-0.5 rounded-full">
              {pendingAgreements.length} Pending
            </span>
          </div>
        </CardHeader>
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
                    No pending agreements awaiting woreda verification.
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
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border border-amber-200 text-[11px] font-semibold px-2.5 py-0.5 uppercase tracking-wider">
                          <Clock className="w-3 h-3 mr-1" />
                          Awaiting Verification
                        </Badge>
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
