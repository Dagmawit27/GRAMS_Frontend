"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, getSession } from "@/lib/api";
import {
  LayoutDashboard,
  ShieldCheck,
  FileText,
  History,
  BarChart3,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Star,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface OfficerSidebarProps {
  role: "woreda_officer" | "woreda_supervisor";
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogoutClick?: () => void;
}

const OFFICER_NAV: NavItem[] = [
  { label: "Dashboard",            href: "/officer/office/dashboard",    icon: LayoutDashboard },
  { label: "Property Verifications", href: "/officer/office/properties", icon: ShieldCheck },
  { label: "Agreement Reviews",    href: "/officer/office/agreements",   icon: FileText },
  { label: "Approved History",     href: "/officer/office/history",      icon: History },
  { label: "Settings",             href: "/officer/office/settings",     icon: Settings },
];

const SUPERVISOR_NAV: NavItem[] = [
  { label: "Dashboard",            href: "/officer/supervisor/dashboard",    icon: LayoutDashboard },
  { label: "Property Approvals",   href: "/officer/supervisor/properties",   icon: ShieldCheck },
  { label: "Agreement Approvals",  href: "/officer/supervisor/agreements",   icon: FileText },
  { label: "Reports",              href: "/officer/supervisor/reports",      icon: BarChart3 },
  { label: "Settings",             href: "/officer/supervisor/settings",     icon: Settings },
];

export const OfficerSidebar: React.FC<OfficerSidebarProps> = ({ role, collapsed, onToggleCollapse, onLogoutClick }) => {
  const pathname = usePathname();
  const router = useRouter();
  const session = getSession();

  const nav = role === "woreda_supervisor" ? SUPERVISOR_NAV : OFFICER_NAV;
  const isSupervisor = role === "woreda_supervisor";

  const handleLogout = () => {
    if (onLogoutClick) {
      onLogoutClick();
    } else {
      clearSession();
      router.push("/officer");
    }
  };

  const userName = session
    ? [session.user.firstName, session.user.lastName].filter(Boolean).join(" ")
    : "Officer";

  return (
    <aside
      className={`hidden md:flex flex-col h-screen fixed left-0 top-0 bottom-0 z-40 bg-white border-r border-slate-200/90 transition-all duration-200 ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      {/* Brand */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${isSupervisor ? "bg-amber-600" : "bg-[#00450d]"}`}>
            <Star className="w-4 h-4 fill-current" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 leading-none truncate">GRAMS</p>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5 truncate">
                {isSupervisor ? "Supervisor Desk" : "Officer Desk"}
              </p>
            </div>
          )}
        </div>
        <button onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0">
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {nav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-lg transition-all ${
                isActive
                  ? "bg-[#d8edd9] text-[#00450d] font-bold border-l-4 border-[#00450d]"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#00450d]" : "text-slate-500"}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{userName}</p>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate">
                {isSupervisor ? "Woreda Supervisor" : "Woreda Officer"}
              </p>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1 text-xs font-medium text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-md transition-colors shrink-0">
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button onClick={handleLogout}
              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
