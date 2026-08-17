import React, { useState } from "react";
import { RentalAgreement, LeaseRequest } from "@/types";
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
  Plus,
  Search,
  ChevronRight,
  ChevronLeft,
  MapPin,
  FileText,
  Eye,
  CheckCircle2
} from "lucide-react";
import { useCitizenData } from "@/hooks/useCitizenData";

export const LandlordAgreementsView: React.FC = () => {
  const {
    agreements,
    leaseRequests,
    setIsNewAgreementModalOpen,
    setViewingAgreement,
    handleOpenLandlordReview,
  } = useCitizenData();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Filter requests waiting for landlord review
  const pendingRequests = leaseRequests.filter(
    (r) => r.status === "Pending Review" || (r.role === "Landlord" && r.status !== "Accepted")
  );

  const filteredAgreements = agreements.filter((item) => {
    return (
      item.agreementCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.counterpartyName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredAgreements.length / itemsPerPage) || 1;
  const paginatedAgreements = filteredAgreements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-slate-200/70">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Rental Agreements
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your lease requests and legally certified rental contracts in the national repository.
          </p>
        </div>
        <Button
          onClick={() => setIsNewAgreementModalOpen(true)}
          className="bg-[#00450d] hover:bg-[#1b5e20] text-white shadow-xs font-medium gap-2 self-start sm:self-auto h-9 px-4 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          <span>New Agreement</span>
        </Button>
      </div>

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
              {pendingRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-xs text-slate-400">
                    No pending lease requests at this moment.
                  </TableCell>
                </TableRow>
              ) : (
                pendingRequests.map((req) => (
                  <TableRow key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-mono font-medium text-xs text-slate-900">
                      {req.requestCode}
                    </TableCell>

                    <TableCell>
                      <div>
                        <span className="font-semibold text-xs text-slate-900 block">
                          {req.propertyTitle}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {req.propertyLocation}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs font-medium text-slate-900">
                      {req.counterpartyName}
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

      {/* Section 2: Active Agreements Table (Matching Screenshot 1) */}
      <Card className="bg-white border-slate-200 shadow-clean overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-base font-semibold text-slate-900">
            Active Agreements
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search agreements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8.5 h-8 text-xs bg-slate-50 border-slate-200"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AGREEMENT ID</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PROPERTY</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">COUNTERPARTY</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">START DATE</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">MONTHLY RENT</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">STATUS</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAgreements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-400">
                    No agreements found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAgreements.map((agr) => (
                  <TableRow key={agr.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-mono font-medium text-xs text-slate-900">
                      {agr.agreementCode}
                    </TableCell>

                    <TableCell>
                      <span className="font-medium text-xs text-slate-900 block">
                        {agr.propertyTitle}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-medium text-[9px]">
                          {agr.counterpartyInitials}
                        </div>
                        <span className="text-xs text-slate-800">{agr.counterpartyName}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-slate-600">
                      {agr.startDate}
                    </TableCell>

                    <TableCell className="font-semibold text-xs text-slate-900">
                      {agr.monthlyRent.toLocaleString()} ETB
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={agr.status === "Active" ? "active" : "expired"}
                        className="text-[10px]"
                      >
                        {agr.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <button
                        onClick={() => setViewingAgreement(agr)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#00450d] hover:text-[#1b5e20] hover:underline"
                      >
                        <span>View Agreement</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Footer (Matching Screenshot 1) */}
          <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredAgreements.length)} of{" "}
              {filteredAgreements.length} agreements
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className={`h-7 w-7 p-0 text-xs ${
                    currentPage === i + 1
                      ? "bg-[#00450d] hover:bg-[#1b5e20] text-white"
                      : "text-slate-700"
                  }`}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LandlordAgreementsView;
