"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCitizenData } from "@/hooks/useCitizenData";
import { LeaseRequestResponse, getLandlordLeaseRequests, getSession } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Building, FileText, CheckCircle2, Download, Eye } from "lucide-react";

/**
 * /citizen/dashboard/agreements/active
 * Shows fully approved agreements (signed by landlord & tenant, verified by woreda officer, approved by supervisor)
 * This displays the history of active agreements
 */
export default function ActiveAgreementsPage() {
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
    if (userRole === "tenant" || userRole === "citizen") {
      router.push("/citizen/dashboard/leases");
    }
  }, [userRole, router]);

  // Filter active agreements (fully approved and verified)
  // Note: This will need to be updated once backend has proper status for fully approved agreements
  const activeAgreements = leaseRequests.filter(
    (r) => r.status === "APPROVED" || r.status === "ACTIVE"
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
            Active Agreements
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Fully approved and verified rental agreements with complete history.
          </p>
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-clean overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CardTitle className="text-base font-semibold text-slate-900">
              Agreement History
            </CardTitle>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-semibold px-2 py-0.5 rounded-full">
              {activeAgreements.length} Active
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
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeAgreements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                    No active agreements found. Agreements will appear here after full approval and verification.
                  </TableCell>
                </TableRow>
              ) : (
                activeAgreements.map((req) => (
                  <TableRow key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-mono font-medium text-xs text-slate-900">
                      {req.id.substring(0, 8)}
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
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-semibold px-2.5 py-0.5 uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" />
                          Download
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {activeAgreements.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900">
              <p className="font-semibold mb-1">Fully Approved Agreements</p>
              <p className="leading-relaxed">
                These agreements have completed the full approval process:
                <br />
                • Signed by both landlord and tenant
                <br />
                • Verified by woreda officer
                <br />
                • Approved by woreda supervisor
                <br />
                They are now legally binding and recorded in the national repository.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
