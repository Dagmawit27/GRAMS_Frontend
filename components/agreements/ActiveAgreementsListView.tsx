"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AgreementResponse, getAllActiveAgreements, getSession } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
} from "lucide-react";
import { sseManager } from "@/lib/sseManager";

interface ActiveAgreementsListViewProps {
  roleTitle: string;
  baseDetailPath: string;
}

export const ActiveAgreementsListView: React.FC<ActiveAgreementsListViewProps> = ({
  roleTitle,
  baseDetailPath,
}) => {
  const router = useRouter();
  const [agreements, setAgreements] = useState<AgreementResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchAgreements = useCallback(async () => {
    setIsLoading(true);
    try {
      const session = getSession();
      if (!session?.token) {
        setError("Authentication required. Please log in.");
        return;
      }
      const data = await getAllActiveAgreements(session.token);
      setAgreements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load active agreements.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgreements();
  }, [fetchAgreements]);

  // Real-time SSE listener
  useEffect(() => {
    const session = getSession();
    if (!session?.token) return;

    const email = session.user?.email;
    const woreda = session.user?.woreda;

    if (woreda) {
      sseManager.connect(`woreda-officer-${woreda}`);
      sseManager.connect(`woreda-supervisor-${woreda}`);
    }
    if (email) {
      sseManager.connect(email);
    }

    const unsubscribe = sseManager.onNotification((notification: any) => {
      const nType = (notification.type || "").toUpperCase();
      if (
        notification.module === "LEASE" ||
        nType === "AGREEMENT_APPROVED" ||
        nType === "LEASE_REQUEST_APPROVED" ||
        nType === "LEASE_REQUEST_STATUS_CHANGED"
      ) {
        console.log("ActiveAgreementsListView: Real-time update received, refreshing...");
        setTimeout(() => {
          fetchAgreements();
        }, 500);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [fetchAgreements]);

  // Filter agreements by search query
  const filtered = agreements.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.agreementNumber?.toLowerCase().includes(q) ||
      a.requestCode?.toLowerCase().includes(q) ||
      a.propertyTitle?.toLowerCase().includes(q) ||
      a.propertyCode?.toLowerCase().includes(q) ||
      a.tenantName?.toLowerCase().includes(q) ||
      a.landlordName?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/70">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Active Registered Agreements
            </h1>
            <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-xs">
              Read-Only
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Official government repository of legally binding active lease agreements in Addis Ababa.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            {agreements.length} Active Records
          </Badge>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by agreement #, request code, property, or citizen..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 bg-white border-slate-200 text-sm h-10 shadow-2xs"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Table Card */}
      <Card className="bg-white border-slate-200 shadow-clean overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Legally Binding Agreements
            </CardTitle>
            <span className="text-xs text-slate-400 font-medium">
              ({filtered.length} found)
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
                  TENANT
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  LANDLORD
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  MONTHLY RENT
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  REGISTERED DATE
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  STATUS
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  ACTION
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-500 mt-2 font-medium">Loading active agreements...</p>
                  </TableCell>
                </TableRow>
              ) : paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16 text-slate-400">
                    <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-700">No active agreements found</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Once lease requests are verified by officers and approved by supervisors, they are recorded as official active agreements and will appear here.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell>
                      <div>
                        <span className="font-mono font-bold text-xs text-slate-900 block">
                          {item.agreementNumber || `AGR-${item.requestCode}`}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Ref: {item.requestCode}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <span className="font-semibold text-xs text-slate-900 block">
                          {item.propertyTitle || "Residential Property"}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          {item.propertyCode}
                          {item.unitCode && ` • Unit: ${item.unitCode}`}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <span className="text-xs font-medium text-slate-900 block">
                          {item.tenantName}
                        </span>
                        {item.tenantPhone && (
                          <span className="text-[11px] text-slate-400 block font-normal">
                            {item.tenantPhone}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <span className="text-xs font-medium text-slate-900 block">
                          {item.landlordName}
                        </span>
                        {item.landlordPhone && (
                          <span className="text-[11px] text-slate-400 block font-normal">
                            {item.landlordPhone}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="font-semibold text-xs text-slate-900">
                      {item.monthlyRent?.toLocaleString() ?? 0} ETB
                    </TableCell>

                    <TableCell className="text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>
                          {item.supervisorApprovedAt
                            ? new Date(item.supervisorApprovedAt).toLocaleDateString("en-GB")
                            : item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString("en-GB")
                            : "N/A"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-semibold px-2.5 py-0.5 uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                        Active
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`${baseDetailPath}/${item.requestCode}`)}
                        className="h-8 px-3 text-xs font-medium cursor-pointer gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 px-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
