"use client";
import React from "react";
import { useCitizenData } from "@/hooks/useCitizenData";
import { ChevronLeft, ChevronRight, TrendingUp, BarChart3, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export const OfficerReportsPage: React.FC = () => {
  const { handleNavigate } = useCitizenData();

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleNavigate("officer-dashboard")}
            className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-[#00450d] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>SUPERVISOR DASHBOARD</span>
          </button>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-mono font-bold text-slate-800">
            REPORTS
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Woreda Municipal Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monthly throughput, SLA compliance, and rental price index monitoring.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => alert("Generating full monthly report bundle...")}
          className="h-9 text-xs font-semibold gap-1.5 bg-[#00450d] text-white"
        >
          <Download className="w-4 h-4" />
          <span>Generate Full Report</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            AVERAGE VERIFICATION TIME
          </span>
          <span className="text-3xl font-extrabold text-slate-900 mt-2 block">18.4 hrs</span>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Well within 48h SLA target</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            MEDIAN LEASE VALUE
          </span>
          <span className="text-3xl font-extrabold text-slate-900 mt-2 block">14,200 ETB</span>
          <p className="text-xs text-slate-500 font-medium mt-1">Bole Sub-City Woreda 03 average</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            CITIZEN SATISFACTION SCORE
          </span>
          <span className="text-3xl font-extrabold text-slate-900 mt-2 block">96.2%</span>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Based on 340 digital ratings</p>
        </div>
      </div>
    </div>
  );
};

export default OfficerReportsPage;
