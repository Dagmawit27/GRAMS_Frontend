"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LeaseRequestResponse, getLeaseRequestsByStatus, getSession } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  FileText,
  Calendar,
  Building,
  User,
  CheckCircle2,
} from "lucide-react";

export default function OfficerAgreementsListPage() {
  const router = useRouter();
  const [leaseRequests, setLeaseRequests] = useState<LeaseRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchLeaseRequests = async () => {
      try {
        const session = getSession();
        if (!session?.token) {
          setError("Authentication required");
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

    fetchLeaseRequests();
  }, []);

  const totalPages = Math.ceil(leaseRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = leaseRequests.slice(startIndex, endIndex);

  const handleViewDetail = (requestCode: string) => {
    router.push(`/officer/dashboard/agreements/${requestCode}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500 text-sm">Loading...</div>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Agreement Verifications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Lease agreements pending officer verification
          </p>
        </div>
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 font-bold border-amber-300 text-xs">
          {leaseRequests.length} Pending
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
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500 text-sm">
                    No lease requests found
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((req) => (
                  <TableRow key={req.requestCode} className="border-b border-slate-100 hover:bg-slate-50">
                    <TableCell className="text-xs font-mono text-slate-700">
                      {req.requestCode}
                    </TableCell>
                    <TableCell className="text-xs text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">{req.propertyTitle}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {req.propertyCode}
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
                            : new Date(req.landlordSignedAt || "").toLocaleDateString()}
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
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(req.requestCode)}
                        className="h-8 text-xs font-medium text-slate-700 border-slate-200 hover:bg-slate-50"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View Detail
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
