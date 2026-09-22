"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getPropertiesByJurisdiction, PropertyResponse } from "@/lib/api";
import { getOfficerJurisdiction } from "@/app/officer/useOfficerJurisdiction";
import {
  Filter,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Building2,
  Home,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfficerPropertiesListPage() {
  const router = useRouter();
  const rawJurisdiction = getOfficerJurisdiction();

  const jurisdiction = useMemo(() => rawJurisdiction, [
    rawJurisdiction?.token,
    rawJurisdiction?.subCity,
    rawJurisdiction?.woreda,
    rawJurisdiction?.user?.id,
  ]);

  const token = jurisdiction?.token;
  const subCity = jurisdiction?.subCity;
  const woreda = jurisdiction?.woreda;

  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const itemsPerPage = 8;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    if (!jurisdiction || !token || !subCity || !woreda) {
      setError("Session expired.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      console.log("[OfficerPropsList] Fetching properties for subCity:", subCity, "woreda:", woreda);
      const data = await getPropertiesByJurisdiction(
        token,
        subCity,
        woreda,
        "PENDING"
      );
      // eslint-disable-next-line no-console
      console.log("[OfficerPropsList] loaded count:", data.length);
      console.log("[OfficerPropsList] loaded properties:", data.map(p => ({ id: p.id, code: p.propertyCode, status: p.status })));
      setProperties(data);
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error("[OfficerPropsList] load failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load properties.";
      // Replace technical backend errors with user-friendly messages
      if (errorMessage.includes("No row with the given identifier exists for entity") && errorMessage.includes("Citizen")) {
        setError("Property owner information not found. The property may be linked to a deleted user account. Please contact system administrator.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token, subCity, woreda]);

  // SSE connection for real-time property registration notifications
  useEffect(() => {
    if (!jurisdiction || !woreda) return;

    const officerUserId = `woreda-officer-${woreda}`;
    console.log("Connecting to SSE with userId:", officerUserId);
    
    // Use global SSE manager
    const { sseManager } = require('@/lib/sseManager');
    sseManager.connect(officerUserId);

    // Listen for notification events
    const unsubscribe = sseManager.onNotification((notification: any) => {
      console.log("Received SSE notification:", notification);
      console.log("Reloading properties...");
      
      // Add a small delay to ensure backend transaction is committed
      setTimeout(() => {
        load();
        
        if (notification.type === 'PROPERTY_REGISTERED') {
          showToast("New property registration received!");
        } else if (notification.type === 'PROPERTY_DELETED') {
          showToast("Property deleted by landlord");
        }
      }, 500);
    });

    return () => {
      console.log("Cleaning up SSE listener");
      unsubscribe();
    };
  }, [jurisdiction, woreda]);

  const filtered = useMemo(() =>
    properties.filter((p) => {
      const q = searchQuery.toLowerCase();
      return !q
        || p.propertyCode?.toLowerCase().includes(q)
        || p.title?.toLowerCase().includes(q)
        || p.address?.subCity?.toLowerCase().includes(q)
        || p.address?.woreda?.toLowerCase().includes(q)
        || p.propertyType?.toLowerCase().includes(q);
    }), [properties, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!jurisdiction) {
    return (
      <div className="py-12 text-center text-slate-500 text-sm">
        Session expired. <a href="/officer" className="text-[#00450d] underline">Sign in again</a>.
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-in fade-in duration-150">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Pending Verifications</h2>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#00450d]" />
            {jurisdiction.subCity} Sub-City · Woreda {jurisdiction.woreda}
            <span className="ml-2 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
              {loading ? "…" : properties.length} pending
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search property ID, type..."
            className="h-8 pl-3 pr-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00450d] w-48"
          />
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1.5 text-xs h-8">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-400 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading pending properties...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && properties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <Building2 className="w-7 h-7" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No pending registrations</p>
          <p className="text-xs text-slate-500 max-w-xs">
            All properties in {jurisdiction.subCity} Woreda {jurisdiction.woreda} have been processed.
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && properties.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-[#fafbfc] text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                  <th className="py-3.5 px-5">Property Code</th>
                  <th className="py-3.5 px-5">Title / Type</th>
                  <th className="py-3.5 px-5">Sub-City / Woreda</th>
                  <th className="py-3.5 px-5">Monthly Rent</th>
                  <th className="py-3.5 px-5">Registered</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                      No results match your search.
                    </td>
                  </tr>
                ) : (
                  paginated.map((p) => {
                    const isCommercial = p.propertyType?.toLowerCase().includes("mall") || p.propertyType?.toLowerCase().includes("commercial");
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => router.push(`/officer/office/properties/verification-detail?id=${p.id}`)}>
                        <td className="py-3.5 px-5 font-black text-slate-900 font-mono tracking-tight whitespace-nowrap">
                          {p.propertyCode}
                        </td>
                        <td className="py-3.5 px-5">
                          <p className="font-semibold text-slate-900 truncate max-w-[180px]">
                            {p.title ?? p.propertyType}
                          </p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            {isCommercial ? <Store className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                            {p.propertyType}
                          </p>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 whitespace-nowrap">
                          {p.address?.subCity} / W{p.address?.woreda}
                        </td>
                        <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                          ETB {Number(p.monthlyRent).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap">
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "—"}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/officer/office/properties/verification-detail?id=${p.id}`);
                            }}
                            className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-bold text-white bg-[#00450d] hover:bg-[#1b5e20] rounded-md transition-colors shadow-xs"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="py-3.5 px-5 border-t border-slate-200/90 bg-[#fafbfc] flex items-center justify-between text-xs text-slate-600">
            <span className="font-medium">
              {paginated.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
              {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-medium">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
