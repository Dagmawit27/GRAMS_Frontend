import React from "react";
import { UserRole } from "@/types";
import { useCitizenData } from "@/hooks/useCitizenData";
import { Building2, User, ArrowLeftRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const RoleSwitcherBanner: React.FC = () => {
  const { userRole, setUserRole, setActiveAgreementView, setSelectedLeaseRequest } = useCitizenData();

  const handleSwitch = (role: UserRole) => {
    setUserRole(role);
    setActiveAgreementView('list');
    setSelectedLeaseRequest(null);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl p-3.5 sm:p-4 shadow-md border border-slate-700/60 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
          <ArrowLeftRight className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Role-Based Access & Testing Navigator
            </span>
            <Badge variant="outline" className="text-[10px] bg-white/10 text-slate-200 border-white/20">
              Live Role: {userRole === "landlord" ? "Landlord (Property Owner)" : "Tenant (Renter)"}
            </Badge>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            {userRole === "landlord"
              ? "Viewing as Landlord: Review incoming lease requests, inspect tenant KYC, and accept agreements."
              : "Viewing as Tenant: Track application statuses, review approved terms, and sign contracts digitally."}
          </p>
        </div>
      </div>

      {/* Role Toggle Buttons */}
      <div className="flex items-center bg-slate-950/70 p-1 rounded-xl border border-slate-700/80 self-start md:self-auto shrink-0 shadow-inner">
        <button
          onClick={() => handleSwitch("landlord")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            userRole === "landlord"
              ? "bg-[#00450d] text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Landlord View</span>
          {userRole === "landlord" && <CheckCircle2 className="w-3 h-3 text-emerald-300" />}
        </button>

        <button
          onClick={() => handleSwitch("tenant")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            userRole === "tenant"
              ? "bg-[#00450d] text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Tenant View</span>
          {userRole === "tenant" && <CheckCircle2 className="w-3 h-3 text-emerald-300" />}
        </button>
      </div>
    </div>
  );
};

export default RoleSwitcherBanner;
