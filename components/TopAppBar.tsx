"use client";

import React, { useState } from "react";
import { Search, Bell, Moon, Sun, Menu, CheckCircle2, FileText, AlertCircle, Sparkles, Building2, User } from "lucide-react";
import { ActivityNotification, NavPage, UserRole } from "@/types";
import { cn } from "@/lib/utils";

interface TopAppBarProps {
  onOpenMobileMenu: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  notifications: ActivityNotification[];
  onNotificationClick: (notif: ActivityNotification) => void;
  onClearNotifications: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onProfileClick: () => void;
  onNavigate: (page: NavPage) => void;
  userRole?: UserRole;
  onToggleRole?: (role: UserRole) => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  onOpenMobileMenu,
  searchQuery,
  onSearchChange,
  notifications,
  onNotificationClick,
  onClearNotifications,
  isDarkMode,
  onToggleDarkMode,
  onProfileClick,
  onNavigate,
  userRole = "landlord",
  onToggleRole,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [name, setName] = useState("Dagmawit");

  return (
    <header className="bg-white sticky top-0 z-30 shadow-2xs border-b border-slate-200/90 h-16 px-4 md:px-8 flex items-center justify-between transition-colors">
      {/* Left: Mobile menu button + Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-md">
          <h1 className="sm:text-1xl font-bold text-slate-600 tracking-tight">
            Welcome back, {name}</h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3 relative">
        {/* Role Quick Toggle Pill for Testing */}
        {onToggleRole && (
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => onToggleRole("landlord")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                userRole === "landlord"
                  ? "bg-[#00450d] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Switch to Landlord role"
            >
              <Building2 className="w-3 h-3" />
              <span>Landlord</span>
            </button>
            <button
              onClick={() => onToggleRole("tenant")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                userRole === "tenant"
                  ? "bg-[#00450d] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Switch to Tenant role"
            >
              <User className="w-3 h-3" />
              <span>Tenant</span>
            </button>
          </div>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors relative"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {isNotifOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNotifOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 py-3 z-50 animate-in fade-in-50 zoom-in-95">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={onClearNotifications}
                      className="text-xs text-[#00450d] hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications at this time.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          onNotificationClick(notif);
                          setIsNotifOpen(false);
                          if (notif.linkPage) onNavigate(notif.linkPage);
                        }}
                        className={cn(
                          "p-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3",
                          !notif.read && "bg-slate-50/60"
                        )}
                      >
                        <div className="mt-0.5 shrink-0">
                          {notif.type === "payment" && (
                            <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {notif.type === "agreement" && (
                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {notif.type === "maintenance" && (
                            <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                              <AlertCircle className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {notif.type === "system" && (
                            <div className="w-6 h-6 rounded-full bg-slate-100 text-[#00450d] flex items-center justify-center">
                              <Sparkles className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                            {notif.description}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {notif.timestamp}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Profile Badge */}
        <div
          onClick={onProfileClick}
          className="flex items-center gap-2.5 pl-2.5 md:pl-4 border-l border-slate-200 cursor-pointer group select-none"
        >
          <div className="text-right hidden sm:block">
            <span className="text-xs font-semibold text-slate-900 group-hover:text-[#00450d] block leading-tight">
              Dagmawit Mesfin
            </span>
            <span className="text-[10px] text-slate-400 block">Citizen Account</span>
          </div>
          <div className="relative">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOeGxWiEl2NeKDuJV16b8MGWdq1uN--G_FLPzSrdoJLC5VPsEwf_UhVCtt6qeecVysb57w5n6kvUYdE4n8hL_RHukdIM8E8aI39k6ODc74SpAm4BJOZanJy-4qNGJ6cZjX3dotzJEwv-uYJ6VzGv-H1k_JS3TR8W2YujNBsMi1W6HFeDVP8NzopWHOfi_FUDcNA5TqKqXOSAEid3CvgiOAcESPWIFcTF_kbnrbXgnhIH1-Z7h5oTKMaQ"
              alt="Dagmawit Mesfin"
              className="w-8 h-8 rounded-full object-cover shadow-2xs border border-slate-200 group-hover:border-slate-400 transition-all"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const next = e.currentTarget.nextElementSibling;
                if (next) (next as HTMLElement).style.display = 'flex';
              }}
            />
            <div className="hidden w-8 h-8 rounded-full bg-slate-900 text-white font-semibold text-xs items-center justify-center">
              DM
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-600 border-2 border-white rounded-full" />
          </div>
        </div>
      </div>
    </header>
  );
};

