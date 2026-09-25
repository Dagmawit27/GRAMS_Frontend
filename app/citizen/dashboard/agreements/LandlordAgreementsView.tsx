import React, { useState, useEffect } from "react";
import { LeaseRequestResponse, getLandlordLeaseRequests, getSession } from "@/lib/api";
import { sseManager } from "@/lib/sseManager";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  Plus,
  Search,
  ChevronRight,
  ChevronLeft,
  MapPin,
  FileText,
  Eye,
  CheckCircle2,
  Building
} from "lucide-react";
import { useRouter } from "next/navigation";

export const LandlordAgreementsView: React.FC = () => {
  console.log("LandlordAgreementsView: Component rendering");
  const router = useRouter();
  const [leaseRequests, setLeaseRequests] = useState<LeaseRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchLeaseRequests = async () => {
      console.log("LandlordAgreementsView: Fetching lease requests...");
      try {
        const session = getSession();
        if (!session?.token) {
          console.error("LandlordAgreementsView: No authentication token found, redirecting to login");
          router.push("/citizen/login");
          return;
        }
        console.log("LandlordAgreementsView: Calling getLandlordLeaseRequests with token");
        const data = await getLandlordLeaseRequests(session.token);
        console.log("LandlordAgreementsView: Received data:", data);
        console.log("LandlordAgreementsView: Data length:", data.length);
        if (data.length > 0) {
          console.log("LandlordAgreementsView: First item:", data[0]);
        }
        setLeaseRequests(data);
      } catch (err) {
        console.error("LandlordAgreementsView: Error fetching lease requests:", err);
        setError(err instanceof Error ? err.message : "Failed to load lease requests");
      } finally {
        console.log("LandlordAgreementsView: Setting isLoading to false");
        setIsLoading(false);
      }
    };

    fetchLeaseRequests();
  }, [router]);

  // SSE connection for real-time lease request notifications
  useEffect(() => {
    console.log("LandlordAgreementsView: SSE useEffect triggered");
    const session = getSession();
    console.log("LandlordAgreementsView: Session:", session);
    const landlordEmail = session?.user?.email;
    const userId = session?.user?.id;
    if (!landlordEmail && !userId) {
      console.log("LandlordAgreementsView: No session or email, skipping SSE");
      return;
    }

    if (landlordEmail) {
      console.log("LandlordAgreementsView: Using global SSE manager for email:", landlordEmail);
      sseManager.connect(landlordEmail.trim());
      sseManager.connect(landlordEmail.trim().toLowerCase());
    }
    if (userId) {
      sseManager.connect(userId.trim());
    }

    // Listen for notifications
    const unsubscribe = sseManager.onNotification((notification: any) => {
      console.log("LandlordAgreementsView: Received SSE notification:", notification);
      
      // If notification is about new lease request, status change, or cancellation, reload
      const notificationType = notification.type?.toUpperCase();
      if (
        notification.module === 'LEASE' ||
        notificationType === 'AGREEMENT_REQUESTED' || 
        notificationType === 'LEASE_REQUEST_CANCELLED' || 
        notificationType === 'LEASE_REQUEST_STATUS_CHANGED' || 
        notificationType === 'LEASE_REQUEST_SIGNED' ||
        notificationType === 'LEASE_REQUEST_VERIFIED' ||
        notificationType === 'LEASE_REQUEST_APPROVED' ||
        notificationType === 'AGREEMENT_APPROVED'
      ) {
        console.log("LandlordAgreementsView: Lease request update received, reloading...");
        setTimeout(() => {
          const currentSession = getSession();
          if (currentSession?.token) {
            getLandlordLeaseRequests(currentSession.token)
              .then((data) => {
                setLeaseRequests(data);
              })
              .catch((err) => {
                console.error("Failed to reload lease requests:", err);
              });
          }
        }, 300);
      }
    });

    return () => {
      console.log("LandlordAgreementsView: Cleaning up SSE listener");
      unsubscribe();
    };
  }, []);

  // Filter requests waiting for landlord review
  const pendingRequests = leaseRequests.filter(
    (r) => r.status === "PENDING"
  );

  // Filter history (accepted/declined/cancelled requests)
  const historyRequests = leaseRequests.filter(
    (r) => r.status === "LANDLORD_APPROVED" || r.status === "REJECTED" || r.status === "CANCELLED"
  );

  // Pagination for pending requests
  const totalPages = Math.ceil(pendingRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPendingRequests = pendingRequests.slice(startIndex, endIndex);

  const handleOpenLandlordReview = (req: LeaseRequestResponse) => {
    router.push(`/citizen/dashboard/agreements/lease-review/${req.requestCode}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-100">
        <Card className="bg-white border-slate-200 shadow-clean overflow-hidden">
          <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-lg" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
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
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
     

      {/* Section 1: New Lease Requests Table (Matching Screenshot 1) */}
      <Card className="bg-white border-slate-200 shadow-clean overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CardTitle className="text-base font-semibold text-slate-900">
              New Lease Requests
            </CardTitle>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-semibold px-2 py-0.5 rounded-full">
              {pendingRequests.length} Pending
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">REQUEST ID</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PROPERTY</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">LANDLORD/TENANT</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">MONTHLY RENT</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPendingRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-400">
                    No pending lease requests at this moment.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPendingRequests.map((req, index) => (
                  <TableRow key={req.requestCode} className="hover:bg-slate-50/80 transition-colors">
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

                    <TableCell className="text-right">
                      <button
                        onClick={() => handleOpenLandlordReview(req)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#00450d] hover:text-[#1b5e20] hover:underline"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-lg">
          <div className="text-xs text-slate-500">
            Showing {startIndex + 1} to {Math.min(endIndex, pendingRequests.length)} of {pendingRequests.length} requests
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 px-3 text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-xs font-medium text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-3 text-xs"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Section 2: History Card (Accepted/Declined Requests) 
      <Card className="bg-white border-slate-200 shadow-clean overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CardTitle className="text-base font-semibold text-slate-900">
              Agreement History
            </CardTitle>
            <span className="bg-slate-100 text-slate-600 border border-slate-200/80 text-[11px] font-semibold px-2 py-0.5 rounded-full">
              {historyRequests.length} Total
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">REQUEST ID</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PROPERTY</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">LANDLORD/TENANT</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">MONTHLY RENT</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-400">
                    No agreement history available.
                  </TableCell>
                </TableRow>
              ) : (
                historyRequests.map((req, index) => (
                  <TableRow key={req.requestCode} className="hover:bg-slate-50/80 transition-colors">
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
                      <Badge
                        variant={req.status === "LANDLORD_APPROVED" ? "verified" : "rejected"}
                        className="text-[11px] font-semibold px-2.5 py-0.5 uppercase tracking-wider"
                      >
                        {req.status === "LANDLORD_APPROVED" ? "Accepted" : "Declined"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>*/}

    </div>
  );
};

export default LandlordAgreementsView;
