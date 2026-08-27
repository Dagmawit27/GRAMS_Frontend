"use client";
import React, { useState, useEffect } from "react";
import { OfficerSidebarWrapper } from "@/app/officer/dashboard/sidebar-wrapper";
import { getSession, clearSession, validateSession } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { NavPage, UserRole } from "@/types";
import { useCitizenData } from "@/hooks/useCitizenData";
import { useRouter } from "next/navigation";

import {
  Search,
  Bell,
  HelpCircle,
  Settings,
  Sliders,
  LogOut,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface OfficerDashboardLayoutProps {
  children: React.ReactNode;
  activeNav?: NavPage;
  onNavigate?: (page: NavPage) => void;
}

export const OfficerDashboardLayout: React.FC<OfficerDashboardLayoutProps> = ({
  children,
  activeNav = "officer-dashboard",
  onNavigate,
}) => {
  const {
  handleNavigate: citizenNavigate,
  userRole: contextUserRole,
} = useCitizenData();
  const navigate = onNavigate || citizenNavigate;
  const router = useRouter();

  const [session, setSession] = useState(getSession());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const sessionValidation = validateSession();
    if (!sessionValidation.valid) {
      router.replace("/officer");
      return;
    }
    setSession(sessionValidation.session || getSession());
  }, [router]);

 const userRole: UserRole =
  contextUserRole ||
  (session?.user?.roles?.[0]?.toLowerCase() as UserRole) ||
  "citizen";

const isOfficer =
  userRole === "woreda_officer" ||
  userRole === "woreda_supervisor";

const isSupervisor = userRole === "woreda_supervisor";

useEffect(() => {
  if (!isOfficer) {
    router.replace("/officer");
  }
}, [isOfficer, router]);

if (!isOfficer) {
  return null;
}

  const handleLogout = () => {
    clearSession();
    if (typeof window !== "undefined") {
      localStorage.removeItem("userRole");
      localStorage.removeItem("session");
      localStorage.removeItem("user");
    }
    navigate("landing");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans">
      {/* Unified SideNavBar */}
      <OfficerSidebarWrapper
        currentPage={activeNav}
        onNavigate={navigate}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        onLogoutClick={handleLogout}
        userRole={userRole}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          sidebarCollapsed ? "md:pl-[68px]" : "md:pl-[240px]"
        }`}
      >
        {/* Top Header Bar (Matching Reference Images 1-4) */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Sliders className="w-5 h-5" />
            </button>
            <h2
              onClick={() => navigate("officer-dashboard")}
              className="text-base sm:text-lg font-bold text-slate-900 tracking-tight whitespace-nowrap cursor-pointer"
            >
              Woreda Management Portal
            </h2>

            {/* Search Bar */}
            <div className="relative w-full max-w-xs hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isSupervisor ? "Search Portal..." : "Search ID, Name..."}
                className="pl-9 h-9 text-xs bg-slate-50/80 border-slate-200 rounded-lg focus:bg-white"
              />
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setToastMessage("4 unread municipal notifications.")}
              className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600" />
            </button>

            <button
              onClick={() => alert("Woreda Municipal Support Desk • Toll-free 8812")}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors hidden sm:block"
              title="Help & Guidelines"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate("officer-settings")}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors hidden sm:block"
              title="Desk Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-2 pl-2 sm:border-l sm:border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold ring-1 ring-slate-300">
                {isSupervisor ? "SU" : "DA"}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {isSupervisor ? "Supervisor User" : "Officer Dawit M."}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                  {isSupervisor ? "Supervisor Desk" : "Woreda Officer"}
                </p>
              </div>
            </div>

            {/* Logout Text Button */}
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-slate-800 hover:text-red-700 px-2 py-1 transition-colors uppercase tracking-wider text-[11px]"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Global Toast */}
        {toastMessage && (
          <div className="mx-4 sm:mx-8 mt-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-700">
              ✕
            </button>
          </div>
        )}

        {/* Main Dashboard Child Views */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default OfficerDashboardLayout;
