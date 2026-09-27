"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  getOfficerHistory,
  getSession,
  OfficerHistoryResponse,
  VerifiedPropertyHistoryItem,
  VerifiedAgreementHistoryItem,
} from "@/lib/api";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Search,
  Download,
  ShieldCheck,
  FileText,
  AlertCircle,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function OfficerHistoryPage() {
  const [data, setData] = useState<OfficerHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "PROPERTIES" | "AGREEMENTS">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const loadHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const session = getSession();
      const token = session?.token || (typeof window !== "undefined" ? localStorage.getItem("accessToken") || "" : "");
      const res = await getOfficerHistory(token);
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load officer history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const properties = data?.verifiedProperties || [];
  const agreements = data?.verifiedAgreements || [];

  const filteredProperties = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return properties;
    return properties.filter(
      (p) =>
        p.propertyCode?.toLowerCase().includes(q) ||
        p.title?.toLowerCase().includes(q) ||
        p.landlordName?.toLowerCase().includes(q) ||
        p.woreda?.toLowerCase().includes(q)
    );
  }, [properties, searchQuery]);

  const filteredAgreements = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return agreements;
    return agreements.filter(
      (a) =>
        a.agreementNumber?.toLowerCase().includes(q) ||
        a.requestCode?.toLowerCase().includes(q) ||
        a.propertyTitle?.toLowerCase().includes(q) ||
        a.landlordName?.toLowerCase().includes(q) ||
        a.tenantName?.toLowerCase().includes(q) ||
        a.woreda?.toLowerCase().includes(q)
    );
  }, [agreements, searchQuery]);

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ["Type", "Code", "Title / Parties", "Location", "Status", "Date Verified", "Remarks"].join(","),
    ];

    if (activeTab === "ALL" || activeTab === "PROPERTIES") {
      filteredProperties.forEach((p) => {
        rows.push(
          [
            `"Property"`,
            `"${p.propertyCode || ""}"`,
            `"${p.title || ""} (${p.landlordName || ""})"`,
            `"${p.subCity || ""} Woreda ${p.woreda || ""}"`,
            `"${p.verificationStatus || ""}"`,
            `"${p.verifiedAt ? new Date(p.verifiedAt).toLocaleDateString() : ""}"`,
            `"${(p.remarks || "").replace(/"/g, '""')}"`,
          ].join(",")
        );
      });
    }

    if (activeTab === "ALL" || activeTab === "AGREEMENTS") {
      filteredAgreements.forEach((a) => {
        rows.push(
          [
            `"Agreement"`,
            `"${a.agreementNumber || a.requestCode || ""}"`,
            `"${a.propertyTitle || ""} - ${a.landlordName || ""} / ${a.tenantName || ""}"`,
            `"${a.subCity || ""} Woreda ${a.woreda || ""}"`,
            `"${a.supervisorApproved ? "Supervisor Approved" : "Pending Supervisor"}"`,
            `"${a.verifiedAt ? new Date(a.verifiedAt).toLocaleDateString() : ""}"`,
            `"${a.monthlyRent ? a.monthlyRent + " ETB" : ""}"`,
          ].join(",")
        );
      });
    }

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Officer_Verification_History_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/officer/office/dashboard"
            className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-[#00450d] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>OFFICER DASHBOARD</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-mono font-bold text-slate-800">OFFICER VERIFICATION HISTORY</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadHistory}
          disabled={loading}
          className="h-8 text-xs gap-1.5 bg-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            My Verification History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete audit trail of all properties registered and tenancy agreements verified by you.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          disabled={loading || (!filteredProperties.length && !filteredAgreements.length)}
          className="h-9 text-xs font-semibold gap-1.5 text-slate-700 bg-white"
        >
          <Download className="w-4 h-4" />
          <span>Export Certified Ledger (CSV)</span>
        </Button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Properties Verified</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{data?.totalVerifiedProperties ?? 0}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#00450d]">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Agreements Verified</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{data?.totalVerifiedAgreements ?? 0}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Verified Records</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">
              {(data?.totalVerifiedProperties ?? 0) + (data?.totalVerifiedAgreements ?? 0)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        {/* Controls: Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === "ALL" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Records ({properties.length + agreements.length})
            </button>
            <button
              onClick={() => setActiveTab("PROPERTIES")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "PROPERTIES" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Properties ({properties.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("AGREEMENTS")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "AGREEMENTS" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Agreements ({agreements.length})</span>
            </button>
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code, title, citizen, or woreda..."
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#00450d]" />
            <p className="text-xs">Loading officer verification history...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">RECORD CODE</th>
                  <th className="py-2.5 px-3">CATEGORY</th>
                  <th className="py-2.5 px-3">TITLE / PARTIES</th>
                  <th className="py-2.5 px-3">LOCATION</th>
                  <th className="py-2.5 px-3">VERIFICATION STATUS</th>
                  <th className="py-2.5 px-3">SUPERVISOR APPROVAL</th>
                  <th className="py-2.5 px-3">DATE VERIFIED</th>
                  <th className="py-2.5 px-3 text-right">REMARKS / DETAILS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Properties Rows */}
                {(activeTab === "ALL" || activeTab === "PROPERTIES") &&
                  filteredProperties.map((p) => (
                    <tr key={p.verificationId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{p.propertyCode || "PRP-N/A"}</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <ShieldCheck className="w-3 h-3" /> Property
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        <div>{p.title}</div>
                        <div className="text-[10px] text-slate-500 font-normal">Landlord: {p.landlordName}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {p.subCity} - W. {p.woreda}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-semibold text-[11px] ${
                            p.verificationStatus === "VERIFIED"
                              ? "text-emerald-700"
                              : p.verificationStatus === "REJECTED"
                              ? "text-rose-700"
                              : "text-slate-700"
                          }`}
                        >
                          {p.verificationStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {p.currentPropertyStatus === "LISTED" ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved (Listed)
                          </span>
                        ) : p.currentPropertyStatus === "REJECTED" ? (
                          <span className="text-rose-700 font-semibold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Rejected
                          </span>
                        ) : (
                          <span className="text-amber-700 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Pending Signoff
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {p.verifiedAt ? new Date(p.verifiedAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500 italic max-w-xs truncate">
                        {p.remarks || "Verified to standard"}
                      </td>
                    </tr>
                  ))}

                {/* Agreements Rows */}
                {(activeTab === "ALL" || activeTab === "AGREEMENTS") &&
                  filteredAgreements.map((a) => (
                    <tr key={a.agreementId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {a.agreementNumber || a.requestCode}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          <FileText className="w-3 h-3" /> Agreement
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        <div>{a.propertyTitle || "Tenancy Agreement"}</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          {a.landlordName} & {a.tenantName}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {a.subCity} - W. {a.woreda}
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-semibold">
                        {a.monthlyRent ? `${a.monthlyRent.toLocaleString()} ETB/mo` : "Verified"}
                      </td>
                      <td className="py-3 px-3">
                        {a.supervisorApproved ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Supervisor Sealed
                          </span>
                        ) : (
                          <span className="text-amber-700 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Pending Seal
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {a.verifiedAt ? new Date(a.verifiedAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-800">
                        Status: <span className="font-bold text-[#00450d]">{a.agreementStatus || "ACTIVE"}</span>
                      </td>
                    </tr>
                  ))}

                {/* Empty State */}
                {((activeTab === "ALL" && !filteredProperties.length && !filteredAgreements.length) ||
                  (activeTab === "PROPERTIES" && !filteredProperties.length) ||
                  (activeTab === "AGREEMENTS" && !filteredAgreements.length)) && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <ShieldCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600 text-sm">No verified historical records found</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {searchQuery ? "Try a different search query" : "Records will appear once you verify properties or lease agreements"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
