"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  getSubCityReport,
  getActiveAgreements,
  getComplaints,
  SubCityReportResponse,
  WoredaMetricsDto,
  AgreementResponse,
  getSession,
} from "@/lib/api";
import {
  Building2,
  FileText,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  Download,
  RefreshCw,
  MapPin,
  TrendingUp,
  User,
  Filter,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function SubCityReportsPage() {
  const [report, setReport] = useState<SubCityReportResponse | null>(null);
  const [agreements, setAgreements] = useState<AgreementResponse[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"WOREDA_SUMMARY" | "ACTIVE_AGREEMENTS" | "COMPLAINTS">("WOREDA_SUMMARY");

  // Filters
  const [selectedWoreda, setSelectedWoreda] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const session = getSession();
      const token = session?.token;
      const subCity = session?.user?.subCity || "Bole";

      const [repData, agData] = await Promise.all([
        getSubCityReport(token, subCity),
        getActiveAgreements(token),
      ]);

      setReport(repData);
      setAgreements(agData);

      // Load complaints
      try {
        const compData = await getComplaints(token);
        setComplaints(compData || []);
      } catch (e) {
        console.warn("Complaints fetch optional fallback:", e);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load sub-city report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Agreements
  const filteredAgreements = useMemo(() => {
    return agreements.filter((ag) => {
      const matchWoreda =
        selectedWoreda === "ALL" ||
        ag.propertyWoreda?.replaceAll("(?i)woreda", "").trim() === selectedWoreda.replaceAll("(?i)woreda", "").trim();
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        ag.agreementNumber?.toLowerCase().includes(q) ||
        ag.requestCode?.toLowerCase().includes(q) ||
        ag.propertyTitle?.toLowerCase().includes(q) ||
        ag.tenantName?.toLowerCase().includes(q) ||
        ag.landlordName?.toLowerCase().includes(q);
      return matchWoreda && matchSearch;
    });
  }, [agreements, selectedWoreda, searchQuery]);

  // Filtered Complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const cWoreda = c.complainant?.woreda || "";
      const matchWoreda =
        selectedWoreda === "ALL" ||
        cWoreda.replaceAll("(?i)woreda", "").trim() === selectedWoreda.replaceAll("(?i)woreda", "").trim();
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.subject?.toLowerCase().includes(q) ||
        c.complainant?.firstName?.toLowerCase().includes(q) ||
        c.complainant?.lastName?.toLowerCase().includes(q);
      return matchWoreda && matchSearch;
    });
  }, [complaints, selectedWoreda, searchQuery]);

  const woredaList = useMemo(() => {
    if (!report?.woredaBreakdowns) return [];
    return report.woredaBreakdowns.map((w) => w.woreda);
  }, [report]);

  const handleExportCSV = () => {
    if (!report) return;
    const rows = [
      ["Woreda", "Total Properties", "Listed Properties", "Active Agreements", "Total Complaints", "Open Complaints"].join(","),
    ];

    report.woredaBreakdowns.forEach((w) => {
      rows.push(
        [
          `"Woreda ${w.woreda}"`,
          w.totalProperties,
          w.listedProperties,
          w.activeAgreements,
          w.totalComplaints,
          w.openComplaints,
        ].join(",")
      );
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.subCity}_SubCity_MultiWoreda_Report_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resolutionRate = useMemo(() => {
    if (!report || report.totalComplaints === 0) return 100;
    return Math.round((report.resolvedComplaints / report.totalComplaints) * 100);
  }, [report]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-[#00450d] border border-emerald-200">
              Executive Regional Oversight
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#00450d]" />
              {report?.subCity || "Bole"} Sub-City Administrative Bureau
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            {report?.subCity || "Sub-City"} Multi-Woreda Master Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Consolidated municipal oversight of active tenancy agreements, verified properties, and citizen complaints across all {woredaList.length || "constituent"} woredas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="h-9 text-xs font-semibold gap-1.5 bg-white border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Live</span>
          </Button>

          <Button
            size="sm"
            onClick={handleExportCSV}
            disabled={loading || !report}
            className="h-9 text-xs font-bold gap-1.5 bg-[#00450d] hover:bg-[#1b5e20] text-white shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Sub-City Audit (CSV)</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Agreements */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Agreements</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {report?.activeAgreements ?? 0}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">/ {report?.totalAgreements ?? 0} total</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Monthly Rent Turnover</span>
            <span className="font-bold text-slate-900">
              ETB {(report?.totalMonthlyRentVolume ?? 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Approved Properties */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Approved Properties</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#00450d]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {report?.listedProperties ?? 0}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">/ {report?.totalProperties ?? 0} total</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Pending Signoff</span>
            <span className="font-bold text-amber-600">
              {(report?.pendingProperties ?? 0) + (report?.verifiedProperties ?? 0)} properties
            </span>
          </div>
        </div>

        {/* Complaints Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Citizen Complaints</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {report?.totalComplaints ?? 0}
              </span>
              <span className="text-xs text-slate-400 ml-1.5 font-medium">registered</span>
            </div>
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              {resolutionRate}% resolved
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Open Investigations</span>
            <span className="font-bold text-rose-600">{report?.openComplaints ?? 0} pending</span>
          </div>
        </div>

        {/* Sub-City Woredas Oversight */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Jurisdiction Scope</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {woredaList.length || 0}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">active woredas</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Municipal Authority</span>
            <span className="font-bold text-[#00450d]">{report?.subCity || "Bole"} Desk</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab("WOREDA_SUMMARY")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "WOREDA_SUMMARY"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-slate-700" />
            <span>Woreda Comparison Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab("ACTIVE_AGREEMENTS")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "ACTIVE_AGREEMENTS"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Active Agreements ({agreements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("COMPLAINTS")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "COMPLAINTS"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Complaints ({complaints.length})</span>
          </button>
        </div>

        {/* Global Woreda Dropdown & Search */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedWoreda}
              onChange={(e) => setSelectedWoreda(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Woredas</option>
              {woredaList.map((w) => (
                <option key={w} value={w}>
                  Woreda {w}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code, name, or title..."
              className="pl-8 h-8 text-xs w-48 sm:w-60 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Tab 1: Woreda Summary Matrix */}
      {activeTab === "WOREDA_SUMMARY" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Woreda Administrative Breakdown ({report?.subCity} Sub-City)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparative analysis of housing inventory, certified leases, and incident workload across all woredas.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-[#fafbfc] text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">WOREDA JURISDICTION</th>
                  <th className="py-3 px-4">TOTAL PROPERTIES</th>
                  <th className="py-3 px-4">APPROVED & LISTED</th>
                  <th className="py-3 px-4">ACTIVE AGREEMENTS</th>
                  <th className="py-3 px-4">TOTAL COMPLAINTS</th>
                  <th className="py-3 px-4">OPEN INVESTIGATIONS</th>
                  <th className="py-3 px-4 text-right">MUNICIPAL STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report?.woredaBreakdowns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No woreda data available for this sub-city.
                    </td>
                  </tr>
                ) : (
                  report?.woredaBreakdowns
                    .filter((w) => selectedWoreda === "ALL" || w.woreda === selectedWoreda)
                    .map((w) => (
                      <tr key={w.woreda} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-[11px] font-bold">
                            {w.woreda}
                          </div>
                          <span>Woreda {w.woreda}</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">{w.totalProperties}</td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-700">
                          {w.listedProperties}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-blue-700">{w.activeAgreements}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">{w.totalComplaints}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-semibold ${
                              w.openComplaints > 0 ? "text-rose-700 font-bold" : "text-slate-400"
                            }`}
                          >
                            {w.openComplaints}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#00450d] border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-[#00450d]" /> Operational
                          </span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Active Agreements across All Woredas */}
      {activeTab === "ACTIVE_AGREEMENTS" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Active Tenancy Contracts ({selectedWoreda === "ALL" ? "All Woredas" : `Woreda ${selectedWoreda}`})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Legally certified tenancy agreements operating under Sub-City authority.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Showing {filteredAgreements.length} agreements
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-[#fafbfc] text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">AGREEMENT NO</th>
                  <th className="py-3 px-4">PROPERTY</th>
                  <th className="py-3 px-4">WOREDA</th>
                  <th className="py-3 px-4">PARTIES (TENANT & LANDLORD)</th>
                  <th className="py-3 px-4">MONTHLY RENT</th>
                  <th className="py-3 px-4">CONTRACT STATUS</th>
                  <th className="py-3 px-4 text-right">MUNICIPAL SEAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAgreements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No active agreements match your selection.
                    </td>
                  </tr>
                ) : (
                  filteredAgreements.map((ag) => (
                    <tr key={ag.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {ag.agreementNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{ag.propertyTitle}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{ag.propertyCode}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        Woreda {ag.propertyWoreda || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800">
                        <p className="font-medium text-slate-900">Tenant: {ag.tenantName}</p>
                        <p className="text-[10px] text-slate-500">Landlord: {ag.landlordName}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#00450d]">
                        ETB {Number(ag.monthlyRent).toLocaleString()}/mo
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge className="bg-emerald-100 text-emerald-800 font-bold border-emerald-200 text-[10px] uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3 mr-1 inline text-emerald-600" />
                          Active
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-[10px] font-bold text-emerald-700">
                          {ag.supervisorApproved ? "Supervisor Sealed" : "Verified"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Complaints across All Woredas */}
      {activeTab === "COMPLAINTS" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Citizen Complaints Dossier ({selectedWoreda === "ALL" ? "All Woredas" : `Woreda ${selectedWoreda}`})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Active dispute and violation reports submitted by tenants and landlords in your sub-city.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Showing {filteredComplaints.length} complaints
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-[#fafbfc] text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">SUBJECT / CATEGORY</th>
                  <th className="py-3 px-4">COMPLAINANT</th>
                  <th className="py-3 px-4">WOREDA</th>
                  <th className="py-3 px-4">PRIORITY</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">DATE FILED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No complaints registered in this scope.
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{c.subject}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{c.category}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800">
                        {c.complainant?.firstName} {c.complainant?.lastName}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        Woreda {c.complainant?.woreda || "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.priority === "HIGH" || c.priority === "URGENT"
                              ? "bg-red-100 text-red-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {c.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.status === "RESOLVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : c.status === "UNDER_INVESTIGATION"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
