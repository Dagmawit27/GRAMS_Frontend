"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Building2, CreditCard, UserCircle } from "lucide-react"
import { getSession } from "@/lib/api"
import type { UserSummary } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
} from "recharts"

// ── Data ─────────────────────────────────────────────────────────────────────

const monthlyData = [
  { month: "Jan", agreements: 1, payments: 0 },
  { month: "Feb", agreements: 1, payments: 1 },
  { month: "Mar", agreements: 2, payments: 1 },
  { month: "Apr", agreements: 2, payments: 2 },
  { month: "May", agreements: 3, payments: 2 },
  { month: "Jun", agreements: 3, payments: 3 },
  { month: "Jul", agreements: 4, payments: 3 },
  { month: "Aug", agreements: 4, payments: 4 },
]

const paymentData = [
  { status: "Paid", count: 4 },
  { status: "Pending", count: 2 },
  { status: "Overdue", count: 1 },
]

const areaConfig: ChartConfig = {
  agreements: { label: "Agreements", color: "#16a34a" },
  payments:   { label: "Payments",   color: "#3b82f6" },
}

const barConfig: ChartConfig = {
  count: { label: "Count", color: "#16a34a" },
}

const statCards = [
  { title: "Active Agreements", value: "3",   sub: "2 pending review",  icon: FileText,   color: "text-green-600",  bg: "bg-green-50",  border: "border-green-100",  bar: "bg-green-500",  barW: "w-3/4" },
  { title: "Properties Viewed", value: "12",  sub: "4 saved",           icon: Building2,  color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-100",   bar: "bg-blue-500",   barW: "w-2/3" },
  { title: "Payments Made",     value: "4",   sub: "1 pending",         icon: CreditCard, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", bar: "bg-purple-500", barW: "w-1/2" },
  { title: "Profile Complete",  value: "85%", sub: "2 fields missing",  icon: UserCircle, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100", bar: "bg-orange-500", barW: "w-5/6" },
]

const quickActions = [
  { icon: FileText,   label: "Rental Agreements", desc: "View & manage contracts",   href: "/citizen/dashboard/agreements", color: "text-green-600",  bg: "bg-green-50",  hoverBorder: "hover:border-green-300"  },
  { icon: Building2,  label: "Properties",         desc: "Browse available rentals", href: "/citizen/dashboard/properties", color: "text-blue-600",   bg: "bg-blue-50",   hoverBorder: "hover:border-blue-300"   },
  { icon: CreditCard, label: "Payments",           desc: "Track dues & history",     href: "/citizen/dashboard/payments",   color: "text-purple-600", bg: "bg-purple-50", hoverBorder: "hover:border-purple-300" },
  { icon: UserCircle, label: "My Profile",         desc: "Update your information",  href: "/citizen/dashboard/profile",    color: "text-orange-600", bg: "bg-orange-50", hoverBorder: "hover:border-orange-300" },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CitizenDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserSummary | null>(null)

  useEffect(() => {
    const session = getSession()
    if (!session) { router.push("/citizen/login"); return }
    if (session.user.userType !== "CITIZEN") { router.push("/citizen/login"); return }
    setUser(session.user)
  }, [router])

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto w-full">

      {/* Welcome */}
      <div>
        <h1 className="text-xl font-semibold text-gray-800">
          Welcome, {user.firstName} {user.lastName} 👋
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">Here&apos;s an overview of your rental activity.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.title} className={`border ${s.border} shadow-sm bg-white overflow-hidden rounded-xl`}>
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className={`${s.bg} p-2.5 rounded-xl`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <span className={`text-xs font-semibold ${s.color} ${s.bg} px-2 py-0.5 rounded-full`}>
                  Active
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 leading-none">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.title}</p>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[11px] text-gray-400">{s.sub}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-1.5 ${s.bar} ${s.barW} rounded-full`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Area chart — 2 cols */}
        <Card className="lg:col-span-2 border border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Rental Activity</CardTitle>
            <CardDescription className="text-xs">Agreements &amp; payments over the year</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={areaConfig} className="h-52 w-full">
              <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillAgreements" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillPayments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area type="monotone" dataKey="agreements" stroke="#16a34a" strokeWidth={2} fill="url(#fillAgreements)" dot={{ r: 3 }} />
                <Area type="monotone" dataKey="payments"   stroke="#3b82f6" strokeWidth={2} fill="url(#fillPayments)"   dot={{ r: 3 }} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Bar chart */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Payment Status</CardTitle>
            <CardDescription className="text-xs">Breakdown of your payments</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barConfig} className="h-52 w-full">
              <BarChart data={paymentData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((item) => (
            <a key={item.label} href={item.href} className="group">
              <Card className={`border border-gray-100 shadow-sm bg-white rounded-xl transition-all duration-200 hover:shadow-md ${item.hoverBorder} cursor-pointer`}>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`${item.bg} p-3 rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{item.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-tight">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>

    </div>
  )
}
