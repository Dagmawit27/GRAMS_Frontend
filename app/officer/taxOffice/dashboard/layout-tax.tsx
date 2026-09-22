"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/api";
import { SideNavBar } from "@/components/SideNavBar";
import { TopAppBar } from "@/components/TopAppBar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NavPage } from "@/types";

export interface TaxOfficerLayoutProps {
  children: React.ReactNode;
  activeNav: "tax-dashboard" | "tax-landlord-ledger" | "tax-assessments" | "tax-discrepancies" | "tax-reports";
}

export const TaxOfficerLayout: React.FC<TaxOfficerLayoutProps> = ({ children, activeNav }) => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = () => {
    clearSession();
    if (typeof window !== "undefined") {
      localStorage.removeItem("userRole");
      localStorage.removeItem("session");
      localStorage.removeItem("user");
    }
    router.push("/officer");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      {/* Unified SideNavBar: Identical component, design & behavior as Woreda Officer & Supervisor */}
      <SideNavBar
        currentPage={activeNav as NavPage}
        onNavigate={() => {}}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((p) => !p)}
        onLogoutClick={() => setLogoutOpen(true)}
        userRole="tax_officer"
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-200 ${collapsed ? "md:pl-[68px]" : "md:pl-[260px]"}`}>
        {/* Unified TopAppBar: Identical component, design & behavior as Woreda Officer & Supervisor */}
        <TopAppBar
          onOpenMobileMenu={() => setCollapsed((p) => !p)}
          title="Tax Officer Portal"
          subtitle="Federal Tax Administration System"
          notifications={[]}
          onNotificationClick={() => {}}
          onClearNotifications={() => {}}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onProfileClick={() => {}}
          onLogoutClick={() => setLogoutOpen(true)}
          userRole="tax_officer"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
          {children}
        </main>
      </div>

      {/* Standard Logout Confirmation Dialog */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent onClose={() => setLogoutOpen(false)} className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out of the Federal Tax Officer Portal?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-4">
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleLogout}>
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
