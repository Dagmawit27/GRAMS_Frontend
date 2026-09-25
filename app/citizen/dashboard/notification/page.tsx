"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Shield,
  Clock,
  Search,
  Calendar,
  CheckCheck,
  SlidersHorizontal,
  MoreVertical,
  ArrowRight,
  Download,
  ExternalLink,
  MessageSquare,
  Mail,
  Monitor,
  Zap,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Building,
  Scale,
  Bell,
  X,
  FileCheck2,
  FileClock,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getSession,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getMyAgreements,
  getMyProperties,
  NotificationResponse,
  AgreementResponse,
} from "@/lib/api";
import { sseManager, NotificationData } from "@/lib/sseManager";

export interface DisplayNotification {
  id: string;
  category: "action" | "verifications" | "agreements" | "tax" | "system";
  badgeText: string;
  title: string;
  description: string;
  refId: string;
  counterparty?: string;
  timestamp: string;
  createdAt: Date;
  read: boolean;
  priority: "High" | "Normal";
  actionType?: "review-property" | "view-agreement" | "pay-rent" | "view-receipt" | "profile";
  actionUrl?: string;
  actionLabel?: string;
  metaLabel?: string;
  metaValue?: string;
}

export default function NotificationPage() {
  const router = useRouter();

  // Loading & Session States
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userName, setUserName] = useState("");

  // Notifications State
  const [notifications, setNotifications] = useState<DisplayNotification[]>([]);

  // Filter States
  const [activeFilterTab, setActiveFilterTab] = useState<
    "all" | "unread" | "action" | "verifications" | "agreements" | "tax"
  >("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"All" | "High" | "Normal">("All");
  const [dateRangeFilter, setDateRangeFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Auditing rules checkboxes state (persisted to localStorage)
  const [auditRules, setAuditRules] = useState({
    smsCadastral: true,
    escalation24h: true,
    stampDutyAlert: true,
  });

  // Action alerts / feedback banners
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  // Load audit rules from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("grams_audit_rules");
      if (saved) {
        setAuditRules(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleAuditRuleToggle = (key: keyof typeof auditRules, value: boolean) => {
    const updated = { ...auditRules, [key]: value };
    setAuditRules(updated);
    try {
      localStorage.setItem("grams_audit_rules", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Helper to format relative time
  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Yesterday at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  };

  // Fetch real notifications and context from backend
  const loadRealData = async () => {
    const session = getSession();
    if (!session?.token) {
      setLoading(false);
      return;
    }

    setUserEmail(session.user.email || "");
    setUserPhone(session.user.phoneNumber || "+251 91 123 4567");
    setUserName(`${session.user.firstName || ""} ${session.user.lastName || ""}`.trim() || "Citizen Payer");

    try {
      setLoading(true);
      const items: DisplayNotification[] = [];

      // 1. Fetch real notifications from backend notification module
      try {
        const notifData = await getNotifications(session.token, 0, 100);
        if (notifData?.content && Array.isArray(notifData.content)) {
          notifData.content.forEach((n: NotificationResponse) => {
            const createdAt = n.createdAt ? new Date(n.createdAt) : new Date();
            let cat: DisplayNotification["category"] = "system";
            let badge = "[General Notice]";
            let priority: "High" | "Normal" = "Normal";
            let actionType: DisplayNotification["actionType"] = undefined;
            let actionUrl: string | undefined = undefined;
            let actionLabel: string | undefined = undefined;

            const typeStr = (n.type || "").toUpperCase();
            let title = n.type ? n.type.replace(/_/g, " ") : "Municipal Notice";

            if (typeStr.includes("LEASE") || typeStr.includes("AGREEMENT")) {
              cat = "agreements";
              badge = "[Agreement Sign-Off]";
              actionType = "view-agreement";
              actionUrl = `/citizen/dashboard/agreements/active/${n.entityId || ""}`;
              actionLabel = "View Agreement";
              if (typeStr.includes("SIGNED") || typeStr.includes("PENDING")) {
                priority = "High";
              }
            } else if (typeStr.includes("PROPERTY")) {
              cat = "verifications";
              badge = "[Property Verification]";
              actionType = "review-property";
              actionUrl = "/citizen/dashboard/properties";
              actionLabel = "View Property";
              if (typeStr.includes("REJECTED") || typeStr.includes("ACTION")) {
                priority = "High";
                cat = "action";
              }
            } else if (typeStr.includes("TAX_CLEARANCE")) {
              cat = "tax";
              badge = "[Tax Clearance Certificate]";
              title = "Tax Clearance Issued (Schedule B)";
              actionUrl = "/citizen/dashboard/tax";
              actionLabel = "View Clearance";
              priority = "Normal";
            } else if (typeStr.includes("ANNUAL_RENTAL_TAX") || typeStr.includes("TAX_DUE")) {
              cat = "tax";
              badge = "[Schedule B Tax Due]";
              title = "Annual Rental Income Tax Filing Due";
              actionUrl = "/citizen/dashboard/tax";
              actionLabel = "Settle Annual Tax";
              priority = "High";
            } else if (typeStr.includes("RENT_PAYMENT_RECEIVED")) {
              cat = "tax";
              badge = "[Rent Payment Received]";
              title = "Advance Rent Payment Received";
              actionType = "pay-rent";
              actionUrl = "/citizen/dashboard/payments";
              actionLabel = "View Payment";
              priority = "Normal";
            } else if (typeStr.includes("RENT_PAYMENT_SETTLED")) {
              cat = "tax";
              badge = "[Rent Payment Settled]";
              title = "Advance Rent Payment Settled";
              actionType = "pay-rent";
              actionUrl = "/citizen/dashboard/payments";
              actionLabel = "View Receipt";
              priority = "Normal";
            } else if (typeStr.includes("TAX")) {
              cat = "tax";
              badge = "[Tax Clearance]";
              actionUrl = "/citizen/dashboard/tax";
              actionLabel = "Tax Statement";
            } else if (typeStr.includes("PAYMENT") || typeStr.includes("RENT")) {
              cat = "tax";
              badge = "[Payment Clearance]";
              actionType = "pay-rent";
              actionUrl = `/citizen/dashboard/payments`;
              actionLabel = "View Payment";
              if (typeStr.includes("PENDING") || typeStr.includes("REQUIRED")) {
                priority = "High";
                cat = "action";
              }
            }

            items.push({
              id: n.id,
              category: cat,
              badgeText: badge,
              title: title,
              description: n.message || "Notification dispatch from Addis Ababa Rental Administration.",
              refId: n.entityId || `NOTIF-${n.id.substring(0, 8)}`,
              timestamp: getRelativeTime(createdAt),
              createdAt,
              read: n.read,
              priority,
              actionType,
              actionUrl,
              actionLabel,
              metaLabel: "Module",
              metaValue: n.module || "GRAMS",
            });
          });
        }
      } catch (err) {
        console.warn("Could not load backend notifications table:", err);
      }

      // 2. Fetch live agreements and properties to populate contextual notifications
      const [agreementsRes, propertiesRes] = await Promise.allSettled([
        getMyAgreements(session.token),
        getMyProperties(session.token),
      ]);

      // If active agreements exist in DB, derive real notices
      if (agreementsRes.status === "fulfilled" && Array.isArray(agreementsRes.value)) {
        agreementsRes.value.forEach((agr: AgreementResponse, index: number) => {
          const agrCode = agr.agreementNumber || agr.requestCode || `AGR-${index}`;
          const isSigned = agr.landlordSigned && agr.tenantSigned;
          const isVerified = agr.officerVerified;
          const isApproved = agr.supervisorApproved;

          const baseDate = agr.contractDate ? new Date(agr.contractDate) : new Date(Date.now() - index * 86400000 * 2);

          if (isApproved) {
            items.push({
              id: `ctx-agr-appr-${agrCode}`,
              category: "agreements",
              badgeText: "[Agreement Enforced]",
              title: `Statutory Lease Agreement Endorsed & Registered #${agrCode}`,
              description: `Zonal Supervisor has officially approved residential lease contract #${agrCode} for ${agr.propertyTitle || "Property"}. Municipal seal applied and verified with Land Management registry.`,
              refId: agrCode,
              counterparty: agr.landlordName || agr.tenantName || "Counterparty",
              timestamp: getRelativeTime(baseDate),
              createdAt: baseDate,
              read: index > 0,
              priority: "Normal",
              actionType: "view-agreement",
              actionUrl: `/citizen/dashboard/agreements/active/${agrCode}`,
              actionLabel: "View Agreement",
              metaLabel: "Monthly Rent",
              metaValue: agr.monthlyRent ? `${agr.monthlyRent.toLocaleString()} ETB` : "Under Contract",
            });
          } else if (isVerified) {
            items.push({
              id: `ctx-agr-ver-${agrCode}`,
              category: "verifications",
              badgeText: "[Officer Verification]",
              title: `Woreda Officer Verified Lease Application #${agrCode}`,
              description: `Officer verification and biometric validation completed for lease agreement #${agrCode}. Queue forwarded for final Supervisor registration endorsement.`,
              refId: agrCode,
              counterparty: agr.landlordName || agr.tenantName,
              timestamp: getRelativeTime(baseDate),
              createdAt: baseDate,
              read: false,
              priority: "High",
              actionType: "view-agreement",
              actionUrl: `/citizen/dashboard/agreements/active/${agrCode}`,
              actionLabel: "Track Approval",
              metaLabel: "Registration Desk",
              metaValue: "Woreda Municipal Desk",
            });
          } else if (isSigned) {
            items.push({
              id: `ctx-agr-sgn-${agrCode}`,
              category: "action",
              badgeText: "[Biometric Signature]",
              title: `Digital Signatures Executed on Lease #${agrCode}`,
              description: `Both lessor and lessee have completed Fayda cryptographic signatures for contract #${agrCode}. Awaiting Woreda officer review and stamp duty assessment.`,
              refId: agrCode,
              counterparty: agr.landlordName || agr.tenantName,
              timestamp: getRelativeTime(baseDate),
              createdAt: baseDate,
              read: false,
              priority: "High",
              actionType: "view-agreement",
              actionUrl: `/citizen/dashboard/agreements/active/${agrCode}`,
              actionLabel: "Inspect Contract",
              metaLabel: "Status",
              metaValue: "Under Verification",
            });
          }
        });
      }

      // If registered properties exist in DB, derive real notices
      if (propertiesRes.status === "fulfilled" && Array.isArray(propertiesRes.value)) {
        propertiesRes.value.forEach((prop: any, index: number) => {
          const propCode = prop.propertyCode || `PROP-${prop.id?.substring(0, 8) || index}`;
          const isVerified = prop.status === "VERIFIED" || prop.status === "LISTED";
          const propDate = prop.createdAt ? new Date(prop.createdAt) : new Date(Date.now() - (index + 1) * 86400000 * 3);

          if (isVerified) {
            items.push({
              id: `ctx-prop-ver-${propCode}`,
              category: "verifications",
              badgeText: "[Cadastral Clearance]",
              title: `Cadastral Registry Clearance Approved: ${prop.title || propCode}`,
              description: `Municipal Land Bureau completed cadastral cross-check and GIS parcel validation for unit ${propCode} located in ${prop.subCity || "Addis Ababa"}, Woreda ${prop.woreda || "01"}.`,
              refId: propCode,
              counterparty: session.user.firstName + " " + session.user.lastName,
              timestamp: getRelativeTime(propDate),
              createdAt: propDate,
              read: true,
              priority: "Normal",
              actionType: "review-property",
              actionUrl: `/citizen/dashboard/properties`,
              actionLabel: "View Cadastral Record",
              metaLabel: "Cadastral Status",
              metaValue: "Verified & Endorsed",
            });
          } else {
            items.push({
              id: `ctx-prop-pend-${propCode}`,
              category: "action",
              badgeText: "[Property Review]",
              title: `Title Deed Assessment In Progress: ${prop.title || propCode}`,
              description: `Ownership documents and property dossier submitted for ${propCode}. Municipal desk verification scheduled within 48-hour statutory SLA.`,
              refId: propCode,
              timestamp: getRelativeTime(propDate),
              createdAt: propDate,
              read: false,
              priority: "High",
              actionType: "review-property",
              actionUrl: `/citizen/dashboard/properties`,
              actionLabel: "Review Submission",
              metaLabel: "SLA Window",
              metaValue: "48-Hour Guarantee",
            });
          }
        });
      }

      // 3. Add Statutory City Proclamation Notice
      items.push({
        id: "statutory-notice-sla-2026",
        category: "system",
        badgeText: "[Statutory Directive]",
        title: "Addis Ababa City Administration Notice #DIR-2026/09",
        description: "Implementation of revised 48-Hour statutory SLA processing standards for rental agreements and residential property titles across all sub-city branches takes full effect.",
        refId: "DIR-2026/09",
        counterparty: "Addis Ababa Land Management Bureau",
        timestamp: "3 days ago",
        createdAt: new Date(Date.now() - 86400000 * 3),
        read: true,
        priority: "Normal",
        metaLabel: "Authority",
        metaValue: "Bureau of Land Management",
      });

      // Sort newest first
      items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Deduplicate by id
      const uniqueMap = new Map<string, DisplayNotification>();
      items.forEach((it) => {
        if (!uniqueMap.has(it.id)) {
          uniqueMap.set(it.id, it);
        }
      });

      setNotifications(Array.from(uniqueMap.values()));
    } catch (err) {
      console.error("Failed to load notifications page data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealData();

    // Subscribe to SSE updates for real-time notifications
    const session = getSession();
    if (session?.user?.email) {
      const unsub = sseManager.onNotification((event: NotificationData) => {
        setActionAlert(`New notification received: ${event.type || "Update"}`);
        setTimeout(() => setActionAlert(null), 4000);
        loadRealData();
      });
      return () => {
        unsub();
      };
    }
  }, []);

  // Filtered Notifications Computation
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Category Tab Filter
      if (activeFilterTab === "unread" && n.read) return false;
      if (activeFilterTab === "action" && n.category !== "action" && n.priority !== "High") return false;
      if (activeFilterTab === "verifications" && n.category !== "verifications") return false;
      if (activeFilterTab === "agreements" && n.category !== "agreements") return false;
      if (activeFilterTab === "tax" && n.category !== "tax") return false;

      // Priority Filter
      if (priorityFilter !== "All" && n.priority !== priorityFilter) return false;

      // Date Filter
      if (dateRangeFilter === "today") {
        const today = new Date();
        if (
          n.createdAt.getDate() !== today.getDate() ||
          n.createdAt.getMonth() !== today.getMonth() ||
          n.createdAt.getFullYear() !== today.getFullYear()
        ) {
          return false;
        }
      } else if (dateRangeFilter === "week") {
        const weekAgo = new Date(Date.now() - 7 * 86400000);
        if (n.createdAt < weekAgo) return false;
      } else if (dateRangeFilter === "month") {
        const monthAgo = new Date(Date.now() - 30 * 86400000);
        if (n.createdAt < monthAgo) return false;
      }

      // Keyword Search
      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(q);
        const matchesDesc = n.description.toLowerCase().includes(q);
        const matchesRef = n.refId.toLowerCase().includes(q);
        const matchesCounterparty = n.counterparty?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesRef && !matchesCounterparty) {
          return false;
        }
      }

      return true;
    });
  }, [notifications, activeFilterTab, priorityFilter, dateRangeFilter, searchKeyword]);

  // Group filtered notifications by period (Today, Yesterday, Earlier)
  const groupedNotifications = useMemo(() => {
    const today: DisplayNotification[] = [];
    const yesterday: DisplayNotification[] = [];
    const earlier: DisplayNotification[] = [];

    const now = new Date();
    const todayDate = now.getDate();
    const todayMonth = now.getMonth();
    const todayYear = now.getFullYear();

    const yesterdayObj = new Date(Date.now() - 86400000);
    const yestDate = yesterdayObj.getDate();
    const yestMonth = yesterdayObj.getMonth();
    const yestYear = yesterdayObj.getFullYear();

    filteredNotifications.forEach((n) => {
      const d = n.createdAt;
      if (d.getDate() === todayDate && d.getMonth() === todayMonth && d.getFullYear() === todayYear) {
        today.push(n);
      } else if (d.getDate() === yestDate && d.getMonth() === yestMonth && d.getFullYear() === yestYear) {
        yesterday.push(n);
      } else {
        earlier.push(n);
      }
    });

    return { today, yesterday, earlier };
  }, [filteredNotifications]);

  // Counts for Metric Cards & Category Pills
  const totalCount = notifications.length;
  const unreadCount = notifications.filter((n) => !n.read).length;
  const actionCount = notifications.filter((n) => n.category === "action" || (n.priority === "High" && !n.read)).length;
  const verificationsCount = notifications.filter((n) => n.category === "verifications").length;
  const agreementsCount = notifications.filter((n) => n.category === "agreements").length;
  const taxCount = notifications.filter((n) => n.category === "tax" || n.category === "system").length;

  // Urgent Actions for the Right Sidebar Widget
  const urgentActions = useMemo(() => {
    return notifications
      .filter((n) => !n.read && (n.priority === "High" || n.category === "action"))
      .slice(0, 3);
  }, [notifications]);

  // Mark all notifications as read
  const markAllAsRead = async () => {
    const session = getSession();
    if (session?.token) {
      try {
        await markAllNotificationsAsRead(session.token);
      } catch (err) {
        console.error("Backend mark-all failed:", err);
      }
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setActionAlert("All notifications marked as read.");
    setTimeout(() => setActionAlert(null), 3000);
  };

  // Mark group as read
  const markGroupAsRead = async (groupList: DisplayNotification[]) => {
    const session = getSession();
    const ids = groupList.map((g) => g.id);
    if (session?.token) {
      ids.forEach((id) => {
        if (!id.startsWith("ctx-") && !id.startsWith("statutory-")) {
          markNotificationAsRead(session.token, id).catch(() => {});
        }
      });
    }
    setNotifications((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n))
    );
    setActionAlert("Group notifications marked as read.");
    setTimeout(() => setActionAlert(null), 3000);
  };

  // Dismiss / Mark individual notification as read
  const dismissNotification = async (id: string) => {
    const session = getSession();
    if (session?.token && !id.startsWith("ctx-") && !id.startsWith("statutory-")) {
      try {
        await markNotificationAsRead(session.token, id);
      } catch (err) {
        console.error("Backend mark read failed:", err);
      }
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setActionAlert("Notification dismissed.");
    setTimeout(() => setActionAlert(null), 2500);
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / itemsPerPage));
  const paginatedItems = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-5 pb-12 font-sans antialiased text-slate-800 text-[13px]">
      {/* --------------------------------------------------------------------- */}
      {/* 1. BREADCRUMBS                                                        */}
      {/* --------------------------------------------------------------------- */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/citizen/dashboard"
            className="inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-[#00450d] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>DASHBOARD</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-mono font-bold text-slate-800 uppercase">
            NOTIFICATIONS & ALERT CENTER
          </span>
        </div>

        <button
          onClick={loadRealData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#00450d] transition-colors p-1.5"
          title="Refresh Notifications"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#00450d]" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. TITLE ROW & TOP ACTIONS                                            */}
      {/* --------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-0.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Notifications & Alerts
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>
              {totalCount} Total • {unreadCount} Unread
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              unreadCount === 0
                ? "text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Mark All as Read</span>
          </button>

          <Link
            href="/citizen/dashboard/profile"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
            <span>Notification Settings</span>
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDateDropdownOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00450d] hover:bg-[#06380c] text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-white" />
              <span>
                {dateRangeFilter === "all"
                  ? "All Time"
                  : dateRangeFilter === "today"
                  ? "Today"
                  : dateRangeFilter === "week"
                  ? "Past 7 Days"
                  : "Past 30 Days"}
              </span>
              <ChevronDown className="w-3 h-3 text-white/80" />
            </button>

            {isDateDropdownOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setDateRangeFilter("all");
                    setIsDateDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${
                    dateRangeFilter === "all" ? "font-bold text-[#00450d]" : "text-slate-700"
                  }`}
                >
                  All Time
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDateRangeFilter("today");
                    setIsDateDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${
                    dateRangeFilter === "today" ? "font-bold text-[#00450d]" : "text-slate-700"
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDateRangeFilter("week");
                    setIsDateDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${
                    dateRangeFilter === "week" ? "font-bold text-[#00450d]" : "text-slate-700"
                  }`}
                >
                  Past 7 Days
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDateRangeFilter("month");
                    setIsDateDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${
                    dateRangeFilter === "month" ? "font-bold text-[#00450d]" : "text-slate-700"
                  }`}
                >
                  Past 30 Days
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {actionAlert && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{actionAlert}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionAlert(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 3. FOUR METRIC / CATEGORY CARDS                                       */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Critical & Attention */}
        <div
          onClick={() => setActiveFilterTab(activeFilterTab === "action" ? "all" : "action")}
          className={`bg-white border rounded-xl p-4 shadow-2xs transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
            activeFilterTab === "action" ? "border-red-400 ring-2 ring-red-100" : "border-slate-200 hover:border-red-300"
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Critical & Attention
              </span>
              <h4 className="text-xs font-extrabold text-slate-800 mt-0.5">
                Unread Alerts
              </h4>
            </div>
            <div className="w-7 h-7 rounded bg-red-50 text-red-600 border border-red-200 flex items-center justify-center font-bold text-xs shrink-0">
              !
            </div>
          </div>

          <div className="flex items-end justify-between pt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-red-600 font-mono leading-none">
                {unreadCount}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                pending action
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">
              Action Req.
            </span>
          </div>
        </div>

        {/* Card 2: Cadastral & Land Registry */}
        <div
          onClick={() => setActiveFilterTab(activeFilterTab === "verifications" ? "all" : "verifications")}
          className={`bg-white border rounded-xl p-4 shadow-2xs transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
            activeFilterTab === "verifications" ? "border-emerald-500 ring-2 ring-emerald-100" : "border-slate-200 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Cadastral & Land Registry
              </span>
              <h4 className="text-xs font-extrabold text-slate-800 mt-0.5">
                Property Verifications
              </h4>
            </div>
            <div className="w-7 h-7 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
            </div>
          </div>

          <div className="flex items-end justify-between pt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 font-mono leading-none">
                {verificationsCount}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                records active
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Verified
            </span>
          </div>
        </div>

        {/* Card 3: Leases & Stamp Duty */}
        <div
          onClick={() => setActiveFilterTab(activeFilterTab === "agreements" ? "all" : "agreements")}
          className={`bg-white border rounded-xl p-4 shadow-2xs transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
            activeFilterTab === "agreements" ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Leases & Stamp Duty
              </span>
              <h4 className="text-xs font-extrabold text-slate-800 mt-0.5">
                Agreement Notices
              </h4>
            </div>
            <div className="w-7 h-7 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
            </div>
          </div>

          <div className="flex items-end justify-between pt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 font-mono leading-none">
                {agreementsCount}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                contract updates
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
              Contract Flow
            </span>
          </div>
        </div>

        {/* Card 4: Directives & Audit Logs */}
        <div
          onClick={() => setActiveFilterTab(activeFilterTab === "tax" ? "all" : "tax")}
          className={`bg-white border rounded-xl p-4 shadow-2xs transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
            activeFilterTab === "tax" ? "border-emerald-500 ring-2 ring-emerald-100" : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Directives & Audit Logs
              </span>
              <h4 className="text-xs font-extrabold text-slate-800 mt-0.5">
                System & Statutory
              </h4>
            </div>
            <div className="w-7 h-7 rounded bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4 text-slate-600" />
            </div>
          </div>

          <div className="flex items-end justify-between pt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 font-mono leading-none">
                {taxCount}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                advisories & logs
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
              Compliance
            </span>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 4. SEARCH & FILTER CONTROLS BAR                                       */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search notifications by keyword, reference ID (PROP-..., AGR-..., DIR-...)"
              className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => setSearchKeyword("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Priority Selector */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsPriorityDropdownOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Priority: {priorityFilter}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isPriorityDropdownOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20 text-xs">
                {(["All", "High", "Normal"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setPriorityFilter(p);
                      setIsPriorityDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${
                      priorityFilter === p ? "font-bold text-[#00450d]" : "text-slate-700"
                    }`}
                  >
                    {p} Priority
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear Filters */}
          <button
            type="button"
            onClick={() => {
              setSearchKeyword("");
              setPriorityFilter("All");
              setDateRangeFilter("all");
              setActiveFilterTab("all");
              setCurrentPage(1);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors whitespace-nowrap"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>

        {/* Filter Category Tabs (Pills) */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5 select-none scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setActiveFilterTab("all");
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeFilterTab === "all"
                ? "bg-[#00450d] text-white shadow-2xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Notifications <span className="ml-1 opacity-90 font-mono">{totalCount}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveFilterTab("unread");
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeFilterTab === "unread"
                ? "bg-[#00450d] text-white shadow-2xs"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span>Unread</span>
            <span className="ml-0.5 font-mono">{unreadCount}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveFilterTab("action");
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeFilterTab === "action"
                ? "bg-[#00450d] text-white shadow-2xs"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            Action Required <span className="ml-1 font-mono">{actionCount}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveFilterTab("verifications");
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeFilterTab === "verifications"
                ? "bg-[#00450d] text-white shadow-2xs"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            Verifications <span className="ml-1 font-mono">{verificationsCount}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveFilterTab("agreements");
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeFilterTab === "agreements"
                ? "bg-[#00450d] text-white shadow-2xs"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            Agreements <span className="ml-1 font-mono">{agreementsCount}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveFilterTab("tax");
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeFilterTab === "tax"
                ? "bg-[#00450d] text-white shadow-2xs"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            Financial & Tax <span className="ml-1 font-mono">{taxCount}</span>
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 5. MAIN 2-COLUMN FEED & SIDE PANELS                                   */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* =================================================================== */}
        {/* LEFT COLUMN: 8 COLS (NOTIFICATIONS TIMELINE FEED)                  */}
        {/* =================================================================== */}
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((k) => (
                <div key={k} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-start gap-4">
                  <Skeleton className="w-10 h-10 rounded-xl shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-3.5 w-full max-w-lg" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-2xs space-y-3">
              <Bell className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Notifications Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No notifications match your current filter criteria. You are completely caught up!
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchKeyword("");
                  setActiveFilterTab("all");
                  setDateRangeFilter("all");
                  setPriorityFilter("All");
                }}
                className="px-3.5 py-1.5 bg-[#00450d] text-white text-xs font-bold rounded-lg hover:bg-[#06380c] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {/* GROUP 1: TODAY */}
              {groupedNotifications.today.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black tracking-wider uppercase text-slate-900">
                        Today
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
                        {groupedNotifications.today.length} items
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => markGroupAsRead(groupedNotifications.today)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      Mark group as read
                    </button>
                  </div>

                  {groupedNotifications.today.map((item) => renderNotificationCard(item))}
                </div>
              )}

              {/* GROUP 2: YESTERDAY */}
              {groupedNotifications.yesterday.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black tracking-wider uppercase text-slate-900">
                        Yesterday
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold font-mono">
                        {groupedNotifications.yesterday.length} items
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => markGroupAsRead(groupedNotifications.yesterday)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      Mark group as read
                    </button>
                  </div>

                  {groupedNotifications.yesterday.map((item) => renderNotificationCard(item))}
                </div>
              )}

              {/* GROUP 3: EARLIER */}
              {groupedNotifications.earlier.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black tracking-wider uppercase text-slate-900">
                        Earlier This Week & Prior
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold font-mono">
                        {groupedNotifications.earlier.length} items
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => markGroupAsRead(groupedNotifications.earlier)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      Mark group as read
                    </button>
                  </div>

                  {groupedNotifications.earlier.map((item) => renderNotificationCard(item))}
                </div>
              )}

              {/* BOTTOM PAGINATION CONTROLS */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs text-slate-500">
                <span>
                  Showing {filteredNotifications.length} notifications total
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ${
                      currentPage === 1
                        ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-bold"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="font-mono text-slate-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={currentPage >= totalPages}
                    className={`px-3 py-1.5 border rounded-lg text-xs transition-colors ${
                      currentPage >= totalPages
                        ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-bold"
                    }`}
                  >
                    Next Page
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: 4 COLS (URGENT CENTER, SLA MANDATE, DISPATCH, STAMP) */}
        {/* =================================================================== */}
        <div className="lg:col-span-4 space-y-4">
          {/* ----------------------------------------------------------------- */}
          {/* 1. URGENT ACTION CENTER                                           */}
          {/* ----------------------------------------------------------------- */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-red-500 fill-red-500" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Urgent Action Center
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">
                {urgentActions.length} Pending
              </span>
            </div>

            {urgentActions.length === 0 ? (
              <div className="py-4 text-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-800">All Urgent Actions Cleared</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  No statutory deadlines or signature requests pending your input.
                </p>
              </div>
            ) : (
              urgentActions.map((action, idx) => (
                <div
                  key={action.id}
                  className={`space-y-1.5 ${
                    idx < urgentActions.length - 1 ? "pb-2.5 border-b border-slate-100" : ""
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-900 truncate max-w-[170px]">
                      {action.refId}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-600 font-bold text-[10px] shrink-0">
                      Action Req.
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                    {action.title}
                  </p>
                  {action.actionUrl && (
                    <button
                      type="button"
                      onClick={() => router.push(action.actionUrl!)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00450d] hover:underline pt-0.5"
                    >
                      <span>{action.actionLabel || "Open Action"}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* 2. 48-HOUR STATUTORY SLA MANDATE                                  */}
          {/* ----------------------------------------------------------------- */}
          <div className="bg-[#00450d] text-white rounded-xl p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-emerald-800/80 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-4 h-4 text-emerald-200" />
              </div>
              <h4 className="text-xs font-bold tracking-tight text-emerald-50">
                48-Hour Statutory SLA Mandate
              </h4>
            </div>

            <p className="text-[11px] text-emerald-100/90 leading-relaxed">
              Under Addis Ababa Municipal Directive #WMR-2026, all citizen property verifications and rental notifications must receive municipal adjudication within 48 business hours of filing.
            </p>

            <div className="flex items-center gap-1.5 pt-1 text-[11px] text-emerald-200 font-semibold border-t border-emerald-800/80">
              <Clock className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>Current Compliance Rate: <strong>98.4%</strong></span>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* 3. CITIZEN DISPATCH CHANNELS                                      */}
          {/* ----------------------------------------------------------------- */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-900 tracking-tight">
                Citizen Dispatch Channels
              </h3>
              <Link
                href="/citizen/dashboard/profile"
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
              >
                Configure
              </Link>
            </div>

            {/* Channels List */}
            <div className="space-y-2 text-xs">
              {/* Channel 1: SMS Urgent Dispatch */}
              <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2 min-w-0">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <div className="truncate">
                    <span className="block text-[11px] font-bold text-slate-800 leading-tight truncate">
                      SMS Urgent Dispatch
                    </span>
                    <span className="block text-[10px] text-slate-500 font-mono">
                      {userPhone || "+251 92 884 1920"}
                    </span>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold shrink-0">
                  Active
                </span>
              </div>

              {/* Channel 2: GovMail Daily Digest */}
              <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <div className="truncate">
                    <span className="block text-[11px] font-bold text-slate-800 leading-tight truncate">
                      Email Dispatch
                    </span>
                    <span className="block text-[10px] text-slate-500 truncate">
                      {userEmail || "citizen@ethiorental.gov.et"}
                    </span>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold shrink-0">
                  Active
                </span>
              </div>

              {/* Channel 3: Desktop Browser Push */}
              <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2 min-w-0">
                  <Monitor className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <div className="truncate">
                    <span className="block text-[11px] font-bold text-slate-800 leading-tight truncate">
                      Desktop Browser Push
                    </span>
                    <span className="block text-[10px] text-slate-500 truncate">
                      SSE Live Channel
                    </span>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold shrink-0">
                  Active
                </span>
              </div>
            </div>

            {/* Auditing Rules */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="block text-[10px] font-black text-slate-500 tracking-wider uppercase">
                Notification Rules
              </span>

              <div className="space-y-1.5 text-xs text-slate-700">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[11px]">Immediate SMS on Cadastral Update</span>
                  <input
                    type="checkbox"
                    checked={auditRules.smsCadastral}
                    onChange={(e) => handleAuditRuleToggle("smsCadastral", e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-emerald-700 focus:ring-0 cursor-pointer accent-[#00450d]"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[11px]">Escalation notice after 24 hrs</span>
                  <input
                    type="checkbox"
                    checked={auditRules.escalation24h}
                    onChange={(e) => handleAuditRuleToggle("escalation24h", e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-emerald-700 focus:ring-0 cursor-pointer accent-[#00450d]"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[11px]">Advance rent settlement alerts</span>
                  <input
                    type="checkbox"
                    checked={auditRules.stampDutyAlert}
                    onChange={(e) => handleAuditRuleToggle("stampDutyAlert", e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-emerald-700 focus:ring-0 cursor-pointer accent-[#00450d]"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* 4. OFFICIAL ADMINISTRATIVE GATEWAY                                */}
          {/* ----------------------------------------------------------------- */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 block text-[11px]">
                Official GRAMS Administrative Gateway
              </strong>
              <span className="text-[10px] text-slate-500">
                Cryptographically signed notifications compliant with Proclamation No. 1205/2020.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper to render individual notification card
  function renderNotificationCard(item: DisplayNotification) {
    const isUnread = !item.read;
    const isAction = item.category === "action" || item.priority === "High";

    return (
      <div
        key={item.id}
        className={`bg-white border rounded-xl p-4 shadow-2xs space-y-3 transition-colors ${
          isAction && isUnread
            ? "border-l-4 border-l-red-600 border-slate-200"
            : isUnread
            ? "border-l-4 border-l-[#00450d] border-slate-200"
            : "border-slate-200"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                isAction
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : item.category === "verifications"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : item.category === "agreements"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : item.category === "tax"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              {isAction ? (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              ) : item.category === "verifications" ? (
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
              ) : item.category === "agreements" ? (
                <FileCheck2 className="w-4 h-4 text-blue-600" />
              ) : item.category === "tax" ? (
                <Building className="w-4 h-4 text-emerald-700" />
              ) : (
                <Shield className="w-4 h-4 text-slate-600" />
              )}
            </div>

            {/* Title & Badge */}
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-extrabold tracking-wider uppercase ${
                    isAction
                      ? "text-red-700"
                      : item.category === "verifications"
                      ? "text-emerald-700"
                      : item.category === "agreements"
                      ? "text-blue-700"
                      : "text-slate-600"
                  }`}
                >
                  {item.badgeText}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  {item.title}
                </h3>
                {isUnread && (
                  <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                )}
              </div>
            </div>
          </div>

          <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
            {item.timestamp}
          </span>
        </div>

        <div className="text-xs text-slate-600 leading-relaxed pl-11 whitespace-pre-line space-y-2">
          <p>{item.description}</p>
          {(item.description.includes("በኢትዮጵያ ሕግ") || item.description.includes("Schedule B")) && (
            <div className="p-2.5 bg-emerald-50/90 border border-emerald-200/80 rounded-lg text-emerald-950 text-[11px] leading-relaxed flex items-start gap-2.5 mt-2">
              <Scale className="w-4 h-4 text-[#00450d] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#00450d] block">
                  Ministry of Revenues Schedule B Rental Law Notice
                </span>
                <span className="text-slate-700">
                  Tax is progressively calculated (0%–35%) and recorded monthly. Settlement is conducted during the Ethiopian Summer filing window (Hamle 1 – Nehase 30).
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 pl-11 border-t border-slate-100">
          <div className="text-[11px] text-slate-500">
            {item.counterparty && (
              <>
                <span>Counterparty: </span>
                <strong className="text-slate-800">{item.counterparty}</strong>
                <span className="mx-1.5 text-slate-300">•</span>
              </>
            )}
            <span>Ref: </span>
            <strong className="text-slate-800 font-mono">{item.refId}</strong>
            {item.metaLabel && item.metaValue && (
              <>
                <span className="mx-1.5 text-slate-300">•</span>
                <span>{item.metaLabel}: </span>
                <strong className="text-slate-800 font-mono">{item.metaValue}</strong>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {item.actionUrl && (
              <button
                type="button"
                onClick={() => router.push(item.actionUrl!)}
                className="px-3.5 py-1.5 bg-[#00450d] hover:bg-[#06380c] text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
              >
                {item.actionLabel || "View Details"}
              </button>
            )}
            {isUnread && (
              <button
                type="button"
                onClick={() => dismissNotification(item.id)}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors"
              >
                Mark Read
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}
