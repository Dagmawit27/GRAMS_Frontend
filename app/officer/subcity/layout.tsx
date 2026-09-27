"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/navigation";
import { clearSession, validateSession, getSession } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Building2,
  FileText,
  BarChart3,
  AlertTriangle,
  LogOut,
  MapPin,
  RefreshCw,
  Home,
} from "lucide-react";

export default function SubCityLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [userName, setUserName] = useState("Sub-City Administrator");
  const [subCityName, setSubCityName] = useState("Bole");

  useEffect(() => {
    const sessionValidation = validateSession();
    if (!sessionValidation.valid) {
      router.replace("/officer");
      return;
    }

    const role = (localStorage.getItem("userRole") ?? "").toLowerCase();
    const allowed = [
      "sub_city_administrator",
      "sub_city_admin",
      "city_administrator",
      "city_admin",
      "system_administrator",
    ];

    if (!allowed.includes(role)) {
      router.replace("/officer");
      return;
    }

    const session = getSession();
    if (session?.user) {
      const full = [session.user.firstName, session.user.lastName].filter(Boolean).join(" ");
      if (full) setUserName(full);
      if (session.user.subCity) setSubCityName(session.user.subCity);
    }

    setReady(true);
  }, [router]);

  const handleLogout = () => {
    clearSession();
    router.replace("/officer");
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#00450d] animate-spin" />
          <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase">
            Loading Sub-City Command Portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col">
      {/* Top Command Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#00450d] flex items-center justify-center text-white shrink-0 shadow-sm border border-emerald-700/50">
              <Building2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 tracking-tight truncate">
                  GRAMS Sub-City Portal
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#00450d] border border-emerald-200">
                  <MapPin className="w-3 h-3 text-[#00450d]" />
                  {subCityName} Jurisdiction
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 truncate">
                Sub-City Municipal Housing Authority • Multi-Woreda Oversight
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900 leading-tight">{userName}</span>
              <span className="text-[10px] text-slate-500 leading-tight">Sub-City Administrator</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLogoutOpen(true)}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-9 gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">Sign Out Confirmation</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Are you sure you want to end your Sub-City administrative session?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setLogoutOpen(false)} className="text-xs h-9">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleLogout}
              className="text-xs h-9 bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
