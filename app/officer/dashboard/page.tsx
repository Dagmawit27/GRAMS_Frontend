"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ClipboardCheck, CheckCircle, Building2,
  ListChecks, XCircle, Home, TrendingUp,
} from "lucide-react"
import { getSession, getPropertiesByStatus, type PropertyResponse } from "@/lib/api"
import type { UserSummary } from "@/lib/api"
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"


// ── constants ──────────────────────────────────────────────────────────────

const ALL_STATUSES = ["PENDING", "VERIFIED", "LISTED", "REJECTED", "RENTED", "UNLISTED"] as const

const STATUS_META: Record<string, { label: string; color: string; hex: string; icon: React.ReactNode }> = {
  PENDING:  { label: "Pending",  color: "text-amber-600",  hex: "#f59e0b", icon: <ClipboardCheck className="h-4 w-4" /> },
  VERIFIED: { label: "Verified", color: "text-blue-600",   hex: "#3b82f6", icon: <CheckCircle    className="h-4 w-4" /> },
  LISTED:   { label: "Listed",   color: "text-emerald-600",hex: "#10b981", icon: <ListChecks     className="h-4 w-4" /> },
  REJECTED: { label: "Rejected", color: "text-red-500",    hex: "#ef4444", icon: <XCircle        className="h-4 w-4" /> },
  RENTED:   { label: "Rented",   color: "text-purple-600", hex: "#a855f7", icon: <Home           className="h-4 w-4" /> },
  UNLISTED: { label: "Unlisted", color: "text-slate-500",  hex: "#94a3b8", icon: <Building2      className="h-4 w-4" /> },
}

// ── helpers ────────────────────────────────────────────────────────────────

function computeStats(all: PropertyResponse[]) {
  const counts: Record<string, number> = {}
  const typeMap: Record<string, number> = {}
  for (const p of all) {
    counts[p.status] = (counts[p.status] ?? 0) + 1
    typeMap[p.propertyType] = (typeMap[p.propertyType] ?? 0) + 1
  }
  const byType = Object.entries(typeMap)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
  return { counts, byType, total: all.length }
}

// ── sub-components ─────────────────────────────────────────────────────────

function StatCard({
  status, value, loading,
}: { status: string; value: number; loading: boolean }) {
  const meta = STATUS_META[status]
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-4">
        <div className={`flex items-center justify-between mb-3 ${meta.color}`}>
          {meta.icon}
          <TrendingUp className="h-3.5 w-3.5 opacity-40" />
        </div>
        {loading
          ? <Skeleton className="h-8 w-16 mb-1" />
          : <p className="text-3xl font-bold tracking-tight">{value}</p>
        }
        <p className="text-xs text-muted-foreground font-medium mt-0.5">{meta.label}</p>
      </CardContent>
    </Card>
  )
}

function ChartSkeleton() {
  return (
    <div className="space-y-2 pt-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-[180px] w-full rounded-lg" />
    </div>
  )
}

// ── Native SVG bar chart ───────────────────────────────────────────────────

