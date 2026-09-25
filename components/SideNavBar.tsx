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
  BookOpen,
  AlertTriangle,
  Building,
  Landmark,
  Scale,
  Coins,
  Download,
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
  isLoading?: boolean;
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
  isLoading = false,
}) => {
  const session = getSession();
  const displayRole = propUserRole.toLowerCase() as UserRole;
  const pathname = usePathname();

  const [isMounted, setIsMounted] = useState(false);
  const [isCityAdmin, setIsCityAdmin] = useState(false);
  const [isOfficer, setIsOfficer] = useState(false);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [isTaxOfficer, setIsTaxOfficer] = useState(false);
  const [isTenant, setIsTenant] = useState(false);
  const [isLandlord, setIsLandlord] = useState(false);
  const [isBoth, setIsBoth] = useState(false);
  const [userName, setUserName] = useState("");
  const [accountType, setAccountType] = useState("Citizen Account");
  const [isAgreementsDropdownOpen, setIsAgreementsDropdownOpen] = useState(false);

  // Helper function to check if a menu item is active based on current pathname
  const isPathActive = (href: string) => {
    if (href === "/citizen/dashboard") {
      return pathname === "/citizen/dashboard" || pathname === "/citizen/dashboard/";
    }
    if (href === "/citizen/dashboard/leases") {
      return (
        (pathname === "/citizen/dashboard/leases" ||
          pathname === "/citizen/dashboard/leases/" ||
          pathname.startsWith("/citizen/dashboard/leases/")) &&
        !pathname.startsWith("/citizen/dashboard/leases/active")
      );
    }
    if (href.startsWith("/officer/city/dashboard")) {
      return pathname.startsWith("/officer/city");
    }
    if (href.includes("/ledger")) {
      return pathname.includes("/ledger") || pathname.includes("/ladger");
    }
    if (href.endsWith("/dashboard")) {
      return (
        pathname === href ||
        pathname === href + "/" ||
        pathname === href.replace("/taxOfficer/", "/taxOffice/") ||
        pathname === href.replace("/taxOfficer/", "/taxOffice/") + "/"
      );
    }
    return (
      pathname === href ||
      pathname.startsWith(href) ||
      pathname.startsWith(href.replace("/taxOfficer/", "/taxOffice/"))
    );
  };

  useEffect(() => {
    setIsMounted(true);
    const role = displayRole;
    const sessionRoles = (session?.user?.roles ?? []).map((r) => r.toLowerCase());

    const cityRole =
      role === "city_administrator" ||
      role === "city_admin" ||
      (role as string) === "cityAdministrator" ||
      sessionRoles.includes("city_administrator") ||
      sessionRoles.includes("city_admin") ||
      (typeof window !== "undefined" &&
        (localStorage.getItem("userRole") === "city_administrator" ||
          localStorage.getItem("userRole") === "city_admin"));

    setIsCityAdmin(Boolean(cityRole));

    const taxRole =
      !cityRole &&
      (role === "tax_officer" ||
        role === "taxofficer" ||
        (role as string) === "taxOfficer" ||
        sessionRoles.includes("tax_officer") ||
        sessionRoles.includes("taxofficer") ||
        (typeof window !== "undefined" &&
          (localStorage.getItem("userRole") === "tax_officer" ||
            localStorage.getItem("userRole") === "taxofficer")));

    setIsTaxOfficer(Boolean(taxRole));

    setIsOfficer(
      !cityRole &&
        !taxRole &&
        (role === "woreda_officer" ||
          role === "woreda_supervisor" ||
          session?.user?.userType === "GOVERNMENT_EMPLOYEE")
    );
    setIsSupervisor(
      !cityRole &&
        (role === "woreda_supervisor" ||
          session?.user?.roles?.some(
            (r) => r.toLowerCase() === "supervisor" || r.toLowerCase() === "woreda_supervisor"
          ) === true)
    );

    // Strict role detection for Citizen portal
    const hasBoth =
      role === "both" ||
      sessionRoles.includes("both") ||
      (sessionRoles.includes("landlord") && sessionRoles.includes("tenant"));

    setIsBoth(Boolean(hasBoth));

    const isExplicitLandlord = role === "landlord" || sessionRoles.includes("landlord");
    const isExplicitTenant = role === "tenant" || sessionRoles.includes("tenant");

    if (hasBoth) {
      setIsTenant(true);
      setIsLandlord(true);
    } else if (isExplicitLandlord && !isExplicitTenant) {
      setIsTenant(false);
      setIsLandlord(true);
    } else if (isExplicitTenant && !isExplicitLandlord) {
      setIsTenant(true);
      setIsLandlord(false);
    } else {
      // Default citizen with no landlord designation is tenant
      setIsTenant(true);
      setIsLandlord(false);
    }

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
    {
      id: "officer-agreements-active" as NavPage,
      label: "Active Agreements",
      icon: CheckCircle2,
      href: `${officerBase}/agreements/active`,
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

  const taxOfficerNavItems: Array<{
    id: NavPage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    category?: string;
    badge?: number;
    href: string;
  }> = [
    {
      id: "tax-dashboard",
      label: "Tax Dashboard",
      icon: LayoutDashboard,
      href: "/officer/taxOfficer/dashboard",
      category: "Overview",
    },
    {
      id: "tax-landlord-ledger",
      label: "Landlord Tax Ledger",
      icon: BookOpen,
      href: "/officer/taxOfficer/dashboard/ledger",
      category: "Operational Ledgers",
    },
    {
      id: "tax-assessments",
      label: "Tax Assessments",
      icon: FileCheck2,
      href: "/officer/taxOfficer/dashboard/assessments",
      category: "Operational Ledgers",
    },
    {
      id: "tax-discrepancies",
      label: "Audit & Discrepancies",
      icon: AlertTriangle,
      badge: 642,
      href: "/officer/taxOfficer/dashboard/audit",
      category: "Audits & Compliance",
    },
    {
      id: "tax-reports",
      label: "Reports & Analytics",
      icon: BarChart3,
      href: "/officer/taxOfficer/dashboard/reports",
      category: "Reports",
    },
    {
      id: "officer-settings",
      label: "Settings",
      icon: Settings,
      href: "/officer/office/settings",
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
          ...(!isBoth
            ? [
                {
                  id: "agreements-t-active" as NavPage,
                  label: "Active Agreements",
                  icon: ShieldCheck,
                  category: "Rentals",
                  href: "/citizen/dashboard/leases/active",
                },
              ]
            : []),
        ]
      : []),
    ...(isLandlord
      ? [
          { id: "properties" as NavPage, label: "My Properties", icon: Building2, category: "Management", href: "/citizen/dashboard/properties" },
          {
            id: "agreements" as NavPage,
            label: "Rental Agreements",
            icon: FileText,
            category: "Management",
            badge: pendingAgreementsCount,
            href: "/citizen/dashboard/agreements/new",
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
    ...(isLandlord
      ? [
          { id: "tax-records" as NavPage, label: "Tax Records", icon: Landmark, category: "Finance", href: "/citizen/dashboard/tax" },
        ]
      : []),
    { id: "profile", label: "My Profile", icon: User, category: "Account", href: "/citizen/dashboard/profile" },
  ];

  const cityNavItems: Array<{
    id: NavPage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    category?: string;
    badge?: number | string;
    href: string;
  }> = [
    {
      id: "city-dashboard" as NavPage,
      label: "Executive Overview",
      icon: LayoutDashboard,
      href: "/officer/city/dashboard",
      category: "Overview",
    },
    {
      id: "city-benchmarking" as NavPage,
      label: "Sub-City Benchmarking",
      icon: BarChart3,
      href: "/officer/city/dashboard#subcities",
      category: "Municipal Intelligence",
    },
    {
      id: "city-telemetry" as NavPage,
      label: "Woreda Performance",
      icon: Building2,
      href: "/officer/city/dashboard#telemetry",
      category: "Municipal Intelligence",
    },
    {
      id: "city-revenue" as NavPage,
      label: "Revenue & Statutory",
      icon: Coins,
      href: "/officer/city/dashboard#revenue",
      category: "Compliance & Audits",
    },
    {
      id: "city-enforcement" as NavPage,
      label: "Proclamation Enforcement",
      icon: Scale,
      href: "/officer/city/dashboard#enforcement",
      category: "Compliance & Audits",
    },
    {
      id: "city-alerts" as NavPage,
      label: "Civic Alerts",
      icon: AlertTriangle,
      badge: 3,
      href: "/officer/city/dashboard#alerts",
      category: "Compliance & Audits",
    },
  ];

  const currentNavItems = isCityAdmin
    ? cityNavItems
    : isTaxOfficer
    ? taxOfficerNavItems
    : isOfficer
    ? officerNavItems
    : citizenNavItems;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/90 text-slate-900">
      {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              onNavigate(isCityAdmin ? "city-dashboard" : isTaxOfficer ? "tax-dashboard" : isOfficer ? "officer-dashboard" : "dashboard");
              onCloseMobile?.();
            }}
          >
            {isCityAdmin ? (
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#00450d] text-white flex items-center justify-center shadow-xs shrink-0">
                    <Star className="w-5 h-5 fill-current text-white" />
                  </div>
                  {!collapsed && (
                    <div className="min-w-0">
                      <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                        GRAMS Executive
                      </h1>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                        Addis Ababa Municipal Portal
                      </p>
                    </div>
                  )}
                </div>
                {!collapsed && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200/80 text-[10px] font-bold text-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Proclamation 1284/2016 Enforced</span>
                  </div>
                )}
              </div>
            ) : isTaxOfficer || isOfficer ? (
              /* Government Official Header (Unified across Woreda Officer, Supervisor & Tax Officer) */
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
                      {isTaxOfficer ? "Tax Admin" : isSupervisor ? "Woreda Supervisor" : "Woreda Admin"}
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                      {isTaxOfficer ? "Federal Tax Portal" : "Official Portal"}
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
                  {!collapsed && "badge" in item && (item as any).badge !== undefined && (
                    <span className={cn(
                      "px-2 py-0.5 text-[10px] font-bold rounded-full leading-none",
                      item.id === "city-alerts"
                        ? "bg-rose-500 text-white"
                        : isActive
                        ? "bg-[#00450d] text-white"
                        : "bg-slate-200 text-slate-700"
                    )}>
                      {item.id === "city-alerts" ? `${(item as any).badge} Active` : (item as any).badge}
                    </span>
                  )}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Executive Quick Actions for City Admin */}
      {isCityAdmin && !collapsed && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 space-y-2.5 shrink-0">
          <button
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8,SubCity,RegisteredUnits,CertifiedTitleDeeds,AvgUnitRent,FreezeCompliance\nBole,34180,22038,16450,99.4%\nKirkos,26920,11667,14200,98.9%\nYeka,23410,14260,11100,99.1%\nArada,12800,5140,9450,97.4%\nLideta,14250,4890,8760,98.2%\nNifas Silk,21500,5910,10185,98.7%\nGullele,12150,3890,7650,98.0%\nKolfe Keranio,15400,4200,7600,97.9%\nAddis Ketema,11000,1980,8200,96.1%\nAkaki Kality,10600,2280,6400,98.4%\nLemi Kura,16100,4720,9390,98.7%";
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "GRAMS_Executive_Audit_Dossier_2017.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="w-full h-9 rounded-lg bg-[#00450d] hover:bg-[#164e23] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Dossier</span>
          </button>
          <div className="space-y-0.5">
            <Link
              href="/officer/city/dashboard#settings"
              className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>System Settings</span>
            </Link>
            <Link
              href="/officer/city/dashboard#directives"
              className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Support & Legal Directives</span>
            </Link>
          </div>
          <p className="text-[9px] text-slate-400 leading-tight pt-1 border-t border-slate-200/60">
            FDRE Federal Cadastre Integration v4.0 · Encrypted State Database
          </p>
        </div>
      )}

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

  if (isLoading || !isMounted) {
    return (
      <SideNavSkeleton
        collapsed={collapsed}
        isCityAdmin={displayRole === "city_administrator" || displayRole === "city_admin"}
        isMobileOpen={isMobileOpen}
        onCloseMobile={onCloseMobile}
      />
    );
  }

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

export interface SideNavSkeletonProps {
  collapsed?: boolean;
  isCityAdmin?: boolean;
  className?: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  asFixedSidebar?: boolean;
}

export const SideNavSkeleton: React.FC<SideNavSkeletonProps> = ({
  collapsed = false,
  isCityAdmin = false,
  className,
  isMobileOpen = false,
  onCloseMobile,
  asFixedSidebar = true,
}) => {
  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/90 text-slate-900 select-none">
      {/* Brand Header Skeleton */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 w-full">
          <div className="w-9 h-9 rounded-xl bg-slate-200 animate-pulse shrink-0" />
          {!collapsed && (
            <div className="flex-1 space-y-1.5 min-w-0">
              <div className="h-4 w-28 bg-slate-200 animate-pulse rounded" />
              <div className="h-2.5 w-20 bg-slate-100 animate-pulse rounded" />
              {isCityAdmin && (
                <div className="h-5 w-36 bg-emerald-50/80 border border-emerald-100 animate-pulse rounded mt-1.5" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links Skeleton */}
      <div className="flex-1 overflow-hidden py-3 px-2.5 space-y-4">
        {/* Category 1 Skeleton */}
        <div className="space-y-1.5">
          {!collapsed && (
            <div className="pt-2 pb-1 px-3">
              <div className="h-2.5 w-16 bg-slate-100 animate-pulse rounded" />
            </div>
          )}
          {/* Active Item Skeleton */}
          <div
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border-l-4 border-[#00450d]/40 bg-[#d8edd9]/40",
              collapsed && "justify-center px-0 border-l-0"
            )}
          >
            <div className="w-4 h-4 rounded bg-[#00450d]/30 animate-pulse shrink-0" />
            {!collapsed && (
              <div className="h-3.5 w-28 bg-[#00450d]/20 animate-pulse rounded flex-1" />
            )}
          </div>

          {/* Normal Items */}
          {[1, 2].map((i) => (
            <div
              key={`skel-cat1-${i}`}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                collapsed && "justify-center px-0"
              )}
            >
              <div className="w-4 h-4 rounded bg-slate-200 animate-pulse shrink-0" />
              {!collapsed && (
                <div
                  className="h-3.5 bg-slate-200 animate-pulse rounded"
                  style={{ width: i === 1 ? "68%" : "54%" }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Category 2 Skeleton */}
        <div className="space-y-1.5 pt-2">
          {!collapsed && (
            <div className="pt-2 pb-1 px-3">
              <div className="h-2.5 w-24 bg-slate-100 animate-pulse rounded" />
            </div>
          )}
          {[1, 2, 3].map((i) => (
            <div
              key={`skel-cat2-${i}`}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                collapsed && "justify-center px-0"
              )}
            >
              <div className="w-4 h-4 rounded bg-slate-200 animate-pulse shrink-0" />
              {!collapsed && (
                <div
                  className="h-3.5 bg-slate-200 animate-pulse rounded"
                  style={{ width: i === 1 ? "75%" : i === 2 ? "60%" : "82%" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* City Admin Action Footer Skeleton */}
      {isCityAdmin && !collapsed && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/60 space-y-2 shrink-0">
          <div className="h-9 w-full bg-[#00450d]/20 animate-pulse rounded-lg" />
          <div className="space-y-1 py-1">
            <div className="h-3.5 w-24 bg-slate-200 animate-pulse rounded" />
            <div className="h-3.5 w-32 bg-slate-200 animate-pulse rounded" />
          </div>
        </div>
      )}

      {/* Logout Footer Skeleton */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 shrink-0">
        {!collapsed ? (
          <div className="h-9 w-full rounded-lg border border-slate-200 bg-slate-100 animate-pulse flex items-center justify-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-200" />
            <div className="w-12 h-3 rounded bg-slate-200" />
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-md bg-slate-200 animate-pulse" />
        )}
      </div>
    </div>
  );

  if (!asFixedSidebar) {
    return (
      <div className={cn("h-full", collapsed ? "w-[68px]" : "w-[260px]", className)}>
        {content}
      </div>
    );
  }

  return (
    <>
      <aside
        className={cn(
          "hidden md:block h-screen fixed left-0 top-0 bottom-0 z-40 transition-all duration-200",
          collapsed ? "w-[68px]" : "w-[260px]",
          className
        )}
      >
        {content}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-[260px] z-50 bg-white shadow-xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export const SideNavBarSkeleton = SideNavSkeleton;




