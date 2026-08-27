"use client";
import React, { useState } from "react";
import { useCitizenData } from "@/hooks/useCitizenData";
import { ArrowLeft, ShieldCheck, CheckCircle2, Building, User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const OfficerSettingsPage: React.FC = () => {
  const { handleNavigate } = useCitizenData();
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavigate("officer-dashboard")}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Desk & Officer Settings
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure your municipal branch credentials, signature key, and notification preferences.
            </p>
          </div>
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Desk settings successfully saved.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs max-w-2xl space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 block">Sub-City Administration</label>
          <Input defaultValue="Bole Sub-City Administration Office" className="h-10 text-xs" />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 block">Assigned Woreda & Branch</label>
          <Input defaultValue="Woreda 03 • Land Administration Desk" className="h-10 text-xs" />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 block">Officer Full Name</label>
          <Input defaultValue="Dawit Mengistu Alemu" className="h-10 text-xs" />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 block">Employee ID / Badge #</label>
          <Input defaultValue="GOV-ET-AA-BOL-0092" disabled className="h-10 text-xs bg-slate-50 font-mono" />
        </div>

        <div className="pt-3">
          <Button type="submit" className="h-10 bg-[#00450d] text-white font-bold text-xs">
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OfficerSettingsPage;
