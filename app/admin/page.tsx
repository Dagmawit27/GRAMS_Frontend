"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Users,
  UserPlus,
  Lock,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  Trash2,
  ArrowRight,
  Sparkles,
  Briefcase,
  Key,
  Building,
} from "lucide-react";
import { getSession, registerEmployee, RegisterEmployeePayload, getSubCities, SubCityDto } from "@/lib/api";

export type EmployeeRole = "WOREDA_OFFICER" | "WOREDA_SUPERVISOR";

interface RegisteredEmployee {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  role: EmployeeRole;
  employeeNumber: string;
  email: string;
  phone: string;
  subCity: string;
  woreda: string;
  positionTitle: string;
  defaultPassword: string;
  createdAt: string;
}

const SUB_CITIES = [
  "Akaky Kaliti",
  "Addis Ketema",
  "Arada",
  "Bole",
  "Gullele",
  "Kirkos",
  "Kolfe Keranio",
  "Lemi Kura",
  "Lideta",
  "Nifas Silk-Lafto",
  "Yeka",
];

const WOREDA_COUNTS: Record<string, number> = {
  "Akaky Kaliti": 13, "Addis Ketema": 10, "Arada": 8, "Bole": 14,
  "Gullele": 10, "Kirkos": 10, "Kolfe Keranio": 15, "Lemi Kura": 12,
  "Lideta": 10, "Nifas Silk-Lafto": 14, "Yeka": 13,
};

const DEFAULT_PASSWORD = "CityAdmin@2026";

