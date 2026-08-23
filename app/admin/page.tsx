"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Building,
  Users,
  UserPlus,
  Lock,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  Filter,
  Trash2,
  ArrowRight,
  Sparkles,
  Printer,
  FileBadge,
  Briefcase,
  Key,
} from "lucide-react";

export type EmployeeRole = "woreda_officer" | "woreda_supervisor";

export interface RegisteredEmployee {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  role: EmployeeRole;
  employeeId: string;
  faydaId: string;
  email: string;
  phone: string;
  subCity: string;
  woreda: string;
  department: string;
  defaultPassword: string;
  status: "ACTIVE" | "PENDING_ACTIVATION" | "SUSPENDED";
  createdAt: string;
}

const DEFAULT_EMPLOYEES: RegisteredEmployee[] = [
  {
    id: "emp-1",
    firstName: "Dawit",
    middleName: "Mengistu",
    lastName: "Alemu",
    role: "woreda_supervisor",
    employeeId: "ETH-WRD-SUP-0104",
    faydaId: "FIN-8841-9923-0144",
    email: "dawit.mengistu@bole.gov.et",
    phone: "+251 91 888 9900",
    subCity: "Bole",
    woreda: "Woreda 03",
    department: "Land Holding & Housing Administration",
    defaultPassword: "CityAdmin@2026",
    status: "ACTIVE",
    createdAt: "2026-01-15T08:30:00Z",
  },
  {
    id: "emp-2",
    firstName: "Alemu",
    middleName: "Kebede",
    lastName: "Tadesse",
    role: "woreda_officer",
    employeeId: "ETH-WRD-OFF-0402",
    faydaId: "FIN-4912-3810-7721",
    email: "alemu.kebede@bole.gov.et",
    phone: "+251 91 234 5678",
    subCity: "Bole",
    woreda: "Woreda 03",
    department: "Title Deed & Lease Verification Desk",
    defaultPassword: "CityAdmin@2026",
    status: "ACTIVE",
    createdAt: "2026-02-01T10:15:00Z",
  },
  {
    id: "emp-3",
    firstName: "Rahel",
    middleName: "Solomon",
    lastName: "Haile",
    role: "woreda_officer",
    employeeId: "ETH-WRD-OFF-0718",
    faydaId: "FIN-7719-2041-8930",
    email: "rahel.solomon@yeka.gov.et",
    phone: "+251 92 456 7890",
    subCity: "Yeka",
    woreda: "Woreda 08",
    department: "Cadastral Survey & Inspection",
    defaultPassword: "CityAdmin@2026",
    status: "ACTIVE",
    createdAt: "2026-02-10T14:20:00Z",
  },
  {
    id: "emp-4",
    firstName: "Tigist",
    middleName: "Berhanu",
    lastName: "Girma",
    role: "woreda_supervisor",
    employeeId: "ETH-WRD-SUP-0211",
    faydaId: "FIN-6612-4019-5582",
    email: "tigist.berhanu@kirkos.gov.et",
    phone: "+251 93 111 2233",
    subCity: "Kirkos",
    woreda: "Woreda 02",
    department: "Municipal Compliance & Dispute Desk",
    defaultPassword: "CityAdmin@2026",
    status: "ACTIVE",
    createdAt: "2026-02-18T09:00:00Z",
  },
];

const SUB_CITIES = [
  "Bole",
  "Yeka",
  "Kirkos",
  "Arada",
  "Lideta",
  "Nifas Silk-Lafto",
  "Gullele",
  "Akaky Kaliti",
  "Kolfe Keranio",
  "Lemi Kura",
  "Addis Ketema",
];

const DEPARTMENTS = [
  "Land Holding & Housing Administration",
  "Title Deed & Lease Verification Desk",
  "Cadastral Survey & Inspection",
  "Municipal Compliance & Dispute Desk",
  "Revenue & Stamp Duty Assessment",
  "Citizen Services & Inquiry Desk",
];

const DEFAULT_GLOBAL_PASSWORD = "CityAdmin@2026";

