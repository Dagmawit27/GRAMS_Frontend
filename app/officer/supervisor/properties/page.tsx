"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getPropertiesByJurisdiction, PropertyResponse } from "@/lib/api";
import { getOfficerJurisdiction, OfficerJurisdiction } from "@/app/officer/useOfficerJurisdiction";
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SupervisorPropertiesQueuePage() {
  const router = useRouter();
  const [jurisdiction, setJurisdiction] = useState<OfficerJurisdiction | null>(null);
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

  const load = useCallback(async (j: OfficerJurisdiction) => {
    setLoading(true);
    setError("");
    try {
      const data = await getPropertiesByJurisdiction(j.token, j.subCity, j.woreda, "VERIFIED");
      setProperties(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load.";
      // Replace technical backend errors with user-friendly messages
      if ((errorMessage.includes("No row with the given identifier exists for entity") || errorMessage.includes("does not exist")) && errorMessage.includes("Citizen")) {
        setError("Property owner information not found. The property may be linked to a deleted user account. Please contact system administrator.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const j = getOfficerJurisdiction();
    if (!j) {
      setError("Session expired. Please sign in again.");
      setLoading(false);
      return;
    }
    setJurisdiction(j);
    load(j);
  }, [load]);

  // SSE connection for real-time property verification notifications
  useEffect(() => {
    const j = getOfficerJurisdiction();
    if (!j || !j.woreda) return;

    const supervisorUserId = `woreda-supervisor-${j.woreda}`;
    console.log("Connecting to SSE with userId:", supervisorUserId);
    
    // Use global SSE manager
    const { sseManager } = require('@/lib/sseManager');
    sseManager.connect(supervisorUserId);

    // Listen for notification events
    const unsubscribe = sseManager.onNotification((notification: any) => {
      console.log("Received SSE notification:", notification);
      
      // If notification is about property verification, reload properties
      if (notification.type === 'PROPERTY_VERIFIED') {
        console.log("Property verified, reloading...");
        setTimeout(() => {
          if (j) load(j);
          showToast("New verified property received!");
        }, 500);
      }
    });

    return () => {
      console.log("Cleaning up SSE listener");
      unsubscribe();
    };
  }, [load]);

  const filtered = useMemo(() =>
    properties.filter((p) => {
      const q = searchQuery.toLowerCase();
      return !q
        || p.propertyCode?.toLowerCase().includes(q)
        || p.title?.toLowerCase().includes(q)
        || p.address?.subCity?.toLowerCase().includes(q)
        || p.propertyType?.toLowerCase().includes(q);
    }), [properties, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleReview = (id: string) => {
    router.push(`/officer/supervisor/properties/verification-detail?id=${id}`);
  };

  const handleExport = () => {
    if (properties.length === 0) { showToast("No data to export."); return; }
    const csv = [
      "Property Code,Title,Type,Sub-City,Woreda,Monthly Rent,Registered",
      ...properties.map((p) =>
        `"${p.propertyCode}","${p.title ?? p.propertyType}","${p.propertyType}","${p.address?.subCity}","${p.address?.woreda}",${p.monthlyRent},"${new Date(p.createdAt).toLocaleDateString()}"`
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Supervisor_Queue_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast("Report exported.");
  };

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
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Final Approval Queue</h2>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            {jurisdiction.subCity} Sub-City · Woreda {jurisdiction.woreda}
            <span className="ml-2 text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
              {loading ? "…" : properties.length} awaiting approval
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search property code, type..."
            className="h-8 pl-3 pr-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00450d] w-48"
          />
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs h-8 border-slate-200">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => jurisdiction && load(jurisdiction)} disabled={loading} className="gap-1.5 text-xs h-8">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-400 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading verified properties...
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
          <CheckCircle2 className="w-12 h-12 text-emerald-300" />
          <p className="text-sm font-semibold text-slate-700">No verified properties awaiting approval</p>
          <p className="text-xs text-slate-500">All officer-verified properties in {jurisdiction.subCity} Woreda {jurisdiction.woreda} are processed.</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && properties.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-[#fafbfc] text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                  <th className="py-3.5 px-6">Property Code</th>
                  <th className="py-3.5 px-6">Title / Type</th>
                  <th className="py-3.5 px-6">Location / Woreda</th>
                  <th className="py-3.5 px-6">Monthly Rent</th>
                  <th className="py-3.5 px-6">Registered</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                      No results match your search.
                    </td>
                  </tr>
                ) : (
                  paginated.map((p) => (
                    <tr key={p.id} onClick={() => handleReview(p.id)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group">
                      <td className="py-4 px-6 font-black text-slate-900 font-mono text-[10px] tracking-tight whitespace-nowrap">
                        {p.propertyCode}
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-900 truncate max-w-[160px]">
                          {p.title ?? p.propertyType}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{p.propertyType}</p>
                      </td>
                      <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                        {p.address?.subCity} / W{p.address?.woreda}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                        ETB {Number(p.monthlyRent).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-semibold bg-[#e1effe] text-[#1e429f] border border-blue-200">
                          Ready for Approval
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleReview(p.id); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 transition-colors">
                          Review <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="py-3.5 px-6 border-t border-slate-200/90 bg-[#fafbfc] flex items-center justify-between text-xs text-slate-600">
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