function BarChartSVG({ data }: { data: { type: string; count: number }[] }) {
  const W = 480, H = 180, PL = 28, PB = 28, PT = 8, PR = 8
  const chartW = W - PL - PR
  const chartH = H - PB - PT
  const max = Math.max(...data.map(d => d.count), 1)
  const barW = Math.min(48, (chartW / data.length) - 8)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
      {/* y gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map(f => {
        const y = PT + chartH * (1 - f)
        return (
          <g key={f}>
            <line x1={PL} x2={W - PR} y1={y} y2={y} stroke="#e2e8f0" strokeWidth={1} />
            <text x={PL - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#94a3b8">
              {Math.round(max * f)}
            </text>
          </g>
        )
      })}
      {/* bars */}
      {data.map((d, i) => {
        const slotW = chartW / data.length
        const x = PL + slotW * i + slotW / 2 - barW / 2
        const barH = (d.count / max) * chartH
        const y = PT + chartH - barH
        return (
          <g key={d.type}>
            <rect x={x} y={y} width={barW} height={barH} rx={4} fill="#3b82f6" />
            <text
              x={x + barW / 2} y={H - PB + 14}
              textAnchor="middle" fontSize={9} fill="#64748b"
            >
              {d.type.length > 8 ? d.type.slice(0, 7) + "…" : d.type}
            </text>
            <text x={x + barW / 2} y={y - 3} textAnchor="middle" fontSize={9} fill="#3b82f6" fontWeight="600">
              {d.count}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Native SVG donut chart ─────────────────────────────────────────────────

function DonutChartSVG({ data }: { data: { name: string; value: number }[] }) {
  const SIZE = 200, cx = 100, cy = 90, R = 65, r = 35
  const total = data.reduce((s, d) => s + d.value, 0) || 1

  let angle = -Math.PI / 2
  const slices = data.map(d => {
    const sweep = (d.value / total) * 2 * Math.PI
    const start = angle
    angle += sweep
    return { ...d, start, sweep }
  })

  function arc(start: number, sweep: number, outer: number, inner: number) {
    const x1 = cx + outer * Math.cos(start)
    const y1 = cy + outer * Math.sin(start)
    const x2 = cx + outer * Math.cos(start + sweep)
    const y2 = cy + outer * Math.sin(start + sweep)
    const ix1 = cx + inner * Math.cos(start + sweep)
    const iy1 = cy + inner * Math.sin(start + sweep)
    const ix2 = cx + inner * Math.cos(start)
    const iy2 = cy + inner * Math.sin(start)
    const large = sweep > Math.PI ? 1 : 0
    return `M${x1},${y1} A${outer},${outer},0,${large},1,${x2},${y2} L${ix1},${iy1} A${inner},${inner},0,${large},0,${ix2},${iy2} Z`
  }

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full" style={{ height: SIZE }}>
      {slices.map(s => (
        <path
          key={s.name}
          d={arc(s.start, s.sweep, R, r)}
          fill={STATUS_META[s.name]?.hex ?? "#94a3b8"}
        />
      ))}
      {/* center total */}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={11} fill="#64748b">Total</text>
      <text x={cx} y={cy + 11} textAnchor="middle" fontSize={16} fontWeight="700" fill="#1e293b">{total}</text>
      {/* legend */}
      {slices.map((s, i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        const lx = col === 0 ? 8 : SIZE / 2 + 4
        const ly = 175 + row * 14
        return (
          <g key={s.name}>
            <rect x={lx} y={ly - 7} width={8} height={8} rx={2} fill={STATUS_META[s.name]?.hex ?? "#94a3b8"} />
            <text x={lx + 11} y={ly} fontSize={9} fill="#64748b">
              {STATUS_META[s.name]?.label ?? s.name} ({s.value})
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── page ───────────────────────────────────────────────────────────────────

export default function OfficerDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserSummary | null>(null)
  const [stats, setStats] = useState<ReturnType<typeof computeStats> | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStats = async (token: string) => {
    setLoading(true)
    try {
      const results = await Promise.allSettled(
        ALL_STATUSES.map((s) => getPropertiesByStatus(s, token))
      )
      const all: PropertyResponse[] = []
      for (const r of results) {
        if (r.status === "fulfilled") all.push(...r.value)
      }
      setStats(computeStats(all))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const session = getSession()
    if (!session || session.user.userType !== "GOVERNMENT_EMPLOYEE") {
      router.push("/officer/login")
      return
    }
    setUser(session.user)
    loadStats(session.token)
  }, [router])

  if (!user) return (
    <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
      Loading...
    </div>
  )

  const role = user.roles?.[0] ?? ""
  const isOfficer = role === "WOREDA_OFFICER"
  const isSupervisor = role === "WOREDA_SUPERVISOR"
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()

  const pieData = stats
    ? Object.entries(stats.counts).map(([name, value]) => ({ name, value }))
    : []

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">

      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background px-4 shadow-sm">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <span className="text-sm font-medium text-muted-foreground hidden sm:block">
          Federal Democratic Republic of Ethiopia — GRAMS
        </span>
        <div className="ml-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold ring-2 ring-blue-200">
            {initials}
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{role.replace(/_/g, " ")}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full">

        {/* Page title */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Welcome back, {user.firstName}. Here&apos;s an overview of all properties.
            </p>
          </div>
          {stats && (
            <div className="text-right hidden sm:block">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total properties</p>
            </div>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {ALL_STATUSES.map((s) => (
            <StatCard
              key={s}
              status={s}
              value={stats?.counts[s] ?? 0}
              loading={loading}
            />
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Bar chart — wider */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-semibold">Properties by Type</CardTitle>
              <CardDescription className="text-xs">Volume per property category</CardDescription>
            </CardHeader>
            <CardContent className="pt-3">
              {loading ? <ChartSkeleton /> : stats?.byType.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">No data yet.</div>
              ) : (
                <BarChartSVG data={stats!.byType} />
              )}
            </CardContent>
          </Card>

          {/* Pie chart — narrower */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-semibold">Status Distribution</CardTitle>
              <CardDescription className="text-xs">Share of each status</CardDescription>
            </CardHeader>
            <CardContent className="pt-3">
              {loading ? <ChartSkeleton /> : pieData.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">No data yet.</div>
              ) : (
                <DonutChartSVG data={pieData} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {(isOfficer || !isSupervisor) && (
              <Link href="/officer/dashboard/review" className="group">
                <Card className="h-full border-l-4 border-l-blue-500 hover:shadow-md transition-all group-hover:-translate-y-0.5">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        <ClipboardCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">Review Queue</CardTitle>
                        {!loading && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {stats?.counts["PENDING"] ?? 0} pending
                          </p>
                        )}
                      </div>
                    </div>
                    <CardDescription className="text-xs mt-2">
                      Review PENDING properties and forward verified ones to the supervisor.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )}

            {(isSupervisor || !isOfficer) && (
              <Link href="/officer/dashboard/supervisor" className="group">
                <Card className="h-full border-l-4 border-l-emerald-500 hover:shadow-md transition-all group-hover:-translate-y-0.5">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">Supervisor Queue</CardTitle>
                        {!loading && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {stats?.counts["VERIFIED"] ?? 0} awaiting approval
                          </p>
                        )}
                      </div>
                    </div>
                    <CardDescription className="text-xs mt-2">
                      Approve or suspend VERIFIED properties. Approved ones become publicly LISTED.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )}

            <Card className="h-full border-l-4 border-l-slate-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-50 text-slate-500">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Listed Properties</CardTitle>
                    {!loading && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {stats?.counts["LISTED"] ?? 0} active
                      </p>
                    )}
                  </div>
                </div>
                <CardDescription className="text-xs mt-2">
                  Browse all currently active listed rental properties.
                </CardDescription>
              </CardHeader>
            </Card>

          </div>
        </div>

      </main>
    </div>
  )
}
