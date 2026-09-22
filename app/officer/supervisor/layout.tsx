"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { NavPage } from "@/types";
import { clearSession, validateSession, getSession } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TopAppBar } from "@/components/TopAppBar";

const OfficerSidebarWrapper = dynamic(
  () => import("@/app/officer/supervisor/sidebar-wrapper").then((m) => m.OfficerSidebarWrapper),
  { ssr: false }
);

function resolveCurrentPage(pathname: string): NavPage {
  if (pathname.includes("/properties")) return "officer-property-verifications";
  if (pathname.includes("/agreements/active")) return "officer-agreements-active";
  if (pathname.includes("/agreements")) return "officer-agreement-verifications";
  if (pathname.includes("/history")) return "officer-history";
  if (pathname.includes("/reports")) return "officer-reports";
  if (pathname.includes("/settings")) return "officer-settings";
  return "officer-dashboard";
}

export default function SupervisorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const sessionValidation = validateSession();
    if (!sessionValidation.valid) {
      router.replace("/officer");
      return;
    }

    const role = (localStorage.getItem("userRole") ?? "").toLowerCase();
    if (role !== "woreda_supervisor") {
      router.replace(role === "woreda_officer" ? "/officer/office/dashboard" : "/officer");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;

  const currentPage = resolveCurrentPage(pathname);

  const session = getSession();
  const userName = session?.user ? `${session.user.firstName} ${session.user.lastName}` : "Supervisor";

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      <OfficerSidebarWrapper
        userRole="woreda_supervisor"
        currentPage={currentPage}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((p) => !p)}
        onLogoutClick={() => setLogoutOpen(true)}
      />
      <div className={`flex-1 flex flex-col transition-all duration-200 ${collapsed ? "md:pl-[68px]" : "md:pl-[260px]"}`}>
        <TopAppBar
          onOpenMobileMenu={() => setCollapsed((p) => !p)}
          title="Woreda Supervisor Portal"
          subtitle="Property Verification System"
          notifications={[]}
          onNotificationClick={() => {}}
          onClearNotifications={() => {}}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onProfileClick={() => {}}
          onLogoutClick={() => setLogoutOpen(true)}
          userRole="woreda_supervisor"
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
          {children}
        </main>
      </div>
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent onClose={() => setLogoutOpen(false)} className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out of the Woreda Supervisor Portal?
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
