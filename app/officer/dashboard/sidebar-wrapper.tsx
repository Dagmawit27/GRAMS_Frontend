"use client";
import React from "react";
import { SideNavBar } from "@/components/SideNavBar";
import { useCitizenData } from "@/hooks/useCitizenData";
import { UserRole } from "@/types";

interface OfficerSidebarWrapperProps {
  currentPage?: any;
  onNavigate?: (page: any) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onLogoutClick?: () => void;
  userRole?: UserRole;
}

export const OfficerSidebarWrapper: React.FC<OfficerSidebarWrapperProps> = ({
  currentPage = "officer-dashboard",
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
  onLogoutClick,
  userRole,
}) => {
  const { handleNavigate } = useCitizenData();

  return (
    <SideNavBar
      currentPage={currentPage}
      onNavigate={onNavigate || handleNavigate}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      isMobileOpen={isMobileOpen}
      onCloseMobile={onCloseMobile}
      onLogoutClick={onLogoutClick}
      userRole={userRole}
    />
  );
};

export default OfficerSidebarWrapper;
