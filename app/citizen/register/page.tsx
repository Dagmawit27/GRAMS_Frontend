"use client";
import React, { useState, useEffect, useRef } from "react";
import { useCitizenData } from "@/hooks/useCitizenData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  RefreshCw,
  Lock,
  User,
  KeyRound,
  FileText,
  MapPin,
  Building,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  BadgeCheck
} from "lucide-react";

export const CitizenRegisterPage: React.FC = () => {
  const { handleNavigate } = useCitizenData();

  // Registration Mode: 'fayda' (National ID + OTP) or 'manual' (Full Information)
  const [registerMode, setRegisterMode] = useState<"fayda" | "manual">("fayda");

  // ==========================================
  // FAYDA REGISTRATION STATE
  // ==========================================
  // Fayda sub-step: 1 = FIN Input, 2 = OTP Verification, 3 = Profile Confirmation & PIN
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
    fullNameEn: string;
    fullNameAm: string;
    phoneMasked: string;
    phoneFull: string;
    gender: string;
    dob: string;
    subCity: string;
    woreda: string;
    kebele: string;
    avatarUrl: string;
  }>({
    fin: "ET-NID-00892418",
    fullNameEn: "Dagmawit Mesfin Tadesse",
    fullNameAm: "ዳግማዊት መስፈን ታደሰ",
    phoneMasked: "+251 91 ••• ••67",
    phoneFull: "+251 91 123 4567",
    gender: "Female",
    dob: "14/10/1993",
    subCity: "Bole Sub City",
    woreda: "Woreda 03",
    kebele: "Kebele 08 / House 402",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  });

  const [portalPassword, setPortalPassword] = useState<string>("Ethio@Secure2025");
  const [portalPin, setPortalPin] = useState<string>("4829");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<"both" | "tenant" | "landlord">("both");

  // ==========================================
  // MANUAL REGISTRATION STATE (FULL INFORMATION)
  // ==========================================
  const [manualFullNameEn, setManualFullNameEn] = useState<string>("Almaz Bekele Tadesse");
  const [manualFullNameAm, setManualFullNameAm] = useState<string>("አልማዝ በቀለ ታደሰ");
  const [manualGender, setManualGender] = useState<string>("Female");
  const [manualDob, setManualDob] = useState<string>("1992-06-18");
  const [manualPhone, setManualPhone] = useState<string>("+251 91 234 5678");
  const [manualEmail, setManualEmail] = useState<string>("almaz.bekele@gov.et");
  const [manualSubCity, setManualSubCity] = useState<string>("Kirkos Sub City");
  const [manualWoreda, setManualWoreda] = useState<string>("Woreda 04");
  const [manualHouseNo, setManualHouseNo] = useState<string>("Bldg 12, Apt 3A");
  const [manualDocType, setManualDocType] = useState<string>("Kebele Resident ID");
  const [manualDocId, setManualDocId] = useState<string>("AA-KRK-04-998124");
  const [manualDocUploaded, setManualDocUploaded] = useState<string>("Kebele_Card_FrontBack_Scan.pdf");
  const [manualPassword, setManualPassword] = useState<string>("AlmazPass#2025");
  const [manualConfirmPassword, setManualConfirmPassword] = useState<string>("AlmazPass#2025");
  const [manualAgreedProclamation, setManualAgreedProclamation] = useState<boolean>(true);
  const [isManualSubmitting, setIsManualSubmitting] = useState<boolean>(false);

  // Completion State
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // OTP Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (faydaStep === 2 && countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      setCanResendOtp(true);
    }
    return () => clearTimeout(timer);
  }, [faydaStep, countdown]);

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
    }, 850);
  };

  // OTP digit change handler
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleanValue = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanValue;
    setOtpDigits(newDigits);

    // Auto move to next input
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

    // Simulate cryptographic OTP verification against NIDP auth server
    setTimeout(() => {
      setIsOtpVerifying(false);
      setFaydaStep(3);
    }, 900);
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
  const handleCompleteFaydaRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      handleNavigate("dashboard");
    }, 1200);
  };

  // Handle Manual Full Registration Form Submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualFullNameEn.trim() || !manualPhone.trim()) return;

    if (manualPassword !== manualConfirmPassword) {
      alert("Passwords do not match. Please re-enter.");
      return;
    }

    setIsManualSubmitting(true);
    setTimeout(() => {
      setIsManualSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        handleNavigate("dashboard");
      }, 1200);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-3 sm:p-6 font-sans">
      <div className="w-full max-w-2xl space-y-5 my-4">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-xs mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
              Federal Democratic Republic of Ethiopia
            </span>
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#00450d] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              G
            </div>
            <div className="text-left">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                GRAMS Citizen Portal
              </h1>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                የመንግስት የኪራይ አስተዳደር እና የማዘጋጃ ቤት አገልግሎት
              </p>
            </div>
          </div>
        </div>

        {/* Success Splash */}
        {isSuccess ? (
          <Card className="border-slate-200 bg-white shadow-clean text-center p-8 sm:p-10 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#00450d] flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <Badge variant="verified" className="mx-auto text-xs py-0.5 px-3">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Verified Citizen Account Created
              </Badge>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight pt-1">
                Welcome to GRAMS, {registerMode === "fayda" ? verifiedProfile.fullNameEn : manualFullNameEn}!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                Your citizen account is now linked with the National Housing Registry. Redirecting you to your personal dashboard...
              </p>
            </div>
            <div className="pt-3">
              <Button
                onClick={() => handleNavigate("dashboard")}
                className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-10 px-6 font-semibold"
              >
                Go to Dashboard Now
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="border-slate-200 shadow-clean bg-white overflow-hidden">
            {/* Registration Method Switcher Tabs */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 border-b border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setRegisterMode("fayda")}
                className={`py-2.5 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  registerMode === "fayda"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${registerMode === "fayda" ? "text-emerald-700" : "text-slate-400"}`} />
                <div className="text-left leading-tight">
                  <span className="block font-bold">Register with Fayda ID</span>
                  <span className="block text-[10px] font-normal text-emerald-700 hidden sm:block">
                    FIN & OTP Verification (Instant)
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRegisterMode("manual")}
                className={`py-2.5 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  registerMode === "manual"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <FileText className={`w-4 h-4 ${registerMode === "manual" ? "text-slate-900" : "text-slate-400"}`} />
                <div className="text-left leading-tight">
                  <span className="block font-bold">Manual Registration</span>
                  <span className="block text-[10px] font-normal text-slate-500 hidden sm:block">
                    Insert Full Information
                  </span>
                </div>
              </button>
            </div>

            <CardContent className="p-5 sm:p-7">
              {/* ========================================================================= */}
              {/* METHOD 1: FAYDA NATIONAL ID (FIN -> OTP -> PROFILE CONFIRMATION)          */}
              {/* ========================================================================= */}
              {registerMode === "fayda" && (
                <div className="space-y-6">
                  {/* Fayda Progress Indicator */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          faydaStep >= 1 ? "bg-[#00450d] text-white" : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {faydaStep > 1 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "1"}
                      </div>
                      <span className={`text-xs font-bold ${faydaStep === 1 ? "text-slate-900" : "text-slate-500"}`}>
                        Fayda FIN
                      </span>
                    </div>

                    <div className={`flex-1 h-[2px] mx-2.5 ${faydaStep >= 2 ? "bg-[#00450d]" : "bg-slate-200"}`} />

                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          faydaStep >= 2 ? "bg-[#00450d] text-white" : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {faydaStep > 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "2"}
                      </div>
                      <span className={`text-xs font-bold ${faydaStep === 2 ? "text-slate-900" : "text-slate-500"}`}>
                        SMS OTP
                      </span>
                    </div>

                    <div className={`flex-1 h-[2px] mx-2.5 ${faydaStep >= 3 ? "bg-[#00450d]" : "bg-slate-200"}`} />

                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          faydaStep === 3 ? "bg-[#00450d] text-white" : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        3
                      </div>
                      <span className={`text-xs font-bold ${faydaStep === 3 ? "text-slate-900" : "text-slate-500"}`}>
                        Confirm Profile
                      </span>
                    </div>
                  </div>

                  {/* ---------------------------------------------------- */}
                  {/* FAYDA STEP 1: FIN INPUT HANDLER                      */}
                  {/* ---------------------------------------------------- */}
                  {faydaStep === 1 && (
                    <form onSubmit={handleVerifyFin} className="space-y-4">
                      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-[#00450d] shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <span className="font-bold text-slate-900 block">
                            Direct Integration with National ID Program (NIDP)
                          </span>
                          <span className="text-slate-600 block mt-0.5 leading-relaxed">
                            Enter your 12 to 16 digit Fayda Identification Number (FIN / NID). We will verify your identity and send an SMS OTP to your registered phone.
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
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
                            className="h-11 text-sm font-mono tracking-wider pl-10 bg-slate-50/50 border-slate-300 focus:bg-white"
                            required
                          />
                          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Found on the front of your physical Fayda card or Fayda digital mobile wallet.
                        </p>
                      </div>

                      {finError && (
                        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{finError}</span>
                        </div>
                      )}

                      <div className="pt-1">
                        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 select-none">
                          <input
                            type="checkbox"
                            checked={faydaConsent}
                            onChange={(e) => setFaydaConsent(e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#00450d] focus:ring-[#00450d]"
                          />
                          <span>
                            I authorize the Ethiopian National ID Program (NIDP) to share my verified demographic data with the Government Rental Administration and Municipal Services (GRAMS).
                          </span>
                        </label>
                      </div>

                      <div className="pt-3">
                        <Button
                          type="submit"
                          disabled={isFinVerifying}
                          className="w-full bg-[#00450d] hover:bg-[#1b5e20] text-white h-11 text-xs sm:text-sm font-bold rounded-lg shadow-sm"
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

                  {/* ---------------------------------------------------- */}
                  {/* FAYDA STEP 2: OTP INPUT HANDLER                      */}
                  {/* ---------------------------------------------------- */}
                  {faydaStep === 2 && (
                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                      <div className="text-center space-y-1.5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00450d] flex items-center justify-center mx-auto border border-emerald-200">
                          <Smartphone className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">
                          Enter 6-Digit SMS Verification Code
                        </h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          We sent an OTP code to your Fayda registered mobile number:{" "}
                          <span className="font-mono font-bold text-slate-900">{verifiedProfile.phoneMasked}</span>
                        </p>
                      </div>

                      {/* Segmented OTP 6-Digit Inputs */}
                      <div className="space-y-3">
                        <div className="flex justify-center items-center gap-2 sm:gap-3">
                          {otpDigits.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => (otpInputRefs.current[idx] = el)}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              onPaste={handleOtpPaste}
                              className="w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono border-2 border-slate-200 rounded-xl bg-white focus:border-[#00450d] focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                            />
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 px-2">
                          <button
                            type="button"
                            onClick={() => setOtpDigits(["5", "8", "2", "9", "1", "4"])}
                            className="font-medium text-emerald-800 hover:underline flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Auto-fill Demo Code (582914)
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
                        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{otpError}</span>
                        </div>
                      )}

                      <div className="pt-2 flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setFaydaStep(1)}
                          className="text-xs h-11 px-4"
                        >
                          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                          Change FIN
                        </Button>
                        <Button
                          type="submit"
                          disabled={isOtpVerifying}
                          className="flex-1 bg-[#00450d] hover:bg-[#1b5e20] text-white h-11 text-xs sm:text-sm font-bold rounded-lg shadow-sm"
                        >
                          {isOtpVerifying ? (
                            <span className="flex items-center justify-center gap-2">
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Verifying Biometric Token...
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

                  {/* ---------------------------------------------------- */}
                  {/* FAYDA STEP 3: PROFILE CONFIRMATION & PORTAL PASSWORD */}
                  {/* ---------------------------------------------------- */}
                  {faydaStep === 3 && (
                    <form onSubmit={handleCompleteFaydaRegistration} className="space-y-5">
                      <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                          <div className="flex items-center gap-2">
                            <BadgeCheck className="w-5 h-5 text-emerald-700" />
                            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                              National ID Record Verified
                            </span>
                          </div>
                          <Badge variant="verified" className="text-[10px] py-0.5">
                            NIDP Match 100%
                          </Badge>
                        </div>

                        {/* Citizen Verified Details Card */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-slate-500 block text-[10px]">Full Name (English / Amharic)</span>
                            <span className="font-bold text-slate-900 block">
                              {verifiedProfile.fullNameEn}
                            </span>
                            <span className="text-slate-600 text-[11px] block">
                              {verifiedProfile.fullNameAm}
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
                            <span className="text-slate-500 block text-[10px]">Primary Jurisdiction</span>
                            <span className="font-medium text-slate-900 block">
                              {verifiedProfile.subCity}, {verifiedProfile.woreda}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Citizen Role Preference */}
                      <div>
                        <label className="text-xs font-bold text-slate-800 block mb-1.5">
                          Select Your Primary Municipal Portal Role
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedRole("both")}
                            className={`p-2.5 rounded-lg border text-center transition-all ${
                              selectedRole === "both"
                                ? "border-[#00450d] bg-emerald-50/50 ring-1 ring-[#00450d] text-slate-900 font-bold"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <span className="block text-xs">Tenant & Landlord</span>
                            <span className="block text-[10px] text-slate-400 font-normal mt-0.5">All features</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedRole("tenant")}
                            className={`p-2.5 rounded-lg border text-center transition-all ${
                              selectedRole === "tenant"
                                ? "border-[#00450d] bg-emerald-50/50 ring-1 ring-[#00450d] text-slate-900 font-bold"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <span className="block text-xs">Tenant / Renter</span>
                            <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Rent & agreements</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedRole("landlord")}
                            className={`p-2.5 rounded-lg border text-center transition-all ${
                              selectedRole === "landlord"
                                ? "border-[#00450d] bg-emerald-50/50 ring-1 ring-[#00450d] text-slate-900 font-bold"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <span className="block text-xs">Property Owner</span>
                            <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Listings & leases</span>
                          </button>
                        </div>
                      </div>

                      {/* Security Setup: Password & PIN */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Create Portal Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              value={portalPassword}
                              onChange={(e) => setPortalPassword(e.target.value)}
                              placeholder="Minimum 8 characters"
                              className="h-9.5 text-xs pr-8 bg-white"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            4-Digit Quick Security PIN
                          </label>
                          <Input
                            type="password"
                            maxLength={4}
                            value={portalPin}
                            onChange={(e) => setPortalPin(e.target.value)}
                            placeholder="4 Digits (e.g. 4829)"
                            className="h-9.5 text-xs font-mono tracking-widest bg-white"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setFaydaStep(2)}
                          className="text-xs h-10 px-4"
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-[#00450d] hover:bg-[#1b5e20] text-white h-10 text-xs sm:text-sm font-bold rounded-lg shadow-sm"
                        >
                          Complete Registration & Launch Portal
                          <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* METHOD 2: MANUAL REGISTRATION (FULL INFORMATION INSERTION)                */}
              {/* ========================================================================= */}
              {registerMode === "manual" && (
                <form onSubmit={handleManualSubmit} className="space-y-5">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3">
                    <Info className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 block">
                        Manual Citizen Registration Form (የተሟላ መረጃ)
                      </span>
                      <span className="text-slate-600 block mt-0.5 leading-relaxed">
                        If you do not currently hold a Fayda National ID, you may insert your full legal identity details, residency address, and Kebele / Passport identification for municipal review.
                      </span>
                    </div>
                  </div>

                  {/* Section 1: Personal Identity */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      1. Personal Legal Identity
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Full Legal Name (English) <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={manualFullNameEn}
                          onChange={(e) => setManualFullNameEn(e.target.value)}
                          placeholder="e.g. Almaz Bekele Tadesse"
                          className="h-9.5 text-xs"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          ሙሉ ስም በአማርኛ (Full Name in Amharic)
                        </label>
                        <Input
                          value={manualFullNameAm}
                          onChange={(e) => setManualFullNameAm(e.target.value)}
                          placeholder="e.g. አልማዝ በቀለ ታደሰ"
                          className="h-9.5 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Gender
                        </label>
                        <select
                          value={manualGender}
                          onChange={(e) => setManualGender(e.target.value)}
                          className="w-full h-9.5 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
                        >
                          <option value="Female">Female (ሴት)</option>
                          <option value="Male">Male (ወንድ)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Date of Birth
                        </label>
                        <Input
                          type="date"
                          value={manualDob}
                          onChange={(e) => setManualDob(e.target.value)}
                          className="h-9.5 text-xs"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={manualPhone}
                          onChange={(e) => setManualPhone(e.target.value)}
                          placeholder="+251 91 234 5678"
                          className="h-9.5 text-xs font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          value={manualEmail}
                          onChange={(e) => setManualEmail(e.target.value)}
                          placeholder="user@domain.et"
                          className="h-9.5 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Municipal Residency & Address */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      2. Municipal Residency & Sub-City Jurisdiction
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Sub-City Administration <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={manualSubCity}
                          onChange={(e) => setManualSubCity(e.target.value)}
                          className="w-full h-9.5 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
                        >
                          <option value="Bole Sub City">Bole Sub City (ቦሌ)</option>
                          <option value="Kirkos Sub City">Kirkos Sub City (ቂርቆስ)</option>
                          <option value="Yeka Sub City">Yeka Sub City (የካ)</option>
                          <option value="Arada Sub City">Arada Sub City (አራዳ)</option>
                          <option value="Nifas Silk-Lafto Sub City">Nifas Silk-Lafto (ንፋስ ስልክ)</option>
                          <option value="Lideta Sub City">Lideta Sub City (ልደታ)</option>
                          <option value="Gullele Sub City">Gullele Sub City (ጉለሌ)</option>
                          <option value="Akaky Kaliti Sub City">Akaky Kaliti (አቃቂ ቃሊቲ)</option>
                          <option value="Kolfe Keranio Sub City">Kolfe Keranio (ኮልፌ ቀራኒዮ)</option>
                          <option value="Addis Ketema Sub City">Addis Ketema (አዲስ ከተማ)</option>
                          <option value="Lemi Kura Sub City">Lemi Kura (ለሚ ኩራ)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Woreda Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={manualWoreda}
                          onChange={(e) => setManualWoreda(e.target.value)}
                          placeholder="e.g. Woreda 04"
                          className="h-9.5 text-xs"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Kebele / House / Block No.
                        </label>
                        <Input
                          value={manualHouseNo}
                          onChange={(e) => setManualHouseNo(e.target.value)}
                          placeholder="e.g. House 402 / Block 12"
                          className="h-9.5 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Identity Document Upload */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      3. Identity Document & Verification Attachment
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Document Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={manualDocType}
                          onChange={(e) => setManualDocType(e.target.value)}
                          className="w-full h-9.5 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
                        >
                          <option value="Kebele Resident ID">Kebele Resident ID Card</option>
                          <option value="Ethiopian Passport">Ethiopian Passport</option>
                          <option value="Yellow Card (Origin ID)">Yellow Card / Ethiopian Origin ID</option>
                          <option value="Driver License">National Driver's License</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Document Reference / Serial No. <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={manualDocId}
                          onChange={(e) => setManualDocId(e.target.value)}
                          placeholder="e.g. AA-KRK-04-XXXXX"
                          className="h-9.5 text-xs font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Upload Clear ID Scan or Photo (Front & Back)
                      </label>
                      <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 hover:bg-slate-100/60 transition-colors cursor-pointer text-center">
                        <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                        <span className="text-xs font-semibold text-slate-800 block">
                          {manualDocUploaded || "Click to upload ID Card Document"}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          PDF, JPG, PNG (Max 10MB) &bull; Verified by Woreda Registrar
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Security Password */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      4. Portal Password & Security Setup
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Account Password <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="password"
                          value={manualPassword}
                          onChange={(e) => setManualPassword(e.target.value)}
                          placeholder="Minimum 8 characters"
                          className="h-9.5 text-xs"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="password"
                          value={manualConfirmPassword}
                          onChange={(e) => setManualConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="h-9.5 text-xs"
                          required
                        />
                      </div>
                    </div>

                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 select-none pt-1">
                      <input
                        type="checkbox"
                        checked={manualAgreedProclamation}
                        onChange={(e) => setManualAgreedProclamation(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#00450d] focus:ring-[#00450d]"
                        required
                      />
                      <span>
                        I declare that all submitted information is accurate under Ethiopian Proclamation No. 1320/2024 and agree to GRAMS terms of municipal service.
                      </span>
                    </label>
                  </div>

                  <div className="pt-3">
                    <Button
                      type="submit"
                      disabled={isManualSubmitting}
                      className="w-full bg-[#00450d] hover:bg-[#1b5e20] text-white h-11 text-xs sm:text-sm font-bold rounded-lg shadow-sm"
                    >
                      {isManualSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Processing Municipal Registration...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <span>Submit Full Registration for Verification</span>
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>

            {/* Card Footer: Sign-in link & Security assurance */}
            <div className="bg-slate-50 px-5 sm:px-7 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <span className="text-slate-500">
                Already registered with GRAMS?{" "}
                <button
                  type="button"
                  onClick={() => handleNavigate("dashboard")}
                  className="font-bold text-emerald-800 hover:underline"
                >
                  Sign In to Citizen Portal
                </button>
              </span>

              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>NIDP & Ministry of Innovation (MInT) Certified</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CitizenRegisterPage;
