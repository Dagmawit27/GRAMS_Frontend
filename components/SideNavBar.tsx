"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavPage, UserRole } from "@/types/index";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  FileText,
  Building2,
  CreditCard,
  Receipt,
  User,
  LogOut,
  Star,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface SideNavBarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onLogoutClick?: () => void;
  pendingAgreementsCount?: number;
  userRole?: UserRole;
  onToggleRole?: (role: UserRole) => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  currentPage,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
  onLogoutClick,
  pendingAgreementsCount = 2,
  userRole = "landlord",
  onToggleRole,
}) => {
  const pathname = usePathname();

  const navItems: Array<{
    id: NavPage;
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    category?: string;
    badge?: number;
  }> = [
    { id: "dashboard", label: "Dashboard", href: "/citizen/dashboard", icon: LayoutDashboard },
    { id: "search", label: "Search House", href: "/citizen/dashboard/search", icon: Search },
    { id: "agreements", label: userRole === "landlord" ? "Rental Agreements" : "My Lease Requests", href: "/citizen/dashboard/agreements", icon: FileText, category: "Management", badge: pendingAgreementsCount },
    { id: "properties", label: "Properties", href: "/citizen/dashboard/properties", icon: Building2, category: "Management" },
    { id: "payments", label: "Payments", href: "/citizen/dashboard/payments", icon: CreditCard, category: "Payment" },
    { id: "bills", label: "Bills", href: "/citizen/dashboard/bills", icon: Receipt, category: "Payment" },
    { id: "profile", label: "My Profile", href: "/citizen/dashboard/profile", icon: User, category: "Account" },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/90 text-slate-900">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
        <Link 
          href="/citizen/dashboard"
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => {
            onNavigate("dashboard");
            onCloseMobile?.();
          }}
        >
          <div className="w-9 h-9 rounded-lg bg-[#00450d] flex items-center justify-center text-white shadow-xs shrink-0">
            <Star className="w-4 h-4 fill-current text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">GRAMS</h1>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Citizen Portal</p>
            </div>
          )}
        </Link>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        )}
      </div>

       {/* Role Indicator Widget in Sidebar */}
      {!collapsed && onToggleRole && (
        <div className="mx-3 mt-3 p-2 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Role</span>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded">
              {userRole === "landlord" ? "Landlord" : "Tenant"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => onToggleRole("landlord")}
              className={`py-1 px-2 rounded-md font-semibold text-[11px] transition-all text-center ${
                userRole === "landlord"
                  ? "bg-[#00450d] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Landlord
            </button>
            <button
              onClick={() => onToggleRole("tenant")}
              className={`py-1 px-2 rounded-md font-semibold text-[11px] transition-all text-center ${
                userRole === "tenant"
                  ? "bg-[#00450d] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tenant
            </button>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        {navItems.map((item, index) => {
          const isActive =
            currentPage === item.id ||
            (pathname ? pathname === item.href || (item.id !== "dashboard" && pathname.startsWith(item.href)) : false);

          const showCategoryHeader =
            item.category &&
            (index === 0 || navItems[index - 1]?.category !== item.category);

          const Icon = item.icon;

          return (
            <React.Fragment key={item.id}>
              {showCategoryHeader && !collapsed && (
                <div className="pt-4 pb-1 px-3">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
              )}

              <Link
                href={item.href}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile?.();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative text-left",
                  isActive
                    ? "bg-slate-100 text-[#00450d] font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-transform",
                    isActive ? "text-[#00450d]" : "text-slate-400"
                  )}
                />
                {!collapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#00450d] text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
        {!collapsed ? (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900">Dagmawit Mesfin</p>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  Ministry of Urban Dev.
                </p>
              </div>
              <button
                onClick={onLogoutClick}
                className="flex items-center gap-1 text-xs font-medium text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-md transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={onLogoutClick}
              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden md:block h-screen fixed left-0 top-0 bottom-0 z-40 transition-all duration-200",
          collapsed ? "w-[68px]" : "w-[260px]"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-[260px] z-50 bg-white shadow-xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};



