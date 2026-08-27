"use client";
import React from "react";
import { NavPage } from "@/types";
import { SideNavBar } from "@/components/SideNavBar";

interface Props {
  userRole: "woreda_officer";
  currentPage: NavPage;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogoutClick: () => void;
}

export const OfficerSidebarWrapper: React.FC<Props> = ({
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
      userRole="woreda_officer"
    />
  );
};
