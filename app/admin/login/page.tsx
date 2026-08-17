"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { saveSession, type AuthResult } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api/v1";

const MOCK_ADMIN_AUTH: AuthResult = {
  accessToken: "admin-demo-token",
  tokenType: "Bearer",
  expiresIn: 86400,
  user: {
    id: "admin-01",
    firstName: "System",
    lastName: "Admin",
    gender: "OTHER",
    phoneNumber: "+251900000000",
    email: "admin@grams.gov.et",
    createdAt: new Date().toISOString(),
    roles: ["SYSTEM_ADMINISTRATOR"],
    userType: "GOVERNMENT_EMPLOYEE",
    governmentEmployee: true,
    employeeNumber: "EMP-ADMIN-001",
    positionTitle: "System Administrator",
  },
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ loginIdentifier: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.loginIdentifier.trim()) e.loginIdentifier = "Admin Email or Username is required.";
    if (!form.password) e.password = "Password is required.";
    return e;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/login/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Fallback for dev / demo admin login
        if (form.loginIdentifier === "admin" && form.password === "admin") {
          saveSession(MOCK_ADMIN_AUTH);
          router.push("/admin/dashboard");
          return;
        }
        throw new Error(data.message || "Invalid administrator credentials.");
      }

      saveSession(data);
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      // Allow fallback login for demo if offline
      if (form.loginIdentifier === "admin" && form.password === "admin") {
        saveSession(MOCK_ADMIN_AUTH);
        router.push("/admin/dashboard");
        return;
      }
      setServerError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-700 to-teal-800 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">System Admin Access</h1>
            <p className="text-emerald-100 text-sm mt-1">GRAMS Central Governance & Control</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="px-8 py-8 space-y-5">
            {serverError && (
              <div className="bg-red-950/70 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg">
                {serverError}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">
                Admin Identifier <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                name="loginIdentifier"
                value={form.loginIdentifier}
                onChange={handleChange}
                placeholder="admin or admin@grams.gov.et"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm text-white bg-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                  errors.loginIdentifier ? "border-red-500" : "border-slate-700"
                }`}
              />
              {errors.loginIdentifier && (
                <p className="text-xs text-red-400">{errors.loginIdentifier}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">
                Password <span className="text-emerald-400">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm text-white bg-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                  errors.password ? "border-red-500" : "border-slate-700"
                }`}
              />
              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-widest uppercase rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? "Authenticating..." : "Admin Sign In"}
              </button>

              <p className="text-center text-sm text-slate-400 mt-4">
                Return to{" "}
                <Link href="/" className="text-emerald-400 hover:underline">
                  Home Portal
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
