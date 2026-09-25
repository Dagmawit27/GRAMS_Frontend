"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TaxOfficerLayout } from "../layout-tax";
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  FileText,
  Clock,
  Send,
  Eye,
  Building,
  RotateCcw,
  Check,
  ChevronDown,
  Layers,
  ArrowUpDown,
  Download,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  Printer
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const TaxAuditSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-100">
      {/* Top Banner Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex items-center gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-2xs space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Cases List Skeleton */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((j) => (
          <div key={j} className="p-4 border border-slate-100 rounded-xl flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-4 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-64" />
              <Skeleton className="h-3 w-36" />
            </div>
            <div className="flex items-center gap-4">
              <div className="space-y-1 text-right">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface AuditCase {
  id: string;
  name: string;
  property: string;
  tin: string;
  woreda: string;
  discrepancyType: string;
  typeSeverity: "critical" | "high" | "medium";
  declaredRent: string;
  actualBenchmark: string;
  benchmarkSource: string;
  taxGap: string;
  penaltyAccrued: string;
  status: "Open Investigation" | "Demand Issued" | "Escalated to Legal" | "Pending Field Audit";
  statusColor: string;
}

const AUDIT_CASES: AuditCase[] = [
  {
    id: "aud-1",
    name: "Alemayehu Tadesse Commercial Properties",
    property: "Bole Medhanealem Mall Complex #4 (6 Floors)",
    tin: "0048192841",
    woreda: "Bole, Woreda 03",
    discrepancyType: "Under-declared rental value",
    typeSeverity: "critical",
    declaredRent: "85,000 ETB/mo",
    actualBenchmark: "240,000 ETB/mo",
    benchmarkSource: "GRAMS Verified Lease",
    taxGap: "651,000 ETB",
    penaltyAccrued: "65,100 ETB",
    status: "Open Investigation",
    statusColor: "bg-red-50 text-red-700 border-red-200"
  },
  {
    id: "aud-2",
    name: "Sara Hailu Real Estate Holdings",
    property: "Kazanchis Commercial Center Bldg B",
    tin: "0019483921",
    woreda: "Kirkos, Woreda 08",
    discrepancyType: "Unregistered tenant sublease",
    typeSeverity: "critical",
    declaredRent: "4 Leases filed",
    actualBenchmark: "9 Subleases identified",
    benchmarkSource: "Bank Flow Cross-Check",
    taxGap: "418,200 ETB",
    penaltyAccrued: "41,820 ETB",
    status: "Demand Issued",
    statusColor: "bg-amber-50 text-amber-800 border-amber-200"
  },
  {
    id: "aud-3",
    name: "Yonas Kebede & Partners",
    property: "Hayahulet Multi-tenant Warehouse 12",
    tin: "0092837411",
    woreda: "Yeka, Woreda 11",
    discrepancyType: "Under-declared rental value",
    typeSeverity: "high",
    declaredRent: "40,000 ETB/mo",
    actualBenchmark: "135,000 ETB/mo",
    benchmarkSource: "CBE Transaction Audit",
    taxGap: "399,000 ETB",
    penaltyAccrued: "39,900 ETB",
    status: "Open Investigation",
    statusColor: "bg-red-50 text-red-700 border-red-200"
  },
  {
    id: "aud-4",
    name: "Mesfin Wolde Giorgis",
    property: "Piazza Heritage Commercial Villa",
    tin: "INVALID TIN",
    woreda: "Arada, Woreda 02",
    discrepancyType: "Missing TIN / Shadow Rental",
    typeSeverity: "critical",
    declaredRent: "Direct Cash (0 ETB)",
    actualBenchmark: "65,000 ETB/mo",
    benchmarkSource: "Tenant Self-Report Form",
    taxGap: "210,000 ETB",
    penaltyAccrued: "52,500 ETB",
    status: "Escalated to Legal",
    statusColor: "bg-purple-50 text-purple-700 border-purple-200"
  },
  {
    id: "aud-5",
    name: "Bethel Multi-Service Complex Ltd",
    property: "Lideta Condominium Commercial Strip 04",
    tin: "0073619283",
    woreda: "Lideta, Woreda 05",
    discrepancyType: "Under-declared rental value",
    typeSeverity: "medium",
    declaredRent: "18,000 ETB/mo",
    actualBenchmark: "55,000 ETB/mo",
    benchmarkSource: "Woreda Municipal Inspection",
    taxGap: "155,400 ETB",
    penaltyAccrued: "15,540 ETB",
    status: "Pending Field Audit",
    statusColor: "bg-blue-50 text-blue-700 border-blue-200"
  },
];

export default function TaxDiscrepanciesPage() {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCase, setSelectedCase] = useState<AuditCase | null>(null);
  const [filterSeverity, setFilterSeverity] = useState("all");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filtered = AUDIT_CASES.filter((c) => {
    if (filterSeverity !== "all" && c.typeSeverity !== filterSeverity) return false;
    if (
      searchTerm &&
      !c.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !c.tin.includes(searchTerm) &&
      !c.woreda.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const [isReady, setIsReady] = useState(false);
  React.useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <TaxOfficerLayout activeNav="tax-discrepancies">
        <TaxAuditSkeleton />
      </TaxOfficerLayout>
    );
  }

  return (
    <TaxOfficerLayout activeNav="tax-discrepancies">
      <div className="space-y-6">
        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-[#00450d] rounded-lg text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-slate-500 hover:text-slate-800">
              Dismiss
            </button>
          </div>
        )}

        {/* HEADER & TOP BANNER */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold text-red-600 tracking-wider uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Discrepancy Identification & Audit Enforcement</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              Active Audit & Discrepancies Queue
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
              Live algorithmic matching between Land Registry deeds, CBE banking receipts, Telebirr digital remittances, and filed Schedule 'B' returns.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-left">
              <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                Total Revenue at Risk
              </div>
              <div className="text-base font-black text-red-700 font-mono">
                28.4M ETB
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 text-left shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Pending Cases
              </div>
              <div className="text-base font-black text-slate-900">
                642 Files
              </div>
            </div>
          </div>
        </div>

        {/* FILTER & SEARCH BAR */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search audit queue by entity name, TIN, or property..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-600 focus:bg-white"
              />
            </div>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">All Discrepancy Severities</option>
              <option value="critical">Critical (&gt; 300,000 ETB Gap)</option>
              <option value="high">High (100k - 300k ETB)</option>
              <option value="medium">Medium (&lt; 100k ETB)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast("Batch demand letters queued for all 642 accounts.")}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold shadow-2xs transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Issue All Demand Notices</span>
            </button>
            <button
              onClick={() => showToast("Exporting audit discrepancy register to CSV...")}
              className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"
              title="Export Discrepancies"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AUDIT TABLE */}
        <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/90 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Entity & Property</th>
                  <th className="py-3 px-4">TIN & Location</th>
                  <th className="py-3 px-4">Discrepancy Nature</th>
                  <th className="py-3 px-4">Declared vs. Benchmark</th>
                  <th className="py-3 px-4">Assessed Gap & Penalty</th>
                  <th className="py-3 px-4">Enforcement Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500">{item.property}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-semibold text-slate-800">{item.tin}</div>
                      <div className="text-[11px] text-slate-500">{item.woreda}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold">
                        <AlertCircle className="w-3 h-3" />
                        <span>{item.discrepancyType}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-700 font-semibold">{item.declaredRent}</div>
                      <div className="text-[11px] text-red-600 font-bold">
                        {item.actualBenchmark}{" "}
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({item.benchmarkSource})
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-red-600 font-mono">{item.taxGap}</div>
                      <div className="text-[10px] text-slate-500">
                        + {item.penaltyAccrued} (Penalties)
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold ${item.statusColor}`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedCase(item);
                          }}
                          className="px-2.5 py-1.5 bg-[#00450d] hover:bg-[#07390e] text-white rounded-md text-xs font-semibold shadow-2xs transition-colors"
                        >
                          Audit Case
                        </button>
                        <button
                          onClick={() => showToast(`Enforcement demand letter dispatched to ${item.name}`)}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-xs font-semibold shadow-2xs transition-colors"
                        >
                          Dispatch
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AUDIT CASE DETAIL MODAL */}
        {selectedCase && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Audit Case File • Ref: AUD-{selectedCase.tin}
                  </h3>
                </div>
                <button onClick={() => setSelectedCase(null)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900 text-sm">{selectedCase.name}</div>
                  <div className="text-slate-600">{selectedCase.property}</div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    TIN: {selectedCase.tin} • Jurisdiction: {selectedCase.woreda}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-red-50/50 border border-red-200 rounded-lg">
                    <div className="text-[10px] uppercase font-bold text-red-700">Tax Gap Liability</div>
                    <div className="text-xl font-black text-red-700 font-mono mt-0.5">{selectedCase.taxGap}</div>
                    <div className="text-[10px] text-slate-500">Excludes court charges</div>
                  </div>

                  <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
                    <div className="text-[10px] uppercase font-bold text-amber-800">Statutory Penalty (Art. 134)</div>
                    <div className="text-xl font-black text-amber-900 font-mono mt-0.5">{selectedCase.penaltyAccrued}</div>
                    <div className="text-[10px] text-slate-500">10% Late fine + interest</div>
                  </div>
                </div>

                <div className="space-y-1 text-slate-600">
                  <div className="font-semibold text-slate-800">Evidence Summary:</div>
                  <p className="leading-relaxed text-slate-600">
                    Comparison between reported return and independent cross-verification ({selectedCase.benchmarkSource}) indicates an unmitigated disparity of {selectedCase.declaredRent} reported against {selectedCase.actualBenchmark} evidenced.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedCase(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    showToast(`Formal 14-Day Statutory Summons drafted and filed for ${selectedCase.name}`);
                    setSelectedCase(null);
                  }}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Issue 14-Day Legal Summons
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TaxOfficerLayout>
  );
}
