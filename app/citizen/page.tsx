"use client";
import React, { useState, useEffect, useRef } from "react";
import { useCitizenData } from "@/hooks/useCitizenData";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Lock,
  User,
  KeyRound,
  FileText,
  Building,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  BadgeCheck,
  UserPlus,
  LogIn,
  X,
  ChevronRight,
  Briefcase,
  Mail,
  Calendar,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { loginCitizen, registerCitizen, saveSession } from "@/lib/api";
import { useRouter } from "next/dist/client/components/navigation";

type AuthFormMode = "signin" | "register";
type RegisterMode = "fayda" | "manual";

export const CitizenHome: React.FC = () => {
  const { handleNavigate, setUserRole } = useCitizenData();

  // State to control whether the auth card/grid is open
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<AuthFormMode>("register");

  // Registration Mode: 'fayda' (National ID + OTP) or 'manual' (Full Information)
  const [registerMode, setRegisterMode] = useState<RegisterMode>("fayda");

  // ==========================================
  // SIGN IN STATE
  // ==========================================
  const [loginEmail, setLoginEmail] = useState<string>("citizen.test@example.com");
  const [loginPassword, setLoginPassword] = useState<string>("SecurePass123!");
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");

  // ==========================================
  // FAYDA REGISTRATION STATE
  // ==========================================
  const [faydaStep, setFaydaStep] = useState<1 | 2 | 3>(1);
  const [finNumber, setFinNumber] = useState<string>("ET-NID-00892418");
  const [faydaConsent, setFaydaConsent] = useState<boolean>(true);
  const [isFinVerifying, setIsFinVerifying] = useState<boolean>(false);
  const [finError, setFinError] = useState<string>("");

  // OTP State (6 digits)
  const [otpDigits, setOtpDigits] = useState<string[]>(["5", "8", "2", "9", "1", "4"]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isOtpVerifying, setIsOtpVerifying] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(45);
  const [canResendOtp, setCanResendOtp] = useState<boolean>(false);

  // Fayda Verified Profile State
  const [verifiedProfile, setVerifiedProfile] = useState<{
    fin: string;
    firstName: string;
    middleName: string;
    lastName: string;
    phoneMasked: string;
    phoneFull: string;
    gender: string;
    dateOfBirth: string;
    avatarUrl: string;
  }>({
    fin: "ET-NID-00892418",
    firstName: "Dagmawit",
    middleName: "Mesfin",
    lastName: "Tadesse",
    phoneMasked: "+251 91 ••• ••67",
    phoneFull: "+251 91 123 4567",
    gender: "Female",
    dateOfBirth: "14/10/1993",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  });

  const [portalPassword, setPortalPassword] = useState<string>("Ethio@Secure2025");
  const [portalPin, setPortalPin] = useState<string>("4829");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<"both" | "tenant" | "landlord">("both");

  // ==========================================
  // MANUAL REGISTRATION STATE (FULL INFORMATION)
  // ==========================================
  const [firstName, setFirstName] = useState<string>("Almaz");
  const [middleName, setMiddleName] = useState<string>("Bekele");
  const [lastName, setLastName] = useState<string>("Tadesse");
  const [gender, setGender] = useState<string>("Female");
  const [dateOfBirth, setDateOfBirth] = useState<string>("1992-06-18");
  const [phoneNumber, setPhoneNumber] = useState<string>("+251 91 234 5678");
  const [email, setEmail] = useState<string>("almaz.bekele@gov.et");
  const [worksOn, setWorksOn] = useState<string>("Commercial Bank of Ethiopia (Senior Analyst)");
  const [role, setRole] = useState<string>("both");
  const [password, setPassword] = useState<string>("AlmazPass#2025");
  const [confirmPassword, setConfirmPassword] = useState<string>("AlmazPass#2025");
  const [agreedProclamation, setAgreedProclamation] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");

  // Completion State
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Open Auth with specific mode
  const openAuth = (mode: AuthFormMode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
    setIsSuccess(false);
  };
const router = useRouter();
  // Close Auth and return to initial hero
  const closeAuth = () => {
    setIsAuthOpen(false);
    setIsSuccess(false);
    setFinError("");
    setOtpError("");
    setLoginError("");
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAuthOpen) {
        closeAuth();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthOpen]);

  // OTP Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAuthOpen && authMode === "register" && registerMode === "fayda" && faydaStep === 2 && countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      setCanResendOtp(true);
    }
    return () => clearTimeout(timer);
  }, [isAuthOpen, authMode, registerMode, faydaStep, countdown]);

  // Handle Login Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const data = await loginCitizen({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      saveSession(data);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/citizen/dashboard");
      }, 950);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "An error occurred during login.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Fayda FIN Verification Submission
  const handleVerifyFin = (e: React.FormEvent) => {
    e.preventDefault();
    setFinError("");

    if (!finNumber.trim() || finNumber.length < 8) {
      setFinError("Please enter a valid 12-16 character Fayda National ID (FIN).");
      return;
    }

    if (!faydaConsent) {
      setFinError("Please accept the National ID verification consent to continue.");
      return;
    }

    setIsFinVerifying(true);

    // Simulate NIDP Registry lookup
    setTimeout(() => {
      setIsFinVerifying(false);
      setCountdown(45);
      setCanResendOtp(false);
      setFaydaStep(2);
    }, 800);
  };

  // OTP digit change handler
  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanValue;
    setOtpDigits(newDigits);

    if (cleanValue && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // OTP keyboard navigation handler
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // OTP paste handler
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedData[i] || "";
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pastedData.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
    }
  };

  // Handle OTP Verification Submission
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    const enteredOtp = otpDigits.join("");

    if (enteredOtp.length !== 6) {
      setOtpError("Please enter the complete 6-digit OTP code sent to your phone.");
      return;
    }

    setIsOtpVerifying(true);

    setTimeout(() => {
      setIsOtpVerifying(false);
      setFaydaStep(3);
    }, 800);
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (!canResendOtp) return;
    setCountdown(45);
    setCanResendOtp(false);
    setOtpDigits(["5", "8", "2", "9", "1", "4"]);
    setOtpError("");
  };

  // Handle Final Fayda Registration Completion
  const handleCompleteFaydaRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === "tenant") setUserRole("tenant");
    else setUserRole("landlord");

    try {
      // Convert DD/MM/YYYY to YYYY-MM-DD
      const [dd, mm, yyyy] = verifiedProfile.dateOfBirth.split("/");
      const formattedDob = `${yyyy}-${mm}-${dd}`;

      const data = await registerCitizen({
        firstName: verifiedProfile.firstName,
        middleName: verifiedProfile.middleName,
        lastName: verifiedProfile.lastName,
        gender: verifiedProfile.gender.toUpperCase() as "MALE" | "FEMALE",
        dateOfBirth: formattedDob,
        phoneNumber: verifiedProfile.phoneFull.replace(/\s/g, ""),
        email: `${verifiedProfile.firstName.toLowerCase()}@example.com`,
        worksOn: "",
        rolePreference: selectedRole.toUpperCase(),
        password: portalPassword,
      });

      saveSession(data);
      setIsSuccess(true);
      setTimeout(() => {
        handleNavigate("dashboard");
      }, 1100);
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred during Fayda registration.");
    }
  };

  // Handle Manual Full Registration Form Submission
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
     setSubmitError("");
    if (!firstName.trim() || !phoneNumber.trim()) return;

    if (password !== confirmPassword) {
      setSubmitError("Passwords do not match. Please re-enter.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerCitizen({
        firstName,
        middleName,
        lastName,
        gender: gender.toUpperCase() as "MALE" | "FEMALE",
        dateOfBirth: dateOfBirth,
        phoneNumber: phoneNumber.replace(/\s/g, ""),
        email,
        worksOn,
        rolePreference: role.toUpperCase(),
        password,
      });

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/citizen/dashboard");
      }, 1100);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col m-0 p-0 overflow-x-hidden selection:bg-emerald-500 selection:text-white bg-[#0a120e]">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0 bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat pointer-events-none transform scale-105 transition-transform duration-1000"
        aria-hidden="true" 
      />
      
      {/* Dark Ambient Gradient Overlay */}
      <div 
        className="fixed inset-0 z-0 bg-gradient-to-b from-black/80 via-black/55 to-black/85 backdrop-blur-[0.5px] pointer-events-none" 
        aria-hidden="true" 
      />
      {/* Navigation */}
      <Navbar
        onOpenLogin={() => openAuth("signin")}
        onOpenRegister={() => openAuth("register")}
        onOpenDashboard={() => handleNavigate("dashboard")}
      />

      {/* Main Container with Smooth AnimatePresence */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-white px-4 sm:px-6 pt-24 pb-12 w-full">
        <AnimatePresence mode="wait">
          {!isAuthOpen ? (
            /* ========================================================================= */
            /* VIEW 1: FULL HERO CITIZEN LANDING PAGE (Matches Image 1)                   */
            /* ========================================================================= */
            <motion.div
              key="hero-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-4xl mx-auto text-center flex flex-col items-center space-y-6 w-full"
            >
              {/* Government Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-emerald-300 text-xs sm:text-sm font-medium tracking-wide"
              >
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Federal Democratic Republic of Ethiopia</span>
                <span className="text-white/40">•</span>
                <span className="text-white/80 font-normal">Official Citizen Portal</span>
              </motion.div>

              {/* Main Title in Display Serif / Typography */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.45 }}
                className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.15] text-white drop-shadow-lg text-balance"
              >
                Digital Rental Agreement <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400">
                  Management System
                </span>
              </motion.h1>

              {/* Subtitle / Description */}
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="text-base sm:text-lg md:text-xl text-white/85 max-w-2xl font-light leading-relaxed drop-shadow"
              >
                The national digital platform for Ethiopian citizens to register rental properties,
                legally sign lease agreements, and manage secure tenancy payments online.
              </motion.p>

              {/* Action CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full sm:w-auto"
              >
                <button
                  type="button"
                  onClick={() => openAuth("register")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-base shadow-xl shadow-emerald-950/50 hover:shadow-emerald-900/60 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Create Citizen Account</span>
                  <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => openAuth("signin")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base backdrop-blur-md border border-white/25 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
                >
                  <LogIn className="w-5 h-5 opacity-80" />
                  <span>Sign In to Portal</span>
                </button>
              </motion.div>

              
            </motion.div>
          ) : (
            /* ========================================================================= */
            /* VIEW 2: 2-COLUMN SPLIT GRID LAYOUT WITH REGISTRATION & SIGN IN FORM       */
            /* ========================================================================= */
            <motion.div
              key="grid-auth-view"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-2"
            >
              {/* LEFT COLUMN: Brand, System Title & Information */}
              <motion.div
                initial={{ opacity: 0, x: -25 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.45 }}
                className="lg:col-span-5 xl:col-span-5 flex flex-col space-y-5 text-left"
              >
                {/* Government Pill Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-md text-emerald-300 text-xs font-medium w-fit">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Federal Democratic Republic of Ethiopia</span>
                </div>

                {/* Left Column Headline */}
                <div className="space-y-2.5">
                  <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight leading-[1.15] text-white drop-shadow">
                    Digital Rental Agreement <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400">
                      Management System
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed max-w-lg">
                    The official national portal for property registration, legally binding digital leases, Fayda ID verification, and transparent tenancy payments under Ethiopian Proclamation No. 1320/2024.
                  </p>
                </div>

                {/* Key Benefits List */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-start gap-2.5 text-xs text-white/90">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>Direct Fayda National ID verification (NIDP)</span>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-white/90">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>Sub-city registered digital lease agreements</span>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-white/90">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>Automated municipal receipts & Telebirr/CBE payment sync</span>
                  </div>
                </div>

                {/* Bottom Interactive Controls */}
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleNavigate("search")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-white/80 hover:border-white text-white font-bold text-xs tracking-wide uppercase hover:bg-white/10 transition-all duration-200"
                  >
                    <span>Search Properties</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={closeAuth}
                    className="text-xs text-white/60 hover:text-white underline underline-offset-4 transition-colors"
                  >
                    Return to Overview
                  </button>
                </div>

                {/* 5 Pagination Dots (Image 2 style indicator) */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
                </div>
              </motion.div>

              {/* RIGHT COLUMN: Interactive Form Card with 'X' Close Icon */}
              <motion.div
                initial={{ opacity: 0, x: 25, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.45 }}
                className="lg:col-span-7 xl:col-span-7"
              >
                <div className="relative bg-white text-slate-900 rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/40 backdrop-blur-xl overflow-hidden">
                  {/* Top Right 'X' Close Button */}
                  <button
                    type="button"
                    onClick={closeAuth}
                    className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all z-20 cursor-pointer group"
                    title="Close form (Esc)"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                  </button>

                  {/* Top Mode Toggle Tabs (Sign In vs Register) */}
                  <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-bold mr-8 sm:mr-10">
                    <button
                      type="button"
                      onClick={() => setAuthMode("register")}
                      className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        authMode === "register"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5 text-[#00450d]" />
                      <span>Create Account</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode("signin")}
                      className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        authMode === "signin"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In</span>
                    </button>
                  </div>

                  {/* ========================================================= */}
                  {/* MODE 1: CREATE CITIZEN ACCOUNT (REGISTRATION FORM)         */}
                  {/* ========================================================= */}
                  {authMode === "register" && (
                    <div className="space-y-4">
                      {/* Registration Method Switcher Tabs */}
                      <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 border border-slate-200/80 rounded-xl text-xs">
                        <button
                          type="button"
                          onClick={() => setRegisterMode("fayda")}
                          className={`py-2 px-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                            registerMode === "fayda"
                              ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          <ShieldCheck className={`w-4 h-4 shrink-0 ${registerMode === "fayda" ? "text-emerald-700" : "text-slate-400"}`} />
                          <div className="text-left leading-tight">
                            <span className="block font-bold text-[11px] sm:text-xs">Register with Fayda ID</span>
                            <span className="block text-[9px] sm:text-[10px] font-normal text-emerald-700">
                              FIN & OTP Verification (Instant)
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRegisterMode("manual")}
                          className={`py-2 px-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                            registerMode === "manual"
                              ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          <FileText className={`w-4 h-4 shrink-0 ${registerMode === "manual" ? "text-slate-900" : "text-slate-400"}`} />
                          <div className="text-left leading-tight">
                            <span className="block font-bold text-[11px] sm:text-xs">Manual Registration</span>
                            <span className="block text-[9px] sm:text-[10px] font-normal text-slate-500">
                              Insert Full Information
                            </span>
                          </div>
                        </button>
                      </div>

                      {/* --------------------------------------------------------- */}
                      {/* METHOD A: FAYDA NATIONAL ID (FIN -> OTP -> CONFIRMATION)  */}
                      {/* --------------------------------------------------------- */}
                      {registerMode === "fayda" && (
                        <div className="space-y-4">
                          {/* Fayda Progress Indicator */}
                          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                                  faydaStep >= 1 ? "bg-[#00450d] text-white" : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                {faydaStep > 1 ? <Check className="w-3 h-3 stroke-[3]" /> : "1"}
                              </div>
                              <span className={`text-[11px] font-bold ${faydaStep === 1 ? "text-slate-900" : "text-slate-500"}`}>
                                Fayda FIN
                              </span>
                            </div>

                            <div className={`flex-1 h-[2px] mx-2 ${faydaStep >= 2 ? "bg-[#00450d]" : "bg-slate-200"}`} />

                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                                  faydaStep >= 2 ? "bg-[#00450d] text-white" : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                {faydaStep > 2 ? <Check className="w-3 h-3 stroke-[3]" /> : "2"}
                              </div>
                              <span className={`text-[11px] font-bold ${faydaStep === 2 ? "text-slate-900" : "text-slate-500"}`}>
                                SMS OTP
                              </span>
                            </div>

                            <div className={`flex-1 h-[2px] mx-2 ${faydaStep >= 3 ? "bg-[#00450d]" : "bg-slate-200"}`} />

                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                                  faydaStep === 3 ? "bg-[#00450d] text-white" : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                3
                              </div>
                              <span className={`text-[11px] font-bold ${faydaStep === 3 ? "text-slate-900" : "text-slate-500"}`}>
                                Confirm Profile
                              </span>
                            </div>
                          </div>

                          {/* FAYDA STEP 1: FIN INPUT */}
                          {faydaStep === 1 && (
                            <form onSubmit={handleVerifyFin} className="space-y-3.5">
                              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3 flex items-start gap-2.5">
                                <ShieldCheck className="w-4 h-4 text-[#00450d] shrink-0 mt-0.5" />
                                <div className="text-xs">
                                  <span className="font-bold text-slate-900 block text-[11px]">
                                    Direct Integration with National ID Program (NIDP)
                                  </span>
                                  <span className="text-slate-600 block mt-0.5 text-[11px] leading-relaxed">
                                    Enter your 12 to 16 digit Fayda Identification Number (FIN / NID). We will verify your identity and send an SMS OTP to your registered phone.
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-slate-800">
                                    Fayda Identification Number (FIN / NID) <span className="text-red-500">*</span>
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => setFinNumber("ET-NID-00892418")}
                                    className="text-[11px] font-semibold text-emerald-800 hover:underline flex items-center gap-1"
                                  >
                                    <Sparkles className="w-3 h-3" />
                                    Use Demo FIN
                                  </button>
                                </div>

                                <div className="relative">
                                  <Input
                                    value={finNumber}
                                    onChange={(e) => setFinNumber(e.target.value.toUpperCase())}
                                    placeholder="e.g. ET-NID-00892418 or 1234-5678-9012"
                                    className="h-10 text-xs font-mono tracking-wider pl-9 bg-slate-50/50 border-slate-300 focus:bg-white"
                                    required
                                  />
                                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                </div>
                                <p className="text-[10px] text-slate-400">
                                  Found on the front of your physical Fayda card or Fayda digital mobile wallet.
                                </p>
                              </div>

                              {finError && (
                                <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                  <span>{finError}</span>
                                </div>
                              )}

                              <div className="pt-0.5">
                                <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-600 select-none">
                                  <input
                                    type="checkbox"
                                    checked={faydaConsent}
                                    onChange={(e) => setFaydaConsent(e.target.checked)}
                                    className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-[#00450d] focus:ring-[#00450d]"
                                  />
                                  <span>
                                    I authorize the Ethiopian National ID Program (NIDP) to share my verified demographic data with the Government Rental Administration and Municipal Services (GRAMS).
                                  </span>
                                </label>
                              </div>

                              <div className="pt-1">
                                <Button
                                  type="submit"
                                  disabled={isFinVerifying}
                                  className="w-full bg-[#00450d] hover:bg-[#1b5e20] text-white h-10 text-xs font-bold rounded-xl shadow-sm"
                                >
                                  {isFinVerifying ? (
                                    <span className="flex items-center gap-2">
                                      <RefreshCw className="w-4 h-4 animate-spin" />
                                      Connecting to National ID Registry...
                                    </span>
                                  ) : (
                                    <span className="flex items-center justify-center gap-2">
                                      <span>Verify FIN & Send SMS OTP</span>
                                      <ArrowRight className="w-4 h-4" />
                                    </span>
                                  )}
                                </Button>
                              </div>
                            </form>
                          )}

                          {/* FAYDA STEP 2: OTP INPUT */}
                          {faydaStep === 2 && (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                              <div className="text-center space-y-1">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00450d] flex items-center justify-center mx-auto border border-emerald-200">
                                  <Smartphone className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900">
                                  Enter 6-Digit SMS Verification Code
                                </h3>
                                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                                  We sent an OTP code to your Fayda registered mobile number:{" "}
                                  <span className="font-mono font-bold text-slate-900">{verifiedProfile.phoneMasked}</span>
                                </p>
                              </div>

                              {/* Segmented OTP 6-Digit Inputs */}
                              <div className="space-y-2">
                                <div className="flex justify-center items-center gap-1.5 sm:gap-2">
                                  {otpDigits.map((digit, idx) => (
                                    <input
                                      key={idx}
                                      ref={(el) => {(otpInputRefs.current[idx] = el)}}
                                      type="text"
                                      inputMode="numeric"
                                      maxLength={1}
                                      value={digit}
                                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                      onPaste={handleOtpPaste}
                                      className="w-9 h-11 sm:w-10 sm:h-12 text-center text-lg font-bold font-mono border-2 border-slate-200 rounded-xl bg-white focus:border-[#00450d] focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                                    />
                                  ))}
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                                  <button
                                    type="button"
                                    onClick={() => setOtpDigits(["5", "8", "2", "9", "1", "4"])}
                                    className="font-medium text-emerald-800 hover:underline flex items-center gap-1"
                                  >
                                    <Sparkles className="w-3 h-3" />
                                    Auto-fill Demo (582914)
                                  </button>

                                  <div>
                                    {countdown > 0 ? (
                                      <span className="text-slate-400">
                                        Resend code in <strong className="text-slate-700">{countdown}s</strong>
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        className="font-bold text-[#00450d] hover:underline flex items-center gap-1"
                                      >
                                        <RefreshCw className="w-3 h-3" />
                                        Resend OTP
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {otpError && (
                                <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                  <span>{otpError}</span>
                                </div>
                              )}

                              <div className="pt-1 flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setFaydaStep(1)}
                                  className="text-xs h-10 px-3"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                                  Back
                                </Button>
                                <Button
                                  type="submit"
                                  disabled={isOtpVerifying}
                                  className="flex-1 bg-[#00450d] hover:bg-[#1b5e20] text-white h-10 text-xs font-bold rounded-xl shadow-sm"
                                >
                                  {isOtpVerifying ? (
                                    <span className="flex items-center justify-center gap-2">
                                      <RefreshCw className="w-4 h-4 animate-spin" />
                                      Verifying Token...
                                    </span>
                                  ) : (
                                    <span className="flex items-center justify-center gap-2">
                                      <span>Verify Code & Retrieve Profile</span>
                                      <ArrowRight className="w-4 h-4" />
                                    </span>
                                  )}
                                </Button>
                              </div>
                            </form>
                          )}

                          {/* FAYDA STEP 3: PROFILE CONFIRMATION & PORTAL PASSWORD */}
                          {faydaStep === 3 && (
                            <form onSubmit={handleCompleteFaydaRegistration} className="space-y-4">
                              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 space-y-2.5">
                                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                                  <div className="flex items-center gap-2">
                                    <BadgeCheck className="w-4 h-4 text-emerald-700" />
                                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                                      National ID Record Verified
                                    </span>
                                  </div>
                                  <Badge variant="verified" className="text-[10px] py-0.5">
                                    NIDP Match 100%
                                  </Badge>
                                </div>

                                {/* Citizen Verified Details Card */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                  <div>
                                    <span className="text-slate-500 block text-[10px]">Full Name</span>
                                    <span className="font-bold text-slate-900 block">
                                      {verifiedProfile.firstName} {verifiedProfile.middleName} {verifiedProfile.lastName}
                                    </span>
                                  </div>

                                  <div>
                                    <span className="text-slate-500 block text-[10px]">Fayda FIN Identifier</span>
                                    <span className="font-mono font-bold text-emerald-800 block">
                                      {verifiedProfile.fin}
                                    </span>
                                  </div>

                                  <div>
                                    <span className="text-slate-500 block text-[10px]">Verified Phone Number</span>
                                    <span className="font-mono font-medium text-slate-900 block">
                                      {verifiedProfile.phoneFull}
                                    </span>
                                  </div>

                                  <div>
                                    <span className="text-slate-500 block text-[10px]">Date of Birth / Gender</span>
                                    <span className="text-slate-900 block">
                                      {verifiedProfile.dateOfBirth} &bull; {verifiedProfile.gender}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Citizen Role Preference */}
                              <div>
                                <label className="text-[11px] font-bold text-slate-800 block mb-1">
                                  Select Your Primary Municipal Portal Role
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedRole("both")}
                                    className={`p-2 rounded-lg border text-center transition-all ${
                                      selectedRole === "both"
                                        ? "border-[#00450d] bg-emerald-50/50 ring-1 ring-[#00450d] text-slate-900 font-bold"
                                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                    }`}
                                  >
                                    <span className="block text-xs font-bold">Both</span>
                                    <span className="block text-[9px] text-slate-400 font-normal">All features</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setSelectedRole("tenant")}
                                    className={`p-2 rounded-lg border text-center transition-all ${
                                      selectedRole === "tenant"
                                        ? "border-[#00450d] bg-emerald-50/50 ring-1 ring-[#00450d] text-slate-900 font-bold"
                                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                    }`}
                                  >
                                    <span className="block text-xs font-bold">Tenant</span>
                                    <span className="block text-[9px] text-slate-400 font-normal">Rent & lease</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setSelectedRole("landlord")}
                                    className={`p-2 rounded-lg border text-center transition-all ${
                                      selectedRole === "landlord"
                                        ? "border-[#00450d] bg-emerald-50/50 ring-1 ring-[#00450d] text-slate-900 font-bold"
                                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                    }`}
                                  >
                                    <span className="block text-xs font-bold">Landlord</span>
                                    <span className="block text-[9px] text-slate-400 font-normal">List & manage</span>
                                  </button>
                                </div>
                              </div>

                              {/* Security Setup: Password & PIN */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-700 block mb-1">
                                    Create Password <span className="text-red-500">*</span>
                                  </label>
                                  <div className="relative">
                                    <Input
                                      type={showPassword ? "text" : "password"}
                                      value={portalPassword}
                                      onChange={(e) => setPortalPassword(e.target.value)}
                                      placeholder="Minimum 8 characters"
                                      className="h-8.5 text-xs pr-8 bg-white"
                                      required
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowPassword(!showPassword)}
                                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                                    >
                                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-slate-700 block mb-1">
                                    4-Digit Security PIN
                                  </label>
                                  <Input
                                    type="password"
                                    maxLength={4}
                                    value={portalPin}
                                    onChange={(e) => setPortalPin(e.target.value)}
                                    placeholder="4 Digits (e.g. 4829)"
                                    className="h-8.5 text-xs font-mono tracking-widest bg-white"
                                  />
                                </div>
                              </div>

                              <div className="pt-1 flex items-center justify-between gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setFaydaStep(2)}
                                  className="text-xs h-10 px-3"
                                >
                                  Back
                                </Button>
                                <Button
                                  type="submit"
                                  className="flex-1 bg-[#00450d] hover:bg-[#1b5e20] text-white h-10 text-xs font-bold rounded-xl shadow-sm"
                                >
                                  Complete Registration & Launch Portal
                                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                </Button>
                              </div>
                            </form>
                          )}
                        </div>
                      )}

                      {/* --------------------------------------------------------- */}
                      {/* METHOD B: MANUAL REGISTRATION (FULL INFORMATION FORM)     */}
                      {/* --------------------------------------------------------- */}
                      {registerMode === "manual" && (
                        <form onSubmit={handleManualSubmit} className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                          {/* Section 1: Personal Legal Identity */}
                          <div className="space-y-2">
                            <p className="text-red-500 text-xs">{submitError}</p>
                            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
                              <User className="w-3.5 h-3.5 text-slate-500" />
                              1. Personal Legal Identity
                            </h4>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              <div>
                                <label className="text-[10px] font-semibold text-slate-700 block mb-1">
                                  First Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                  value={firstName}
                                  onChange={(e) => setFirstName(e.target.value)}
                                  placeholder="e.g. Almaz"
                                  className="h-8.5 text-xs"
                                  required
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-semibold text-slate-700 block mb-1">
                                  Middle Name
                                </label>
                                <Input
                                  value={middleName}
                                  onChange={(e) => setMiddleName(e.target.value)}
                                  placeholder="e.g. Bekele"
                                  className="h-8.5 text-xs"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-semibold text-slate-700 block mb-1">
                                  Last Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                  value={lastName}
                                  onChange={(e) => setLastName(e.target.value)}
                                  placeholder="e.g. Tadesse"
                                  className="h-8.5 text-xs"
                                  required
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              <div>
                                <label className="text-[10px] font-semibold text-slate-700 block mb-1">
                                  Gender
                                </label>
                                <select
                                  value={gender}
                                  onChange={(e) => setGender(e.target.value)}
                                  className="w-full h-8.5 px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
                                >
                                  <option value="Female">Female</option>
                                  <option value="Male">Male</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] font-semibold text-slate-700 block mb-1">
                                  Date of Birth
                                </label>
                                <Input
                                  type="date"
                                  value={dateOfBirth}
                                  onChange={(e) => setDateOfBirth(e.target.value)}
                                  className="h-8.5 text-xs"
                                  required
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-semibold text-slate-700 block mb-1">
                                  Works On
                                </label>
                                <Input
                                  type="text"
                                  value={worksOn}
                                  onChange={(e) => setWorksOn(e.target.value)}
                                  placeholder="Organization / Employer"
                                  className="h-8.5 text-xs"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-semibold text-slate-700 block mb-1">
                                  Phone Number <span className="text-red-500">*</span>
                                </label>
                                <Input
                                  value={phoneNumber}
                                  onChange={(e) => setPhoneNumber(e.target.value)}
                                  placeholder="+251 91 234 5678"
                                  className="h-8.5 text-xs font-mono"
                                  required
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-semibold text-slate-700 block mb-1">
                                  Email Address
                                </label>
                                <Input
                                  type="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  placeholder="user@domain.et"
                                  className="h-8.5 text-xs"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Citizen Role Preference */}
                          <div className="pt-1">
                            <label className="text-[10px] font-bold text-slate-800 block mb-1">
                              Select Your Primary Municipal Portal Role
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                type="button"
                                onClick={() => { setSelectedRole("both"); setRole("both"); }}
                                className={`p-2 rounded-lg border text-center transition-all ${
                                  selectedRole === "both"
                                    ? "border-[#00450d] bg-emerald-50/50 ring-1 ring-[#00450d] text-slate-900 font-bold"
                                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                <span className="block text-xs font-bold">Both</span>
                                <span className="block text-[9px] text-slate-400 font-normal">All features</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => { setSelectedRole("tenant"); setRole("tenant"); }}
                                className={`p-2 rounded-lg border text-center transition-all ${
                                  selectedRole === "tenant"
                                    ? "border-[#00450d] bg-emerald-50/50 ring-1 ring-[#00450d] text-slate-900 font-bold"
                                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                <span className="block text-xs font-bold">Tenant</span>
                                <span className="block text-[9px] text-slate-400 font-normal">Rent & lease</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => { setSelectedRole("landlord"); setRole("landlord"); }}
                                className={`p-2 rounded-lg border text-center transition-all ${
                                  selectedRole === "landlord"
                                    ? "border-[#00450d] bg-emerald-50/50 ring-1 ring-[#00450d] text-slate-900 font-bold"
                                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                <span className="block text-xs font-bold">Landlord</span>
                                <span className="block text-[9px] text-slate-400 font-normal">List & manage</span>
                              </button>
                            </div>
                          </div>

                          {/* Section: Security Password */}
                          <div className="space-y-2 pt-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-semibold text-slate-700 block mb-1">
                                  Account Password <span className="text-red-500">*</span>
                                </label>
                                <Input
                                  type="password"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  placeholder="Minimum 8 characters"
                                  className="h-8.5 text-xs"
                                  required
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-semibold text-slate-700 block mb-1">
                                  Confirm Password <span className="text-red-500">*</span>
                                </label>
                                <Input
                                  type="password"
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  placeholder="Re-enter password"
                                  className="h-8.5 text-xs"
                                  required
                                />
                              </div>
                            </div>

                            <label className="flex items-start gap-2 cursor-pointer text-[10px] text-slate-600 select-none pt-1">
                              <input
                                type="checkbox"
                                checked={agreedProclamation}
                                onChange={(e) => setAgreedProclamation(e.target.checked)}
                                className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-[#00450d] focus:ring-[#00450d]"
                                required
                              />
                              <span>
                                I declare that all submitted information is accurate under Ethiopian Proclamation No. 1320/2024 and agree to GRAMS terms of municipal service.
                              </span>
                            </label>
                          </div>

                          <div className="pt-1">
                            <Button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full bg-[#00450d] hover:bg-[#1b5e20] text-white h-10 text-xs font-bold rounded-xl shadow-sm"
                            >
                              {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  Processing Registration...
                                </span>
                              ) : (
                                <span className="flex items-center justify-center gap-2">
                                  <span>Submit Citizen Registration</span>
                                  <ArrowRight className="w-4 h-4" />
                                </span>
                              )}
                            </Button>
                          </div>
                        </form>
                      )}

                      {/* Footer Switcher */}
                      <div className="pt-1 text-center text-xs text-slate-500">
                        Already registered with GRAMS?{" "}
                        <button
                          type="button"
                          onClick={() => setAuthMode("signin")}
                          className="font-bold text-[#00450d] hover:underline"
                        >
                          Sign In to Portal
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* MODE 2: SIGN IN FORM                                      */}
                  {/* ========================================================= */}
                  {authMode === "signin" && (
                    <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Email Address
                          </label>
                          <div className="relative">
                            <Input
                              type="email"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              placeholder="citizen.test@example.com"
                              className="pl-9 h-10 text-xs bg-slate-50/50"
                              required
                            />
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Password
                          </label>
                          <div className="relative">
                            <Input
                              type="password"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              placeholder="Enter password"
                              className="pl-9 h-10 text-xs bg-slate-50/50"
                              required
                            />
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          </div>
                        </div>
                      </div>

                      {loginError && (
                        <div className="p-2 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{loginError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full h-10 rounded-xl bg-[#00450d] hover:bg-[#1b5e20] text-white font-bold text-xs tracking-wide uppercase shadow-lg shadow-emerald-950/20 hover:shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
                      >
                        {isLoggingIn ? (
                          <span className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Authenticating...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <span>LOGIN TO PORTAL</span>
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        )}
                      </button>

                      <div className="pt-1 text-center text-xs text-slate-500">
                        Don&apos;t have a citizen account?{" "}
                        <button
                          type="button"
                          onClick={() => setAuthMode("register")}
                          className="font-bold text-[#00450d] hover:underline"
                        >
                          Create Account
                        </button>
                      </div>
                    </form>
                  )}
                  
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CitizenHome;