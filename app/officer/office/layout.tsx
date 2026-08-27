"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { NavPage } from "@/types";
import { clearSession, validateSession, getSession } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, LogOut, Bell, User } from "lucide-react";

const OfficerSidebarWrapper = dynamic(
  () => import("@/app/officer/office/sidebar-wrapper").then((m) => m.OfficerSidebarWrapper),
  { ssr: false }
);

function resolveCurrentPage(pathname: string): NavPage {
  if (pathname.includes("/properties")) return "officer-property-verifications";
  if (pathname.includes("/agreements")) return "officer-agreement-verifications";
  if (pathname.includes("/history")) return "officer-history";
  if (pathname.includes("/reports")) return "officer-reports";
  if (pathname.includes("/settings")) return "officer-settings";
  return "officer-dashboard";
}

export default function OfficeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    const sessionValidation = validateSession();
    if (!sessionValidation.valid) {
      router.replace("/officer");
      return;
    }

    const role = (localStorage.getItem("userRole") ?? "").toLowerCase();
    if (role !== "woreda_officer") {
      router.replace(role === "woreda_supervisor" ? "/officer/supervisor/dashboard" : "/officer");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;

  const currentPage = resolveCurrentPage(pathname);

  const session = getSession();
  const userName = session?.user ? `${session.user.firstName} ${session.user.lastName}` : "Officer";

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      <OfficerSidebarWrapper
        userRole="woreda_officer"
        currentPage={currentPage}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((p) => !p)}
        onLogoutClick={() => setLogoutOpen(true)}
      />
      <div className={`flex-1 flex flex-col transition-all duration-200 ${collapsed ? "md:pl-[68px]" : "md:pl-[260px]"}`}>
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#00450d]" />
            <h1 className="text-sm font-bold text-slate-900">Woreda Officer Portal</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900">
              <Bell className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-900">{userName}</p>
                <p className="text-[10px] text-slate-400">Woreda Officer</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-600" />
              </div>
              <button
                onClick={() => setLogoutOpen(true)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-600"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
          {children}
        </main>
      </div>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent onClose={() => setLogoutOpen(false)} className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out of the Woreda Officer Portal?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-4">
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { clearSession(); router.push("/officer"); }}>
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
