"use client";
import React, { useState, useEffect } from "react";
import { getSession } from "@/lib/api";
import { useCitizenData } from "@/hooks/useCitizenData";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Hourglass,
  ShieldCheck,
  XCircle,
  FileText,
  Plus,
  Download,
  AlertTriangle,
  Info,
} from "lucide-react";

export const OfficerDashboardOverviewPage: React.FC = () => {
  const { handleNavigate } = useCitizenData();
  const [session, setSession] = useState(getSession());

  useEffect(() => {
    setSession(getSession());
  }, []);

  const isSupervisor =
    session?.user?.roles?.includes("SUPERVISOR") ||
    session?.user?.employeeNumber?.includes("SUP") ||
    (typeof window !== "undefined" && localStorage.getItem("userRole") === "supervisor");

  // =========================================================================
  // OFFICER DASHBOARD (IMAGE 1)
  // =========================================================================
  if (!isSupervisor) {
    return (
      <div className="space-y-6 animate-in fade-in duration-150">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Summary of administrative tasks and recent registrations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert("Exporting Woreda summary report (CSV/PDF)...")}
              className="h-10 text-xs font-semibold gap-1.5 text-slate-700 border-slate-200 bg-white hover:bg-slate-50"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </Button>

            <Button
              size="sm"
              onClick={() => handleNavigate("officer-property-verifications")}
              className="h-10 text-xs font-semibold gap-1.5 bg-[#00450d] hover:bg-[#164e23] text-white shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Registration</span>
            </Button>
          </div>
        </div>

        {/* 3 Metric Cards (Matching Image 1) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1 */}
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
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">42</span>
              <p className="text-xs font-semibold text-red-600 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12% from last week</span>
              </p>
            </div>
          </div>

          {/* Card 2 */}
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
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">18</span>
              <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>5 require immediate attention</span>
              </p>
            </div>
          </div>

          {/* Card 3 */}
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
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">156</span>
              <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>On track for monthly goal</span>
              </p>
            </div>
          </div>
        </div>

        {/* 2 Review Columns (Matching Image 1) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Property Reviews */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Pending Property Reviews</h3>
              <button
                onClick={() => handleNavigate("officer-property-verifications")}
                className="text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              <div
                onClick={() => handleNavigate("officer-property-verifications")}
                className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/60 transition-all flex items-center justify-between cursor-pointer group"
              >
                <span className="text-xs font-bold text-slate-800 group-hover:text-[#00450d]">
                  WRD-9921 - Abebe Bikila
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200/60">
                  URGENT
                </span>
              </div>

              <div
                onClick={() => handleNavigate("officer-property-verifications")}
                className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/60 transition-all flex items-center justify-between cursor-pointer group"
              >
                <span className="text-xs font-bold text-slate-800 group-hover:text-[#00450d]">
                  WRD-9922 - Tigist Assefa
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  PENDING
                </span>
              </div>
            </div>
          </div>

          {/* Pending Agreement Reviews */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Pending Agreement Reviews</h3>
              <button
                onClick={() => handleNavigate("officer-agreement-verifications")}
                className="text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              <div
                onClick={() => handleNavigate("officer-agreement-verifications")}
                className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/60 transition-all flex items-center justify-between cursor-pointer group"
              >
                <span className="text-xs font-bold text-slate-800 group-hover:text-[#00450d]">
                  AGR-4402 - Dawit Mengistu
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200/60">
                  IN PROGRESS
                </span>
              </div>

              <div
                onClick={() => handleNavigate("officer-agreement-verifications")}
                className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/60 transition-all flex items-center justify-between cursor-pointer group"
              >
                <span className="text-xs font-bold text-slate-800 group-hover:text-[#00450d]">
                  AGR-4405 - Hanna Tadesse
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  PENDING
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* History: Forwarded to Supervisor Table (Matching Image 1) */}
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
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">WRD-9918</td>
                  <td className="py-3 px-3 text-slate-700">Property</td>
                  <td className="py-3 px-3 text-slate-600">Oct 23, 2023</td>
                  <td className="py-3 px-3 font-semibold text-amber-600">Awaiting Supervisor</td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">AGR-4390</td>
                  <td className="py-3 px-3 text-slate-700">Agreement</td>
                  <td className="py-3 px-3 text-slate-600">Oct 22, 2023</td>
                  <td className="py-3 px-3 font-semibold text-slate-700">Approved by Supervisor</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SUPERVISOR DASHBOARD (IMAGE 2)
  // =========================================================================
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Supervisor Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Overview of pending verifications and woreda metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("Exporting Supervisor Analytics Dossier...")}
            className="h-10 text-xs font-semibold gap-1.5 text-slate-700 border-slate-200 bg-white hover:bg-slate-50"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT REPORT</span>
          </Button>
        </div>
      </div>

      {/* 4 KPI Cards (Matching Image 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
              AWAITING FINAL APPROVAL
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">124</span>
            <p className="text-xs text-slate-500 mt-1">Verified by Officers</p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
              VERIFIED TODAY
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">48</span>
            <p className="text-xs font-semibold text-emerald-600 mt-1">↑ 5% from yesterday</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
              TOTAL APPROVED
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">3,492</span>
            <p className="text-xs text-slate-500 mt-1">YTD Volume</p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
              REJECTION RATE
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900">8.4%</span>
            <p className="text-xs font-semibold text-emerald-600 mt-1">↓ 1.2% from last month</p>
          </div>
        </div>
      </div>

      {/* 2-Column Grid (Left: Approval Queue, Right: Monthly Chart & Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Approval Queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Approval Queue</h3>
            <select className="h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-semibold focus:outline-none">
              <option>All Pending</option>
              <option>High Priority</option>
              <option>Flagged Discrepancies</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">PROPERTY ID</th>
                  <th className="py-2.5 px-3">VERIFIED BY (OFFICER)</th>
                  <th className="py-2.5 px-3">VERIFICATION DATE</th>
                  <th className="py-2.5 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr
                  onClick={() => handleNavigate("officer-property-verifications")}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-bold text-slate-900">PRP-2023-0891</td>
                  <td className="py-3 px-3">
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                        OA
                      </span>
                      <span className="text-slate-800">Officer Abebe</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">Oct 24, 2023</td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-xs font-bold text-[#00450d] hover:underline">Review</span>
                  </td>
                </tr>

                <tr
                  onClick={() => handleNavigate("officer-property-verifications")}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-bold text-slate-900">PRP-2023-0892</td>
                  <td className="py-3 px-3">
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                        MK
                      </span>
                      <span className="text-slate-800">Officer Martha K.</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">Oct 24, 2023</td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-xs font-bold text-[#00450d] hover:underline">Review</span>
                  </td>
                </tr>

                <tr
                  onClick={() => handleNavigate("officer-property-verifications")}
                  className="hover:bg-red-50/30 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-bold text-red-600">
                    PRP-2023-0888 <span className="text-[10px] font-normal text-red-500">(Flagged)</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-[10px] font-bold flex items-center justify-center">
                        YG
                      </span>
                      <span className="text-slate-800">Officer Yonas G.</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">Oct 23, 2023</td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-xs font-bold text-red-700 hover:underline">Investigate</span>
                  </td>
                </tr>

                <tr
                  onClick={() => handleNavigate("officer-property-verifications")}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-bold text-slate-900">PRP-2023-0895</td>
                  <td className="py-3 px-3">
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                        OA
                      </span>
                      <span className="text-slate-800">Officer Abebe</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">Oct 24, 2023</td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-xs font-bold text-[#00450d] hover:underline">Review</span>
                  </td>
                </tr>

                <tr
                  onClick={() => handleNavigate("officer-property-verifications")}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-bold text-slate-900">PRP-2023-0896</td>
                  <td className="py-3 px-3">
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                        MK
                      </span>
                      <span className="text-slate-800">Officer Martha K.</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">Oct 24, 2023</td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-xs font-bold text-[#00450d] hover:underline">Review</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-2 text-center border-t border-slate-100">
            <button
              onClick={() => alert("Displaying all 124 queued items...")}
              className="text-xs font-bold text-slate-800 hover:text-[#00450d] uppercase tracking-wider"
            >
              VIEW ALL QUEUE (124)
            </button>
          </div>
        </div>

        {/* Right Column (1/3): Monthly Chart & System Alerts */}
        <div className="space-y-5">
          {/* Approval Summary (Monthly) Visual Bar Chart (Image 2) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Approval Summary (Monthly)</h3>

            <div className="h-40 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center gap-1 h-28">
                  <div className="w-4 bg-[#1b5e20] rounded-t-sm" style={{ height: "60%" }} title="Approved: 60" />
                  <div className="w-3 bg-red-700 rounded-t-sm" style={{ height: "15%" }} title="Rejected: 15" />
                </div>
                <span className="text-[10px] font-medium text-slate-500">Jul</span>
              </div>

              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center gap-1 h-28">
                  <div className="w-4 bg-[#1b5e20] rounded-t-sm" style={{ height: "85%" }} title="Approved: 85" />
                  <div className="w-3 bg-red-700 rounded-t-sm" style={{ height: "10%" }} title="Rejected: 10" />
                </div>
                <span className="text-[10px] font-medium text-slate-500">Aug</span>
              </div>

              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center gap-1 h-28">
                  <div className="w-4 bg-[#1b5e20] rounded-t-sm" style={{ height: "65%" }} title="Approved: 65" />
                  <div className="w-3 bg-red-700 rounded-t-sm" style={{ height: "20%" }} title="Rejected: 20" />
                </div>
                <span className="text-[10px] font-medium text-slate-500">Sep</span>
              </div>

              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center gap-1 h-28">
                  <div className="w-4 bg-[#1b5e20] rounded-t-sm" style={{ height: "95%" }} title="Approved: 95" />
                  <div className="w-3 bg-red-700 rounded-t-sm" style={{ height: "8%" }} title="Rejected: 8" />
                </div>
                <span className="text-[10px] font-medium text-slate-500">Oct</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1b5e20]" />
                <span>Approved</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-red-700" />
                <span>Rejected</span>
              </span>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">System Alerts</h3>

            <div className="p-3.5 bg-red-50/80 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-red-950">SLA Breach Warning</h4>
                <p className="text-[11px] text-red-800 leading-snug mt-0.5">
                  12 properties in queue exceeding 48hr verification SLA.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
              <Info className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Scheduled Maintenance</h4>
                <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                  Portal will be down for maintenance on Sunday 02:00 AM.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboardOverviewPage;
