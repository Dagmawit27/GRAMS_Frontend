"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Building2,
  CreditCard,
  Key,
  Smartphone,
  Landmark,
  Shield,
  FileCheck,
  Check,
  AlertCircle,
  FileText,
  Bell,
  Camera,
  MapPin,
  RefreshCw,
  Phone,
  Mail,
  UserCheck,
  Fingerprint,
  Home,
  Trash2,
  X,
  SlidersHorizontal,
  Plus,
  Radio,
  ExternalLink,
  Download,
  Scale,
  AlertTriangle,
} from "lucide-react";
import {
  getSession,
  UserSummary,
  updateUserProfile,
  updatePayoutSettings,
  changePassword,
  getNotificationPreferences,
  updateNotificationPreference,
  getMyAgreements,
  getMyProperties,
} from "@/lib/api";
import { useCitizenData } from "@/hooks/useCitizenData";

export const ProfilePage: React.FC = () => {
  const { handleNavigate } = useCitizenData();

  // Active Sub-Navigation Tab
  const [activeTab, setActiveTab] = useState<
    "personal" | "bank" | "security" | "notifications"
  >("personal");

  // User and counts
  const [user, setUser] = useState<UserSummary | null>(null);
  const [activeLeasesCount, setActiveLeasesCount] = useState(1);
  const [propertiesCount, setPropertiesCount] = useState(2);
  const [pageLoading, setPageLoading] = useState(true);

  // Profile management form state
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [regionCity, setRegionCity] = useState("");
  const [subCity, setSubCity] = useState("");
  const [woreda, setWoreda] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [worksOn, setWorksOn] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  // Profile save banner
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState("");

  // -------------------------------------------------------------
  // Bank & Payout Accounts Form State (Supports 3 distinct accounts)
  // -------------------------------------------------------------
  // Account 1 (Primary)
  const [bankName1, setBankName1] = useState("");
  const [accountNumber1, setAccountNumber1] = useState("");
  const [accountHolder1, setAccountHolder1] = useState("");

  // Account 2 (Secondary)
  const [bankName2, setBankName2] = useState("");
  const [accountNumber2, setAccountNumber2] = useState("");
  const [accountHolder2, setAccountHolder2] = useState("");

  // Account 3 (Tertiary)
  const [bankName3, setBankName3] = useState("");
  const [accountNumber3, setAccountNumber3] = useState("");
  const [accountHolder3, setAccountHolder3] = useState("");

  // Preferred primary payout selector
  const [preferredMethod, setPreferredMethod] = useState<"slot1" | "slot2" | "slot3">("slot1");
  const [bankSaving, setBankSaving] = useState(false);
  const [bankSavedMsg, setBankSavedMsg] = useState("");

  // Add Account Form State
  const [showAddAccountForm, setShowAddAccountForm] = useState(false);
  const [newBankName, setNewBankName] = useState("Commercial Bank of Ethiopia (CBE)");
  const [newAccountNumber, setNewAccountNumber] = useState("");
  const [newAccountHolder, setNewAccountHolder] = useState("");
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  // -------------------------------------------------------------
  // Passwords / Security State
  // -------------------------------------------------------------
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // -------------------------------------------------------------
  // Notifications Preferences State
  // -------------------------------------------------------------
  const [notifPrefs, setNotifPrefs] = useState({
    agreements: { inApp: true, sms: true, email: true },
    payments: { inApp: true, sms: true, email: true },
    complaints: { inApp: true, sms: false, email: true },
    notices: { inApp: true, sms: true, email: false },
  });
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifSavedMsg, setNotifSavedMsg] = useState("");

  // -------------------------------------------------------------
  // Load User Data & Counts
  // -------------------------------------------------------------
  const loadUserData = useCallback(async () => {
    setPageLoading(true);
    const session = getSession();
    if (session?.user) {
      const u = session.user;
      setUser(u);
      setFirstName(u.firstName || "");
      setMiddleName(u.middleName || "");
      setLastName(u.lastName || "");
      setPrimaryPhone(u.phoneNumber || "");
      setOfficialEmail(u.email || "");
      if (u.city) setRegionCity(u.city);
      if (u.subCity) setSubCity(u.subCity);
      if (u.woreda) setWoreda(u.woreda);
      if (u.houseNumber) setHouseNumber(u.houseNumber);
      if (u.worksOn) setWorksOn(u.worksOn);
      if (u.tinNumber || u.taxIdentificationNumber) {
        setTinNumber(u.tinNumber || u.taxIdentificationNumber || "");
      }
      if (u.emergencyContactName) setEmergencyContactName(u.emergencyContactName);
      if (u.emergencyContactPhone) setEmergencyContactPhone(u.emergencyContactPhone);

      // Account 1
      if (u.bankName || u.accountNumber) {
        setBankName1(u.bankName || "");
        setAccountNumber1(u.accountNumber || "");
        setAccountHolder1(u.accountHolderName || `${u.firstName} ${u.lastName}`);
      }
      // Account 2
      if (u.bankName2 || u.accountNumber2) {
        setBankName2(u.bankName2 || "");
        setAccountNumber2(u.accountNumber2 || u.phoneNumber);
        setAccountHolder2(u.accountHolderName2 || `${u.firstName} ${u.lastName}`);
      }
      // Account 3
      if (u.bankName3 || u.accountNumber3) {
        setBankName3(u.bankName3 || "");
        setAccountNumber3(u.accountNumber3 || "");
        setAccountHolder3(u.accountHolderName3 || "");
      }

      if (u.preferredPaymentMethod?.includes("2") || u.preferredPaymentMethod?.toLowerCase().includes("telebirr")) {
        setPreferredMethod("slot2");
      } else if (u.preferredPaymentMethod?.includes("3")) {
        setPreferredMethod("slot3");
      } else {
        setPreferredMethod("slot1");
      }
    }

    if (session?.token) {
      try {
        const [agrs, props] = await Promise.allSettled([
          getMyAgreements(session.token),
          getMyProperties(session.token),
        ]);
        if (agrs.status === "fulfilled" && Array.isArray(agrs.value)) {
          setActiveLeasesCount(agrs.value.length);
        }
        if (props.status === "fulfilled" && Array.isArray(props.value)) {
          setPropertiesCount(props.value.length);
        }
      } catch (err) {
        console.warn("Could not load counts:", err);
      }
    }
    setPageLoading(false);
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Derived Full Latin Name
  const legalFullName = useMemo(() => {
    const parts = [firstName, middleName, lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "";
  }, [firstName, middleName, lastName]);

  // Count configured accounts
  const configuredAccountsCount = useMemo(() => {
    let count = 0;
    if (accountNumber1.trim()) count++;
    if (accountNumber2.trim()) count++;
    if (accountNumber3.trim()) count++;
    return count;
  }, [accountNumber1, accountNumber2, accountNumber3]);

  // Role check: Landlord, Both, or Citizen can configure payout accounts
  const isLandlordOrBoth = useMemo(() => {
    const session = getSession();
    const userRoles = (user?.roles || session?.user?.roles || []).map((r: string) =>
      r.toLowerCase().replace("role_", "")
    );
    if (userRoles.length === 0) return true;
    const isTenantOnly = userRoles.includes("tenant") && !userRoles.includes("landlord") && !userRoles.includes("both");
    return !isTenantOnly;
  }, [user]);

  // -------------------------------------------------------------
  // Profile Management: Save Handler
  // -------------------------------------------------------------
  const handleSaveProfile = async () => {
    const session = getSession();
    if (!session?.token) {
      setProfileSavedMsg("Please log in to save changes.");
      return;
    }

    setProfileSaving(true);
    setProfileSavedMsg("");
    try {
      await updateUserProfile(session.token, {
        firstName,
        middleName,
        lastName,
        phone: primaryPhone,
        city: regionCity,
        subCity,
        woreda,
        houseNumber,
        worksOn,
        tinNumber,
        emergencyContactName,
        emergencyContactPhone,
      });
      setProfileSavedMsg("Profile information successfully updated and verified!");
      setTimeout(() => setProfileSavedMsg(""), 4000);
    } catch (err: any) {
      setProfileSavedMsg(err.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  // -------------------------------------------------------------
  // Bank & Account Settings: Save Handler (3 accounts)
  // -------------------------------------------------------------
  const handleSaveBankSettings = async () => {
    const session = getSession();
    if (!session?.token) {
      setBankSavedMsg("Please log in to save bank settings.");
      return;
    }

    if (!tinNumber || tinNumber.trim().length < 8) {
      setBankSavedMsg("Statutory Requirement: Taxpayer Identification Number (TIN) is required before saving bank payout accounts.");
      return;
    }

    setBankSaving(true);
    setBankSavedMsg("");
    try {
      const primaryBank =
        preferredMethod === "slot2" ? bankName2 : preferredMethod === "slot3" ? bankName3 : bankName1;
      const primaryAcc =
        preferredMethod === "slot2" ? accountNumber2 : preferredMethod === "slot3" ? accountNumber3 : accountNumber1;
      const primaryHolder =
        preferredMethod === "slot2" ? accountHolder2 : preferredMethod === "slot3" ? accountHolder3 : accountHolder1;

      await updatePayoutSettings(session.token, {
        tinNumber: tinNumber.trim(),
        bankName: primaryBank || bankName1,
        accountNumber: primaryAcc || accountNumber1,
        accountHolderName: primaryHolder || accountHolder1,
        preferredPaymentMethod: preferredMethod.toUpperCase(),
        bankName2: bankName2 || undefined,
        accountNumber2: accountNumber2 || undefined,
        accountHolderName2: accountHolder2 || undefined,
        bankName3: bankName3 || undefined,
        accountNumber3: accountNumber3 || undefined,
        accountHolderName3: accountHolder3 || undefined,
      });

      setBankSavedMsg("TIN and payout accounts verified & updated with National Bank Escrow!");
      setTimeout(() => setBankSavedMsg(""), 4500);
    } catch (err: any) {
      setBankSavedMsg(err.message || "Failed to save bank settings.");
    } finally {
      setBankSaving(false);
    }
  };

  // Set an existing account as primary
  const handleSetPrimary = async (slot: "slot1" | "slot2" | "slot3") => {
    setPreferredMethod(slot);
    const session = getSession();
    if (!session?.token) return;
    try {
      await updatePayoutSettings(session.token, {
        tinNumber: tinNumber.trim(),
        bankName: bankName1,
        accountNumber: accountNumber1,
        accountHolderName: accountHolder1,
        preferredPaymentMethod: slot.toUpperCase(),
        bankName2: bankName2 || undefined,
        accountNumber2: accountNumber2 || undefined,
        accountHolderName2: accountHolder2 || undefined,
        bankName3: bankName3 || undefined,
        accountNumber3: accountNumber3 || undefined,
        accountHolderName3: accountHolder3 || undefined,
      });
      const activeName = slot === "slot1" ? bankName1 : slot === "slot2" ? bankName2 : bankName3;
      setBankSavedMsg(`★ Primary payout channel updated to ${activeName}!`);
      setTimeout(() => setBankSavedMsg(""), 3500);
    } catch (err: any) {
      setBankSavedMsg(err.message || "Failed to update primary account.");
    }
  };

  // Remove a configured account slot
  const handleRemoveAccount = async (slot: "slot1" | "slot2" | "slot3") => {
    let b1 = bankName1, a1 = accountNumber1, h1 = accountHolder1;
    let b2 = bankName2, a2 = accountNumber2, h2 = accountHolder2;
    let b3 = bankName3, a3 = accountNumber3, h3 = accountHolder3;
    let nextPref = preferredMethod;

    if (slot === "slot1") {
      b1 = ""; a1 = ""; h1 = "";
      setBankName1(""); setAccountNumber1(""); setAccountHolder1("");
      if (preferredMethod === "slot1") {
        nextPref = a2 ? "slot2" : a3 ? "slot3" : "slot1";
        setPreferredMethod(nextPref);
      }
    } else if (slot === "slot2") {
      b2 = ""; a2 = ""; h2 = "";
      setBankName2(""); setAccountNumber2(""); setAccountHolder2("");
      if (preferredMethod === "slot2") {
        nextPref = a1 ? "slot1" : a3 ? "slot3" : "slot1";
        setPreferredMethod(nextPref);
      }
    } else {
      b3 = ""; a3 = ""; h3 = "";
      setBankName3(""); setAccountNumber3(""); setAccountHolder3("");
      if (preferredMethod === "slot3") {
        nextPref = a1 ? "slot1" : a2 ? "slot2" : "slot1";
        setPreferredMethod(nextPref);
      }
    }

    const session = getSession();
    if (!session?.token) return;

    try {
      await updatePayoutSettings(session.token, {
        tinNumber: tinNumber.trim(),
        bankName: b1 || "None",
        accountNumber: a1 || "",
        accountHolderName: h1 || "",
        preferredPaymentMethod: nextPref.toUpperCase(),
        bankName2: b2 || undefined,
        accountNumber2: a2 || undefined,
        accountHolderName2: h2 || undefined,
        bankName3: b3 || undefined,
        accountNumber3: a3 || undefined,
        accountHolderName3: h3 || undefined,
      });
      setBankSavedMsg("Account removed successfully.");
      setTimeout(() => setBankSavedMsg(""), 3500);
    } catch (err: any) {
      setBankSavedMsg(err.message || "Failed to remove account.");
    }
  };

  // Add a new account slot
  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountNumber.trim()) {
      setBankSavedMsg("Please enter an account number or phone number.");
      return;
    }
    if (!tinNumber || tinNumber.trim().length < 8) {
      setBankSavedMsg("Statutory Requirement: Taxpayer Identification Number (TIN) is required before adding bank accounts.");
      return;
    }
    const session = getSession();
    if (!session?.token) return;

    setIsAddingAccount(true);
    setBankSavedMsg("");

    const holder = newAccountHolder.trim() || legalFullName || `${firstName} ${lastName}`;
    let b1 = bankName1, a1 = accountNumber1, h1 = accountHolder1;
    let b2 = bankName2, a2 = accountNumber2, h2 = accountHolder2;
    let b3 = bankName3, a3 = accountNumber3, h3 = accountHolder3;

    let targetSlot: "slot1" | "slot2" | "slot3" = "slot1";
    if (!accountNumber1.trim()) {
      targetSlot = "slot1";
      b1 = newBankName; a1 = newAccountNumber.trim(); h1 = holder;
      setBankName1(b1); setAccountNumber1(a1); setAccountHolder1(h1);
    } else if (!accountNumber2.trim()) {
      targetSlot = "slot2";
      b2 = newBankName; a2 = newAccountNumber.trim(); h2 = holder;
      setBankName2(b2); setAccountNumber2(a2); setAccountHolder2(h2);
    } else {
      targetSlot = "slot3";
      b3 = newBankName; a3 = newAccountNumber.trim(); h3 = holder;
      setBankName3(b3); setAccountNumber3(a3); setAccountHolder3(h3);
    }

    const pref = (configuredAccountsCount === 0 || targetSlot === "slot1") ? "slot1" : preferredMethod;
    if (configuredAccountsCount === 0) {
      setPreferredMethod("slot1");
    }

    try {
      await updatePayoutSettings(session.token, {
        tinNumber: tinNumber.trim(),
        bankName: b1 || newBankName,
        accountNumber: a1 || newAccountNumber.trim(),
        accountHolderName: h1 || holder,
        preferredPaymentMethod: pref.toUpperCase(),
        bankName2: b2 || undefined,
        accountNumber2: a2 || undefined,
        accountHolderName2: h2 || undefined,
        bankName3: b3 || undefined,
        accountNumber3: a3 || undefined,
        accountHolderName3: h3 || undefined,
      });

      setBankSavedMsg(`✓ Successfully linked ${newBankName} account!`);
      setNewAccountNumber("");
      setNewAccountHolder("");
      setShowAddAccountForm(false);
      setTimeout(() => setBankSavedMsg(""), 4500);
    } catch (err: any) {
      setBankSavedMsg(err.message || "Failed to add account.");
    } finally {
      setIsAddingAccount(false);
    }
  };

  // -------------------------------------------------------------
  // Security: Password Update Handler
  // -------------------------------------------------------------
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    const session = getSession();
    if (!session?.token) {
      setPasswordError("Session expired. Please sign in again.");
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword(session.token, {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setPasswordSuccess("✓ Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 4000);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  // -------------------------------------------------------------
  // Notification Preferences: Save Handler
  // -------------------------------------------------------------
  const handleSaveNotifications = async () => {
    setNotifSaving(true);
    setNotifSavedMsg("");
    const session = getSession();
    try {
      if (session?.token) {
        // Submit for key notification types
        await Promise.allSettled([
          updateNotificationPreference(session.token, {
            type: "AGREEMENT_STATUS",
            enabledChannels: [
              ...(notifPrefs.agreements.inApp ? ["IN_APP"] : []),
              ...(notifPrefs.agreements.sms ? ["SMS"] : []),
              ...(notifPrefs.agreements.email ? ["EMAIL"] : []),
            ],
          }),
          updateNotificationPreference(session.token, {
            type: "PAYMENT_CONFIRMATION",
            enabledChannels: [
              ...(notifPrefs.payments.inApp ? ["IN_APP"] : []),
              ...(notifPrefs.payments.sms ? ["SMS"] : []),
              ...(notifPrefs.payments.email ? ["EMAIL"] : []),
            ],
          }),
        ]);
      }
      setNotifSavedMsg("Notification delivery preferences saved!");
      setTimeout(() => setNotifSavedMsg(""), 3500);
    } catch (err: any) {
      setNotifSavedMsg(err.message || "Failed to save preferences.");
    } finally {
      setNotifSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans antialiased text-slate-800 text-[13px]">
      {/* --------------------------------------------------------------------- */}
      {/* BREADCRUMB & TIMESTAMP BAR                                             */}
      {/* --------------------------------------------------------------------- */}
      

      {/* --------------------------------------------------------------------- */}
      {/* CITIZEN PROFILE HEADER BANNER                                         */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Avatar + Main Citizen Info */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-emerald-800 text-white font-black text-2xl flex items-center justify-center border-2 border-emerald-600 shadow-sm">
                {legalFullName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <button
                type="button"
                aria-label="Change photo"
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors border border-white shadow-xs"
              >
                <Camera className="w-3 h-3 text-slate-200" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {legalFullName}
                </h1>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* SUB-NAVIGATION TABS (Menu 2: Bank & Account Settings)                 */}
      {/* --------------------------------------------------------------------- */}
      <div className="border-b border-slate-200 flex items-center gap-1 sm:gap-2 overflow-x-auto select-none">
        {/* Tab 1: Profile Management */}
        <button
          onClick={() => setActiveTab("personal")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "personal"
              ? "border-[#00450d] text-[#00450d]"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Profile Management</span>
        </button>

        {/* Tab 2: Bank & Payout Accounts (2nd menu item!) */}
        <button
          onClick={() => setActiveTab("bank")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "bank"
              ? "border-[#00450d] text-[#00450d]"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Bank & Payout Accounts</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
            {configuredAccountsCount} of 3
          </span>
        </button>

        {/* Tab 3: Security & Credentials */}
        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "security"
              ? "border-[#00450d] text-[#00450d]"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Security & Credentials</span>
        </button>

        {/* Tab 4: Notification Preferences */}
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "notifications"
              ? "border-[#00450d] text-[#00450d]"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notification Preferences</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 2-COLUMN MAIN CONTENT GRID                                            */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =================================================================== */}
        {/* LEFT COLUMN: 8 COLS (Dynamic Tab Panels)                             */}
        {/* =================================================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* ================================================================= */}
          {/* TAB 1: PROFILE MANAGEMENT / PERSONAL INFORMATION                  */}
          {/* ================================================================= */}
          {activeTab === "personal" && (
            <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-2xs space-y-5 animate-in fade-in">
              {/* Header with Live Synchronized Pill */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    Official Citizen Identity & Contact Records
                  </h2>
                  <p className="text-xs text-slate-500">
                    Verified against Ethiopian National Civil Registration and Fayda Registry.
                  </p>
                </div>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold self-start">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Live Synchronized</span>
                </span>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Field: Legal Full Name (Latin) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Legal Full Name (Latin)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled
                      value={legalFullName}
                      className="w-full px-3 py-2 bg-slate-100/90 border border-slate-200 rounded text-xs font-semibold text-slate-800 pr-8 cursor-not-allowed"
                    />
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Read-only, synchronized from National ID (Fayda).
                  </span>
                </div>
              </div>

              {/* Section: CONTACT COORDINATES */}
              <div className="pt-2">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Contact Coordinates</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Primary Phone */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      Primary Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={primaryPhone}
                        onChange={(e) => setPrimaryPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-xs font-mono text-slate-900 pr-18 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                      />
                      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-emerald-50 text-emerald-800 text-[9px] font-bold rounded border border-emerald-200">
                        Verified SMS
                      </span>
                    </div>
                  </div>

                  {/* Alternative Phone */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      Alternative Phone
                      <span className="text-white-500">  (optional)</span>
                    </label>
                    <input
                      type="text"
                      value={altPhone}
                      onChange={(e) => setAltPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-xs font-mono text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                    />
                  </div>

                  {/* Official Email */}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      Official Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        disabled
                        value={officialEmail}
                        className="w-full px-3 py-2 bg-slate-100/90 border border-slate-200 rounded text-xs text-slate-700 pr-8 cursor-not-allowed"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: REGISTERED KEBELE RESIDENTIAL ADDRESS */}
              <div className="pt-2">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Registered Kebele Residential Address</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      Region / City
                    </label>
                    <input
                      type="text"
                      value={regionCity}
                      onChange={(e) => setRegionCity(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded text-xs text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      Sub-City
                    </label>
                    <input
                      type="text"
                      value={subCity}
                      onChange={(e) => setSubCity(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded text-xs text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      Woreda
                    </label>
                    <input
                      type="text"
                      value={woreda}
                      onChange={(e) => setWoreda(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded text-xs text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                      House Number
                    </label>
                    <input
                      type="text"
                      value={houseNumber}
                      onChange={(e) => setHouseNumber(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded text-xs text-slate-900 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom 2 sub-boxes: TIN & Employment + Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Sub-box 1: TIN & Employment */}
                <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                      TIN & EMPLOYMENT
                    </span>
                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[9px] font-bold">
                      Tax Compliant
                    </span>
                  </div>

                  <div className="text-xs">
                    <span className="text-slate-500 block text-[10px]">Taxpayer Identification (TIN)</span>
                    <input
                      type="text"
                      value={tinNumber}
                      onChange={(e) => setTinNumber(e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  <div className="text-xs pt-1 border-t border-slate-200/70">
                    <span className="text-slate-500 block text-[10px]">Employer & Role</span>
                    <input
                      type="text"
                      value={worksOn}
                      onChange={(e) => setWorksOn(e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                {profileSavedMsg && (
                  <span className="text-xs text-emerald-700 font-bold inline-flex items-center gap-1 mr-auto">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    {profileSavedMsg}
                  </span>
                )}
                <button
                  type="button"
                  onClick={loadUserData}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded transition-colors"
                >
                  Discard Changes
                </button>
                <button
                  type="button"
                  disabled={profileSaving}
                  onClick={handleSaveProfile}
                  className="px-5 py-2 bg-[#00450d] hover:bg-[#06380c] text-white text-xs font-bold rounded inline-flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
                >
                  {profileSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: BANK & PAYOUT ACCOUNTS (2nd menu item!)                     */}
          {/* ================================================================= */}
          {activeTab === "bank" && (
            <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-2xs space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-[#00450d]" />
                    <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                      Bank & Escrow Settlement Accounts
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified remittance channels for automated rental agreements and deposit escrow (up to 3 accounts).
                  </p>
                </div>

                {isLandlordOrBoth && (
                  <div className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-right shrink-0">
                    <span className="text-[10px] font-mono text-slate-600 block leading-none">
                      <strong className="text-slate-900">{configuredAccountsCount} of 3</strong> Accounts Configured
                    </span>
                  </div>
                )}
              </div>

              {!isLandlordOrBoth ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-[#00450d] flex items-center justify-center mx-auto">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="text-sm font-extrabold text-slate-900">Tenant Account Notice</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Remittance bank and payout accounts are designated for <strong>Landlords</strong> to receive rental disbursements and deposit escrows from tenants. As a Tenant, you can submit rental payments directly to your landlord's verified account from the Payments dashboard.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/citizen/dashboard/payments"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00450d] hover:bg-[#06380c] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>View Rent Payments</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Info Callout Banner */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                    <Landmark className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800">Statutory Payout Accounts:</strong> In accordance with Ethiopian National Bank and GRAMS Escrow regulations, landlords can configure between a minimum of <strong>1</strong> and a maximum of <strong>3</strong> verified bank/mobile money accounts. Tenants will be able to choose from your configured accounts when paying advance rent.
                    </div>
                  </div>

              {/* ------------------------------------------------------------- */}
              {/* STATUTORY PREREQUISITE: TAXPAYER IDENTIFICATION NUMBER (TIN)   */}
              {/* ------------------------------------------------------------- */}
              <div className="border-2 border-emerald-300/80 bg-gradient-to-r from-emerald-50/70 to-slate-50/70 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#00450d] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Scale className="w-4 h-4 text-emerald-200" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                          1. Taxpayer Identification Number (TIN) — Required Prerequisite
                        </h3>
                        <span className="px-2 py-0.5 rounded bg-[#00450d] text-white text-[9px] font-bold uppercase tracking-wider">
                          NBE & MOR Mandate
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Statutory Ethiopian tax law requires a verified 10-digit TIN before registering bank accounts for rental payouts.
                      </p>
                    </div>
                  </div>

                  {tinNumber && tinNumber.trim().length >= 8 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-[#00450d] border border-emerald-300 text-xs font-bold self-start sm:self-auto shrink-0">
                      <Check className="w-3.5 h-3.5 text-[#00450d]" />
                      <span>TIN Linked ({tinNumber.trim()})</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold self-start sm:self-auto shrink-0 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                      <span>Required First</span>
                    </span>
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-7">
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Landlord 10-Digit TIN Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={tinNumber}
                          onChange={(e) => setTinNumber(e.target.value)}
                          placeholder="e.g. 0092817263"
                          maxLength={12}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-black text-slate-900 tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00450d]"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Format: 10 numerical digits registered with the Ethiopian Ministry of Revenues.
                      </p>
                    </div>

                    <div className="md:col-span-5 bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-[11px] text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>Ministry of Revenues Integration</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-snug">
                        All rental payouts from tenants are subject to Schedule B progressive rates and recorded against this TIN.
                      </p>
                    </div>
                  </div>

                  {(!tinNumber || tinNumber.trim().length < 8) && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Please enter your TIN number above. Bank payout accounts cannot be saved without a valid TIN.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* STEP 2 HEADER: BANK PAYOUT ACCOUNTS (UP TO 3)                 */}
              {/* ------------------------------------------------------------- */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                      2. Configure Remittance Bank & Escrow Accounts ({configuredAccountsCount} of 3 Linked)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Tenants will select from your configured accounts when transferring advance rent.
                    </p>
                  </div>
                  {configuredAccountsCount > 0 && configuredAccountsCount < 3 && !showAddAccountForm && (
                    <button
                      type="button"
                      onClick={() => setShowAddAccountForm(true)}
                      className="px-3 py-1.5 bg-[#00450d] hover:bg-[#06380c] text-white text-xs font-bold rounded inline-flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Another Account</span>
                    </button>
                  )}
                </div>

                {/* CASE A: No Accounts Configured -> Display Add Form directly (NO EMPTY BOXES!) */}
                {configuredAccountsCount === 0 ? (
                  <div className="bg-gradient-to-br from-emerald-50/50 to-slate-50 border-2 border-dashed border-emerald-300 rounded-xl p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#00450d] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Plus className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">
                          Add Primary Remittance & Payout Account
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          You haven't configured any payout accounts yet. Add your commercial bank account or Telebirr mobile wallet below so tenants can deposit advance rent and security escrow directly to your account.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleAddAccount} className="space-y-4 pt-1">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Bank Selection */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Bank / Provider <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={newBankName}
                            onChange={(e) => setNewBankName(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00450d]"
                          >
                            <option>Commercial Bank of Ethiopia (CBE)</option>
                            <option>Awash Bank S.C.</option>
                            <option>Telebirr SuperApp</option>
                            <option>Dashen Bank</option>
                            <option>Bank of Abyssinia</option>
                            <option>Oromia Bank</option>
                            <option>Cooperative Bank of Oromia</option>
                            <option>Hibret Bank</option>
                            <option>Zemen Bank</option>
                            <option>Berhan Bank</option>
                            <option>Nib International Bank</option>
                            <option>Wegagen Bank</option>
                          </select>
                        </div>

                        {/* Account Number */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Account Number / Mobile <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newAccountNumber}
                            onChange={(e) => setNewAccountNumber(e.target.value)}
                            placeholder="e.g. 1000123456789 or 0911..."
                            required
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00450d]"
                          />
                        </div>

                        {/* Account Holder */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Account Holder Name
                          </label>
                          <input
                            type="text"
                            value={newAccountHolder}
                            onChange={(e) => setNewAccountHolder(e.target.value)}
                            placeholder={legalFullName || "Full Legal Name"}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00450d]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-slate-200/80">
                        <span className="text-[11px] text-slate-500">
                          ★ This account will be configured as your <strong>Default Primary Remittance Account</strong>.
                        </span>
                        <button
                          type="submit"
                          disabled={isAddingAccount || !newAccountNumber.trim()}
                          className="px-5 py-2 bg-[#00450d] hover:bg-[#06380c] disabled:opacity-50 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          {isAddingAccount ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                          <span>Save & Activate Primary Account</span>
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* CASE B: Has Configured Accounts -> Render Only Non-Empty Cards */
                  <div className="space-y-3">
                    {/* Account 1 Card (Only if configured) */}
                    {accountNumber1.trim() && (
                      <div className={`border rounded-lg p-4 space-y-3 bg-white transition-all ${
                        preferredMethod === "slot1" ? "border-emerald-500 ring-1 ring-emerald-500/30" : "border-slate-200 hover:border-slate-300"
                      }`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                              {bankName1.toLowerCase().includes("telebirr") ? (
                                <Smartphone className="w-5 h-5 text-blue-600" />
                              ) : (
                                <Building2 className="w-5 h-5 text-amber-700" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-extrabold text-slate-900">
                                  {bankName1}
                                </h4>
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold rounded">
                                  <Check className="w-2.5 h-2.5" />
                                  EthSwitch Live
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">
                                Remittance Slot 1 (Commercial Settlement)
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {preferredMethod === "slot1" ? (
                              <span className="px-2 py-0.5 rounded bg-[#00450d] text-white text-[10px] font-bold uppercase tracking-wider">
                                ★ PRIMARY PAYOUT
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetPrimary("slot1")}
                                className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded transition-colors"
                              >
                                Set as Primary
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveAccount("slot1")}
                              title="Remove this account"
                              className="text-slate-400 hover:text-red-600 p-1 transition-colors rounded hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Account:</span>
                            <input
                              type="text"
                              value={accountNumber1}
                              onChange={(e) => setAccountNumber1(e.target.value)}
                              className="font-mono font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded border border-slate-200 text-xs flex-1"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Holder:</span>
                            <input
                              type="text"
                              value={accountHolder1}
                              onChange={(e) => setAccountHolder1(e.target.value)}
                              className="font-semibold text-slate-800 bg-slate-50 px-2 py-1 rounded border border-slate-200 text-xs flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Account 2 Card (Only if configured) */}
                    {accountNumber2.trim() && (
                      <div className={`border rounded-lg p-4 space-y-3 bg-white transition-all ${
                        preferredMethod === "slot2" ? "border-emerald-500 ring-1 ring-emerald-500/30" : "border-slate-200 hover:border-slate-300"
                      }`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                              {bankName2.toLowerCase().includes("telebirr") ? (
                                <Smartphone className="w-5 h-5 text-blue-600" />
                              ) : (
                                <Building2 className="w-5 h-5 text-amber-700" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-extrabold text-slate-900">
                                  {bankName2}
                                </h4>
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-800 text-[9px] font-bold rounded border border-emerald-200">
                                  <Check className="w-2.5 h-2.5" />
                                  Verified Active
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">
                                Remittance Slot 2 (Mobile / Alternate Settlement)
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {preferredMethod === "slot2" ? (
                              <span className="px-2 py-0.5 rounded bg-[#00450d] text-white text-[10px] font-bold uppercase tracking-wider">
                                ★ PRIMARY PAYOUT
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetPrimary("slot2")}
                                className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded transition-colors"
                              >
                                Set as Primary
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveAccount("slot2")}
                              title="Remove this account"
                              className="text-slate-400 hover:text-red-600 p-1 transition-colors rounded hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Account / Mobile:</span>
                            <input
                              type="text"
                              value={accountNumber2}
                              onChange={(e) => setAccountNumber2(e.target.value)}
                              className="font-mono font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded border border-slate-200 text-xs flex-1"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Holder:</span>
                            <input
                              type="text"
                              value={accountHolder2}
                              onChange={(e) => setAccountHolder2(e.target.value)}
                              className="font-semibold text-slate-800 bg-slate-50 px-2 py-1 rounded border border-slate-200 text-xs flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Account 3 Card (Only if configured) */}
                    {accountNumber3.trim() && (
                      <div className={`border rounded-lg p-4 space-y-3 bg-white transition-all ${
                        preferredMethod === "slot3" ? "border-emerald-500 ring-1 ring-emerald-500/30" : "border-slate-200 hover:border-slate-300"
                      }`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
                              <Landmark className="w-5 h-5 text-emerald-700" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-extrabold text-slate-900">
                                  {bankName3}
                                </h4>
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-800 text-[9px] font-bold rounded border border-emerald-200">
                                  <Check className="w-2.5 h-2.5" />
                                  Slot 3 Verified
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">
                                Remittance Slot 3 (Alternate Commercial Settlement)
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {preferredMethod === "slot3" ? (
                              <span className="px-2 py-0.5 rounded bg-[#00450d] text-white text-[10px] font-bold uppercase tracking-wider">
                                ★ PRIMARY PAYOUT
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetPrimary("slot3")}
                                className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded transition-colors"
                              >
                                Set as Primary
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveAccount("slot3")}
                              title="Remove this account"
                              className="text-slate-400 hover:text-red-600 p-1 transition-colors rounded hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Account:</span>
                            <input
                              type="text"
                              value={accountNumber3}
                              onChange={(e) => setAccountNumber3(e.target.value)}
                              className="font-mono font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded border border-slate-200 text-xs flex-1"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">Holder:</span>
                            <input
                              type="text"
                              value={accountHolder3}
                              onChange={(e) => setAccountHolder3(e.target.value)}
                              className="font-semibold text-slate-800 bg-slate-50 px-2 py-1 rounded border border-slate-200 text-xs flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Add Another Account (If < 3 accounts) */}
                    {configuredAccountsCount < 3 && (
                      showAddAccountForm ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                              Link Additional Account (Slot {configuredAccountsCount + 1} of 3)
                            </h4>
                            <button
                              type="button"
                              onClick={() => setShowAddAccountForm(false)}
                              className="text-xs font-bold text-slate-500 hover:text-slate-800"
                            >
                              Cancel
                            </button>
                          </div>

                          <form onSubmit={handleAddAccount} className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                  Select Bank / Provider <span className="text-red-500">*</span>
                                </label>
                                <select
                                  value={newBankName}
                                  onChange={(e) => setNewBankName(e.target.value)}
                                  className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700"
                                >
                                  <option>Commercial Bank of Ethiopia (CBE)</option>
                                  <option>Awash Bank S.C.</option>
                                  <option>Telebirr SuperApp</option>
                                  <option>Dashen Bank</option>
                                  <option>Bank of Abyssinia</option>
                                  <option>Oromia Bank</option>
                                  <option>Cooperative Bank of Oromia</option>
                                  <option>Hibret Bank</option>
                                  <option>Zemen Bank</option>
                                  <option>Berhan Bank</option>
                                  <option>Nib International Bank</option>
                                  <option>Wegagen Bank</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                  Account Number / Mobile <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={newAccountNumber}
                                  onChange={(e) => setNewAccountNumber(e.target.value)}
                                  placeholder="e.g. 1000123456789 or 0911..."
                                  required
                                  className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                  Account Holder Name
                                </label>
                                <input
                                  type="text"
                                  value={newAccountHolder}
                                  onChange={(e) => setNewAccountHolder(e.target.value)}
                                  placeholder={legalFullName || "Account holder name"}
                                  className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setShowAddAccountForm(false)}
                                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isAddingAccount || !newAccountNumber.trim()}
                                className="px-4 py-1.5 bg-[#00450d] hover:bg-[#06380c] disabled:opacity-50 text-white text-xs font-bold rounded inline-flex items-center gap-1.5 shadow-xs"
                              >
                                {isAddingAccount ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                                <span>Confirm & Link Account</span>
                              </button>
                            </div>
                          </form>
                        </div>
                      ) : (
                        <div className="border border-dashed border-slate-300 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
                          <div className="flex items-center gap-3 text-left">
                            <div className="w-9 h-9 rounded-full bg-slate-200/80 text-slate-600 flex items-center justify-center shrink-0 font-bold text-base">
                              +
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-slate-800">
                                Link Additional Payout Account
                              </h5>
                              <p className="text-[11px] text-slate-500">
                                {3 - configuredAccountsCount} {3 - configuredAccountsCount === 1 ? "Slot" : "Slots"} Remaining (e.g., CBE, Telebirr, Awash Bank, Dashen Bank)
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowAddAccountForm(true)}
                            className="px-3.5 py-2 bg-[#00450d] hover:bg-[#06380c] text-white text-xs font-bold rounded inline-flex items-center gap-1.5 transition-colors shadow-xs whitespace-nowrap"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Another Account</span>
                          </button>
                        </div>
                      )
                    )}

                    {/* All 3 Configured Notice */}
                    {configuredAccountsCount >= 3 && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-[#00450d] shrink-0" />
                        <span>All 3 payout accounts are active and available for tenant payment selection.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Action: Save Payout Settings */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                {bankSavedMsg && (
                  <span className="text-xs text-emerald-700 font-bold inline-flex items-center gap-1 mr-auto">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    {bankSavedMsg}
                  </span>
                )}
                <button
                  type="button"
                  onClick={loadUserData}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded transition-colors"
                >
                  Discard
                </button>
                <button
                  type="button"
                  disabled={bankSaving}
                  onClick={handleSaveBankSettings}
                  className="px-5 py-2 bg-[#00450d] hover:bg-[#06380c] text-white text-xs font-bold rounded inline-flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
                >
                  {bankSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Payout Settings</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

          {/* ================================================================= */}
          {/* TAB 3: SECURITY & CREDENTIALS                                     */}
          {/* ================================================================= */}
          {activeTab === "security" && (
            <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-2xs space-y-5 animate-in fade-in">
              <div className="pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#00450d]" />
                  <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    Security & Credentials Management
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update account password, manage multi-factor authentication, and review active sessions.
                </p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
                {/* Current Password */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your existing password"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-xs font-mono text-slate-900 pr-8 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-xs text-slate-900 pr-8 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5">
                    <span>Password Strength</span>
                    <span className={`font-bold ${newPassword.length >= 8 ? "text-emerald-700" : newPassword.length >= 6 ? "text-amber-600" : "text-slate-400"}`}>
                      {newPassword.length >= 8 ? "Strong" : newPassword.length >= 6 ? "Medium" : "Too Short"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    <div className={`h-1 rounded-full ${newPassword.length >= 2 ? "bg-[#00450d]" : "bg-slate-200"}`}></div>
                    <div className={`h-1 rounded-full ${newPassword.length >= 6 ? "bg-[#00450d]" : "bg-slate-200"}`}></div>
                    <div className={`h-1 rounded-full ${newPassword.length >= 8 ? "bg-[#00450d]" : "bg-slate-200"}`}></div>
                    <div className={`h-1 rounded-full ${newPassword.length >= 10 ? "bg-[#00450d]" : "bg-slate-200"}`}></div>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                {passwordError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="px-5 py-2 bg-[#00450d] hover:bg-[#06380c] disabled:opacity-50 text-white text-xs font-bold rounded transition-colors shadow-xs inline-flex items-center gap-1.5"
                >
                  {passwordSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                  <span>Update Password</span>
                </button>
              </form>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: NOTIFICATION PREFERENCES                                   */}
          {/* ================================================================= */}
          {activeTab === "notifications" && (
            <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-2xs space-y-5 animate-in fade-in">
              <div className="pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#00450d]" />
                  <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                    Notification & Alert Preferences
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure delivery channels for critical tenancy, payment escrow, and government regulatory notifications.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Module 1: Lease Agreements */}
                <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">Lease Agreements & Extensions</h4>
                      <p className="text-slate-500 text-[11px]">
                        Notifications for new tenancy applications, municipal officer reviews, and signatures.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 pt-1 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifPrefs.agreements.inApp}
                        onChange={(e) =>
                          setNotifPrefs((prev) => ({
                            ...prev,
                            agreements: { ...prev.agreements, inApp: e.target.checked },
                          }))
                        }
                        className="rounded border-slate-300 text-[#00450d] focus:ring-emerald-700"
                      />
                      <span>In-App Portal</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifPrefs.agreements.sms}
                        onChange={(e) =>
                          setNotifPrefs((prev) => ({
                            ...prev,
                            agreements: { ...prev.agreements, sms: e.target.checked },
                          }))
                        }
                        className="rounded border-slate-300 text-[#00450d] focus:ring-emerald-700"
                      />
                      <span>SMS Alerts</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifPrefs.agreements.email}
                        onChange={(e) =>
                          setNotifPrefs((prev) => ({
                            ...prev,
                            agreements: { ...prev.agreements, email: e.target.checked },
                          }))
                        }
                        className="rounded border-slate-300 text-[#00450d] focus:ring-emerald-700"
                      />
                      <span>Official Email</span>
                    </label>
                  </div>
                </div>

                {/* Module 2: Rent & Escrow Settlements */}
                <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">Rent & Escrow Settlements</h4>
                      <p className="text-slate-500 text-[11px]">
                        Payment invoice receipts, advance rent deposit alerts, and remittance confirmation.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 pt-1 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifPrefs.payments.inApp}
                        onChange={(e) =>
                          setNotifPrefs((prev) => ({
                            ...prev,
                            payments: { ...prev.payments, inApp: e.target.checked },
                          }))
                        }
                        className="rounded border-slate-300 text-[#00450d] focus:ring-emerald-700"
                      />
                      <span>In-App Portal</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifPrefs.payments.sms}
                        onChange={(e) =>
                          setNotifPrefs((prev) => ({
                            ...prev,
                            payments: { ...prev.payments, sms: e.target.checked },
                          }))
                        }
                        className="rounded border-slate-300 text-[#00450d] focus:ring-emerald-700"
                      />
                      <span>SMS Alerts</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifPrefs.payments.email}
                        onChange={(e) =>
                          setNotifPrefs((prev) => ({
                            ...prev,
                            payments: { ...prev.payments, email: e.target.checked },
                          }))
                        }
                        className="rounded border-slate-300 text-[#00450d] focus:ring-emerald-700"
                      />
                      <span>Official Email</span>
                    </label>
                  </div>
                </div>

                {/* Module 3: Maintenance & Complaints */}
                <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">Complaints & Housing Desk Inspections</h4>
                      <p className="text-slate-500 text-[11px]">
                        Updates when disputes are lodged, hearings are scheduled, or work orders resolved.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 pt-1 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifPrefs.complaints.inApp}
                        onChange={(e) =>
                          setNotifPrefs((prev) => ({
                            ...prev,
                            complaints: { ...prev.complaints, inApp: e.target.checked },
                          }))
                        }
                        className="rounded border-slate-300 text-[#00450d] focus:ring-emerald-700"
                      />
                      <span>In-App Portal</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifPrefs.complaints.sms}
                        onChange={(e) =>
                          setNotifPrefs((prev) => ({
                            ...prev,
                            complaints: { ...prev.complaints, sms: e.target.checked },
                          }))
                        }
                        className="rounded border-slate-300 text-[#00450d] focus:ring-emerald-700"
                      />
                      <span>SMS Alerts</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifPrefs.complaints.email}
                        onChange={(e) =>
                          setNotifPrefs((prev) => ({
                            ...prev,
                            complaints: { ...prev.complaints, email: e.target.checked },
                          }))
                        }
                        className="rounded border-slate-300 text-[#00450d] focus:ring-emerald-700"
                      />
                      <span>Official Email</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Save Notifications */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                {notifSavedMsg && (
                  <span className="text-xs text-emerald-700 font-bold inline-flex items-center gap-1 mr-auto">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    {notifSavedMsg}
                  </span>
                )}
                <button
                  type="button"
                  disabled={notifSaving}
                  onClick={handleSaveNotifications}
                  className="px-5 py-2 bg-[#00450d] hover:bg-[#06380c] disabled:opacity-50 text-white text-xs font-bold rounded inline-flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  {notifSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Notification Preferences</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: 4 COLS (Security Info, 2FA, National Registry)         */}
        {/* =================================================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: National Registry Verification
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-3.5">
            <div className="pb-2 border-b border-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                National Registry Verification
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Fayda National ID</span>
                <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Verified
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Kebele Digital Residence</span>
                <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  {subCity} {woreda} Valid
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Ministry of Revenue (TIN)</span>
                <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Active ({tinNumber})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Title Deed Registry (RRA)</span>
                <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  {propertiesCount} Deeds Matched
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => alert("Downloading Official Citizen Clearance Certificate...")}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded transition-colors inline-flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Download Citizen Clearance Certificate</span>
              </button>
            </div>
          </div> */}

          {/* Card 2: Two-Factor Authentication & Active Sessions */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-800" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Security Status & Sessions
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-factor credentials and active browser sessions.
              </p>
            </div>

            {/* 2FA status */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Two-Factor Auth (2FA)</span>
                <span className="text-emerald-700 font-bold text-[11px] inline-flex items-center gap-1">
                  <Check className="w-3 h-3" /> Enabled
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                <div>
                  <span className="block text-[10px] text-slate-500">Recovery Emergency Codes</span>
                  <span className="text-[11px] text-slate-700 font-medium">8 Remaining</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Recovery emergency codes: 8 remaining. Keep them in a safe place.")}
                  className="text-xs font-bold text-slate-800 hover:text-[#00450d] underline decoration-slate-300"
                >
                  View
                </button>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
                  <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Active Login Sessions</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Logged out of other active sessions successfully.")}
                  className="text-[10px] font-bold text-red-600 hover:text-red-700"
                >
                  Log Out Others
                </button>
              </div>

              {/* Current Session */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-start justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                    <span>Web Browser • Windows / Mac</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Addis Ababa, ET (197.156.103.4)
                  </div>
                </div>
                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold rounded">
                  Current
                </span>
              </div>

              {/* Session 2 */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-start justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                    <span>Telebirr MiniApp Gateway</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Mobile • Active 2h ago
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Session revoked.")}
                  aria-label="Revoke session"
                  className="text-slate-400 hover:text-red-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProfilePage;