export const AdminPage: React.FC = () => {
  // Form State
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<EmployeeRole>("woreda_officer");
  const [employeeId, setEmployeeId] = useState("");
  const [faydaId, setFaydaId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+251 9");
  const [subCity, setSubCity] = useState("Bole");
  const [woreda, setWoreda] = useState("Woreda 03");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [defaultPassword, setDefaultPassword] = useState(DEFAULT_GLOBAL_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);

  // Errors & Form Feedback
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successEmployee, setSuccessEmployee] = useState<RegisteredEmployee | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Employees List & Filter State
  const [employees, setEmployees] = useState<RegisteredEmployee[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [subCityFilter, setSubCityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedForCard, setSelectedForCard] = useState<RegisteredEmployee | null>(null);

  // Initialize employees from localStorage or defaults
  useEffect(() => {
    try {
      const stored = localStorage.getItem("registered_woreda_employees");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEmployees(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    setEmployees(DEFAULT_EMPLOYEES);
    try {
      localStorage.setItem("registered_woreda_employees", JSON.stringify(DEFAULT_EMPLOYEES));
    } catch {
      // ignore
    }
  }, []);

  const saveEmployeesToStorage = (updatedList: RegisteredEmployee[]) => {
    setEmployees(updatedList);
    try {
      localStorage.setItem("registered_woreda_employees", JSON.stringify(updatedList));
    } catch {
      // ignore
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  // Auto-generate employee ID and email when name/role changes if empty
  const handleFirstNameChange = (val: string) => {
    setFirstName(val);
    clearError("firstName");
    if (!email && val) {
      const cleaned = val.toLowerCase().replace(/[^a-z]/g, "");
      const mid = middleName ? "." + middleName.toLowerCase().replace(/[^a-z]/g, "") : "";
      setEmail(`${cleaned}${mid}@${subCity.toLowerCase().replace(/\s+/g, "")}.gov.et`);
    }
    if (!employeeId && val) {
      const prefix = role === "woreda_supervisor" ? "ETH-WRD-SUP" : "ETH-WRD-OFF";
      const randomNum = Math.floor(100 + Math.random() * 900);
      setEmployeeId(`${prefix}-${randomNum}`);
    }
  };

  const handleRoleChange = (newRole: EmployeeRole) => {
    setRole(newRole);
    if (!employeeId || employeeId.startsWith("ETH-WRD-")) {
      const prefix = newRole === "woreda_supervisor" ? "ETH-WRD-SUP" : "ETH-WRD-OFF";
      const randomNum = Math.floor(100 + Math.random() * 900);
      setEmployeeId(`${prefix}-${randomNum}`);
    }
    if (newRole === "woreda_supervisor" && department.includes("Verification")) {
      setDepartment("Land Holding & Housing Administration");
    }
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "First name is required.";
    if (!middleName.trim()) errs.middleName = "Father's name is required.";
    if (!lastName.trim()) errs.lastName = "Grandfather's name is required.";
    if (!employeeId.trim()) errs.employeeId = "Official Employee ID / Badge is required.";
    if (!faydaId.trim()) {
      errs.faydaId = "National Fayda FIN ID is required.";
    } else if (faydaId.trim().length < 8) {
      errs.faydaId = "Please enter a valid 16-digit or formatted Fayda FIN ID.";
    }
    if (!email.trim()) {
      errs.email = "Official government email is required.";
    } else if (!email.includes("@")) {
      errs.email = "Please enter a valid official email address.";
    }
    if (!phone.trim() || phone.length < 9) {
      errs.phone = "Valid contact phone number is required (e.g. +251 91...)";
    }
    if (!defaultPassword.trim()) {
      errs.defaultPassword = "A default password must be provided.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegisterEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast("Please fill in all mandatory employee registration fields.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newEmployee: RegisteredEmployee = {
        id: `emp-${Date.now()}`,
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
        role,
        employeeId: employeeId.trim().toUpperCase(),
        faydaId: faydaId.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        subCity,
        woreda,
        department,
        defaultPassword: defaultPassword.trim(),
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      };

      const updated = [newEmployee, ...employees];
      saveEmployeesToStorage(updated);
      setSuccessEmployee(newEmployee);
      setIsSubmitting(false);
      showToast(`Employee ${newEmployee.firstName} ${newEmployee.lastName} registered successfully!`);

      // Clear form inputs
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setEmployeeId("");
      setFaydaId("");
      setEmail("");
      setPhone("+251 9");
      setDefaultPassword(DEFAULT_GLOBAL_PASSWORD);
      setErrors({});
    }, 500);
  };

  const handleFillSample = (sampleRole: EmployeeRole) => {
    const isSup = sampleRole === "woreda_supervisor";
    const rand = Math.floor(100 + Math.random() * 900);
    const fNames = isSup ? ["Mulugeta", "Selamawit", "Yohannes", "Genet"] : ["Kassahun", "Bethel", "Natnael", "Hanna"];
    const mNames = ["Tesfaye", "Alemu", "Bekele", "Girma", "Haile"];
    const lNames = ["Desta", "Mamo", "Wolde", "Tadesse", "Kebede"];

    const chosenFirst = fNames[Math.floor(Math.random() * fNames.length)];
    const chosenMid = mNames[Math.floor(Math.random() * mNames.length)];
    const chosenLast = lNames[Math.floor(Math.random() * lNames.length)];
    const chosenSubCity = SUB_CITIES[Math.floor(Math.random() * SUB_CITIES.length)];
    const woredaNum = String(Math.floor(1 + Math.random() * 12)).padStart(2, "0");

    setRole(sampleRole);
    setFirstName(chosenFirst);
    setMiddleName(chosenMid);
    setLastName(chosenLast);
    setEmployeeId(isSup ? `ETH-WRD-SUP-${rand}` : `ETH-WRD-OFF-${rand}`);
    setFaydaId(`FIN-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`);
    setEmail(`${chosenFirst.toLowerCase()}.${chosenMid.toLowerCase()}@${chosenSubCity.toLowerCase().replace(/\s+/g, "")}.gov.et`);
    setPhone(`+251 91 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)}`);
    setSubCity(chosenSubCity);
    setWoreda(`Woreda ${woredaNum}`);
    setDepartment(isSup ? DEPARTMENTS[0] : DEPARTMENTS[1]);
    setDefaultPassword(DEFAULT_GLOBAL_PASSWORD);
    setErrors({});
    showToast(`Loaded sample ${isSup ? "Woreda Supervisor" : "Woreda Officer"} template.`);
  };

  const handleDeleteEmployee = (id: string, name: string) => {
    if (confirm(`Are you sure you want to deactivate and remove ${name} from the registry?`)) {
      const filtered = employees.filter((e) => e.id !== id);
      saveEmployeesToStorage(filtered);
      showToast(`Employee ${name} removed.`);
      if (selectedForCard?.id === id) setSelectedForCard(null);
    }
  };

  const handleCopyCredentials = (emp: RegisteredEmployee) => {
    const credText = `FDRE Addis Ababa Municipal Administration\nOfficer Registration Slip\nName: ${emp.firstName} ${emp.middleName} ${emp.lastName}\nRole: ${emp.role === "woreda_supervisor" ? "Woreda Supervisor" : "Woreda Officer"}\nEmployee ID: ${emp.employeeId}\nOfficial Email / Username: ${emp.email}\nDefault Passcode: ${emp.defaultPassword}\nDesk: ${emp.subCity} Sub-City, ${emp.woreda} (${emp.department})\nPortal: /officer`;
    navigator.clipboard.writeText(credText);
    showToast("Login credentials copied to clipboard!");
  };

  // Filtered list
  const filteredEmployees = employees.filter((emp) => {
    const matchesRole = roleFilter === "all" || emp.role === roleFilter;
    const matchesSubCity = subCityFilter === "all" || emp.subCity === subCityFilter;
    const fullName = `${emp.firstName} ${emp.middleName} ${emp.lastName} ${emp.employeeId} ${emp.email} ${emp.faydaId}`.toLowerCase();
    const matchesSearch = searchQuery === "" || fullName.includes(searchQuery.toLowerCase());
    return matchesRole && matchesSubCity && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f8faf8] p-3 sm:p-6 lg:p-8 font-sans text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#00450d] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-emerald-500/40 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Municipal Banner & Navigation Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#00450d] text-white flex items-center justify-center font-black shadow-md shrink-0 border border-emerald-600/30">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00450d] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Municipal Civil Service Bureau
                </span>
                <Badge variant="verified" className="text-[10px]">
                  HR & Role Provisioning
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                Woreda Employee & Officer Registration Portal
              </h1>
              <p className="text-xs text-slate-500">
                Register authorized government personnel for Woreda Housing Desks with default municipal credentials.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            <a
              href="/officer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00450d] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3.5 py-2 rounded-xl transition-all shadow-2xs"
            >
              <Users className="w-4 h-4 text-[#00450d]" />
              <span>Go to Officer Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <span>Citizen Home</span>
            </a>
          </div>
        </div>

        {/* Quick Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold">Total Staff</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-slate-900">{employees.length}</div>
            <p className="text-[10px] text-emerald-700 font-medium">Provisioned Municipal Accounts</p>
          </div>

          <div className="bg-white rounded-xl border border-emerald-200 bg-emerald-50/20 p-3.5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-emerald-900 text-xs">
              <span className="font-bold">Woreda Officers</span>
              <Briefcase className="w-4 h-4 text-[#00450d]" />
            </div>
            <div className="text-2xl font-black text-[#00450d]">
              {employees.filter((e) => e.role === "woreda_officer").length}
            </div>
            <p className="text-[10px] text-slate-500">Deed & Lease Verification</p>
          </div>

          <div className="bg-white rounded-xl border border-amber-200 bg-amber-50/20 p-3.5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-amber-900 text-xs">
              <span className="font-bold">Woreda Supervisors</span>
              <ShieldCheck className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-2xl font-black text-amber-900">
              {employees.filter((e) => e.role === "woreda_supervisor").length}
            </div>
            <p className="text-[10px] text-slate-500">Approval & Dispute Desk</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold">Default Passcode</span>
              <Key className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-sm font-mono font-bold text-slate-800 truncate" title={DEFAULT_GLOBAL_PASSWORD}>
              {DEFAULT_GLOBAL_PASSWORD}
            </div>
            <p className="text-[10px] text-slate-500">Auto-assigned on creation</p>
          </div>
        </div>

        {/* MAIN LAYOUT: Form on left, Roster & Preview on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Employee Registration Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-slate-200 bg-white shadow-xs rounded-2xl overflow-hidden">
              <CardHeader className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-[#00450d] to-emerald-900 text-white flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-emerald-300" />
                    <CardTitle className="text-base sm:text-lg font-bold text-white">
                      New Employee Registration Form
                    </CardTitle>
                  </div>
                  <p className="text-xs text-emerald-200/90">
                    Create Woreda Officer or Supervisor accounts with instant default passcodes.
                  </p>
                </div>

                {/* Quick Sample Fill Buttons */}
                <div className="hidden sm:flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleFillSample("woreda_officer")}
                    className="h-7 text-[11px] bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    <Sparkles className="w-3 h-3 mr-1 text-emerald-300" />
                    Sample Officer
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleFillSample("woreda_supervisor")}
                    className="h-7 text-[11px] bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    <Sparkles className="w-3 h-3 mr-1 text-amber-300" />
                    Sample Supervisor
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-7 space-y-5">
                <form onSubmit={handleRegisterEmployee} className="space-y-5">
                  {/* 1. ROLE SELECTION (Key requirement: woreda_officer, woreda_supervisor) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-[#00450d]" />
                        <span>Assigned Employee Role</span>
                        <span className="text-red-500">*</span>
                      </span>
                      <span className="text-[11px] font-normal text-slate-500">
                        Determines desk permissions and verification scope
                      </span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Option 1: woreda_officer */}
                      <label
                        onClick={() => handleRoleChange("woreda_officer")}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                          role === "woreda_officer"
                            ? "border-[#00450d] bg-emerald-50/70 shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="employeeRole"
                          value="woreda_officer"
                          checked={role === "woreda_officer"}
                          onChange={() => handleRoleChange("woreda_officer")}
                          className="mt-0.5 accent-[#00450d] h-4 w-4 shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs sm:text-sm text-slate-900">
                              Woreda Officer
                            </span>
                            <span className="font-mono text-[10px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
                              woreda_officer
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Processes initial property registrations, title deed scans, cadastral UPI verification, and lease agreement validations.
                          </p>
                        </div>
                      </label>

                      {/* Option 2: woreda_supervisor */}
                      <label
                        onClick={() => handleRoleChange("woreda_supervisor")}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                          role === "woreda_supervisor"
                            ? "border-amber-600 bg-amber-50/60 shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="employeeRole"
                          value="woreda_supervisor"
                          checked={role === "woreda_supervisor"}
                          onChange={() => handleRoleChange("woreda_supervisor")}
                          className="mt-0.5 accent-amber-600 h-4 w-4 shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs sm:text-sm text-slate-900">
                              Woreda Supervisor
                            </span>
                            <span className="font-mono text-[10px] bg-amber-100 text-amber-950 px-1.5 py-0.5 rounded font-bold">
                              woreda_supervisor
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Municipal authority for final certificate approvals, dispute escalations, compliance reviews, and officer oversight.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* 2. EMPLOYEE FULL NAME (Ethiopian 3-name naming system) */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-800 block">
                      Employee Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-500 font-medium block mb-1">
                          First Name (የመጀመሪያ ስም)
                        </label>
                        <Input
                          value={firstName}
                          onChange={(e) => handleFirstNameChange(e.target.value)}
                          placeholder="e.g. Alemu"
                          className={`h-9 text-xs ${errors.firstName ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : ""}`}
                        />
                        {errors.firstName && (
                          <p className="text-[11px] text-red-600 font-medium mt-1">{errors.firstName}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-500 font-medium block mb-1">
                          Father's Name (የአባት ስም)
                        </label>
                        <Input
                          value={middleName}
                          onChange={(e) => {
                            setMiddleName(e.target.value);
                            clearError("middleName");
                          }}
                          placeholder="e.g. Kebede"
                          className={`h-9 text-xs ${errors.middleName ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : ""}`}
                        />
                        {errors.middleName && (
                          <p className="text-[11px] text-red-600 font-medium mt-1">{errors.middleName}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-500 font-medium block mb-1">
                          Grandfather's Name (የአያት ስም)
                        </label>
                        <Input
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            clearError("lastName");
                          }}
                          placeholder="e.g. Tadesse"
                          className={`h-9 text-xs ${errors.lastName ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : ""}`}
                        />
                        {errors.lastName && (
                          <p className="text-[11px] text-red-600 font-medium mt-1">{errors.lastName}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3. NATIONAL FAYDA ID & EMPLOYEE BADGE NUMBER */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        National Fayda FIN ID <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          value={faydaId}
                          onChange={(e) => {
                            setFaydaId(e.target.value);
                            clearError("faydaId");
                          }}
                          placeholder="e.g. FIN-9841-3829-0144"
                          className={`h-9 text-xs font-mono pl-8 uppercase ${
                            errors.faydaId ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : ""
                          }`}
                        />
                        <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                      </div>
                      {errors.faydaId && (
                        <p className="text-[11px] text-red-600 font-medium mt-1">{errors.faydaId}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Official Badge / Employee ID <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          value={employeeId}
                          onChange={(e) => {
                            setEmployeeId(e.target.value);
                            clearError("employeeId");
                          }}
                          placeholder={role === "woreda_supervisor" ? "ETH-WRD-SUP-0104" : "ETH-WRD-OFF-0402"}
                          className={`h-9 text-xs font-mono pl-8 font-bold text-emerald-950 uppercase ${
                            errors.employeeId ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : ""
                          }`}
                        />
                        <FileBadge className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                      </div>
                      {errors.employeeId && (
                        <p className="text-[11px] text-red-600 font-medium mt-1">{errors.employeeId}</p>
                      )}
                    </div>
                  </div>

                  {/* 4. OFFICIAL CONTACTS (Email & Phone) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Government Email (Desk Login) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            clearError("email");
                          }}
                          placeholder="e.g. alemu.kebede@bole.gov.et"
                          className={`h-9 text-xs pl-8 ${errors.email ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : ""}`}
                        />
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                      </div>
                      {errors.email && (
                        <p className="text-[11px] text-red-600 font-medium mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Contact Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            clearError("phone");
                          }}
                          placeholder="+251 91 234 5678"
                          className={`h-9 text-xs pl-8 font-mono ${
                            errors.phone ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : ""
                          }`}
                        />
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                      </div>
                      {errors.phone && (
                        <p className="text-[11px] text-red-600 font-medium mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* 5. LOCATION & MUNICIPAL BRANCH DESK */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-slate-100">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Assigned Sub-City <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={subCity}
                        onChange={(e) => setSubCity(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00450d]"
                      >
                        {SUB_CITIES.map((sc) => (
                          <option key={sc} value={sc}>
                            {sc} Sub-City
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Assigned Woreda <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={woreda}
                        onChange={(e) => setWoreda(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00450d]"
                      >
                        {Array.from({ length: 15 }, (_, i) => {
                          const wNum = `Woreda ${String(i + 1).padStart(2, "0")}`;
                          return (
                            <option key={wNum} value={wNum}>
                              {wNum}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Department / Bureau Desk <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full h-9 px-2 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00450d]"
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 6. DEFAULT PASSWORD PROVISIONING (Key Requirement) */}
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-[#00450d]" />
                        <span>Default Temporary Password</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setDefaultPassword(DEFAULT_GLOBAL_PASSWORD)}
                        className="text-[11px] text-[#00450d] font-semibold hover:underline"
                      >
                        Reset to Standard (CityAdmin@2026)
                      </button>
                    </div>

                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={defaultPassword}
                        onChange={(e) => {
                          setDefaultPassword(e.target.value);
                          clearError("defaultPassword");
                        }}
                        className={`h-9 text-xs font-mono pr-20 bg-white ${
                          errors.defaultPassword ? "border-red-500 ring-1 ring-red-500" : "border-emerald-300"
                        }`}
                      />
                      <div className="absolute right-2 top-2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 text-slate-400 hover:text-slate-700"
                          title={showPassword ? "Hide" : "Show"}
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(defaultPassword);
                            showToast("Default password copied!");
                          }}
                          className="p-1 text-emerald-700 hover:text-emerald-900"
                          title="Copy Password"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-normal">
                      The employee will use this initial passcode to log in at <code className="bg-white px-1 py-0.5 rounded text-[#00450d] font-bold">/officer</code> and will be prompted to set a permanent private password on first session.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFillSample("woreda_officer")}
                        className="text-xs text-slate-600 sm:hidden"
                      >
                        Auto-Fill Sample
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFirstName("");
                          setMiddleName("");
                          setLastName("");
                          setEmployeeId("");
                          setFaydaId("");
                          setEmail("");
                          setPhone("+251 9");
                          setErrors({});
                        }}
                        className="text-xs h-10 px-4 w-full sm:w-auto"
                      >
                        Clear Form
                      </Button>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#00450d] hover:bg-[#164e23] text-white font-bold text-xs h-10 px-6 gap-2 w-full sm:w-auto shadow-md cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Registering Account...</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            <span>Register {role === "woreda_supervisor" ? "Woreda Supervisor" : "Woreda Officer"}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Registration Success Confirmation Card (if newly submitted) */}
            {successEmployee && (
              <div className="bg-emerald-950 text-white rounded-2xl p-5 sm:p-6 shadow-lg border border-emerald-600/40 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-white">
                        Employee Registered & Credentials Generated!
                      </h3>
                      <p className="text-xs text-emerald-200">
                        {successEmployee.firstName} {successEmployee.middleName} {successEmployee.lastName} has been added to the Addis Ababa Municipal Registry.
                      </p>
                    </div>
                  </div>
                  <Badge variant="verified" className="text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-400/40">
                    {successEmployee.role === "woreda_supervisor" ? "SUPERVISOR" : "OFFICER"}
                  </Badge>
                </div>

                {/* Credentials summary box */}
                <div className="bg-black/30 rounded-xl p-4 border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Employee ID</span>
                    <span className="font-mono font-bold text-emerald-300">{successEmployee.employeeId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Official Login Email</span>
                    <span className="font-mono text-white truncate block">{successEmployee.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Assigned Woreda Desk</span>
                    <span className="text-slate-200">{successEmployee.subCity} Sub-City &bull; {successEmployee.woreda}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Default Password</span>
                    <span className="font-mono font-bold text-amber-300">{successEmployee.defaultPassword}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyCredentials(successEmployee)}
                    className="h-8 text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Full Credentials Slip</span>
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setSelectedForCard(successEmployee)}
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print ID Slip</span>
                    </Button>
                    <a
                      href="/officer"
                      className="inline-flex items-center gap-1 h-8 px-3 rounded-md bg-white text-[#00450d] font-bold text-xs hover:bg-emerald-50 transition-colors"
                    >
                      <span>Test Officer Login</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Registered Staff Roster Table & Quick Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-slate-200 bg-white shadow-xs rounded-2xl overflow-hidden">
              <CardHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#00450d]" />
                    <span>Registered Municipal Staff ({filteredEmployees.length})</span>
                  </CardTitle>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Authorized Woreda Officers and Supervisors
                  </p>
                </div>

                <Badge variant="verified" className="text-[10px] self-start sm:self-auto">
                  Live Roster
                </Badge>
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                {/* Search & Filter bar */}
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, ID, or Fayda..."
                      className="h-8 text-xs pl-8 bg-slate-50"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Role Filter */}
                    <div className="flex-1">
                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full h-7 px-2 rounded-md border border-slate-200 bg-white text-[11px] font-semibold text-slate-700 focus:outline-none"
                      >
                        <option value="all">All Roles (Both)</option>
                        <option value="woreda_officer">Officers only (woreda_officer)</option>
                        <option value="woreda_supervisor">Supervisors only (woreda_supervisor)</option>
                      </select>
                    </div>

                    {/* SubCity Filter */}
                    <div className="flex-1">
                      <select
                        value={subCityFilter}
                        onChange={(e) => setSubCityFilter(e.target.value)}
                        className="w-full h-7 px-2 rounded-md border border-slate-200 bg-white text-[11px] font-semibold text-slate-700 focus:outline-none"
                      >
                        <option value="all">All Sub-Cities</option>
                        {SUB_CITIES.map((sc) => (
                          <option key={sc} value={sc}>
                            {sc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Staff List Cards */}
                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {filteredEmployees.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                      <Users className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-500 font-medium">No registered employees match your filter.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRoleFilter("all");
                          setSubCityFilter("all");
                          setSearchQuery("");
                        }}
                        className="text-xs h-7"
                      >
                        Reset Filters
                      </Button>
                    </div>
                  ) : (
                    filteredEmployees.map((emp) => {
                      const isSup = emp.role === "woreda_supervisor";
                      return (
                        <div
                          key={emp.id}
                          className={`p-3.5 rounded-xl border transition-all space-y-2 hover:shadow-2xs ${
                            isSup ? "bg-amber-50/20 border-amber-200/80" : "bg-white border-slate-200"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-xs text-slate-900 truncate">
                                  {emp.firstName} {emp.middleName} {emp.lastName}
                                </span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                    isSup ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                  }`}
                                >
                                  {isSup ? "Supervisor" : "Officer"}
                                </span>
                              </div>
                              <p className="text-[11px] font-mono text-slate-500">
                                {emp.employeeId} &bull; {emp.faydaId}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleCopyCredentials(emp)}
                                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                                title="Copy Credentials Slip"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedForCard(emp)}
                                className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-700"
                                title="View ID Badge Slip"
                              >
                                <FileBadge className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteEmployee(emp.id, `${emp.firstName} ${emp.lastName}`)}
                                className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600"
                                title="Delete / Deactivate"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                            <div>
                              <span className="text-slate-400 text-[10px] block">Location</span>
                              <span className="font-semibold text-slate-700 truncate block">
                                {emp.subCity}, {emp.woreda}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] block">Default Pass</span>
                              <span className="font-mono font-bold text-slate-800">{emp.defaultPassword}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                            <span className="truncate max-w-[200px]" title={emp.email}>
                              {emp.email}
                            </span>
                            <span className="font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                              Active Desk
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Officer Desk Access Guide */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Officer Portal Authentication Guide
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Registered personnel can sign in directly at <code className="text-emerald-300 font-mono">/officer</code> using their generated government email and the default password <code className="text-amber-300 font-mono">{DEFAULT_GLOBAL_PASSWORD}</code>.
              </p>
              <div className="pt-1">
                <a
                  href="/officer"
                  className="inline-flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-[#00450d] hover:bg-[#164e23] text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <span>Open Officer Sign-In Screen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Printable Official ID Slip for selected employee */}
      {selectedForCard && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedForCard(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileBadge className="w-5 h-5 text-[#00450d]" />
                <h3 className="font-bold text-sm text-slate-900">Official Municipal Employee Slip</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedForCard(null)} className="h-7 w-7 p-0">
                ✕
              </Button>
            </div>

            {/* Credential Slip Design */}
            <div className="border-2 border-[#00450d] rounded-xl p-5 bg-gradient-to-b from-emerald-50/40 via-white to-white space-y-4 relative">
              <div className="text-center space-y-0.5 pb-3 border-b border-slate-200">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#00450d] block">
                  Federal Democratic Republic of Ethiopia
                </span>
                <h4 className="text-xs font-black uppercase text-slate-900">
                  City Government of Addis Ababa &bull; Land Bureau
                </h4>
                <p className="text-[10px] text-slate-500">
                  {selectedForCard.subCity} Sub-City &bull; {selectedForCard.woreda} Administration
                </p>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-14 h-16 rounded-lg bg-slate-100 border border-slate-300 flex flex-col items-center justify-center text-slate-400 text-[9px] shrink-0">
                  <ShieldCheck className="w-6 h-6 text-[#00450d] mb-1" />
                  <span>OFFICIAL</span>
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="font-bold text-sm text-slate-900">
                    {selectedForCard.firstName} {selectedForCard.middleName} {selectedForCard.lastName}
                  </div>
                  <Badge
                    variant={selectedForCard.role === "woreda_supervisor" ? "overdue" : "verified"}
                    className="text-[9px]"
                  >
                    {selectedForCard.role === "woreda_supervisor" ? "WOREDA SUPERVISOR" : "WOREDA OFFICER"}
                  </Badge>
                  <p className="text-[10px] text-slate-600 truncate">{selectedForCard.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[9px] uppercase font-semibold text-slate-500 block">Badge ID</span>
                  <span className="font-mono font-bold text-slate-900">{selectedForCard.employeeId}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-semibold text-slate-500 block">Fayda FIN</span>
                  <span className="font-mono font-bold text-slate-800">{selectedForCard.faydaId}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-semibold text-slate-500 block">Login User/Email</span>
                  <span className="text-slate-800 truncate block text-[10px]">{selectedForCard.email}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-semibold text-slate-500 block">Default Passcode</span>
                  <span className="font-mono font-bold text-amber-700">{selectedForCard.defaultPassword}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-100">
                <span>Status: Active Permanent Staff</span>
                <span>Authorized by Municipal Admin</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleCopyCredentials(selectedForCard)}
                className="text-xs h-8 gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Credentials</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  window.print();
                }}
                className="bg-[#00450d] text-white text-xs h-8 gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
