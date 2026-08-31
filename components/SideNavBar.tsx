"use client";
import React, { useEffect, useState } from "react";
import { NavPage, UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { getSession } from "@/lib/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ChevronDown,
  ChevronRight,
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
  userRole: propUserRole = "citizen",
}) => {
  const session = getSession();
  const displayRole = propUserRole.toLowerCase() as UserRole;
  const pathname = usePathname();

  const [isOfficer, setIsOfficer] = useState(false);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [isTenant, setIsTenant] = useState(false);
  const [isLandlord, setIsLandlord] = useState(false);
  const [userName, setUserName] = useState("");
  const [accountType, setAccountType] = useState("Citizen Account");
  const [isAgreementsDropdownOpen, setIsAgreementsDropdownOpen] = useState(false);

  // Helper function to check if a menu item is active based on current pathname
  const isPathActive = (href: string) => {
    if (href === "/citizen/dashboard") {
      return pathname === "/citizen/dashboard" || pathname === "/citizen/dashboard/";
    }
    return pathname.startsWith(href);
  };

  useEffect(() => {
    const role = displayRole;
    const sessionRoles = (session?.user?.roles ?? []).map((r) => r.toLowerCase());

    setIsOfficer(
      role === "woreda_officer" ||
      role === "woreda_supervisor" ||
      session?.user?.userType === "GOVERNMENT_EMPLOYEE"
    );
    setIsSupervisor(
      role === "woreda_supervisor" ||
      session?.user?.roles?.some((r) => r.toLowerCase() === "supervisor" || r.toLowerCase() === "woreda_supervisor") === true
    );

    // isTenant: role is tenant, citizen, or both (can search & request leases)
    setIsTenant(
      role === "tenant" || role === "citizen" || (role as string) === "both" ||
      sessionRoles.includes("tenant") || sessionRoles.includes("citizen") || sessionRoles.includes("both")
    );

    // isLandlord: role is landlord, citizen, or both (can register properties & manage agreements)
    setIsLandlord(
      role === "landlord" || role === "citizen" || (role as string) === "both" ||
      sessionRoles.includes("landlord") || sessionRoles.includes("citizen") || sessionRoles.includes("both")
    );

    setAccountType(
      session?.user?.userType === "GOVERNMENT_EMPLOYEE" ? "Government Employee" : "Citizen Account"
    );

    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        const fullName = `${user.firstName} ${user.middleName ? user.middleName + " " : ""}${user.lastName}`;
        setUserName(fullName);
      } catch (e) {
        console.error("Failed to parse user data:", e);
      }
    }
  }, [displayRole, session]);

  const officerBase = isSupervisor ? "/officer/supervisor" : "/officer/office";

  const officerNavItems: Array<{
    id: NavPage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    category?: string;
    badge?: number;
    href: string;
  }> = [
    {
      id: "officer-dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: `${officerBase}/dashboard`,
      category: "Overview",
    },
    {
      id: "officer-property-verifications",
      label: isSupervisor ? "Property Approvals" : "Property Verifications",
      icon: ShieldCheck,
      href: `${officerBase}/properties`,
      category: "Management",
    },
    {
      id: "officer-agreement-verifications",
      label: isSupervisor ? "Agreement Approvals" : "Agreement Reviews",
      icon: FileText,
      href: `${officerBase}/agreements`,
      category: "Management",
    },
    isSupervisor
      ? {
          id: "officer-reports" as NavPage,
          label: "Reports",
          icon: BarChart3,
          href: `${officerBase}/reports`,
          category: "Reports" as const,
        }
      : {
          id: "officer-history" as NavPage,
          label: "Approved History",
          icon: History,
          href: `${officerBase}/history`,
          category: "Reports" as const,
        },
    {
      id: "officer-settings",
      label: "Settings",
      icon: Settings,
      href: `${officerBase}/settings`,
      category: "Account",
    },
  ];

  const citizenNavItems: Array<{
    id: NavPage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    category?: string;
    badge?: number;
    href: string;
    hasDropdown?: boolean;
    dropdownItems?: Array<{
      id: NavPage;
      label: string;
      href: string;
    }>;
  }> = [
    { id: "dashboard", label: "Dashboard", href: "/citizen/dashboard", icon: LayoutDashboard, category: "Overview" },
    ...(isTenant
      ? [
          { id: "search" as NavPage, label: "Search House", icon: Search, category: "Rentals", href: "/citizen/dashboard/search" },
          { id: "agreements-t" as NavPage, label: "My Lease Requests", icon: FileText, category: "Rentals", badge: pendingAgreementsCount, href: "/citizen/dashboard/leases" },
        ]
      : []),
    ...(isLandlord
      ? [
          { id: "properties" as NavPage, label: "My Properties", icon: Building2, category: "Management", href: "/citizen/dashboard/properties" },
          { id: "register-property" as NavPage, label: "Register Property", icon: PlusCircle, category: "Management", href: "/citizen/dashboard/properties/register" },
          {
            id: "agreements" as NavPage,
            label: "Rental Agreements",
            icon: FileText,
            category: "Management",
            badge: pendingAgreementsCount,
            href: "/citizen/dashboard/agreements",
            hasDropdown: true,
            dropdownItems: [
              { id: "agreements-new" as NavPage, label: "New Requests", href: "/citizen/dashboard/agreements/new" },
              { id: "agreements-pending" as NavPage, label: "Pending Agreements", href: "/citizen/dashboard/agreements/pending" },
              { id: "agreements-active" as NavPage, label: "Active Agreements", href: "/citizen/dashboard/agreements/active" },
            ],
          },
        ]
      : []),
    { id: "payments", label: "Payments", icon: CreditCard, category: "Finance", href: "/citizen/dashboard/payments" },
    { id: "bills", label: "Bills & Invoices", icon: Receipt, category: "Finance", href: "/citizen/dashboard/bills" },
    { id: "profile", label: "My Profile", icon: User, category: "Account", href: "/citizen/dashboard/profile" },
  ];

  const currentNavItems = isOfficer ? officerNavItems : citizenNavItems;

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
                      {displayRole === "landlord" ? "Landlord Desk" : "Citizen Portal"}
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
          const isActive = isPathActive(item.href) || currentPage === item.id;
          const showCategoryHeader =
            "category" in item &&
            item.category &&
            (index === 0 || (currentNavItems[index - 1] as any)?.category !== item.category);

          const Icon = item.icon;
          const hasDropdown = (item as any).hasDropdown;
          const isDropdownOpen = hasDropdown && isAgreementsDropdownOpen;

          return (
            <React.Fragment key={item.id}>
              {showCategoryHeader && !collapsed && (
                <div className="pt-3 pb-1 px-4">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {(item as any).category}
                  </span>
                </div>
              )}

              {hasDropdown ? (
                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setIsAgreementsDropdownOpen(!isAgreementsDropdownOpen);
                      if (!isDropdownOpen) {
                        onNavigate(item.id);
                      }
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
                      <>
                        <span className="flex-1 truncate text-xs">{item.label}</span>
                        {!collapsed && "badge" in item && (item as any).badge !== undefined && (item as any).badge > 0 && (
                          <span className={cn(
                            "px-1.5 py-0.2 text-[10px] font-bold rounded-full",
                            isActive ? "bg-[#00450d] text-white" : "bg-slate-200 text-slate-700"
                          )}>
                            {(item as any).badge}
                          </span>
                        )}
                        <ChevronDown
                          className={cn(
                            "w-3.5 h-3.5 transition-transform",
                            isDropdownOpen ? "rotate-180" : ""
                          )}
                        />
                      </>
                    )}
                  </button>

                  {!collapsed && isDropdownOpen && (item as any).dropdownItems && (
                    <div className="ml-4 space-y-0.5 animate-in slide-in-from-top-2 duration-150">
                      {(item as any).dropdownItems.map((subItem: any) => (
                        <Link
                          key={subItem.id}
                          href={subItem.href}
                          onClick={() => {
                            onNavigate(subItem.id);
                            onCloseMobile?.();
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2 text-xs font-medium transition-all duration-150 relative text-left group",
                            isPathActive(subItem.href) || currentPage === subItem.id
                              ? "bg-[#d8edd9] text-[#00450d] font-semibold"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/90"
                          )}
                        >
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                          <span className="flex-1 truncate text-xs">{subItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
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
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
        {!collapsed ? (
          <button
            onClick={onLogoutClick}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-2.5 rounded-lg transition-colors border border-rose-200 hover:border-rose-300"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
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



