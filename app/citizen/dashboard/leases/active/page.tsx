"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AgreementResponse,
  getTenantActiveAgreements,
  getTenantAgreements,
  getSession,
} from "@/lib/api";
import { useCitizenData } from "@/hooks/useCitizenData";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Building,
  FileText,
  CheckCircle2,
  Eye,
  ShieldCheck,
  User,
  Phone,
  Calendar,
  CreditCard,
  Receipt,
  Copy,
  Check,
  Search,
  ExternalLink,
  ArrowRight,
  Clock,
  Sparkles,
  MapPin,
} from "lucide-react";
import { UnauthorizedAccess } from "@/components/UnauthorizedAccess";
import { AgreementViewModal } from "@/components/AgreementViewModal";
import { RentalAgreement } from "@/types";

export default function TenantActiveAgreementsPage() {
  const { userRole, viewingAgreement, setViewingAgreement } = useCitizenData();
  const router = useRouter();
  const [agreements, setAgreements] = useState<AgreementResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal inspection state
  const [selectedModalAgreement, setSelectedModalAgreement] = useState<RentalAgreement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If user is "both", seamlessly redirect to /citizen/dashboard/agreements/active
  useEffect(() => {
    if (userRole === "both") {
      router.replace("/citizen/dashboard/agreements/active");
    }
  }, [userRole, router]);

  const fetchTenantAgreements = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const session = getSession();
      if (!session?.token) {
        setError("No active session found. Please log in.");
        return;
      }

      let data: AgreementResponse[] = [];
      try {
        data = await getTenantActiveAgreements(session.token);
      } catch (err) {
        console.warn("Primary getTenantActiveAgreements failed, attempting fallback:", err);
        const allTenantAgreements = await getTenantAgreements(session.token);
        data = allTenantAgreements.filter(
          (a) => (a.status || "").toUpperCase() === "ACTIVE"
        );
      }

      setAgreements(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load active tenancy agreements.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userRole !== "landlord" && userRole !== "both") {
      fetchTenantAgreements();
    }
  }, [fetchTenantAgreements, userRole]);

  // Real-time SSE listener for agreement activation events
  useEffect(() => {
    const session = getSession();
    if (!session?.user?.email) return;

    let unsubscribe = () => {};
    try {
      const { sseManager } = require("@/lib/sseManager");
      sseManager.connect(session.user.email);
      unsubscribe = sseManager.onNotification((notification: any) => {
        const nType = (notification.type || "").toUpperCase();
        if (
          notification.module === "LEASE" ||
          nType === "AGREEMENT_APPROVED" ||
          nType === "LEASE_REQUEST_APPROVED" ||
          nType === "AGREEMENT_ACTIVATED" ||
          nType === "LEASE_REQUEST_SIGNED"
        ) {
          fetchTenantAgreements();
        }
      });
    } catch (e) {
      console.warn("SSE connection error:", e);
    }

    return () => {
      unsubscribe();
    };
  }, [fetchTenantAgreements]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenAgreementModal = (item: AgreementResponse) => {
    const rentalAgreement: RentalAgreement = {
      id: item.id,
      agreementCode: item.agreementNumber || item.requestCode,
      propertyTitle: item.propertyTitle || "Residential Property",
      propertyLocation: `${item.propertySubCity || "Addis Ababa"}, Woreda ${item.propertyWoreda || "N/A"}${item.unitNumber ? ` · Unit ${item.unitNumber}` : ""}`,
      unitNumber: item.unitNumber,
      counterpartyName: item.landlordName || "Landlord",
      counterpartyInitials: (item.landlordName || "LL").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
      counterpartyRole: "Landlord",
      startDate: item.startDate || item.contractDate || item.createdAt?.substring(0, 10) || "N/A",
      endDate: item.endDate || "Ongoing",
      monthlyRent: item.monthlyRent || 0,
      status: "Active",
      depositAmount: item.securityDeposit || 0,
      termsSummary: `Standard Municipal Residential Lease (${item.leaseDurationMonths || 12} months). Utilities paid by: ${item.utilitiesPaidBy || "Tenant"}.`,
      landlordName: item.landlordName,
      tenantName: item.tenantName,
      landlordSigned: item.landlordSigned,
      tenantSigned: item.tenantSigned,
      landlordSignedDate: item.landlordSignedAt,
      tenantSignedDate: item.tenantSignedAt,
      landlordSignatureHash: item.landlordSignature,
      tenantSignatureHash: item.tenantSignature,
    };

    setSelectedModalAgreement(rentalAgreement);
    setIsModalOpen(true);
  };

  // 1. Guard against Landlord role
  if (userRole === "landlord") {
    return (
      <UnauthorizedAccess
        requiredRole="tenant"
        currentRole="landlord"
        path="/citizen/dashboard/leases/active"
      />
    );
  }

  // 2. Dual (Both) accounts routing state
  if (userRole === "both") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500">
          Redirecting to consolidated Active Agreements portal...
        </p>
      </div>
    );
  }

  const totalMonthlyCommitment = agreements.reduce(
    (acc, curr) => acc + (curr.monthlyRent || 0),
    0
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">

      {/* KPI Overview Cards
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            {isLoading ? (
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  ACTIVE CONTRACTS
                </span>
                <div className="text-2xl font-bold text-slate-900 font-mono">
                  {agreements.length}
                </div>
                <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Fully Woreda Approved
                </span>
              </div>
            )}
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/80 shrink-0 ml-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            {isLoading ? (
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-3.5 w-24" />
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  MONTHLY RENT COMMITMENT
                </span>
                <div className="text-2xl font-bold text-slate-900 font-mono">
                  ETB {totalMonthlyCommitment.toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-500">
                  Across all active rented homes
                </span>
              </div>
            )}
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/80 shrink-0 ml-3">
              <CreditCard className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            {isLoading ? (
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-3.5 w-36" />
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  DIGITAL FAYDA STAMP
                </span>
                <div className="text-base font-bold text-slate-900 flex items-center gap-1.5 mt-1">
                  <Sparkles className="w-4 h-4 text-emerald-600" /> Cryptographically Valid
                </div>
                <span className="text-[11px] text-slate-500">
                  Statutory 2-Year Renewal Guard
                </span>
              </div>
            )}
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/80 shrink-0 ml-3">
              <Building className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Main Active Agreements Table Card */}
      <Card className="bg-white border-slate-200 shadow-clean overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isLoading ? (
              <CardTitle className="text-sm sm:text-base font-semibold text-slate-900">
                <Skeleton className="h-4 w-28 mb-1.5" />
                <Skeleton className="h-3 w-20" />
              </CardTitle>
            ) : (
              <>
              <CardTitle className="text-sm sm:text-base font-semibold text-slate-900">
                Active Tenancy Contracts
              </CardTitle>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200/80 text-[11px] font-semibold">
                {agreements.length} Active
              </Badge>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 border-b border-slate-100">
                    <TableHead className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">                     
                      <Skeleton className="h-4 w-28 mb-1.5" />
                      <Skeleton className="h-3 w-20" />
                    </TableHead>
                    <TableHead className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">                    
                      <Skeleton className="h-4 w-28 mb-1.5" />
                      <Skeleton className="h-3 w-20" />
                    </TableHead>
                    <TableHead className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">                    
                      <Skeleton className="h-4 w-28 mb-1.5" />
                      <Skeleton className="h-3 w-20" />
                    </TableHead>
                    <TableHead className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">                    
                      <Skeleton className="h-4 w-28 mb-1.5" />
                      <Skeleton className="h-3 w-20" />
                    </TableHead>
                    <TableHead className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">                    
                      <Skeleton className="h-4 w-28 mb-1.5" />
                      <Skeleton className="h-3 w-20" />
                    </TableHead>
                    <TableHead className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">                    
                      <Skeleton className="h-4 w-28 mb-1.5" />
                      <Skeleton className="h-3 w-20" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                  {[1, 2, 3, 4].map((i) => (
                    <TableRow key={i} className="hover:bg-transparent">
                      <TableCell className="py-4 px-4">
                        <Skeleton className="h-4 w-28 mb-1.5" />
                        <Skeleton className="h-3 w-20" />
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <Skeleton className="h-4 w-36 mb-1.5" />
                        <Skeleton className="h-3 w-28" />
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <Skeleton className="h-4 w-32 mb-1.5" />
                        <Skeleton className="h-3 w-24" />
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <Skeleton className="h-4 w-24 mb-1.5" />
                        <Skeleton className="h-3 w-16" />
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <Skeleton className="h-4 w-28 mb-1.5" />
                        <Skeleton className="h-3 w-20" />
                      </TableCell>
                      <TableCell className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Skeleton className="h-8 w-16 rounded-md" />
                          <Skeleton className="h-8 w-20 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs max-w-md mx-auto">
                {error}
              </div>
            </div>
          ) : agreements.length === 0 ? (
            <div className="py-16 px-4 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                No Active Tenancy Contracts
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                You do not currently have any active certified rental agreements. When a landlord approves your application and the Woreda supervisor certifies it, your contract will be displayed here.
              </p>
              <div className="mt-5 flex items-center justify-center gap-2.5">
                <Link href="/citizen/dashboard/search">
                  <Button size="sm" className="bg-[#00450d] hover:bg-[#164e23] text-white text-xs font-semibold">
                    <Search className="w-3.5 h-3.5 mr-1" />
                    Find a Home
                  </Button>
                </Link>
                <Link href="/citizen/dashboard/leases">
                  <Button variant="outline" size="sm" className="text-xs font-semibold">
                    View My Applications
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 border-b border-slate-100">
                    <TableHead className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      CONTRACT ID
                    </TableHead>
                    <TableHead className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      RENTED PROPERTY
                    </TableHead>
                    <TableHead className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      LESSOR / LANDLORD
                    </TableHead>
                    <TableHead className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      MONTHLY RENT
                    </TableHead>
                    <TableHead className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      TENURE PERIOD
                    </TableHead>
                    <TableHead className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">
                      ACTIONS
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                  {agreements.map((item) => {
                    const displayCode = item.agreementNumber || item.requestCode;
                    return (
                      <TableRow key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Contract ID */}
                        <TableCell className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {displayCode}
                            </span>
                            <button
                              onClick={() => copyToClipboard(displayCode)}
                              className="text-slate-400 hover:text-slate-600 p-1 rounded"
                              title="Copy Agreement Code"
                            >
                              {copiedCode === displayCode ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Certified ACTIVE
                          </span>
                        </TableCell>

                        {/* Rented Property */}
                        <TableCell className="py-3.5 px-4">
                          <div className="font-semibold text-xs text-slate-900">
                            {item.propertyTitle || "Residential Home"}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {item.propertySubCity || "Addis Ababa"} · Woreda {item.propertyWoreda || "03"}
                          </div>
                        </TableCell>

                        {/* Lessor / Landlord */}
                        <TableCell className="py-3.5 px-4">
                          <div className="font-medium text-xs text-slate-900 flex items-center gap-1.5">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            {item.landlordName || "Registered Landlord"}
                          </div>
                          {item.landlordPhone && (
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-2.5 h-2.5 text-slate-400" />
                              {item.landlordPhone}
                            </div>
                          )}
                        </TableCell>

                        {/* Monthly Rent */}
                        <TableCell className="py-3.5 px-4">
                          <div className="font-mono text-xs font-bold text-slate-900">
                            ETB {(item.monthlyRent || 0).toLocaleString()}
                          </div>
                          <span className="text-[10px] text-slate-400">Due monthly</span>
                        </TableCell>

                        {/* Tenure Period */}
                        <TableCell className="py-3.5 px-4">
                          <div className="text-xs text-slate-800 font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {item.startDate ? new Date(item.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Active"}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5 text-slate-400" />
                            24 Months Statutory Term
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              onClick={() => handleOpenAgreementModal(item)}
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              View Contract
                            </Button>

                            <Link href="/citizen/dashboard/bills">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1"
                                title="View Bills & Invoices"
                              >
                                <Receipt className="w-3.5 h-3.5 text-slate-500" />
                                Invoices
                              </Button>
                            </Link>

                            <Link href="/citizen/dashboard/payments">
                              <Button
                                size="sm"
                                className="h-8 text-xs font-semibold bg-[#00450d] hover:bg-[#164e23] text-white flex items-center gap-1 shadow-2xs"
                              >
                                Pay Rent
                                <ArrowRight className="w-3 h-3" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Global Contract Inspection Modal */}
      {selectedModalAgreement && (
        <AgreementViewModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedModalAgreement(null);
          }}
          agreement={selectedModalAgreement}
        />
      )}
    </div>
  );
}
