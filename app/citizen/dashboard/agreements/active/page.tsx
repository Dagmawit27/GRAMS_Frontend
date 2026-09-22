"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCitizenData } from "@/hooks/useCitizenData";
import {
  AgreementResponse,
  getMyAgreements,
  getLandlordLeaseRequests,
  getMyLeaseRequests,
  getSession,
  LeaseRequestResponse,
} from "@/lib/api";
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
import { Building, FileText, CheckCircle2, Eye, ShieldCheck, UserCheck } from "lucide-react";

interface DisplayAgreement {
  id: string;
  agreementNumber: string;
  requestCode: string;
  propertyTitle: string;
  propertyCode: string;
  unitCode?: string;
  landlordName: string;
  landlordPhone?: string;
  tenantName: string;
  tenantPhone?: string;
  monthlyRent: number;
  status: string;
  contractDate?: string;
  createdAt?: string;
}

/**
 * /citizen/dashboard/agreements/active
 * Shows fully approved active rental agreements for both landlords and tenants.
 */
export default function ActiveAgreementsPage() {
  const { userRole } = useCitizenData();
  const router = useRouter();
  const [agreements, setAgreements] = useState<DisplayAgreement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const isTenant = userRole === "tenant";

  const fetchAgreements = useCallback(async () => {
    try {
      const session = getSession();
      if (!session?.token) {
        setError("No authentication token found");
        return;
      }

      const displayList: DisplayAgreement[] = [];
      const seenCodes = new Set<string>();

      // 1. Fetch official active agreements from backend Agreement module
      try {
        const officialAgreements: AgreementResponse[] = await getMyAgreements(session.token);
        if (officialAgreements && Array.isArray(officialAgreements)) {
          for (const a of officialAgreements) {
            seenCodes.add(a.requestCode);
            displayList.push({
              id: a.id,
              agreementNumber: a.agreementNumber || a.requestCode,
              requestCode: a.requestCode,
              propertyTitle: a.propertyTitle || "Residential Property",
              propertyCode: a.propertyCode || "N/A",
              unitCode: a.unitCode,
              landlordName: a.landlordName || "Landlord",
              landlordPhone: a.landlordPhone,
              tenantName: a.tenantName || "Tenant",
              tenantPhone: a.tenantPhone,
              monthlyRent: a.monthlyRent || 0,
              status: a.status || "ACTIVE",
              contractDate: a.contractDate,
              createdAt: a.createdAt,
            });
          }
        }
      } catch (err) {
        console.warn("Could not load from getMyAgreements, checking fallback:", err);
      }

      // 2. Fetch any legacy approved lease requests not yet in the official agreement list
      try {
        const leaseRequests: LeaseRequestResponse[] = isTenant
          ? await getMyLeaseRequests(session.token)
          : await getLandlordLeaseRequests(session.token);

        if (leaseRequests && Array.isArray(leaseRequests)) {
          for (const lr of leaseRequests) {
            if (
              (lr.status === "SUPERVISOR_APPROVED" || lr.status === "APPROVED") &&
              !seenCodes.has(lr.requestCode)
            ) {
              seenCodes.add(lr.requestCode);
              displayList.push({
                id: lr.id,
                agreementNumber: `AGR-${lr.requestCode}`,
                requestCode: lr.requestCode,
                propertyTitle: lr.propertyTitle || "Residential Property",
                propertyCode: lr.propertyCode || "N/A",
                unitCode: lr.unitCode,
                landlordName: lr.landlordName || "Landlord",
                landlordPhone: "",
                tenantName: lr.applicantName || "Tenant",
                tenantPhone: lr.applicantPhone,
                monthlyRent: lr.proposedRent || 0,
                status: "ACTIVE",
                contractDate: lr.createdAt,
                createdAt: lr.createdAt,
              });
            }
          }
        }
      } catch (err) {
        console.warn("Could not load fallback lease requests:", err);
      }

      setAgreements(displayList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load active agreements");
    } finally {
      setIsLoading(false);
    }
  }, [isTenant]);

  useEffect(() => {
    fetchAgreements();
  }, [fetchAgreements]);

  // Real-time SSE connection to refresh when an agreement is approved
  useEffect(() => {
    const session = getSession();
    if (!session?.user?.email) return;

    const userEmail = session.user.email;
    const { sseManager } = require("@/lib/sseManager");
    sseManager.connect(userEmail);

    const unsubscribe = sseManager.onNotification((notification: any) => {
      const nType = (notification.type || "").toUpperCase();
      if (
        notification.module === "LEASE" ||
        nType === "AGREEMENT_APPROVED" ||
        nType === "LEASE_REQUEST_APPROVED" ||
        nType === "LEASE_REQUEST_VERIFIED" ||
        nType === "LEASE_REQUEST_SIGNED" ||
        nType === "AGREEMENT_SIGNED" ||
        nType === "LEASE_REQUEST_STATUS_CHANGED"
      ) {
        console.log("Active agreements page: Agreement approved event received, reloading...");
        setTimeout(() => {
          fetchAgreements();
        }, 500);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [fetchAgreements]);

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
            Legally binding rental agreements approved by Woreda Administration.
          </p>
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-clean overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CardTitle className="text-base font-semibold text-slate-900">
              {isTenant ? "My Rented Properties & Leases" : "Active Tenant Agreements"}
            </CardTitle>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-semibold px-2 py-0.5 rounded-full">
              {agreements.length} Active
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  AGREEMENT NUMBER
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  PROPERTY
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {isTenant ? "LANDLORD" : "TENANT"}
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  MONTHLY RENT
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  STATUS
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agreements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                    <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No active agreements found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Agreements will appear here once verified by the Woreda Officer and approved by the Supervisor.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                agreements.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell>
                      <div>
                        <span className="font-mono font-semibold text-xs text-slate-900 block">
                          {item.agreementNumber}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Ref: {item.requestCode}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <span className="font-semibold text-xs text-slate-900 block">
                          {item.propertyTitle}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          {item.propertyCode}
                          {item.unitCode && ` • Unit: ${item.unitCode}`}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs font-medium text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <div>
                          <span>{isTenant ? item.landlordName : item.tenantName}</span>
                          {(isTenant ? item.landlordPhone : item.tenantPhone) && (
                            <span className="text-[11px] text-slate-400 block font-normal">
                              {isTenant ? item.landlordPhone : item.tenantPhone}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="font-semibold text-xs text-slate-900">
                      {item.monthlyRent.toLocaleString()} ETB
                    </TableCell>

                    <TableCell>
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-semibold px-2.5 py-0.5 uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                        Active
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/citizen/dashboard/agreements/active/${item.requestCode}`)
                          }
                          className="h-8 px-3 text-xs font-medium cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View Agreement
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

      {agreements.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900">
              <p className="font-semibold mb-1">Official Government-Registered Agreements</p>
              <p className="leading-relaxed">
                These agreements have completed all legal steps: landlord and tenant digital signatures, Woreda officer verification, and supervisor approval.
                They are registered in the Addis Ababa Housing Bureau system and are legally binding under Ethiopian rental law.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
