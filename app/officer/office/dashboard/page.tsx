"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getSession, getPropertiesByJurisdiction, PropertyResponse } from "@/lib/api";
import { getOfficerJurisdiction, OfficerJurisdiction } from "@/app/officer/useOfficerJurisdiction";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  FileText,
  Plus,
  Download,
  MapPin,
  RefreshCw,
  AlertCircle,
  Home,
  Store,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function OfficerDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState(getSession());
  const jurisdiction: OfficerJurisdiction | null = useMemo(() => getOfficerJurisdiction(), []);
  const [pendingProperties, setPendingProperties] = useState<PropertyResponse[]>([]);
  const [verifiedProperties, setVerifiedProperties] = useState<PropertyResponse[]>([]);
  const [rejectedProperties, setRejectedProperties] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const subCity = jurisdiction?.subCity ?? "";
  const woreda = jurisdiction?.woreda ?? "";
  const token = jurisdiction?.token ?? "";

  const go = (page: "properties" | "agreements" | "history" | "reports" | "settings") => {
    router.push(`/officer/office/${page}`);
  };

  const goToDetail = (id: string) => {
    router.push(`/officer/office/properties/verification-detail?id=${id}`);
  };

  useEffect(() => {
    setSession(getSession());
  }, []);

  const load = async () => {
    if (!jurisdiction) {
      setError("Session expired.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      let cancelled = false;
      const [pending, verified, rejected] = await Promise.all([
        getPropertiesByJurisdiction(token, subCity, woreda, "PENDING"),
        getPropertiesByJurisdiction(token, subCity, woreda, "VERIFIED"),
        getPropertiesByJurisdiction(token, subCity, woreda, "REJECTED"),
      ]);
      if (cancelled) return;
      setPendingProperties(pending);
      setVerifiedProperties(verified);
      setRejectedProperties(rejected);
    } catch (err: unknown) {
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

  useEffect(() => {
    if (!subCity || !woreda || !token) return;
    load();
    return () => {};
  }, [subCity, woreda, token]); // eslint-disable-line react-hooks/exhaustive-deps

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const pendingProps = pendingProperties.length;
  const verifiedThisMonth = verifiedProperties.filter((p) => {
    const d = new Date(p.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;
  const agreementsToReview = rejectedProperties.length;
  const allForwarded = verifiedProperties;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
              PENDING VERIFICATIONS
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">{pendingProps}</span>
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>In {subCity} Woreda {woreda}</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
              AGREEMENTS TO REVIEW
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">{agreementsToReview}</span>
            <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-1">
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span>Rejected / need corrections</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
              VERIFIED THIS MONTH
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">{verifiedThisMonth}</span>
            <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Forwarded to Supervisor</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Pending Property Verifications</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={load}
                disabled={loading}
                className="h-7 gap-1 text-[11px] px-2"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <button
                onClick={() => go("properties")}
                className="text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                View All
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8 gap-2 text-slate-400 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading pending verifications...
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {!loading && !error && pendingProperties.length === 0 && (
            <div className="py-8 text-center text-slate-500 text-xs">
              No pending property verifications right now.
            </div>
          )}

          {!loading && !error && pendingProperties.length > 0 && (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {pendingProperties.slice(0, 6).map((p) => {
                const propertyType = p.propertyType || "";
                const isCommercial = propertyType.toLowerCase().includes("mall") || propertyType.toLowerCase().includes("commercial");
                const subCity = p.address?.subCity || "";
                const woreda = p.address?.woreda || "";
                return (
                  <div
                    key={p.id}
                    onClick={() => goToDetail(p.id)}
                    className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/60 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        {isCommercial ? <Store className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 group-hover:text-[#00450d] truncate">
                          {p.propertyCode} — {p.title ?? propertyType}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {subCity}, W{woreda} · ETB {Number(p.monthlyRent || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px]">
                      PENDING
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Rejected / Needs Correction</h3>
            <button
              onClick={() => go("properties")}
              className="text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              View All
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8 gap-2 text-slate-400 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading...
            </div>
          )}

          {!loading && rejectedProperties.length === 0 && (
            <div className="py-8 text-center text-slate-500 text-xs">
              No rejected properties. Good work!
            </div>
          )}

          {!loading && rejectedProperties.length > 0 && (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {rejectedProperties.slice(0, 4).map((p) => {
                const propertyType = p.propertyType || "";
                const isCommercial = propertyType.toLowerCase().includes("mall") || propertyType.toLowerCase().includes("commercial");
                const subCity = p.address?.subCity || "";
                const woreda = p.address?.woreda || "";
                return (
                  <div
                    key={p.id}
                    onClick={() => goToDetail(p.id)}
                    className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/60 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                        {isCommercial ? <Store className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 group-hover:text-[#00450d] block">
                          {p.propertyCode} — {p.title ?? propertyType}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {subCity}, W{woreda} · ETB {Number(p.monthlyRent || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200/60">
                      REJECTED
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3.5">
        <h3 className="text-sm font-bold text-slate-900">
          History: Forwarded to Supervisor
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/60">
                <th className="py-2.5 px-3">Reference ID</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Forwarded Date</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    Loading history...
                  </td>
                </tr>
              )}
              {!loading && allForwarded.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    No properties forwarded to Supervisor yet.
                  </td>
                </tr>
              )}
              {!loading && allForwarded.slice(0, 10).map((p) => (
                <tr
                  key={p.id}
                  onClick={() => goToDetail(p.id)}
                  className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-3 font-semibold text-slate-900">{p.propertyCode}</td>
                  <td className="py-3 px-3 text-slate-700">{p.propertyType || "—"}</td>
                  <td className="py-3 px-3 text-slate-600">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }) : "—"}
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                      Awaiting Supervisor
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