export const AdminPage: React.FC = () => {
  // ── Location data from backend ───────────────────────────────────────────
  const [subCityData, setSubCityData] = useState<SubCityDto[]>([]);

  useEffect(() => {
    getSubCities()
      .then(setSubCityData)
      .catch(() => {/* backend not up yet — selects remain empty */});
  }, []);

  // Derived helpers from backend data
  const subCityNames = subCityData.map((d) => d.subCity);
  const worédaOptionsForCity = (sc: string): string[] =>
    subCityData.find((d) => d.subCity === sc)?.woredas ?? [];
  // ── Form state ───────────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [role, setRole] = useState<EmployeeRole>("WOREDA_OFFICER");
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+2519");
  const [subCity, setSubCity] = useState("Akaky Kaliti");
  const [woreda, setWoreda] = useState("03");
  const [positionTitle, setPositionTitle] = useState("Woreda Housing Verification Officer");
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [successEmployee, setSuccessEmployee] = useState<RegisteredEmployee | null>(null);

  // ── Roster state ─────────────────────────────────────────────────────────
  const [employees, setEmployees] = useState<RegisteredEmployee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [subCityFilter, setSubCityFilter] = useState("all");

  // Load roster from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin_registered_employees");
      if (stored) setEmployees(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const saveRoster = (list: RegisteredEmployee[]) => {
    setEmployees(list);
    try { localStorage.setItem("admin_registered_employees", JSON.stringify(list)); } catch { /* ignore */ }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Auto-generate employee number and email when name / role changes
  useEffect(() => {
    if (firstName) {
      const prefix = role === "WOREDA_SUPERVISOR" ? "ETH-SUP" : "ETH-OFF";
      if (!employeeNumber || employeeNumber.startsWith("ETH-")) {
        setEmployeeNumber(`${prefix}-${Math.floor(100 + Math.random() * 900)}`);
      }
      const slug = firstName.toLowerCase().replace(/[^a-z]/g, "");
      const midSlug = middleName ? `.${middleName.toLowerCase().replace(/[^a-z]/g, "")}` : "";
      const citySlug = subCity.toLowerCase().replace(/[\s-]/g, "");
      setEmail(`${slug}${midSlug}@${citySlug}.gov.et`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstName, middleName, role, subCity]);

  useEffect(() => {
    setPositionTitle(
      role === "WOREDA_SUPERVISOR"
        ? "Woreda Housing Supervisor"
        : "Woreda Housing Verification Officer"
    );
  }, [role]);

  const woredaOptions = worédaOptionsForCity(subCity);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "Required";
    if (!middleName.trim()) e.middleName = "Required";
    if (!lastName.trim()) e.lastName = "Required";
    if (!employeeNumber.trim()) e.employeeNumber = "Required";
    if (!email.trim() || !email.includes("@")) e.email = "Valid email required";
    if (!phone.trim() || phone.replace(/\D/g, "").length < 9) e.phone = "Valid phone required";
    if (!password.trim() || password.length < 6) e.password = "Min 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    const session = getSession();
    if (!session) {
      setSubmitError("Admin session expired. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: RegisterEmployeePayload = {
        employeeNumber: employeeNumber.trim().toUpperCase(),
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        gender,
        phoneNumber: phone.trim().replace(/\s/g, ""),
        email: email.trim().toLowerCase(),
        positionTitle,
        subCity,
        woreda,
        officeType: "WOREDA_OFFICE",
        password,
        roles: [role],
      };

      const result = await registerEmployee(session.token, payload);

      const newEmp: RegisteredEmployee = {
        id: result.user.id,
        firstName,
        middleName,
        lastName,
        role,
        employeeNumber: employeeNumber.toUpperCase(),
        email: email.toLowerCase(),
        phone,
        subCity,
        woreda,
        positionTitle,
        defaultPassword: password,
        createdAt: new Date().toISOString(),
      };

      const updated = [newEmp, ...employees];
      saveRoster(updated);
      setSuccessEmployee(newEmp);
      showToast(`${firstName} ${lastName} registered successfully.`);

      // Reset form
      setFirstName(""); setMiddleName(""); setLastName("");
      setEmployeeNumber(""); setEmail(""); setPhone("+2519");
      setPassword(DEFAULT_PASSWORD); setErrors({});
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Remove ${name} from the roster?`)) return;
    const updated = employees.filter((e) => e.id !== id);
    saveRoster(updated);
    if (successEmployee?.id === id) setSuccessEmployee(null);
    showToast(`${name} removed from roster.`);
  };

  const handleCopy = (emp: RegisteredEmployee) => {
    const text = [
      "GRAMS — Officer Credential Slip",
      `Name: ${emp.firstName} ${emp.middleName} ${emp.lastName}`,
      `Role: ${emp.role === "WOREDA_SUPERVISOR" ? "Woreda Supervisor" : "Woreda Officer"}`,
      `Employee #: ${emp.employeeNumber}`,
      `Email (login): ${emp.email}`,
      `Password: ${emp.defaultPassword}`,
      `Jurisdiction: ${emp.subCity} Sub-City, Woreda ${emp.woreda}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    showToast("Credentials copied to clipboard.");
  };

  const handleFillSample = (r: EmployeeRole) => {
    const isSup = r === "WOREDA_SUPERVISOR";
    const fNames = isSup ? ["Selamawit", "Mulugeta", "Yohannes"] : ["Kassahun", "Bethel", "Natnael"];
    const f = fNames[Math.floor(Math.random() * fNames.length)];
    const m = ["Tesfaye", "Alemu", "Bekele"][Math.floor(Math.random() * 3)];
    const l = ["Desta", "Mamo", "Tadesse"][Math.floor(Math.random() * 3)];
    // Pick a random sub-city from backend data; fall back to first if not loaded yet
    const availableCities = subCityNames.length > 0 ? subCityNames : ["Bole"];
    const sc = availableCities[Math.floor(Math.random() * availableCities.length)];
    const woredas = worédaOptionsForCity(sc);
    const w = woredas.length > 0
      ? woredas[Math.floor(Math.random() * woredas.length)]
      : "01";
    const rand = Math.floor(100 + Math.random() * 900);
    setRole(r);
    setFirstName(f); setMiddleName(m); setLastName(l);
    setGender(Math.random() > 0.5 ? "MALE" : "FEMALE");
    setEmployeeNumber(isSup ? `ETH-SUP-${rand}` : `ETH-OFF-${rand}`);
    setEmail(`${f.toLowerCase()}.${m.toLowerCase()}@${sc.toLowerCase().replace(/[\s-]/g, "")}.gov.et`);
    setPhone(`+25191${Math.floor(1000000 + Math.random() * 9000000)}`);
    setSubCity(sc); setWoreda(w);
    setPassword(DEFAULT_PASSWORD);
    setErrors({});
    showToast(`Sample ${isSup ? "supervisor" : "officer"} loaded.`);
  };

  const filtered = employees.filter((e) => {
    const q = searchQuery.toLowerCase();
    const name = `${e.firstName} ${e.middleName} ${e.lastName} ${e.employeeNumber} ${e.email}`.toLowerCase();
    return (roleFilter === "all" || e.role === roleFilter)
      && (subCityFilter === "all" || e.subCity === subCityFilter)
      && (!q || name.includes(q));
  });

  return (
    <div className="min-h-screen bg-[#f8faf8] p-4 sm:p-6 lg:p-8 font-sans text-slate-900">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#00450d] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#00450d] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#00450d]">Municipal Civil Service Bureau</p>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Woreda Employee Registration Portal</h1>
              <p className="text-xs text-slate-500">Register officers & supervisors with jurisdiction-scoped access to property queues.</p>
            </div>
          </div>
          <div className="flex gap-2 self-start md:self-auto">
            <a href="/officer" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00450d] bg-emerald-50 border border-emerald-300 px-3.5 py-2 rounded-xl hover:bg-emerald-100 transition-all">
              <Users className="w-4 h-4" /> Officer Portal <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition-colors">
              Citizen Home
            </a>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Staff", value: employees.length, sub: "Registered accounts", color: "slate" },
            { label: "Officers", value: employees.filter(e => e.role === "WOREDA_OFFICER").length, sub: "Verification desk", color: "emerald" },
            { label: "Supervisors", value: employees.filter(e => e.role === "WOREDA_SUPERVISOR").length, sub: "Approval desk", color: "amber" },
            { label: "Sub-Cities", value: [...new Set(employees.map(e => e.subCity))].length, sub: "With active staff", color: "blue" },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <p className={`text-2xl font-black mt-0.5 text-${color === "slate" ? "slate-900" : color + "-700"}`}>{value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── Registration Form ── */}
          <div className="lg:col-span-7">
            <Card className="border-slate-200 bg-white shadow-xs rounded-2xl overflow-hidden">
              <CardHeader className="p-5 bg-gradient-to-r from-emerald-950 via-[#00450d] to-emerald-900 text-white flex flex-row items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-emerald-300" />
                    <CardTitle className="text-base font-bold text-white">New Employee Registration</CardTitle>
                  </div>
                  <p className="text-xs text-emerald-200/90 mt-0.5">Creates a backend account and assigns role to the woreda jurisdiction.</p>
                </div>
                <div className="hidden sm:flex gap-1.5">
                  <Button type="button" variant="outline" size="sm" onClick={() => handleFillSample("WOREDA_OFFICER")}
                    className="h-7 text-[11px] bg-white/10 hover:bg-white/20 text-white border-white/20">
                    <Sparkles className="w-3 h-3 mr-1 text-emerald-300" /> Sample Officer
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleFillSample("WOREDA_SUPERVISOR")}
                    className="h-7 text-[11px] bg-white/10 hover:bg-white/20 text-white border-white/20">
                    <Sparkles className="w-3 h-3 mr-1 text-amber-300" /> Sample Supervisor
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-7">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Role */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#00450d]" /> Role <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["WOREDA_OFFICER", "WOREDA_SUPERVISOR"] as EmployeeRole[]).map((r) => {
                        const isSup = r === "WOREDA_SUPERVISOR";
                        return (
                          <label key={r} onClick={() => setRole(r)}
                            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                              role === r
                                ? isSup ? "border-amber-600 bg-amber-50/60" : "border-[#00450d] bg-emerald-50/70"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}>
                            <input type="radio" name="role" value={r} checked={role === r}
                              onChange={() => setRole(r)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#00450d]" />
                            <div>
                              <span className="font-bold text-xs text-slate-900 block">{isSup ? "Woreda Supervisor" : "Woreda Officer"}</span>
                              <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${isSup ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"}`}>{r}</span>
                              <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                                {isSup ? "Final approval, dispute escalations, officer oversight." : "Initial verification of deeds, cadastral UPIs, and leases."}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <label className="text-xs font-bold text-slate-800">Full Name <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "First Name", val: firstName, set: setFirstName, key: "firstName", ph: "e.g. Alemu" },
                        { label: "Father's Name", val: middleName, set: setMiddleName, key: "middleName", ph: "e.g. Kebede" },
                        { label: "Grandfather's Name", val: lastName, set: setLastName, key: "lastName", ph: "e.g. Tadesse" },
                      ].map(({ label, val, set, key, ph }) => (
                        <div key={key}>
                          <p className="text-[11px] text-slate-500 mb-1">{label}</p>
                          <Input value={val} onChange={(e) => { set(e.target.value); setErrors(p => ({ ...p, [key]: "" })); }}
                            placeholder={ph} className={`h-9 text-xs ${errors[key] ? "border-red-400 bg-red-50" : ""}`} />
                          {errors[key] && <p className="text-[11px] text-red-600 mt-0.5">{errors[key]}</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gender & Employee # */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-800 mb-1 block">Gender <span className="text-red-500">*</span></label>
                      <select value={gender} onChange={(e) => setGender(e.target.value as "MALE" | "FEMALE")}
                        className="w-full h-9 text-xs border border-slate-300 rounded-md px-2 bg-white">
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-800 mb-1 block">Employee Number <span className="text-red-500">*</span></label>
                      <Input value={employeeNumber} onChange={(e) => { setEmployeeNumber(e.target.value); setErrors(p => ({ ...p, employeeNumber: "" })); }}
                        placeholder="ETH-OFF-402" className={`h-9 text-xs font-mono uppercase ${errors.employeeNumber ? "border-red-400 bg-red-50" : ""}`} />
                      {errors.employeeNumber && <p className="text-[11px] text-red-600 mt-0.5">{errors.employeeNumber}</p>}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <label className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" /> Official Email <span className="text-red-500">*</span>
                      </label>
                      <Input value={email} onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
                        placeholder="name@subcity.gov.et" className={`h-9 text-xs ${errors.email ? "border-red-400 bg-red-50" : ""}`} />
                      {errors.email && <p className="text-[11px] text-red-600 mt-0.5">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> Phone <span className="text-red-500">*</span>
                      </label>
                      <Input value={phone} onChange={(e) => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: "" })); }}
                        placeholder="+251 91 234 5678" className={`h-9 text-xs font-mono ${errors.phone ? "border-red-400 bg-red-50" : ""}`} />
                      {errors.phone && <p className="text-[11px] text-red-600 mt-0.5">{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Jurisdiction */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#00450d]" /> Jurisdiction <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[11px] text-slate-500 mb-1">Sub-City</p>
                        <select value={subCity} onChange={(e) => { setSubCity(e.target.value); setWoreda("01"); }}
                          className="w-full h-9 text-xs border border-slate-300 rounded-md px-2 bg-white">
                          {(subCityNames.length > 0 ? subCityNames : ["Bole"]).map((sc) => (
                            <option key={sc} value={sc}>{sc}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500 mb-1">Woreda</p>
                        <select value={woreda} onChange={(e) => setWoreda(e.target.value)}
                          className="w-full h-9 text-xs border border-slate-300 rounded-md px-2 bg-white">
                          {woredaOptions.map((w) => <option key={w} value={w}>Woreda {w}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-800">
                      This officer will only see properties registered under <strong>{subCity} Sub-City, Woreda {woreda}</strong>.
                    </div>
                  </div>

                  {/* Position */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-slate-400" /> Position Title
                    </label>
                    <Input value={positionTitle} onChange={(e) => setPositionTitle(e.target.value)}
                      className="h-9 text-xs" />
                  </div>

                  {/* Password */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" /> Default Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} value={password}
                        onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
                        className={`h-9 text-xs font-mono pr-9 ${errors.password ? "border-red-400 bg-red-50" : ""}`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-[11px] text-red-600 mt-0.5">{errors.password}</p>}
                    <p className="text-[11px] text-slate-400 mt-1">Employee must change this on first login.</p>
                  </div>

                  {/* Error */}
                  {submitError && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {submitError}
                    </div>
                  )}

                  <Button type="submit" disabled={isSubmitting}
                    className="w-full bg-[#00450d] hover:bg-[#1b5e20] text-white h-11 text-sm font-bold rounded-xl gap-2">
                    {isSubmitting ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Registering in database...</>
                    ) : (
                      <><UserPlus className="w-4 h-4" /> Register Employee</>
                    )}
                  </Button>
                </form>

                {/* Success card */}
                {successEmployee && (
                  <div className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-bold text-emerald-900">Registered successfully</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        ["Name", `${successEmployee.firstName} ${successEmployee.middleName} ${successEmployee.lastName}`],
                        ["Role", successEmployee.role],
                        ["Employee #", successEmployee.employeeNumber],
                        ["Email", successEmployee.email],
                        ["Password", successEmployee.defaultPassword],
                        ["Jurisdiction", `${successEmployee.subCity} — Woreda ${successEmployee.woreda}`],
                      ].map(([k, v]) => (
                        <div key={k} className="bg-white rounded-lg p-2 border border-emerald-100">
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">{k}</p>
                          <p className="font-bold text-slate-900 truncate">{v}</p>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleCopy(successEmployee)}
                      className="w-full text-xs gap-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-100">
                      <Copy className="w-3.5 h-3.5" /> Copy Credential Slip
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Roster ── */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-slate-200 bg-white shadow-xs rounded-2xl">
              <CardHeader className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#00450d]" /> Registered Employees
                  </CardTitle>
                  <span className="text-[11px] text-slate-400">{filtered.length} shown</span>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, ID, email..." className="h-8 text-xs pl-8" />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                      className="h-8 text-xs border border-slate-200 rounded-md px-2 bg-white">
                      <option value="all">All Roles</option>
                      <option value="WOREDA_OFFICER">Officers</option>
                      <option value="WOREDA_SUPERVISOR">Supervisors</option>
                    </select>
                    <select value={subCityFilter} onChange={(e) => setSubCityFilter(e.target.value)}
                      className="h-8 text-xs border border-slate-200 rounded-md px-2 bg-white">
                      <option value="all">All Sub-Cities</option>
                      {SUB_CITIES.map((sc) => <option key={sc} value={sc}>{sc}</option>)}
                    </select>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {filtered.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">No employees found.</div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                    {filtered.map((emp) => {
                      const isSup = emp.role === "WOREDA_SUPERVISOR";
                      return (
                        <div key={emp.id} className="p-3.5 hover:bg-slate-50/60 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-black shrink-0 ${isSup ? "bg-amber-600" : "bg-[#00450d]"}`}>
                                {emp.firstName[0]}{emp.lastName[0]}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                  {emp.firstName} {emp.middleName} {emp.lastName}
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono truncate">{emp.employeeNumber}</p>
                              </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button onClick={() => handleCopy(emp)} title="Copy credentials"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-[#00450d] hover:bg-emerald-50 transition-colors">
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDelete(emp.id, `${emp.firstName} ${emp.lastName}`)}
                                title="Remove" className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                            <span className={`px-1.5 py-0.5 rounded font-bold ${isSup ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                              {isSup ? "Supervisor" : "Officer"}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5" /> {emp.subCity} / W{emp.woreda}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 truncate max-w-[130px]">
                              {emp.email}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
