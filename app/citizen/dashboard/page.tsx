"use client";

import React, { useState, useEffect } from "react";
import { Property, RentalAgreement, Invoice, ActivityNotification, NavPage } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CreditCard,
  Calendar,
  Bell,
  Plus,
  ArrowRight,
  TrendingUp,
  Building2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock
} from "lucide-react";

import { useCitizenData } from "@/hooks/useCitizenData";
import { getMyProperties, getSession } from "@/lib/api";

interface DashboardPageProps {
  properties?: Property[];
  agreements?: RentalAgreement[];
  invoices?: Invoice[];
  notifications?: ActivityNotification[];
  onNavigate?: (page: NavPage) => void;
  onOpenNewAgreement?: () => void;
  onSelectProperty?: (property: Property) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = (props) => {
  const context = useCitizenData();
  const properties = props.properties || context.properties;
  const agreements = props.agreements || context.agreements;
  const invoices = props.invoices || context.invoices;
  const notifications = props.notifications || context.notifications;
  const onNavigate = props.onNavigate || context.handleNavigate;
  const onOpenNewAgreement = props.onOpenNewAgreement || (() => context.setIsNewAgreementModalOpen(true));
  const onSelectProperty = props.onSelectProperty || context.handleSelectProperty;
  const [trendYear, setTrendYear] = useState<"this" | "last">("this");
  const [hoveredMonth, setHoveredMonth] = useState<{ month: string; amount: number } | null>(null);


  const activeAgreementsCount = agreements.filter((a) => a.status === "Active").length;
  const totalUnits = Math.max(3, activeAgreementsCount);
  const occupancyPercentage = Math.round((activeAgreementsCount / totalUnits) * 100);
  const vacantUnits = Math.max(0, totalUnits - activeAgreementsCount);
  const totalMonthlyRent = agreements
    .filter((a) => a.status === "Active")
    .reduce((sum, a) => sum + a.monthlyRent, 0);

  const nextDueInvoice = invoices.find((i) => i.status === "Pending" || i.status === "Overdue") || invoices[0];
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  // Calculate chart data from actual agreements
  const calculateChartData = (year: "this" | "last") => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    const targetYear = year === "this" ? currentYear : currentYear - 1;

    return months.map((month) => {
      const monthIndex = months.indexOf(month);
      // Calculate revenue from active agreements for this month
      const monthlyRevenue = agreements
        .filter((a) => {
          const startDate = new Date(a.startDate);
          const endDate = a.endDate ? new Date(a.endDate) : new Date(targetYear, monthIndex + 1, 0);
          const agreementYear = startDate.getFullYear();
          
          // Check if agreement was active in this month of target year
          if (agreementYear > targetYear) return false;
          if (agreementYear < targetYear && endDate.getFullYear() < targetYear) return false;
          
          // Simple calculation: if agreement exists and is active, count its rent
          return a.status === "Active";
        })
        .reduce((sum, a) => sum + a.monthlyRent, 0);

      return { month, amount: monthlyRevenue || 0 };
    });
  };

  const chartDataThisYear = calculateChartData("this");
  const chartDataLastYear = calculateChartData("last");

  const currentChartData = trendYear === "this" ? chartDataThisYear : chartDataLastYear;
  const maxChartAmount = Math.max(...currentChartData.map((d) => d.amount), 50000);

