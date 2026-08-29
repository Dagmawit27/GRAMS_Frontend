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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Active Agreements */}
        <Card className="bg-white border-slate-200 shadow-clean hover:border-slate-300 transition-all">
          <CardContent className="px-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Active Agreements
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{activeAgreementsCount}</span>
              <Badge variant="active" className="text-[10px]">
                Active
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">Recorded in national registry</p>
          </CardContent>
        </Card>

        {/* Total Monthly Rent */}
        <Card className="bg-white border-slate-200 shadow-clean hover:border-slate-300 transition-all">
          <CardContent className="px-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Monthly Rent
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-bold text-slate-900">
                ETB {totalMonthlyRent.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">Across active tenancies</p>
          </CardContent>
        </Card>

        {/* Next Payment Due */}
        <Card className="bg-white border-slate-200 shadow-clean hover:border-slate-300 transition-all">
          <CardContent className="px-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Next Payment Due
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            {nextDueInvoice ? (
              <>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">
                    {new Date(nextDueInvoice.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <Badge variant={nextDueInvoice.status === "Overdue" ? "pending" : "active"} className="text-[10px]">
                    {nextDueInvoice.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">
                  {nextDueInvoice.propertyTitle || "Property"} • ETB {(nextDueInvoice.totalAmount || 0).toLocaleString()}
                </p>
              </>
            ) : (
              <div className="mt-2.5">
                <span className="text-sm font-medium text-slate-500">No pending invoices</span>
              </div>
            )}
          </CardContent>
        </Card>

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
