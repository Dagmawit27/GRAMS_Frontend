"use client";
import React from "react";
import { useCitizenData } from "@/hooks/useCitizenData";
import { ChevronLeft, ChevronRight, CheckCircle2, Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const OfficerHistoryPage: React.FC = () => {
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
            <span>OFFICER DASHBOARD</span>
          </button>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-mono font-bold text-slate-800">
            HISTORY
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Approved & Forwarded History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete archive of verified properties and authorized tenancy agreements.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => alert("Downloading certified historical ledger...")}
          className="h-9 text-xs font-semibold gap-1.5 text-slate-700 bg-white"
        >
          <Download className="w-4 h-4" />
          <span>Export Ledger (CSV)</span>
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input placeholder="Search archives by ID, name, or parcel..." className="pl-9 h-9 text-xs" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">RECORD ID</th>
                <th className="py-2.5 px-3">CATEGORY</th>
                <th className="py-2.5 px-3">TITLE / HOLDER</th>
                <th className="py-2.5 px-3">DATE RECORDED</th>
                <th className="py-2.5 px-3">SUPERVISOR APPROVAL</th>
                <th className="py-2.5 px-3 text-right">CERTIFICATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-3 font-bold text-slate-900">PRP-2023-0880</td>
                <td className="py-3 px-3">Property</td>
                <td className="py-3 px-3 font-medium text-slate-800">Villa Compound (Kenenisa B.)</td>
                <td className="py-3 px-3 text-slate-600">Oct 21, 2023</td>
                <td className="py-3 px-3 text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                </td>
                <td className="py-3 px-3 text-right">
                  <span className="text-xs font-bold text-[#00450d] hover:underline cursor-pointer">
                    Download Seal
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-3 font-bold text-slate-900">AGR-4382</td>
                <td className="py-3 px-3">Agreement</td>
                <td className="py-3 px-3 font-medium text-slate-800">18,000 ETB/mo (Yared & Meron)</td>
                <td className="py-3 px-3 text-slate-600">Oct 20, 2023</td>
                <td className="py-3 px-3 text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                </td>
                <td className="py-3 px-3 text-right">
                  <span className="text-xs font-bold text-[#00450d] hover:underline cursor-pointer">
                    Download Seal
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OfficerHistoryPage;
