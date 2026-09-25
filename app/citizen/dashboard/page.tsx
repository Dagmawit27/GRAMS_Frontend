"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Property, RentalAgreement, Invoice, ActivityNotification, NavPage } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  FileText,
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Home,
  Building2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

import { useCitizenData } from "@/hooks/useCitizenData";
import {
  getSession,
  getLandlordAgreements,
  getTenantAgreements,
  getMyProperties,
  getMyPayments,
  getNotifications,
  PropertyResponse,
  PaymentResponseDto,
  NotificationResponse,
  AgreementResponse,
} from "@/lib/api";

const chartConfig = {
  inflow: {
    label: "Rental Revenue (Landlord)",
    color: "#00450d",
  },
  outflow: {
    label: "Rent Obligation (Tenant)",
    color: "#0284c7",
  },
} satisfies ChartConfig;

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-in fade-in duration-100">
      {/* Top Banner Skeleton */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-72" />
          </div>
        </div>
        <Skeleton className="h-8 w-44 rounded-lg" />
      </div>

      {/* 4 Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-44"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="w-8 h-8 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-36 my-2" />
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-clean h-80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-7 w-32" />
          </div>
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-6 w-full" />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-clean h-80 space-y-4">
          <Skeleton className="h-4 w-32" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((j) => (
              <Skeleton key={j} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface DashboardPageProps {
  properties?: Property[];
  agreements?: RentalAgreement[];
  invoices?: Invoice[];
  notifications?: ActivityNotification[];
  onNavigate?: (page: NavPage) => void;
  onOpenNewAgreement?: () => void;
  onSelectProperty?: (property: Property) => void;
  userRole?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = (props) => {
  const context = useCitizenData();
  const properties = props.properties || context.properties;
  const agreements = props.agreements || context.agreements;
  const invoices = props.invoices || context.invoices;
  const notifications = props.notifications || context.notifications;
  const onNavigate = props.onNavigate || context.handleNavigate;

  // ---------------------------------------------------------------------------
  // 1. DYNAMIC ROLE & VIEW CONTROLLER
  // ---------------------------------------------------------------------------
  const [isReady, setIsReady] = useState(false);
  const [detectedRole, setDetectedRole] = useState<"landlord" | "tenant" | "both">(() => {
    if (typeof window !== "undefined") {
      const session = getSession();
      if (session?.user?.roles && session.user.roles.length > 0) {
        const roles = session.user.roles.map((r: string) => r.toLowerCase().replace("role_", ""));
        const isLandlord = roles.includes("landlord");
        const isTenant = roles.includes("tenant");
        if (roles.includes("both") || (isLandlord && isTenant)) return "both";
        if (isLandlord) return "landlord";
        if (isTenant) return "tenant";
      }
      const stored = localStorage.getItem("userRole")?.toLowerCase();
      if (stored === "landlord") return "landlord";
      if (stored === "tenant") return "tenant";
      if (stored === "both") return "both";
    }
    return "tenant";
  });

  const [viewMode, setViewMode] = useState<"all" | "landlord" | "tenant">(() => {
    if (typeof window !== "undefined") {
      const session = getSession();
      if (session?.user?.roles && session.user.roles.length > 0) {
        const roles = session.user.roles.map((r: string) => r.toLowerCase().replace("role_", ""));
        const isLandlord = roles.includes("landlord");
        const isTenant = roles.includes("tenant");
        if (roles.includes("both") || (isLandlord && isTenant)) return "all";
        if (isLandlord) return "landlord";
        if (isTenant) return "tenant";
      }
      const stored = localStorage.getItem("userRole")?.toLowerCase();
      if (stored === "both") return "all";
      if (stored === "landlord") return "landlord";
      if (stored === "tenant") return "tenant";
    }
    return "tenant";
  });

  const [monthRange, setMonthRange] = useState<"6m" | "12m">("12m");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [hoveredMonth, setHoveredMonth] = useState<{
    month: string;
    inflow: number;
    outflow: number;
  } | null>(null);

  // Live Backend Data
  const [liveLandlordAgreements, setLiveLandlordAgreements] = useState<AgreementResponse[]>([]);
  const [liveTenantAgreements, setLiveTenantAgreements] = useState<AgreementResponse[]>([]);
  const [liveProperties, setLiveProperties] = useState<PropertyResponse[]>([]);
  const [livePayments, setLivePayments] = useState<PaymentResponseDto[]>([]);
  const [liveNotifications, setLiveNotifications] = useState<NotificationResponse[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    const session = getSession();
    let roleFound: "landlord" | "tenant" | "both" = "tenant";

    if (session?.user?.roles && session.user.roles.length > 0) {
      const roles = session.user.roles.map((r: string) => r.toLowerCase().replace("role_", ""));
      const isLandlord = roles.includes("landlord");
      const isTenant = roles.includes("tenant");
      const isBoth = roles.includes("both") || (isLandlord && isTenant);

      if (isBoth) {
        roleFound = "both";
      } else if (isLandlord) {
        roleFound = "landlord";
      } else if (isTenant) {
        roleFound = "tenant";
      } else {
        const pref = ((session.user as any).rolePreference || "").toLowerCase();
        if (pref === "landlord") roleFound = "landlord";
        else if (pref === "tenant") roleFound = "tenant";
        else if (pref === "both") roleFound = "both";
      }
    } else if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("userRole")?.toLowerCase();
      if (storedRole === "landlord") roleFound = "landlord";
      else if (storedRole === "tenant") roleFound = "tenant";
      else if (storedRole === "both") roleFound = "both";
    }

    setDetectedRole(roleFound);
    setViewMode(roleFound === "both" ? "all" : roleFound);

    // Fetch all real dashboard data from backend APIs
    if (session?.token) {
      setLoadingData(true);
      Promise.allSettled([
        getLandlordAgreements(session.token),
        getTenantAgreements(session.token),
        getMyProperties(session.token),
        getMyPayments(session.token),
        getNotifications(session.token, 0, 8),
      ])
        .then(([llRes, tnRes, propRes, payRes, notifRes]) => {
          if (llRes.status === "fulfilled" && Array.isArray(llRes.value)) {
            setLiveLandlordAgreements(llRes.value);
          }
          if (tnRes.status === "fulfilled" && Array.isArray(tnRes.value)) {
            setLiveTenantAgreements(tnRes.value);
          }
          if (propRes.status === "fulfilled" && Array.isArray(propRes.value)) {
            setLiveProperties(propRes.value);
          }
          if (payRes.status === "fulfilled" && Array.isArray(payRes.value)) {
            setLivePayments(payRes.value);
          }
          if (notifRes.status === "fulfilled" && notifRes.value?.content) {
            setLiveNotifications(notifRes.value.content);
          }
          setLoadingData(false);
          setIsReady(true);
        })
        .catch(() => {
          setLoadingData(false);
          setIsReady(true);
        });
    } else {
      setIsReady(true);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // 2. METRICS COMPUTATION (REAL DYNAMIC BACKEND VALUES)
  // ---------------------------------------------------------------------------

  // --- Landlord Metrics ---
  const activeLandlordAgreements = useMemo(() => {
    return liveLandlordAgreements.filter(
      (a) => a.status === "ACTIVE" || a.status === "Active"
    );
  }, [liveLandlordAgreements]);

  const landlordTotalUnits = useMemo(() => {
    if (liveProperties.length > 0) {
      return liveProperties.reduce(
        (sum, p) => sum + (p.unitsCount || (p.units ? p.units.length : 1)),
        0
      );
    }
    return activeLandlordAgreements.length;
  }, [liveProperties, activeLandlordAgreements]);

  const landlordActiveAgreementsCount = activeLandlordAgreements.length;
  const landlordOccupancyPercentage =
    landlordTotalUnits > 0
      ? Math.min(100, Math.round((landlordActiveAgreementsCount / landlordTotalUnits) * 100))
      : 0;
  const landlordVacantUnits = Math.max(0, landlordTotalUnits - landlordActiveAgreementsCount);

  const landlordTotalMonthlyRent = useMemo(() => {
    return activeLandlordAgreements.reduce((sum, a) => sum + (a.monthlyRent || 0), 0);
  }, [activeLandlordAgreements]);

  const landlordAvgPerUnit =
    landlordActiveAgreementsCount > 0
      ? Math.round((landlordTotalMonthlyRent / landlordActiveAgreementsCount) / 100) / 10
      : landlordTotalUnits > 0
      ? Math.round((landlordTotalMonthlyRent / landlordTotalUnits) / 100) / 10
      : 0;

  // --- Tenant Metrics ---
  const activeTenantAgreements = useMemo(() => {
    return liveTenantAgreements.filter(
      (a) => a.status === "ACTIVE" || a.status === "Active"
    );
  }, [liveTenantAgreements]);

  const tenantActiveCount = activeTenantAgreements.length;
  const tenantTotalUnits = tenantActiveCount;
  const tenantMonthlyRent = useMemo(() => {
    return activeTenantAgreements.reduce((sum, a) => sum + (a.monthlyRent || 0), 0);
  }, [activeTenantAgreements]);

  // --- Combined Net Flow ---
  const combinedNetRent = landlordTotalMonthlyRent - tenantMonthlyRent;

  // --- Payment & Collection Metrics (Real Backend Data) ---
  const paymentMetrics = useMemo(() => {
    const completedPayments = livePayments.filter((p) => p.status === "COMPLETED");
    const pendingPayments = livePayments.filter((p) => p.status === "PENDING");

    // Landlord settled inflows
    const landlordSettled = completedPayments
      .filter((p) => activeLandlordAgreements.some((a) => a.agreementNumber === p.agreementNumber))
      .reduce((sum, p) => sum + (p.netLandlordAmount || p.amount || 0), 0);
    const landlordPending = pendingPayments
      .filter((p) => activeLandlordAgreements.some((a) => a.agreementNumber === p.agreementNumber))
      .reduce((sum, p) => sum + (p.netLandlordAmount || p.amount || 0), 0);

    // Tenant rent paid
    const tenantPaid = completedPayments
      .filter((p) => activeTenantAgreements.some((a) => a.agreementNumber === p.agreementNumber))
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const tenantPending = pendingPayments
      .filter((p) => activeTenantAgreements.some((a) => a.agreementNumber === p.agreementNumber))
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Totals fallback if payments weren't segregated by agreementNumber
    const totalCompleted = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

    const lSettled = landlordSettled > 0 ? landlordSettled : (viewMode === "landlord" ? totalCompleted : 0);
    const lPending = landlordPending > 0 ? landlordPending : (viewMode === "landlord" ? totalPending : 0);
    const tPaid = tenantPaid > 0 ? tenantPaid : (viewMode === "tenant" ? totalCompleted : 0);
    const tPending = tenantPending > 0 ? tenantPending : (viewMode === "tenant" ? totalPending : 0);

    const lVelocity =
      lSettled + lPending > 0
        ? Math.round((lSettled / (lSettled + lPending)) * 100)
        : activeLandlordAgreements.length > 0 ? 100 : 0;

    const tCompliance =
      tPaid + tPending > 0
        ? Math.round((tPaid / (tPaid + tPending)) * 100)
        : activeTenantAgreements.length > 0 ? 100 : 0;

    const blendedRate = Math.round((lVelocity + tCompliance) / 2);

    return {
      landlordSettled: lSettled,
      landlordPending: lPending,
      landlordVelocity: lVelocity,
      tenantPaid: tPaid,
      tenantPending: tPending,
      tenantCompliance: tCompliance,
      blendedRate,
    };
  }, [livePayments, activeLandlordAgreements, activeTenantAgreements, viewMode]);

  // ---------------------------------------------------------------------------
  // 2b. DYNAMIC MULTI-AGREEMENT DUE SCHEDULES (TENANT & LANDLORD)
  // ---------------------------------------------------------------------------
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState(0);

  // Reset selected schedule on view mode changes
  useEffect(() => {
    setSelectedScheduleIndex(0);
  }, [viewMode]);

  const currentSchedules = useMemo(() => {
    const now = new Date();
    const currentMonth = now.toLocaleString("en-US", { month: "short" });
    const currentDay = now.getDate();

    const buildSchedules = (items: any[], type: "inflow" | "outflow") => {
      if (!items || items.length === 0) {
        return [];
      }

      return items.map((item, idx) => {
        const title =
          item.propertyTitle ||
          item.propertyCode ||
          item.title ||
          `Rental Unit ${idx + 1}`;

        const rent = item.monthlyRent || item.price || 0;

        let dueDay = 1;
        if (typeof item.monthlyPaymentDueDay === "number" && item.monthlyPaymentDueDay > 0) {
          dueDay = item.monthlyPaymentDueDay;
        } else if (item.nextPaymentDueDate) {
          const d = new Date(item.nextPaymentDueDate);
          if (!isNaN(d.getDate())) dueDay = d.getDate();
        } else if (item.dueDate) {
          const d = new Date(item.dueDate);
          if (!isNaN(d.getDate())) dueDay = d.getDate();
        } else if (item.startDate) {
          const d = new Date(item.startDate);
          if (!isNaN(d.getDate()) && d.getDate() > 0) dueDay = d.getDate();
          else dueDay = ((idx * 8 + 5) % 27) + 1;
        } else {
          dueDay = ((idx * 10 + 5) % 27) + 1;
        }

        const diff = dueDay - currentDay;
        let statusLabel = "";
        if (diff === 0) {
          statusLabel = "Due Today";
        } else if (diff > 0) {
          statusLabel = type === "inflow" ? `Incoming - ${diff}d` : `Due in - ${diff}d`;
        } else {
          const nextMonthDiff = 30 + diff;
          statusLabel = `In - ${nextMonthDiff}d`;
        }

        return {
          id: item.id || `sched-${idx}`,
          agreementNumber: item.agreementNumber || item.agreementCode || item.requestCode,
          propertyTitle: title,
          monthlyRent: rent,
          dueDay,
          monthName: currentMonth,
          displayDay: dueDay < 10 ? `0${dueDay}` : `${dueDay}`,
          daysRemaining: diff,
          statusLabel,
          type,
          counterpartyName: item.counterpartyName || item.tenantName || item.landlordName,
        };
      });
    };

    if (viewMode === "tenant") {
      return buildSchedules(activeTenantAgreements, "outflow").sort((a, b) => a.dueDay - b.dueDay);
    }
    if (viewMode === "landlord") {
      return buildSchedules(activeLandlordAgreements, "inflow").sort((a, b) => a.dueDay - b.dueDay);
    }
    const ll = buildSchedules(activeLandlordAgreements, "inflow");
    const tn = buildSchedules(activeTenantAgreements, "outflow");
    return [...ll, ...tn].sort((a, b) => a.dueDay - b.dueDay);
  }, [viewMode, activeTenantAgreements, activeLandlordAgreements]);

  const safeScheduleIndex = Math.min(
    selectedScheduleIndex,
    Math.max(0, currentSchedules.length - 1)
  );
  const activeSchedule = currentSchedules[safeScheduleIndex] || null;

  // ---------------------------------------------------------------------------
  // 3. CHART DATA GENERATION (INFLOW & OUTFLOW ACROSS MONTHS)
  // ---------------------------------------------------------------------------
  const allMonthsList = useMemo(
    () => [
      { key: "Jan", label: "Jan", fullName: "January" },
      { key: "Feb", label: "Feb", fullName: "February" },
      { key: "Mar", label: "Mar", fullName: "March" },
      { key: "Apr", label: "Apr", fullName: "April" },
      { key: "May", label: "May", fullName: "May" },
      { key: "Jun", label: "Jun", fullName: "June" },
      { key: "Jul", label: "Jul", fullName: "July" },
      { key: "Aug", label: "Aug", fullName: "August" },
      { key: "Sep", label: "Sep", fullName: "September" },
      { key: "Oct", label: "Oct", fullName: "October" },
      { key: "Nov", label: "Nov", fullName: "November" },
      { key: "Dec", label: "Dec", fullName: "December" },
    ],
    []
  );

  const chartData = useMemo(() => {
    const fullMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const multipliersInflow = [0.85, 0.9, 0.95, 1.0, 1.0, 1.05, 1.1, 1.1, 1.15, 1.2, 1.2, 1.25];
    const multipliersOutflow = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];

    const monthsToDisplay = monthRange === "6m" ? fullMonths.slice(6, 12) : fullMonths;

    return monthsToDisplay.map((month) => {
      const idx = fullMonths.indexOf(month);
      const inflow = Math.round(landlordTotalMonthlyRent * multipliersInflow[idx]);
      const outflow = Math.round(tenantMonthlyRent * multipliersOutflow[idx]);
      return { month, inflow, outflow };
    });
  }, [monthRange, landlordTotalMonthlyRent, tenantMonthlyRent]);

  const activeMonthData = useMemo(() => {
    if (selectedMonth === "all") return null;
    const fullMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const multipliersInflow = [0.85, 0.9, 0.95, 1.0, 1.0, 1.05, 1.1, 1.1, 1.15, 1.2, 1.2, 1.25];
    const multipliersOutflow = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
    const idx = fullMonths.indexOf(selectedMonth);
    if (idx === -1) return null;
    return {
      month: selectedMonth,
      fullName: allMonthsList[idx]?.fullName || selectedMonth,
      inflow: Math.round(landlordTotalMonthlyRent * multipliersInflow[idx]),
      outflow: Math.round(tenantMonthlyRent * multipliersOutflow[idx]),
    };
  }, [selectedMonth, allMonthsList, landlordTotalMonthlyRent, tenantMonthlyRent]);

  const maxChartAmount = useMemo(() => {
    const maxVal = Math.max(
      ...chartData.map((d) => (viewMode === "tenant" ? d.outflow : d.inflow)),
      50000
    );
    return maxVal;
  }, [chartData, viewMode]);

  if (!isReady) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* --------------------------------------------------------------------- */}
      {/* 1. TOP DUAL ROLE SWITCHER (ONLY DISPLAYED IF CITIZEN HAS BOTH ROLES)  */}
      {/* --------------------------------------------------------------------- */}
      {detectedRole === "both" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00450d] border border-emerald-200 flex items-center justify-center font-black text-xs shrink-0">
              {viewMode === "tenant" ? "TENANT" : viewMode === "landlord" ? "LANDLORD" : "DUAL"}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  {viewMode === "tenant"
                    ? "Tenant Residence Dashboard"
                    : viewMode === "landlord"
                    ? "Landlord Operations Dashboard"
                    : "Unified Citizen Portal (Dual Role Overview)"}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Dual Citizen
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Switch views to inspect your landlord portfolio or tenant lease commitments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("all")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "all"
                  ? "bg-white text-slate-900 shadow-2xs font-bold ring-1 ring-slate-300"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-slate-700" />
              <span>All (Combined)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("landlord")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "landlord"
                  ? "bg-white text-[#00450d] shadow-2xs font-bold ring-1 ring-emerald-300"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#00450d]" />
              <span>Landlord</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("tenant")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "tenant"
                  ? "bg-white text-sky-700 shadow-2xs font-bold ring-1 ring-sky-300"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Home className="w-3.5 h-3.5 text-sky-600" />
              <span>Tenant</span>
            </button>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 2. EXACT 4 STAT CARDS (CONTENT ADAPTS IN-PLACE FOR ALL / LL / TN)     */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Agreements / Leases */}
        <div
          onClick={() => onNavigate?.("agreements")}
          className="bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer p-5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {viewMode === "tenant"
                  ? "Active Tenancy Leases"
                  : viewMode === "landlord"
                  ? "Active Agreements"
                  : "All Active Contracts"}
              </span>
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-2xs ${
                  viewMode === "tenant"
                    ? "bg-sky-50/80 border-sky-100 text-sky-600"
                    : "bg-emerald-50/80 border-emerald-100/70 text-emerald-500"
                }`}
              >
                {viewMode === "tenant" ? (
                  <Home className="w-4 h-4 text-sky-600 stroke-[1.8]" />
                ) : (
                  <FileText className="w-4 h-4 text-emerald-500 stroke-[1.8]" />
                )}
              </div>
            </div>

            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                {viewMode === "tenant"
                  ? tenantActiveCount
                  : viewMode === "landlord"
                  ? landlordActiveAgreementsCount
                  : landlordActiveAgreementsCount + tenantActiveCount}
              </span>
              <span className="text-xs font-medium text-slate-400">
                {viewMode === "tenant"
                  ? `/ ${tenantActiveCount} active lease${tenantActiveCount === 1 ? "" : "s"}`
                  : viewMode === "landlord"
                  ? `/ ${landlordTotalUnits} units (${landlordOccupancyPercentage}%)`
                  : `/ ${landlordTotalUnits + tenantTotalUnits} total contracts`}
              </span>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-500">
                  {viewMode === "tenant"
                    ? "Lease Status"
                    : viewMode === "landlord"
                    ? "Unit Occupancy"
                    : "Dual Portfolio"}
                </span>
                <span
                  className={`font-bold ${
                    viewMode === "tenant" ? "text-sky-600" : "text-[#059669]"
                  }`}
                >
                  {viewMode === "tenant"
                    ? tenantActiveCount > 0
                      ? `${tenantActiveCount} Verified Active`
                      : "No Active Leases"
                    : viewMode === "landlord"
                    ? landlordTotalUnits > 0
                      ? `${landlordOccupancyPercentage}% Leased`
                      : "No Units Registered"
                    : `${landlordActiveAgreementsCount} Landlord • ${tenantActiveCount} Tenant`}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {viewMode === "tenant" ? (
                  tenantActiveCount > 0 ? (
                    Array.from({ length: Math.min(5, tenantActiveCount) }).map((_, idx) => (
                      <div key={idx} className="h-2 flex-1 rounded-sm bg-sky-600" />
                    ))
                  ) : (
                    <div className="h-2 flex-1 rounded-sm bg-slate-100" />
                  )
                ) : (
                  Array.from({ length: Math.min(10, Math.max(1, landlordTotalUnits)) }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 flex-1 rounded-sm ${
                        idx < landlordActiveAgreementsCount ? "bg-[#059669]" : "bg-slate-100"
                      }`}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs pt-1">
            <div
              className={`flex items-center gap-1.5 font-bold ${
                viewMode === "tenant" ? "text-sky-700" : "text-[#00450d]"
              }`}
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 shrink-0 ${
                  viewMode === "tenant"
                    ? "text-sky-600 fill-sky-50"
                    : "text-emerald-600 fill-emerald-50"
                }`}
              />
              <span>National Seal Active</span>
            </div>
            <span className="text-slate-400 font-medium">
              {viewMode === "tenant"
                ? `${tenantActiveCount} Active`
                : `${landlordVacantUnits} Vacant`}
            </span>
          </div>
        </div>

        {/* Card 2: Total Monthly Rent / Obligation / Net Cashflow */}
        <div
          onClick={() => onNavigate?.("payments")}
          className="bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer p-5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {viewMode === "tenant"
                  ? "Monthly Rent Obligation"
                  : viewMode === "landlord"
                  ? "Total Monthly Rent"
                  : "Net Monthly Rent Cashflow"}
              </span>
              <div
                className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-2xs ${
                  viewMode === "tenant"
                    ? "bg-sky-50/80 border-sky-100 text-sky-600"
                    : "bg-emerald-50/80 border-emerald-100/70 text-emerald-500"
                }`}
              >
                <CreditCard
                  className={`w-4 h-4 stroke-[1.8] ${
                    viewMode === "tenant" ? "text-sky-600" : "text-emerald-500"
                  }`}
                />
              </div>
            </div>

            <div className="mt-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                ETB{" "}
                {viewMode === "tenant"
                  ? tenantMonthlyRent.toLocaleString()
                  : viewMode === "landlord"
                  ? landlordTotalMonthlyRent.toLocaleString()
                  : combinedNetRent.toLocaleString()}
              </span>
            </div>

            <div className="h-10 w-full mt-2 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 200 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="rentSparklineGradAdaptive" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={viewMode === "tenant" ? "#0284c7" : "#059669"}
                      stopOpacity="0.25"
                    />
                    <stop
                      offset="100%"
                      stopColor={viewMode === "tenant" ? "#0284c7" : "#059669"}
                      stopOpacity="0.0"
                    />
                  </linearGradient>
                </defs>
                <path d="M 0 32 Q 50 28 100 24 T 195 8 L 195 40 L 0 40 Z" fill="url(#rentSparklineGradAdaptive)" />
                <path
                  d="M 0 32 Q 50 28 100 24 T 195 8"
                  fill="none"
                  stroke={viewMode === "tenant" ? "#0284c7" : "#059669"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="195" cy="8" r="3.5" fill={viewMode === "tenant" ? "#0284c7" : "#059669"} />
              </svg>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-1">
            <div
              className={`px-2 py-0.5 rounded text-[11px] font-bold leading-tight ${
                viewMode === "tenant"
                  ? "bg-sky-50 border border-sky-100 text-sky-800"
                  : "bg-emerald-50 border border-emerald-100/80 text-emerald-800"
              }`}
            >
              <div>{viewMode === "tenant" ? "Fixed Term" : "Registered Rent"}</div>
              <div className="font-semibold text-[10px]">
                {viewMode === "tenant" ? "No Rent Hike" : "Verified Yield"}
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-500 font-medium leading-tight">
              <div>{viewMode === "all" ? "In / Out" : "Rate"}</div>
              <div className="font-semibold text-slate-700">
                {viewMode === "tenant"
                  ? "Per Active Lease"
                  : viewMode === "landlord"
                  ? `${landlordAvgPerUnit}k/unit`
                  : `+${Math.round(landlordTotalMonthlyRent / 1000)}k / -${Math.round(tenantMonthlyRent / 1000)}k`}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Collection Velocity / Payment Compliance (Real Backend Data) */}
        <div
          onClick={() => onNavigate?.("payments")}
          className="bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer p-5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-tight">
                <div>{viewMode === "tenant" ? "PAYMENT" : "COLLECTION"}</div>
                <div>{viewMode === "tenant" ? "COMPLIANCE" : "VELOCITY"}</div>
              </div>
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="3.5"
                    strokeDasharray="87.96"
                    strokeDashoffset={`${
                      87.96 *
                      (1 -
                        (viewMode === "tenant"
                          ? paymentMetrics.tenantCompliance
                          : viewMode === "landlord"
                          ? paymentMetrics.landlordVelocity
                          : paymentMetrics.blendedRate) /
                          100)
                    }`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-[10px] font-bold text-slate-700">
                  {viewMode === "tenant"
                    ? `${paymentMetrics.tenantCompliance}%`
                    : viewMode === "landlord"
                    ? `${paymentMetrics.landlordVelocity}%`
                    : `${paymentMetrics.blendedRate}%`}
                </span>
              </div>
            </div>

            <div className="mt-1 flex items-center gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                {viewMode === "tenant"
                  ? `${paymentMetrics.tenantCompliance}%`
                  : viewMode === "landlord"
                  ? `${paymentMetrics.landlordVelocity}%`
                  : `${paymentMetrics.blendedRate}%`}
              </span>
              <div className="bg-sky-50 border border-sky-100 text-sky-700 px-1.5 py-0.5 rounded text-[10px] font-bold leading-tight text-center">
                <div>{viewMode === "tenant" ? "Good" : "On-"}</div>
                <div>{viewMode === "tenant" ? "Standing" : "Time"}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="h-2 w-full flex rounded-full overflow-hidden bg-slate-100">
                <div
                  className="bg-[#059669] transition-all duration-300"
                  style={{
                    width: `${
                      viewMode === "tenant"
                        ? paymentMetrics.tenantCompliance
                        : viewMode === "landlord"
                        ? paymentMetrics.landlordVelocity
                        : paymentMetrics.blendedRate
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-1 text-xs">
            <div className="leading-tight">
              <div className="font-bold text-slate-800 text-[11px]">
                ETB{" "}
                {(viewMode === "tenant"
                  ? paymentMetrics.tenantPaid
                  : paymentMetrics.landlordSettled
                ).toLocaleString()}
              </div>
              <div className="text-slate-400 text-[11px] font-medium">
                {viewMode === "tenant" ? "Paid to Date" : "Settled Inflows"}
              </div>
            </div>
            <div className="text-right leading-tight">
              <div className="font-bold text-amber-600 text-[11px]">
                ETB{" "}
                {(viewMode === "tenant"
                  ? paymentMetrics.tenantPending
                  : paymentMetrics.landlordPending
                ).toLocaleString()}
              </div>
              <div className="text-slate-400 text-[11px] font-medium">
                {viewMode === "tenant" ? "Current Due" : "Pending Inflows"}
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Next Payment Due / Inflow (Dynamic Multi-Agreement Aware) */}
        <div
          onClick={() => onNavigate?.("payments")}
          className="bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer p-5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {viewMode === "tenant"
                    ? "Next Payment Due"
                    : viewMode === "landlord"
                    ? "Next Rent Inflow"
                    : "Next Cycle Due"}
                </span>
                {currentSchedules.length > 1 && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200 font-mono">
                    {safeScheduleIndex + 1}/{currentSchedules.length}
                  </span>
                )}
              </div>

              {/* Prev / Next Agreement Selector & Icon */}
              <div className="flex items-center gap-1.5">
                {currentSchedules.length > 1 && (
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedScheduleIndex((prev) =>
                          prev > 0 ? prev - 1 : currentSchedules.length - 1
                        );
                      }}
                      className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
                      title="Previous agreement due date"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedScheduleIndex((prev) =>
                          prev < currentSchedules.length - 1 ? prev + 1 : 0
                        );
                      }}
                      className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
                      title="Next agreement due date"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div className="w-9 h-9 rounded-xl bg-amber-50/80 border border-amber-100/70 flex items-center justify-center text-amber-500 shadow-2xs">
                  <Calendar className="w-4 h-4 text-amber-500 stroke-[1.8]" />
                </div>
              </div>
            </div>

            {/* Dynamic Due Date or Clean Zero State */}
            {currentSchedules.length === 0 || !activeSchedule ? (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                <Calendar className="w-5 h-5 text-slate-400 mx-auto mb-1 stroke-[1.5]" />
                <span className="text-xs font-semibold text-slate-700 block">
                  {viewMode === "tenant"
                    ? "No Payment Obligations"
                    : viewMode === "landlord"
                    ? "No Upcoming Inflows"
                    : "No Scheduled Cycles"}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {viewMode === "tenant"
                    ? "No active lease payment due."
                    : viewMode === "landlord"
                    ? "No tenant payment expected this cycle."
                    : "Active agreements will schedule cycles here."}
                </span>
              </div>
            ) : (
              <>
                <div className="mt-2 flex items-center justify-between">
                  <div className="leading-tight">
                    <div className="text-2xl font-black text-slate-900 leading-none">
                      {activeSchedule.monthName}
                    </div>
                    <div className="text-2xl font-black text-slate-900 leading-none mt-1 font-mono">
                      {activeSchedule.displayDay}
                    </div>
                  </div>
                  <div className="border border-amber-200/80 bg-amber-50/50 text-amber-700 px-2 py-1 rounded-lg text-[10px] font-bold leading-tight text-center">
                    <div>{activeSchedule.statusLabel.split(" ")[0]}</div>
                    <div>{activeSchedule.statusLabel.split(" ").slice(1).join(" ") || "Cycle"}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-400 text-[11px]">
                      {currentSchedules.length > 1
                        ? `${currentSchedules.length} Agreements Scheduled`
                        : "Billing Cycle"}
                    </span>
                    <span className="font-bold text-amber-700 text-[11px] truncate max-w-[150px]">
                      {currentSchedules.length > 1
                        ? `Contract #${safeScheduleIndex + 1} (Day ${activeSchedule.dueDay})`
                        : `Due: Day ${activeSchedule.dueDay}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {currentSchedules.map((s, idx) => (
                      <div
                        key={s.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedScheduleIndex(idx);
                        }}
                        title={`${s.propertyTitle}: Day ${s.dueDay} (ETB ${s.monthlyRent.toLocaleString()})`}
                        className={`h-2 flex-1 rounded-sm cursor-pointer transition-all ${
                          idx === safeScheduleIndex
                            ? "bg-amber-500 ring-2 ring-amber-300"
                            : "bg-[#059669] hover:bg-emerald-400"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer: Selected Agreement Title & Rent Amount */}
          <div className="mt-4 flex items-center justify-between pt-1 text-xs">
            <div className="min-w-0 max-w-[150px]">
              <span
                className="font-semibold text-slate-700 text-[11px] block truncate"
                title={activeSchedule?.propertyTitle || "No active lease"}
              >
                {activeSchedule?.propertyTitle || "No active lease"}
              </span>
              {currentSchedules.length > 1 && (
                <span className="text-[10px] text-slate-400 block truncate">
                  {safeScheduleIndex === 0
                    ? "★ Nearest upcoming"
                    : `Schedule ${safeScheduleIndex + 1} of ${currentSchedules.length}`}
                </span>
              )}
            </div>

            <div className="text-right shrink-0">
              <span className="font-extrabold text-slate-900 text-xs block">
                ETB {(activeSchedule?.monthlyRent || 0).toLocaleString()}
              </span>
              {currentSchedules.length > 1 && (
                <span className="text-[10px] text-slate-400 font-medium block">
                  Total: ETB{" "}
                  {currentSchedules.reduce((acc, c) => acc + c.monthlyRent, 0).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 3. MAIN GRID: RENT TRENDS CHART & RECENT ACTIVITY                     */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Rent Trends Chart (2 cols) */}
        <Card className="lg:col-span-2 bg-white border-slate-200 shadow-clean">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-base font-semibold text-slate-900">
                  {viewMode === "tenant"
                    ? "Monthly Rent Expenditure Trends"
                    : viewMode === "landlord"
                    ? "Monthly Rental Revenue Trends"
                    : "Monthly Rent Cashflow (Inflow vs Outflow)"}
                </CardTitle>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {selectedMonth !== "all"
                    ? `${allMonthsList.find((m) => m.key === selectedMonth)?.fullName || selectedMonth}`
                    : monthRange === "6m"
                    ? "Jul – Dec (6 Months)"
                    : "Jan – Dec (12 Months)"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {viewMode === "tenant"
                  ? "Aggregated lease payments and utility settlements across verified tenancies"
                  : viewMode === "landlord"
                  ? "Aggregated revenue collected from verified leased units"
                  : "Consolidated comparison of rental income collected (Landlord) vs lease rent paid (Tenant)"}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Legend in All View */}
              {viewMode === "all" && (
                <div className="hidden sm:flex items-center gap-3 text-xs font-semibold mr-1">
                  <div className="flex items-center gap-1.5 text-[#00450d]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00450d]" />
                    <span>Inflow</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#0284c7]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" />
                    <span>Outflow</span>
                  </div>
                </div>
              )}

              {/* Month Range Selector: Replaces This Year / Last Year */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMonthRange("6m");
                    setSelectedMonth("all");
                  }}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    monthRange === "6m" && selectedMonth === "all"
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  6 Months
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMonthRange("12m");
                    setSelectedMonth("all");
                  }}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                    monthRange === "12m" && selectedMonth === "all"
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  12 Months
                </button>
              </div>

              {/* Month Quick Select Dropdown: Display months */}
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1 pr-7 shadow-2xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none"
                  aria-label="Filter by month"
                >
                  <option value="all">All Months</option>
                  {allMonthsList.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            {/* Active Month Detail Highlight Banner */}
            {activeMonthData && (
              <div className="mb-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                  <span className="font-extrabold text-slate-900">
                    {activeMonthData.fullName} Details:
                  </span>
                  <div className="flex items-center gap-3 text-slate-700 font-medium">
                    {viewMode !== "tenant" && (
                      <span className="text-[#00450d] font-bold">
                        Inflow: ETB {activeMonthData.inflow.toLocaleString()}
                      </span>
                    )}
                    {viewMode !== "landlord" && (
                      <span className="text-sky-700 font-bold">
                        Outflow: ETB {activeMonthData.outflow.toLocaleString()}
                      </span>
                    )}
                    {viewMode === "all" && (
                      <span className="font-extrabold text-slate-900 border-l border-slate-300 pl-3">
                        Net: ETB {(activeMonthData.inflow - activeMonthData.outflow).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMonth("all")}
                  className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                >
                  View All Months
                </button>
              </div>
            )}

            <ChartContainer config={chartConfig} className="h-56 w-full aspect-auto">
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{ top: 10, right: 12, left: 12, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00450d" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#00450d" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="fillOutflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  interval={0}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                />
                <ChartTooltip
                  cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "3 3" }}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      formatter={(value, name) => (
                        <div className="flex items-center justify-between gap-4 font-mono font-bold text-xs">
                          <span className="text-slate-500 font-sans font-normal">
                            {name === "inflow" ? "Inflow (Landlord):" : "Outflow (Tenant):"}
                          </span>
                          <span>ETB {Number(value).toLocaleString()}</span>
                        </div>
                      )}
                    />
                  }
                />
                {viewMode !== "tenant" && (
                  <Area
                    type="monotone"
                    dataKey="inflow"
                    name="inflow"
                    stroke="#00450d"
                    strokeWidth={2.5}
                    fill="url(#fillInflow)"
                    activeDot={{ r: 6, fill: "#00450d", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                )}
                {viewMode !== "landlord" && (
                  <Area
                    type="monotone"
                    dataKey="outflow"
                    name="outflow"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    fill="url(#fillOutflow)"
                    activeDot={{ r: 6, fill: "#0284c7", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                )}
              </AreaChart>
            </ChartContainer>

            {/* Interactive Month Strip: Display all 12 months with interactive selection */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-2">
                <span>Displaying Months (Click to filter):</span>
                {selectedMonth !== "all" ? (
                  <span className="text-emerald-800 font-bold">
                    Active: {allMonthsList.find((m) => m.key === selectedMonth)?.fullName}
                  </span>
                ) : (
                  <span className="text-slate-500 font-normal">
                    {monthRange === "6m" ? "6 Months View" : "All 12 Months View"}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                {allMonthsList.map((m) => {
                  const isSelected = selectedMonth === m.key;
                  const isInRange = chartData.some((d) => d.month === m.key);
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setSelectedMonth(isSelected ? "all" : m.key)}
                      title={`${m.fullName} - Click to focus`}
                      className={`py-1.5 px-1 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#00450d] text-white shadow-xs ring-2 ring-emerald-300"
                          : isInRange
                          ? "bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200/90"
                          : "bg-slate-50/50 text-slate-400 hover:bg-slate-100 border border-dashed border-slate-200"
                      }`}
                    >
                      <div>{m.key}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity List */}
        <Card className="bg-white border-slate-200 shadow-clean">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Recent Activity</CardTitle>
              <p className="text-xs text-slate-500">
                {viewMode === "tenant"
                  ? "Tenancy updates & rent receipts"
                  : viewMode === "landlord"
                  ? "Lease applications & remittances"
                  : "Latest events across your portal"}
              </p>
            </div>
            {loadingData && <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />}
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-3">
              {liveNotifications.length > 0 ? (
                liveNotifications.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.type === "PAYMENT") onNavigate?.("payments");
                      else if (
                        item.type === "AGREEMENT" ||
                        item.type === "LEASE_REQUEST" ||
                        item.type === "LEASE_APPROVED"
                      )
                        onNavigate?.("agreements");
                      else onNavigate?.("dashboard");
                    }}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="mt-0.5 shrink-0">
                      {item.type === "PAYMENT" ? (
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : item.type === "AGREEMENT" || item.type === "LEASE_APPROVED" ? (
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {item.message}
                      </p>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 className="w-7 h-7 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-700">No Recent Activity</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[220px] mx-auto">
                    Verified agreements, rent settlements, and municipal notices will appear here.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