  return (
    <div className="space-y-3 animate-in fade-in duration-150">
      {/* Welcome Header 
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h2 >
            Overview Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Welcome back, Dagmawit. Monitoring your verified properties and active tenancies.
          </p>
        </div>
      </div>*/}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Agreements (Pixel-perfect match to uploaded design) */}
        <div
          onClick={() => onNavigate?.("agreements")}
          className="bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer p-5 flex flex-col justify-between"
        >
          <div>
            {/* Header: Title on Left, Mint Icon on Right */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active Agreements
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50/80 border border-emerald-100/70 flex items-center justify-center text-emerald-500 shadow-2xs">
                <FileText className="w-4 h-4 text-emerald-500 stroke-[1.8]" />
              </div>
            </div>

            {/* Metric Value: 3 / 3 units (100%) */}
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                {activeAgreementsCount}
              </span>
              <span className="text-xs font-medium text-slate-400">
                / {totalUnits} units ({occupancyPercentage}%)
              </span>
            </div>

            {/* Unit Occupancy & 3-Segment Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-500">Unit Occupancy</span>
                <span className="font-bold text-[#059669]">{occupancyPercentage}% Leased</span>
              </div>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalUnits }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 flex-1 rounded-sm ${
                      idx < activeAgreementsCount ? "bg-[#059669]" : "bg-slate-100"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer Status: National Seal Active & 0 Vacant */}
          <div className="mt-4 flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-1.5 font-bold text-[#00450d]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-50 shrink-0" />
              <span>National Seal Active</span>
            </div>
            <span className="text-slate-400 font-medium">{vacantUnits} Vacant</span>
          </div>
        </div>

        {/* Card 2: Total Monthly Rent (Pixel-perfect match to uploaded design) */}
        <div
          onClick={() => onNavigate?.("payments")}
          className="bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer p-5 flex flex-col justify-between"
        >
          <div>
            {/* Header: Title on Left, Mint Icon on Right */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Monthly Rent
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50/80 border border-emerald-100/70 flex items-center justify-center text-emerald-500 shadow-2xs">
                <CreditCard className="w-4 h-4 text-emerald-500 stroke-[1.8]" />
              </div>
            </div>

            {/* Metric Value: ETB 62,500 */}
            <div className="mt-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                ETB {(totalMonthlyRent > 0 ? totalMonthlyRent : 62500).toLocaleString()}
              </span>
            </div>

            {/* Sparkline Chart */}
            <div className="h-10 w-full mt-2 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 200 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="rentSparklineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 32 Q 50 28 100 24 T 195 8 L 195 40 L 0 40 Z"
                  fill="url(#rentSparklineGrad)"
                />
                <path
                  d="M 0 32 Q 50 28 100 24 T 195 8"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="195" cy="8" r="3.5" fill="#059669" />
              </svg>
            </div>
          </div>

          {/* Footer: YoY Growth Badge & Avg/unit */}
          <div className="mt-4 flex items-center justify-between pt-1">
            <div className="bg-emerald-50 border border-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-bold leading-tight">
              <div>+8.4% YoY</div>
              <div className="font-semibold text-[10px]">Growth</div>
            </div>
            <div className="text-right text-[11px] text-slate-500 font-medium leading-tight">
              <div>Avg ETB</div>
              <div className="font-semibold text-slate-700">20.8k/unit</div>
            </div>
          </div>
        </div>

        {/* Card 3: Collection Velocity (Pixel-perfect match to uploaded design) */}
        <div
          onClick={() => onNavigate?.("payments")}
          className="bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer p-5 flex flex-col justify-between"
        >
          <div>
            {/* Header: Title on Left, Donut Gauge on Right */}
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-tight">
                <div>COLLECTION</div>
                <div>VELOCITY</div>
              </div>
              {/* 84% Donut Gauge */}
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="3.5"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="3.5"
                    strokeDasharray="87.96"
                    strokeDashoffset="14.07"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-[10px] font-bold text-slate-700">
                  84%
                </span>
              </div>
            </div>

            {/* Metric Value: 84.0% & On-Time Badge */}
            <div className="mt-1 flex items-center gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                84.0%
              </span>
              <div className="bg-sky-50 border border-sky-100 text-sky-700 px-1.5 py-0.5 rounded text-[10px] font-bold leading-tight text-center">
                <div>On-</div>
                <div>Time</div>
              </div>
            </div>

            {/* Split Progress Bar (Green 84%, Amber 16%) */}
            <div className="mt-4">
              <div className="h-2 w-full flex rounded-full overflow-hidden">
                <div className="bg-[#059669] w-[84%]" />
                <div className="bg-amber-400 w-[16%]" />
              </div>
            </div>
          </div>

          {/* Footer: Settled vs Pending */}
          <div className="mt-4 flex items-center justify-between pt-1 text-xs">
            <div className="leading-tight">
              <div className="font-bold text-slate-800 text-[11px]">ETB 50,000</div>
              <div className="text-slate-400 text-[11px] font-medium">Settled</div>
            </div>
            <div className="text-right leading-tight">
              <div className="font-bold text-amber-600 text-[11px]">ETB 12.5k</div>
              <div className="text-slate-400 text-[11px] font-medium">Pending</div>
            </div>
          </div>
        </div>

        {/* Card 4: Next Payment Due (Pixel-perfect match to uploaded design) */}
        <div
          onClick={() => onNavigate?.("payments")}
          className="bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer p-5 flex flex-col justify-between"
        >
          <div>
            {/* Header: Title on Left, Amber Calendar Icon on Right */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Next Payment Due
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50/80 border border-amber-100/70 flex items-center justify-center text-amber-500 shadow-2xs">
                <Calendar className="w-4 h-4 text-amber-500 stroke-[1.8]" />
              </div>
            </div>

            {/* Metric Value: Oct 15 & Overdue Badge */}
            <div className="mt-2 flex items-center justify-between">
              <div className="leading-tight">
                <div className="text-2xl font-black text-slate-900 leading-none">Oct</div>
                <div className="text-2xl font-black text-slate-900 leading-none mt-1">15</div>
              </div>
              <div className="border border-amber-200/80 bg-amber-50/50 text-amber-700 px-2 py-1 rounded-lg text-[10px] font-bold leading-tight text-center">
                <div>Overdue -</div>
                <div>3d</div>
              </div>
            </div>

            {/* Billing Cycles Row & 5-Segment Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-400 text-[11px]">Billing Cycles (H2)</span>
                <span className="font-bold text-amber-600 text-[11px]">Cycle 5 Overdue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 flex-1 rounded-sm bg-[#059669]" />
                <div className="h-2 flex-1 rounded-sm bg-[#059669]" />
                <div className="h-2 flex-1 rounded-sm bg-[#059669]" />
                <div className="h-2 flex-1 rounded-sm bg-[#059669]" />
                <div className="h-2 flex-1 rounded-sm bg-amber-500" />
              </div>
            </div>
          </div>

          {/* Footer: Property Address & Amount */}
          <div className="mt-4 flex items-center justify-between pt-1 text-xs">
            <span className="font-semibold text-slate-700 text-[11px]">Bole Ring Rd 4B</span>
            <span className="font-extrabold text-slate-900 text-xs">ETB 12,500</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Rent Trends Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Rent Trends Chart (2 cols) */}
        <Card className="lg:col-span-2 bg-white border-slate-200 shadow-clean">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Monthly Rent Trends</CardTitle>
              <p className="text-xs text-slate-500">Aggregated revenue from verified leases</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setTrendYear("this")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  trendYear === "this" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                }`}
              >
                This Year
              </button>
              <button
                onClick={() => setTrendYear("last")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  trendYear === "last" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                }`}
              >
                Last Year
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Interactive SVG Chart */}
            <div className="h-56 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="rentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00450d" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#00450d" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="40" x2="600" y2="40" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="0" y1="160" x2="600" y2="160" stroke="#f1f5f9" strokeDasharray="3 3" />

                {/* Area Fill */}
                <path
                  d={`M 0 190 ${currentChartData
                    .map((d, i) => {
                      const x = (i / (currentChartData.length - 1)) * 600;
                      const y = 190 - (d.amount / maxChartAmount) * 160;
                      return `L ${x} ${y}`;
                    })
                    .join(" ")} L 600 190 Z`}
                  fill="url(#rentGradient)"
                />

                {/* Stroke Line */}
                <path
                  d={`M 0 ${190 - (currentChartData[0].amount / maxChartAmount) * 160} ${currentChartData
                    .map((d, i) => {
                      const x = (i / (currentChartData.length - 1)) * 600;
                      const y = 190 - (d.amount / maxChartAmount) * 160;
                      return `L ${x} ${y}`;
                    })
                    .join(" ")}`}
                  fill="none"
                  stroke="#00450d"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive Points */}
                {currentChartData.map((d, i) => {
                  const x = (i / (currentChartData.length - 1)) * 600;
                  const y = 190 - (d.amount / maxChartAmount) * 160;
                  return (
                    <circle
                      key={d.month}
                      cx={x}
                      cy={y}
                      r="4"
                      className="fill-white stroke-[#00450d] stroke-2 hover:r-6 hover:fill-[#00450d] transition-all cursor-pointer"
                      onMouseEnter={() => setHoveredMonth(d)}
                      onMouseLeave={() => setHoveredMonth(null)}
                    />
                  );
                })}
              </svg>

              {/* Month Labels */}
              <div className="flex justify-between text-xs text-slate-400 font-medium mt-2 px-1">
                {currentChartData.map((d) => (
                  <span key={d.month}>{d.month}</span>
                ))}
              </div>

              {/* Tooltip Overlay */}
              {hoveredMonth && (
                <div className="absolute top-2 right-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs shadow-md animate-in fade-in">
                  <span className="font-semibold">{hoveredMonth.month}:</span> ETB {hoveredMonth.amount.toLocaleString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity List */}
        <Card className="bg-white border-slate-200 shadow-clean">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-900">Recent Activity</CardTitle>
            <p className="text-xs text-slate-500">Latest events on your portal</p>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-3">
              {notifications.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => item.linkPage && onNavigate(item.linkPage)}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="mt-0.5 shrink-0">
                    {item.type === "payment" && (
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                    {item.type === "agreement" && (
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                    )}
                    {item.type === "maintenance" && (
                      <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{item.description}</p>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {item.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
