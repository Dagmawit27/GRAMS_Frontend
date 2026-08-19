"use client";
import React, { useState, useEffect } from "react";
import { loginOfficer, getSession } from "@/lib/api";
import { useCitizenData } from "@/hooks/useCitizenData";
import { OfficerDashboardLayout } from "@/app/officer/dashboard/layout";
import { OfficerDashboardOverviewPage } from "@/app/officer/dashboard/page";
import { OfficerPropertyVerificationsPage } from "@/app/officer/dashboard/properties/page";
import { OfficerAgreementVerificationsPage } from "@/app/officer/dashboard/agreements/page";
import { OfficerHistoryPage } from "@/app/officer/dashboard/history/page";
import { OfficerReportsPage } from "@/app/officer/dashboard/reports/page";
import { OfficerSettingsPage } from "@/app/officer/dashboard/settings/page";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Lock,
  User,
  Building2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

export const OfficerPage: React.FC = () => {
  const { currentPage, handleNavigate } = useCitizenData();

  // Authentication State
  const [session, setSession] = useState(getSession());
  const [username, setUsername] = useState("officer_alemu");
  const [password, setPassword] = useState("••••••••");
  const [subCityOffice, setSubCityOffice] = useState("Bole Sub-City (Woreda 03 Desk)");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Sync session from localStorage
  useEffect(() => {
    const currentSession = getSession();
    setSession(currentSession);
  }, []);

  const isOfficerLoggedIn =
    !!session &&
    (session.user?.userType === "GOVERNMENT_EMPLOYEE" ||
      session.user?.roles?.includes("OFFICER") ||
      session.user?.roles?.includes("SUPERVISOR") ||
      (typeof window !== "undefined" &&
        (localStorage.getItem("userRole") === "officer" ||
          localStorage.getItem("userRole") === "supervisor")));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    try {
      const response = await loginOfficer({ username, password });
      const role = username.includes("sup") ? "supervisor" : "officer";
      if (typeof window !== "undefined") {
        localStorage.setItem("userRole", role);
      }
      setSession({
        token: response.accessToken,
        user: response.user,
      });
      handleNavigate("officer-dashboard");
    } catch (err: any) {
      setLoginError(err.message || "Failed to authenticate officer credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role: "officer" | "supervisor") => {
    if (role === "officer") {
      setUsername("officer_alemu");
      setPassword("password123");
      const resp = {
        token: "mock-token-officer-" + Date.now(),
        user: {
          id: "usr-officer-1",
          firstName: "Dawit",
          lastName: "M.",
          email: "dawit.m@bole.gov.et",
          phoneNumber: "+251 91 234 5678",
          gender: "Male",
          userType: "GOVERNMENT_EMPLOYEE" as const,
          governmentEmployee: true,
          employeeNumber: "WRD-OFF-402",
          positionTitle: "Senior Housing & Cadastre Officer",
          department: "Addis Ababa Land & Housing Bureau",
          roles: ["OFFICER"],
          createdAt: new Date().toISOString(),
        },
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("session", JSON.stringify(resp));
        localStorage.setItem("userRole", "officer");
        localStorage.setItem("user", JSON.stringify(resp.user));
      }
      setSession(resp);
      handleNavigate("officer-dashboard");
    } else {
      setUsername("supervisor_dawit");
      setPassword("password123");
      const resp = {
        token: "mock-token-supervisor-" + Date.now(),
        user: {
          id: "usr-supervisor-1",
          firstName: "Supervisor",
          lastName: "User",
          email: "supervisor.user@bole.gov.et",
          phoneNumber: "+251 91 888 9900",
          gender: "Male",
          userType: "GOVERNMENT_EMPLOYEE" as const,
          governmentEmployee: true,
          employeeNumber: "WRD-SUP-0104",
          positionTitle: "Woreda Head of Housing Bureau",
          department: "Addis Ababa Municipal Administration",
          roles: ["SUPERVISOR"],
          createdAt: new Date().toISOString(),
        },
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("session", JSON.stringify(resp));
        localStorage.setItem("userRole", "supervisor");
        localStorage.setItem("user", JSON.stringify(resp.user));
      }
      setSession(resp);
      handleNavigate("officer-dashboard");
    }
  };

  // =========================================================================
  // VIEW A: LOGGED IN OFFICER DASHBOARD VIEWS
  // =========================================================================
  if (isOfficerLoggedIn) {
    return (
      <OfficerDashboardLayout activeNav={currentPage} onNavigate={handleNavigate}>
        {currentPage === "officer-dashboard" && <OfficerDashboardOverviewPage />}
        {currentPage === "officer-property-verifications" && <OfficerPropertyVerificationsPage />}
        {currentPage === "officer-agreement-verifications" && <OfficerAgreementVerificationsPage />}
        {currentPage === "officer-history" && <OfficerHistoryPage />}
        {currentPage === "officer-reports" && <OfficerReportsPage />}
        {currentPage === "officer-settings" && <OfficerSettingsPage />}
      </OfficerDashboardLayout>
    );
  }

  // =========================================================================
  // VIEW B: OFFICER SIGN IN PAGE
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#07130c] text-white flex flex-col justify-center items-center px-4 sm:px-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none opacity-20 scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80')`,
        }}
      />
      <div className="fixed inset-0 z-0 bg-radial from-emerald-950/40 via-black/80 to-[#050b07] pointer-events-none" />

      {/* Return to Citizen Home Portal */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => handleNavigate("landing")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300 hover:text-white bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/15 transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Citizen Home</span>
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md my-8">
        {/* Government Officer Seal Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-900 border border-slate-200">
          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#00450d] text-white flex items-center justify-center shadow-lg shadow-emerald-950/30 border border-emerald-500/30">
              <ShieldCheck className="w-8 h-8 text-emerald-300" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#00450d]">
                Federal Democratic Republic of Ethiopia
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Officer Administration Portal
              </h1>
              <p className="text-xs text-slate-500">
                Authorized Woreda & Kebele municipal officers and supervisors only.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Sub-City Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Administrative Desk Location
              </label>
              <div className="relative">
                <select
                  value={subCityOffice}
                  onChange={(e) => setSubCityOffice(e.target.value)}
                  className="w-full h-11 pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00450d]/20 focus:border-[#00450d] transition-all appearance-none"
                >
                  <option value="Bole Sub-City (Woreda 03 Desk)">Bole Sub-City (Woreda 03 Desk)</option>
                  <option value="Yeka Sub-City (Woreda 08 Desk)">Yeka Sub-City (Woreda 08 Desk)</option>
                  <option value="Kirkos Sub-City (Woreda 02 Desk)">Kirkos Sub-City (Woreda 02 Desk)</option>
                  <option value="Arada Sub-City (Woreda 01 Desk)">Arada Sub-City (Woreda 01 Desk)</option>
                  <option value="Lideta Sub-City (Woreda 04 Desk)">Lideta Sub-City (Woreda 04 Desk)</option>
                </select>
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Username / Employee ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Official Username or Employee ID
              </label>
              <div className="relative">
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. officer_alemu or WRD-092"
                  className="pl-9 h-11 text-xs bg-slate-50 border-slate-200"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Official Passcode</label>
                <button
                  type="button"
                  onClick={() => alert("Contact Woreda ICT Bureau for passcode reset: ext 4401")}
                  className="text-[11px] font-semibold text-[#00450d] hover:underline"
                >
                  Forgot passcode?
                </button>
              </div>
              <div className="relative">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 h-11 text-xs bg-slate-50 border-slate-200 font-mono"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="officer-remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded accent-[#00450d] cursor-pointer"
              />
              <label htmlFor="officer-remember" className="text-xs text-slate-600 select-none cursor-pointer">
                Keep desk session active for 8 hours
              </label>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-[#00450d] hover:bg-[#164e23] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying Credentials...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Sign In to Officer Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Quick Access Testing Desks */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Quick 1-Click Access Desks
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleQuickLogin("officer")}
                className="h-10 text-xs font-bold border-emerald-300 text-emerald-900 bg-emerald-50/60 hover:bg-emerald-100/70"
              >
                Officer Desk
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleQuickLogin("supervisor")}
                className="h-10 text-xs font-bold border-slate-300 text-slate-900 bg-slate-100 hover:bg-slate-200"
              >
                Supervisor Desk
              </Button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-400 mt-4">
          Government Intranet Service • Ministry of Urban Development & Land Registry
        </p>
      </div>
    </div>
  );
};

export default OfficerPage;
