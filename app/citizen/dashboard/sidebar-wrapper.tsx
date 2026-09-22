"use client";

import React from "react";
import { SideNavBar } from "@/components/SideNavBar";
import { useCitizenData } from "@/hooks/useCitizenData";

export const SidebarWrapper: React.FC = () => {
  const {
    currentPage,
    handleNavigate,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    setIsLogoutModalOpen,
    leaseRequests,
    userRole,
    setUserRole,
  } = useCitizenData();

  return (
    <SideNavBar
      currentPage={currentPage}
      onNavigate={handleNavigate}
      collapsed={isSidebarCollapsed}
      onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      isMobileOpen={isMobileMenuOpen}
      onCloseMobile={() => setIsMobileMenuOpen(false)}
      onLogoutClick={() => setIsLogoutModalOpen(true)}
      pendingAgreementsCount={
        userRole === "landlord"
          ? leaseRequests.filter((r) => r.status === "PENDING" || r.status === "Pending Review").length
          : leaseRequests.filter((r) => r.status === "LANDLORD_APPROVED" || r.status === "Ready to Sign").length
      }
      userRole={userRole}
      onToggleRole={(role) => setUserRole(role)}
    />
  );
};

export default SidebarWrapper;

