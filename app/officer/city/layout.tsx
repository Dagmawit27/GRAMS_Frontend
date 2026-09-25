"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { NavPage } from "@/types";
import { clearSession, validateSession } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TopAppBar } from "@/components/TopAppBar";
import { SideNavSkeleton } from "@/components/SideNavBar";

const CitySidebarWrapper = dynamic(
  () => import("@/app/officer/city/sidebar-wrapper").then((m) => m.CitySidebarWrapper),
  { ssr: false, loading: () => <SideNavSkeleton isCityAdmin collapsed={false} /> }
);

function resolveCurrentPage(pathname: string): NavPage {
  if (pathname.includes("/benchmarking")) return "city-benchmarking" as NavPage;
  if (pathname.includes("/telemetry")) return "city-telemetry" as NavPage;
  if (pathname.includes("/revenue")) return "city-revenue" as NavPage;
  if (pathname.includes("/enforcement")) return "city-enforcement" as NavPage;
  if (pathname.includes("/alerts")) return "city-alerts" as NavPage;
  return "city-dashboard" as NavPage;
}

export default function CityLayout({ children }: { children: React.ReactNode }) {
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
    if (role !== "city_administrator" && role !== "city_admin") {
      router.replace("/officer");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex font-sans">
        <SideNavSkeleton isCityAdmin collapsed={collapsed} />
        <div className={`flex-1 flex flex-col ${collapsed ? "md:pl-[68px]" : "md:pl-[260px]"}`}>
          <div className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between animate-pulse">
            <div className="h-4 w-48 bg-slate-200 rounded" />
            <div className="h-8 w-24 bg-slate-200 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  const currentPage = resolveCurrentPage(pathname);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      <CitySidebarWrapper
        userRole="city_administrator"
        currentPage={currentPage}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((p) => !p)}
        onLogoutClick={() => setLogoutOpen(true)}
      />
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          collapsed ? "md:pl-[68px]" : "md:pl-[260px]"
        }`}
      >
        <TopAppBar
          onOpenMobileMenu={() => setCollapsed((p) => !p)}
          title="GRAMS Executive Command Center"
          subtitle="Addis Ababa City Administration • Land & Housing Authority Executive Command"
          notifications={[]}
          onNotificationClick={() => {}}
          onClearNotifications={() => {}}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onProfileClick={() => {}}
          onLogoutClick={() => setLogoutOpen(true)}
          userRole="city_administrator"
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1720px] mx-auto">
          {children}
        </main>
      </div>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent onClose={() => setLogoutOpen(false)} className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out of the Executive City Command Center?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-4">
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearSession();
                router.push("/officer");
              }}
            >
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// For backward compatibility if anything imports CityOfficerDashboardLayout
export const CityOfficerDashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <>{children}</>;
};
