"use client";
import React from "react";
import { NavPage } from "@/types";
import { SideNavBar } from "@/components/SideNavBar";

interface Props {
  userRole: "city_administrator";
  currentPage: NavPage;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogoutClick: () => void;
}

export const CitySidebarWrapper: React.FC<Props> = ({
  currentPage,
  collapsed,
  onToggleCollapse,
  onLogoutClick,
}) => {
  return (
    <SideNavBar
      currentPage={currentPage}
      onNavigate={() => {}}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      onLogoutClick={onLogoutClick}
      userRole="city_administrator"
    />
  );
};
export { CitySidebarWrapper as OfficerSidebarWrapper };
