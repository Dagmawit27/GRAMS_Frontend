"use client";
import React from "react";
import { NavPage, UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { getSession } from "@/lib/api";
import Link from "next/link";
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
  Home,
  ShieldCheck,
  FileCheck2,
  Clock,
  Settings,
  HelpCircle,
  Archive,
  BarChart3,
  PlusCircle,
  CheckCircle2,
  History,
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
}) => {
  const session = getSession();
  const isOfficer = userRole === "officer" || userRole === "supervisor" || session?.user?.userType === "GOVERNMENT_EMPLOYEE";
  const isSupervisor = userRole === "supervisor" || session?.user?.roles?.includes("SUPERVISOR");

  
    // Officer / Supervisor Navigation Items (Exact match to Reference Images 1, 2, 3, 4)
    const officerNavItems = [
      {
        id: "officer-dashboard" as NavPage,
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/officer/dashboard",
      },
      {
        id: "officer-property-verifications" as NavPage,
        label: isSupervisor ? "Property Approvals (Final)" : "Property Verifications (Initial)",
        icon: ShieldCheck,
        href: "/officer/dashboard/properties",
      },
      {
        id: "officer-agreement-verifications" as NavPage,
        label: isSupervisor ? "Agreement Approvals (Final)" : "Agreement Verifications (Initial)",
        icon: FileText,
        href: "/officer/dashboard/agreements",
      },
      {
        id: "officer-history" as NavPage,
        label: isSupervisor ? "Reports" : "Approved History",
        icon: isSupervisor ? BarChart3 : History,
        href: "/officer/dashboard/history",
      },
      {
        id: "officer-settings" as NavPage,
        label: "Settings",
        icon: Settings,
        href: "/officer/dashboard/settings",
      },
    ];
  
    // Citizen Nav Items based on Role (Landlord vs Tenant, automatically read from localStorage)
    const citizenNavItems: Array<{
      id: NavPage;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      category?: string;
      badge?: number;
      href: string;
    }> = [
      { id: "dashboard", label: "Dashboard", href: "/citizen/dashboard", icon: LayoutDashboard, category: "Overview" },
      ...(userRole === "tenant"
        ? [
            { id: "search" as NavPage, label: "Search House", icon: Search, category: "Rentals", href: "/citizen/dashboard/search" },
            { id: "agreements" as NavPage, label: "My Lease Requests", icon: FileText, category: "Rentals", badge: pendingAgreementsCount, href: "/citizen/dashboard/agreements" },
          ]
        : [
            { id: "properties" as NavPage, label: "My Properties", icon: Building2, category: "Management", href: "/citizen/dashboard/properties" },
            { id: "register-property" as NavPage, label: "+ Register Property", icon: PlusCircle, category: "Management", href: "/citizen/dashboard/register-property" },
            { id: "agreements" as NavPage, label: "Rental Agreements", icon: FileText, category: "Management", badge: pendingAgreementsCount, href: "/citizen/dashboard/agreements" },
          ]),
      { id: "payments", label: "Payments", icon: CreditCard, category: "Finance", href: "/citizen/dashboard/payments" },
      { id: "bills", label: "Bills & Invoices", icon: Receipt, category: "Finance", href: "/citizen/dashboard/bills" },
      { id: "profile", label: "My Profile", icon: User, category: "Account", href: "/citizen/dashboard/profile" },
    ];
  
    const currentNavItems = isOfficer ? officerNavItems : citizenNavItems;
  
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
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              onNavigate(isOfficer ? "officer-dashboard" : "dashboard");
              onCloseMobile?.();
            }}
          >
            {isOfficer ? (
              /* Woreda Admin Official Header (Matching Images 1-4) */
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shadow-2xs shrink-0 overflow-hidden">
                  {/* Government Seal Emblem */}
                  <div className="w-7 h-7 rounded-full bg-[#00450d] text-white flex items-center justify-center font-serif text-[11px] font-bold ring-2 ring-emerald-200">
                    ET
                  </div>
                </div>
                {!collapsed && (
                  <div>
                    <h1 className="text-[17px] font-extrabold text-[#00450d] tracking-tight leading-tight">
                      Woreda Admin
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                      Official Portal
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Citizen Portal Header */
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00450d] flex items-center justify-center text-white shadow-xs shrink-0">
                  <Star className="w-4 h-4 fill-current text-white" />
                </div>
                {!collapsed && (
                  <div>
                    <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">GRAMS</h1>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                      {userRole === "landlord" ? "Landlord Desk" : "Citizen Portal"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
  
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

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        {currentNavItems.map((item, index) => {
          const isActive = currentPage === item.id;
          const showCategoryHeader =
            "category" in item &&
            item.category &&
            (index === 0 || (currentNavItems[index - 1] as any)?.category !== item.category);

          const Icon = item.icon;

          return (
            <React.Fragment key={item.id}>
              {showCategoryHeader && !collapsed && (
                <div className="pt-3 pb-1 px-4">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {(item as any).category}
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
                  "w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium transition-all duration-150 relative text-left group",
                  isActive
                    ? "bg-[#d8edd9] text-[#00450d] font-bold border-l-4 border-[#00450d]"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-50/90"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-transform",
                    isActive ? "text-[#00450d] stroke-[2.2]" : "text-slate-500 group-hover:text-slate-800 stroke-[1.75]"
                  )}
                />
                {!collapsed && (
                  <span className="flex-1 truncate text-xs">{item.label}</span>
                )}
                {!collapsed && "badge" in item && (item as any).badge !== undefined && (item as any).badge > 0 && (
                  <span className={cn(
                    "px-1.5 py-0.2 text-[10px] font-bold rounded-full",
                    isActive ? "bg-[#00450d] text-white" : "bg-slate-200 text-slate-700"
                  )}>
                    {(item as any).badge}
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



