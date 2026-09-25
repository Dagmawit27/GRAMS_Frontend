"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home, Building2, FileText, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnauthorizedAccessProps {
  requiredRole: "tenant" | "landlord";
  currentRole?: string;
  path?: string;
}

export const UnauthorizedAccess: React.FC<UnauthorizedAccessProps> = ({
  requiredRole,
  currentRole = "citizen",
  path,
}) => {
  const isLandlordBlocked = requiredRole === "tenant";
  const normalizedCurrent = (currentRole || "citizen").toUpperCase();

  const title = isLandlordBlocked
    ? "Tenant Portal Restriction"
    : "Landlord Portal Restriction";

  const description = isLandlordBlocked
    ? "This page is strictly reserved for Tenant and Dual (Both) accounts. Your account is currently registered as a Landlord, which does not have permission to access house search and tenant lease applications."
    : "This page is strictly reserved for Landlord and Dual (Both) accounts. Your account is currently registered as a Tenant, which does not have permission to manage property registrations, landlord agreements, or municipal tax records.";

  const recommendedRoute = isLandlordBlocked
    ? { href: "/citizen/dashboard/properties", label: "Go to My Properties", icon: Building2 }
    : { href: "/citizen/dashboard/leases", label: "Go to My Lease Requests", icon: FileText };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-red-200/80 shadow-xl shadow-red-500/5 overflow-hidden">
        {/* Top Warning Strip */}
        <div className="h-2 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500" />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header with Icon */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0 shadow-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-red-100/80 text-red-800 text-[11px] font-bold uppercase tracking-wider">
                  403 Forbidden
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                  RBAC Security Guard
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {title}
              </h1>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {description}
          </p>

          {/* Information Diagnostic Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-medium text-slate-500">Your Active Role:</span>
              <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {normalizedCurrent}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-medium text-slate-500">Authorized Roles:</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {isLandlordBlocked ? "TENANT · BOTH" : "LANDLORD · BOTH"}
              </span>
            </div>
            {path && (
              <div className="flex items-center justify-between text-slate-600 truncate">
                <span className="font-medium text-slate-500">Attempted Path:</span>
                <span className="font-mono text-[11px] text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 truncate max-w-[260px]">
                  {path}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] text-slate-500">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                To gain access to both portals, register or switch to a <strong>Both (Dual)</strong> account in your profile.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link href="/citizen/dashboard" className="flex-1">
              <Button
                variant="outline"
                className="w-full h-10 border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Return to Dashboard
              </Button>
            </Link>

            <Link href={recommendedRoute.href} className="flex-1">
              <Button
                className="w-full h-10 bg-[#00450d] hover:bg-[#164e23] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs"
              >
                <recommendedRoute.icon className="w-4 h-4" />
                {recommendedRoute.label}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedAccess;
