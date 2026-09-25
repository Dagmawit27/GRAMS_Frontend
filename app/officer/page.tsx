"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginOfficer, getSession } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const OFFICER_ROLES = ["WOREDA_OFFICER", "WOREDA_SUPERVISOR", "TAX_OFFICER", "CITY_ADMINISTRATOR", "CITY_ADMIN"];

function isOfficerSession(): boolean {
  if (typeof window === "undefined") return false;
  const session = getSession();
  if (!session) return false;
  const roles = (session.user.roles ?? []).map((r) => r.toUpperCase());
  return roles.some((r) => OFFICER_ROLES.includes(r));
}

export const OfficerPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  // If already logged in as an officer, redirect to the right dashboard
  useEffect(() => {
    if (typeof window === "undefined") return;
    const role = (localStorage.getItem("userRole") ?? "").toLowerCase();
    const token = localStorage.getItem("accessToken");
    if (!token) { setChecking(false); return; }
    if (role === "city_administrator") { router.replace("/officer/city/dashboard"); return; }
    if (role === "woreda_officer") { router.replace("/officer/office/dashboard"); return; }
    if (role === "woreda_supervisor") { router.replace("/officer/supervisor/dashboard"); return; }
    if (role === "tax_officer") { router.replace("/officer/taxOfficer/dashboard"); return; }
    setChecking(false);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const result = await loginOfficer({ email: email.trim(), password });
      // Role is already saved in localStorage by loginOfficer → saveSession
      const role = (result.user.roles?.[0] ?? "").toLowerCase();
      if (role === "city_administrator") {
        router.push("/officer/city/dashboard");
      } else if (role === "woreda_supervisor") {
        router.push("/officer/supervisor/dashboard");
      } else if (role === "tax_officer") {
        router.push("/officer/taxOfficer/dashboard");
      } else {
        router.push("/officer/office/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#07130c] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07130c] text-white flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
      {/* Background */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none opacity-20 scale-105"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80')` }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/80 via-black/60 to-[#050b07] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md my-8">
        <div className="bg-white rounded-3xl shadow-2xl p-7 sm:p-9 text-slate-900 border border-slate-200">
          {/* Header */}
          <div className="text-center mb-7 space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#00450d] flex items-center justify-center shadow-lg shadow-emerald-950/30 border border-emerald-500/30">
              <ShieldCheck className="w-8 h-8 text-emerald-300" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Officer Administration Portal
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@subcity.gov.et"
                  className="pl-9 h-11 text-xs bg-slate-50 border-slate-200 focus:bg-white"
                  required
                  autoComplete="email"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 h-11 text-xs bg-slate-50 border-slate-200 font-mono focus:bg-white"
                  required
                  autoComplete="current-password"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-[#00450d] hover:bg-[#164e23] text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 mt-1"
            >
              {isLoading ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Verifying credentials...</>
              ) : (
                <><span>Sign In to Officer Portal</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-2">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Quick Role Sign-In
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setEmail("cityadmin@gmail.com");
                  setPassword("12345678");
                }}
                className="text-[11px] px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md border border-emerald-800 font-semibold cursor-pointer shadow-xs"
              >
                City Admin (cityadmin@gmail.com)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("taxOfficer@gmail.com");
                  setPassword("12345678");
                }}
                className="text-[11px] px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-md border border-emerald-300 font-medium cursor-pointer"
              >
                Tax Officer
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("officer03@gmail.com");
                  setPassword("12345678");
                }}
                className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300 font-medium cursor-pointer"
              >
                Woreda Officer
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("supervisor03@gmail.com");
                  setPassword("12345678");
                }}
                className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300 font-medium cursor-pointer"
              >
                Supervisor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerPage;
