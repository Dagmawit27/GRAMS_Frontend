"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { LeaseRequestResponse, getLeaseRequestById, getSession } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  Bed,
  Bath,
  Maximize,
  User,
  Phone,
  Mail,
  Shield,
} from "lucide-react";

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const requestCode = params.id as string;
  const [leaseRequest, setLeaseRequest] = useState<LeaseRequestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaseRequest = async () => {
      try {
        const session = getSession();
        if (!session?.token) {
          setError("Authentication required");
          return;
        }

        const data = await getLeaseRequestById(session.token, requestCode);
        setLeaseRequest(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load property details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaseRequest();
  }, [requestCode]);

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !leaseRequest) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center m-4">
        <p className="text-red-800 text-sm">{error || "Property not found"}</p>
        <Button variant="outline" onClick={handleBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs">
              <Link
                href={`/citizen/dashboard/agreements/lease-signing`}
                className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-[#00450d] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>MY LEASES</span>
              </Link>
              <Link
                href={`/citizen/dashboard/agreements/lease-signing/${requestCode}`}
                className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-[#00450d] transition-colors"
              >
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="font-mono font-bold text-slate-800">
                  {leaseRequest.requestCode}
                </span>
              </Link>
              <Link
                href={`/citizen/dashboard/agreements/lease-signing/${requestCode}/property-detail`}
                className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-[#00450d] transition-colors"
              >
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="font-bold text-slate-900 uppercase">
                  PROPERTY DETAILS
                </span>
              </Link>
            </div>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              {leaseRequest.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Property Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Images */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video bg-slate-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <Building className="w-16 h-16" />
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-xs">
                    Property Image
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Property Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Location</p>
                      <p className="font-medium text-slate-900">{leaseRequest.propertyTitle || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Monthly Rent</p>
                      <p className="font-bold text-slate-900">{leaseRequest.proposedRent.toLocaleString()} ETB</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Lease Duration</p>
                      <p className="font-medium text-slate-900">{leaseRequest.leaseDuration || "12 Months"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Security Deposit</p>
                      <p className="font-medium text-slate-900">
                        {(leaseRequest.securityDeposit || leaseRequest.proposedRent * 2).toLocaleString()} ETB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-2">Property Address</p>
                  <p className="text-sm text-slate-900">
                    {leaseRequest.propertyCity || ""}, {leaseRequest.propertySubCity || ""}, {leaseRequest.propertyWoreda || ""}
                  </p>
                  <p className="text-sm text-slate-900 mt-1">
                    {leaseRequest.propertySpecificPlace || ""}, House No: {leaseRequest.propertyHouseNo || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Property Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Property Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <Bed className="w-6 h-6 mx-auto text-emerald-600 mb-2" />
                    <p className="text-xs text-slate-500">Bedrooms</p>
                    <p className="font-bold text-slate-900">2</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <Bath className="w-6 h-6 mx-auto text-emerald-600 mb-2" />
                    <p className="text-xs text-slate-500">Bathrooms</p>
                    <p className="font-bold text-slate-900">1</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <Maximize className="w-6 h-6 mx-auto text-emerald-600 mb-2" />
                    <p className="text-xs text-slate-500">Area</p>
                    <p className="font-bold text-slate-900">85 m²</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <Building className="w-6 h-6 mx-auto text-emerald-600 mb-2" />
                    <p className="text-xs text-slate-500">Floor</p>
                    <p className="font-bold text-slate-900">3rd</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Landlord & Contact */}
          <div className="space-y-6">
            {/* Landlord Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Landlord Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{leaseRequest.landlordName}</p>
                    <p className="text-xs text-slate-500">Property Owner</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">{leaseRequest.landlordPhone || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">{leaseRequest.landlordEmail || "N/A"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lease Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">Lease Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Start Date</span>
                  <span className="font-medium text-slate-900">{leaseRequest.startDate || "To be determined"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">End Date</span>
                  <span className="font-medium text-slate-900">{leaseRequest.endDate || "To be determined"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Payment Due Day</span>
                  <span className="font-medium text-slate-900">5th of each month</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-600">Utilities</span>
                  <span className="font-medium text-slate-900">Tenant pays</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Button
                  className="w-full bg-[#00450d] hover:bg-[#1b5e20]"
                  onClick={() => router.back()}
                >
                  Back to Agreement
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
