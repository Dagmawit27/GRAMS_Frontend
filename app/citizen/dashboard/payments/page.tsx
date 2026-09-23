"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Invoice } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  CreditCard,
  Search,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Zap,
  Droplets,
  Building,
  User,
  Wallet,
  Sparkles,
  Check,
  Eye,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Phone,
  Mail,
  ArrowUpRight,
  FileText,
  Clock,
} from "lucide-react";

import { useCitizenData } from "@/hooks/useCitizenData";
import {
  getMyAgreements,
  getLandlordAgreements,
  getTenantAgreements,
  getSession,
  AgreementResponse,
  verifyPayment,
  getMyPayments,
  PaymentResponseDto,
} from "@/lib/api";
import { sseManager } from "@/lib/sseManager";
import confetti from "canvas-confetti";

export interface LandlordCollectionItem {
  id: string;
  agreementId: string;
  agreementNumber: string;
  requestCode: string;
  propertyTitle: string;
  propertySubCity?: string;
  propertyWoreda?: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  advancePaymentMonths: number;
  monthlyRent: number;
  totalAmount: number;
  dueDate: string;
  status: "Cleared" | "Pending" | "Overdue";
  periodLabel?: string;
  landlordBankName?: string;
  landlordAccountNumber?: string;
  landlordAccountHolderName?: string;
  hasPayoutConfigured: boolean;
}

interface PaymentsPageProps {
  invoices?: Invoice[];
  onOpenPayInvoice?: (invoice: Invoice) => void;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = (props) => {
  const router = useRouter();
  const context = useCitizenData();
  const { userRole } = context;

  // Track locally paid invoices so settled status persists across sessions
  const [paidIds, setPaidIds] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("grams_paid_invoice_ids");
        if (stored) return new Set<string>(JSON.parse(stored));
      } catch {}
    }
    return new Set<string>();
  });

  // Effective Role-Based Access:
  // 1. Account is Tenant: only display Bills to Pay (Tenant)
  // 2. Account is Landlord: only display Rental Collections (Landlord)
  // 3. Account is Citizen / Both: display tab switcher to toggle between both
  const [storedRole, setStoredRole] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userRole");
    }
    return null;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setStoredRole(localStorage.getItem("userRole"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const session = getSession();
  const sessionRoles = useMemo(() => {
    return (session?.user?.roles || []).map((r: string) => r.toLowerCase());
  }, [session]);

  const effectiveRole = useMemo(() => {
    const rawRole = (
      userRole ||
      storedRole ||
      (sessionRoles.includes("landlord") && !sessionRoles.includes("tenant") ? "landlord" : "") ||
      (sessionRoles.includes("tenant") && !sessionRoles.includes("landlord") ? "tenant" : "") ||
      "citizen"
    ).toLowerCase();

    return rawRole;
  }, [userRole, storedRole, sessionRoles]);

  const isTenantOnly = effectiveRole === "tenant";
  const isLandlordOnly = effectiveRole === "landlord";
  const isBoth = effectiveRole === "citizen" || effectiveRole === "both" || (!isTenantOnly && !isLandlordOnly);

  // Active view tab: "tenant" = Bills to Pay, "landlord" = Rental Collections
  const [activeTab, setActiveTab] = useState<"tenant" | "landlord">(() => {
    if (isLandlordOnly) return "landlord";
    return "tenant";
  });

  // Keep active tab synchronized if user toggles role via sidebar/topbar
  useEffect(() => {
    if (isTenantOnly) {
      setActiveTab("tenant");
    } else if (isLandlordOnly) {
      setActiveTab("landlord");
    }
  }, [isTenantOnly, isLandlordOnly]);

  const [searchQuery, setSearchQuery] = useState("");
  const [tenantPage, setTenantPage] = useState(1);
  const [landlordPage, setLandlordPage] = useState(1);
  const itemsPerPage = 5;

  const [rawAgreementInvoices, setRawAgreementInvoices] = useState<Invoice[]>([]);
  const [rawLandlordCollections, setRawLandlordCollections] = useState<LandlordCollectionItem[]>([]);
  const [isLoadingAgreements, setIsLoadingAgreements] = useState(true);
  const [realtimeUpdated, setRealtimeUpdated] = useState(false);
  const [chapaSuccessNotice, setChapaSuccessNotice] = useState<{
    txRef: string;
    amount?: number;
    landlordName?: string;
    bankName?: string;
  } | null>(null);

  // Check if an agreement is settled / paid
  const checkIsSettled = useCallback(
    (a: AgreementResponse, backendSettledSet?: Set<string>): boolean => {
      if (a.status === "PAID") return true;
      const invId = `agr-inv-${a.id}`;
      const reqInvId = `agr-inv-${a.requestCode}`;
      if (
        paidIds.has(invId) ||
        paidIds.has(reqInvId) ||
        paidIds.has(a.id) ||
        paidIds.has(a.requestCode) ||
        backendSettledSet?.has(invId) ||
        backendSettledSet?.has(reqInvId) ||
        backendSettledSet?.has(a.id) ||
        backendSettledSet?.has(a.requestCode)
      ) {
        return true;
      }
      try {
        const stored = localStorage.getItem("grams_completed_receipts");
        if (stored) {
          const list = JSON.parse(stored);
          return list.some(
            (r: any) =>
              r.transactionRef?.toLowerCase().includes(a.requestCode.toLowerCase()) ||
              r.id?.includes(a.requestCode) ||
              r.id?.includes(a.id)
          );
        }
      } catch {}
      return false;
    },
    [paidIds]
  );

  // Fetch agreements and partition by role
  const fetchAgreements = useCallback(async () => {
    const currentSession = getSession();
    if (!currentSession?.token) {
      setIsLoadingAgreements(false);
      return;
    }

    try {
      const userEmail = (currentSession.user?.email || "").toLowerCase().trim();
      const userId = currentSession.user?.id || "";
      const userFirstName = currentSession.user?.firstName || "";
      const userLastName = currentSession.user?.lastName || "";
      const userName = `${userFirstName} ${userLastName}`.toLowerCase().trim();

      // Fetch agreements from API
      let allAgreements: AgreementResponse[] = [];
      try {
        allAgreements = await getMyAgreements(currentSession.token);
      } catch (err) {
        console.warn("Could not fetch my agreements:", err);
      }

      // Query role-specific endpoints if available
      let backendLandlordAgreements: AgreementResponse[] = [];
      let backendTenantAgreements: AgreementResponse[] = [];
      try {
        const [lRes, tRes] = await Promise.allSettled([
          getLandlordAgreements(currentSession.token),
          getTenantAgreements(currentSession.token),
        ]);
        if (lRes.status === "fulfilled" && Array.isArray(lRes.value)) backendLandlordAgreements = lRes.value;
        if (tRes.status === "fulfilled" && Array.isArray(tRes.value)) backendTenantAgreements = tRes.value;
      } catch {}

      // Fetch user's payments from API to dynamically resolve settled bills
      let backendPayments: PaymentResponseDto[] = [];
      try {
        backendPayments = await getMyPayments(currentSession.token);
      } catch (err) {
        console.warn("Could not fetch my payments:", err);
      }

      const settledFromBackend = new Set<string>();
      if (Array.isArray(backendPayments)) {
        backendPayments.forEach((p) => {
          if (p.status === "COMPLETED") {
            if (p.agreementId) {
              settledFromBackend.add(p.agreementId);
              settledFromBackend.add(`agr-inv-${p.agreementId}`);
            }
            if (p.requestCode) {
              settledFromBackend.add(p.requestCode);
              settledFromBackend.add(`agr-inv-${p.requestCode}`);
            }
            if (p.agreementNumber) {
              settledFromBackend.add(p.agreementNumber);
              settledFromBackend.add(`agr-inv-${p.agreementNumber}`);
            }
            if (p.txRef) {
              settledFromBackend.add(p.txRef);
            }
          }
        });

        if (settledFromBackend.size > 0) {
          setPaidIds((prev) => {
            const next = new Set(prev);
            settledFromBackend.forEach((id) => next.add(id));
            try {
              localStorage.setItem("grams_paid_invoice_ids", JSON.stringify(Array.from(next)));
            } catch {}
            return next;
          });
        }
      }

      const combinedAgreementsMap = new Map<string, AgreementResponse>();
      const addAgreements = (list: AgreementResponse[]) => {
        if (Array.isArray(list)) {
          list.forEach((a) => {
            if (a && (a.id || a.requestCode)) {
              const key = a.id || a.requestCode;
              combinedAgreementsMap.set(key, a);
            }
          });
        }
      };

      addAgreements(allAgreements);
      addAgreements(backendLandlordAgreements);
      addAgreements(backendTenantAgreements);

      const activeList = Array.from(combinedAgreementsMap.values()).filter(
        (a) => !a.status || a.status === "ACTIVE" || a.status === "APPROVED" || a.supervisorApproved
      );

      const landlordIds = new Set(
        (Array.isArray(backendLandlordAgreements) ? backendLandlordAgreements : []).map((a) => a.id)
      );
      const tenantIds = new Set(
        (Array.isArray(backendTenantAgreements) ? backendTenantAgreements : []).map((a) => a.id)
      );

      const tenantInvs: Invoice[] = [];
      const landlordCols: LandlordCollectionItem[] = [];

      activeList.forEach((a) => {
        const isLandlord =
          landlordIds.has(a.id) ||
          (userEmail && a.landlordEmail && a.landlordEmail.toLowerCase().trim() === userEmail) ||
          (userId && a.landlordId && a.landlordId === userId) ||
          (userName && a.landlordName && a.landlordName.toLowerCase().trim() === userName);

        const isTenant =
          tenantIds.has(a.id) ||
          (userEmail && a.tenantEmail && a.tenantEmail.toLowerCase().trim() === userEmail) ||
          (userId && a.tenantId && a.tenantId === userId) ||
          (userName && a.tenantName && a.tenantName.toLowerCase().trim() === userName);

        const advanceMonths = a.advancePaymentMonths && a.advancePaymentMonths > 0 ? a.advancePaymentMonths : 2;
        const totalMonthsPaid = a.totalMonthsPaid ?? 0;
        const monthlyRent = a.monthlyRent || 0;
        const totalAdvance = monthlyRent * advanceMonths;
        const invId = `agr-inv-${a.id}`;
        const hasPayout = Boolean(a.landlordAccountNumber && a.landlordAccountNumber.trim().length > 0);

        // Check if initial advance payment is paid
        const isAdvancePaid = totalMonthsPaid >= advanceMonths || checkIsSettled(a, settledFromBackend);

        if (!isAdvancePaid) {
          // --- Case 1: Initial Advance Payment pending ---
          const startDateObj = a.startDate ? new Date(a.startDate) : new Date();
          const todayMid = new Date();
          todayMid.setHours(0, 0, 0, 0);
          const startMid = new Date(startDateObj.getFullYear(), startDateObj.getMonth(), startDateObj.getDate());
          const diffDays = Math.round((startMid.getTime() - todayMid.getTime()) / (1000 * 60 * 60 * 24));
          const advStatus: "Pending" | "Overdue" = diffDays < 0 ? "Overdue" : "Pending";

          if (isLandlord || (effectiveRole === "landlord" && !isTenant)) {
            landlordCols.push({
              id: `col-${a.id}`,
              agreementId: a.id,
              agreementNumber: a.agreementNumber || a.requestCode,
              requestCode: a.requestCode,
              propertyTitle: a.propertyTitle || `Property ${a.propertyCode || ""}`,
              propertySubCity: a.propertySubCity,
              propertyWoreda: a.propertyWoreda,
              tenantName: a.tenantName || "Tenant",
              tenantPhone: a.tenantPhone || "",
              tenantEmail: a.tenantEmail || "",
              advancePaymentMonths: advanceMonths,
              monthlyRent: monthlyRent,
              totalAmount: totalAdvance,
              dueDate: a.startDate
                ? new Date(a.startDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
                : "Upon Approval",
              status: advStatus,
              periodLabel: `First ${advanceMonths} Months Advance Rent`,
              landlordBankName: a.landlordBankName,
              landlordAccountNumber: a.landlordAccountNumber,
              landlordAccountHolderName: a.landlordAccountHolderName || a.landlordName,
              hasPayoutConfigured: hasPayout,
            });
          }

          if (isTenant || (!isLandlord && !isTenant && effectiveRole !== "landlord")) {
            tenantInvs.push({
              id: invId,
              invoiceCode: `INV-${a.agreementNumber || a.requestCode}`,
              propertyTitle: a.propertyTitle || `Property ${a.propertyCode || ""}`,
              dueDate: a.startDate
                ? new Date(a.startDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
                : "Upon Approval",
              period: `First ${advanceMonths} Months Advance Rent`,
              advancePaymentMonths: advanceMonths,
              baseRent: totalAdvance,
              waterUtility: 0,
              electricityMaintenance: 0,
              latePenalty: 0,
              totalAmount: totalAdvance,
              status: advStatus,
              landlordName: a.landlordName || "Landlord",
              landlordPreferredPaymentMethod: a.landlordPreferredPaymentMethod || a.landlordBankName,
              landlordBankName: a.landlordBankName,
              landlordAccountNumber: a.landlordAccountNumber,
              landlordAccountHolderName: a.landlordAccountHolderName || a.landlordName,
              requestCode: a.requestCode,
            });
          }
        } else {
          // --- Case 2: Initial Advance Payment has been paid! ---
          // 1. Landlord: Show the cleared advance payment
          if (isLandlord || (effectiveRole === "landlord" && !isTenant)) {
            landlordCols.push({
              id: `col-${a.id}`,
              agreementId: a.id,
              agreementNumber: a.agreementNumber || a.requestCode,
              requestCode: a.requestCode,
              propertyTitle: a.propertyTitle || `Property ${a.propertyCode || ""}`,
              propertySubCity: a.propertySubCity,
              propertyWoreda: a.propertyWoreda,
              tenantName: a.tenantName || "Tenant",
              tenantPhone: a.tenantPhone || "",
              tenantEmail: a.tenantEmail || "",
              advancePaymentMonths: advanceMonths,
              monthlyRent: monthlyRent,
              totalAmount: totalAdvance,
              dueDate: a.startDate
                ? new Date(a.startDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
                : "Upon Approval",
              status: "Cleared",
              periodLabel: `First ${advanceMonths} Months Advance Rent`,
              landlordBankName: a.landlordBankName,
              landlordAccountNumber: a.landlordAccountNumber,
              landlordAccountHolderName: a.landlordAccountHolderName || a.landlordName,
              hasPayoutConfigured: hasPayout,
            });

            // Also push all cleared recurring monthly cycles (e.g. Month 3 up to totalMonthsPaid)
            for (let m = advanceMonths + 1; m <= totalMonthsPaid; m++) {
              const baseDate = a.startDate ? new Date(a.startDate) : new Date();
              const cycleDueDate = new Date(baseDate);
              cycleDueDate.setMonth(cycleDueDate.getMonth() + (m - 1));
              if (a.monthlyPaymentDueDay) {
                cycleDueDate.setDate(a.monthlyPaymentDueDay);
              }
              landlordCols.push({
                id: `col-${a.id}-m${m}`,
                agreementId: a.id,
                agreementNumber: a.agreementNumber || a.requestCode,
                requestCode: a.requestCode,
                propertyTitle: a.propertyTitle || `Property ${a.propertyCode || ""}`,
                propertySubCity: a.propertySubCity,
                propertyWoreda: a.propertyWoreda,
                tenantName: a.tenantName || "Tenant",
                tenantPhone: a.tenantPhone || "",
                tenantEmail: a.tenantEmail || "",
                advancePaymentMonths: 1,
                monthlyRent: monthlyRent,
                totalAmount: monthlyRent,
                dueDate: cycleDueDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
                status: "Cleared",
                periodLabel: `Month ${m} Rent`,
                landlordBankName: a.landlordBankName,
                landlordAccountNumber: a.landlordAccountNumber,
                landlordAccountHolderName: a.landlordAccountHolderName || a.landlordName,
                hasPayoutConfigured: hasPayout,
              });
            }
          }

          // 2. Determine next recurring monthly cycle from server state
          const nextCycleNum = totalMonthsPaid + 1; // e.g. Month 3 if advance of 2 months paid
          let nextCycleDueDate: Date;
          if (a.nextPaymentDueDate) {
            const parts = a.nextPaymentDueDate.split(/[-T ]/);
            nextCycleDueDate = parts.length >= 3
              ? new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
              : new Date(a.nextPaymentDueDate);
          } else {
            const baseDate = a.startDate ? new Date(a.startDate) : new Date();
            nextCycleDueDate = new Date(baseDate);
            nextCycleDueDate.setMonth(nextCycleDueDate.getMonth() + (nextCycleNum - 1));
            if (a.monthlyPaymentDueDay) {
              nextCycleDueDate.setDate(a.monthlyPaymentDueDay);
            }
          }

          const now = new Date();
          const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const dueMid = new Date(nextCycleDueDate.getFullYear(), nextCycleDueDate.getMonth(), nextCycleDueDate.getDate());
          const daysUntilDue = Math.round((dueMid.getTime() - todayMid.getTime()) / (1000 * 60 * 60 * 24));
          const isCycleDueOrOverdue = daysUntilDue <= 5;

          const cycleInvId = `agr-inv-${a.id}-m${nextCycleNum}`;
          const isCyclePaid = totalMonthsPaid >= nextCycleNum || paidIds.has(cycleInvId) || paidIds.has(`${a.requestCode}-m${nextCycleNum}`);

          // If recurring cycle is approaching (<= 5 days) or overdue
          if (isCycleDueOrOverdue) {
            const cycleStatus: "Cleared" | "Pending" | "Overdue" = isCyclePaid
              ? "Cleared"
              : daysUntilDue < 0
              ? "Overdue"
              : "Pending";

            // Show collection on landlord side
            if (isLandlord || (effectiveRole === "landlord" && !isTenant)) {
              landlordCols.push({
                id: `col-${a.id}-m${nextCycleNum}`,
                agreementId: a.id,
                agreementNumber: a.agreementNumber || a.requestCode,
                requestCode: a.requestCode,
                propertyTitle: a.propertyTitle || `Property ${a.propertyCode || ""}`,
                propertySubCity: a.propertySubCity,
                propertyWoreda: a.propertyWoreda,
                tenantName: a.tenantName || "Tenant",
                tenantPhone: a.tenantPhone || "",
                tenantEmail: a.tenantEmail || "",
                advancePaymentMonths: 1,
                monthlyRent: monthlyRent,
                totalAmount: monthlyRent,
                dueDate: nextCycleDueDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
                status: cycleStatus,
                periodLabel: `Month ${nextCycleNum} Rent`,
                landlordBankName: a.landlordBankName,
                landlordAccountNumber: a.landlordAccountNumber,
                landlordAccountHolderName: a.landlordAccountHolderName || a.landlordName,
                hasPayoutConfigured: hasPayout,
              });
            }

            // Show bill on tenant side if not yet paid
            if ((isTenant || (!isLandlord && !isTenant && effectiveRole !== "landlord")) && !isCyclePaid) {
              tenantInvs.push({
                id: cycleInvId,
                invoiceCode: `INV-${a.agreementNumber || a.requestCode}-M${nextCycleNum}`,
                propertyTitle: a.propertyTitle || `Property ${a.propertyCode || ""}`,
                dueDate: nextCycleDueDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
                period: `Month ${nextCycleNum} Rent (${nextCycleDueDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })})`,
                advancePaymentMonths: 1,
                baseRent: monthlyRent,
                waterUtility: 0,
                electricityMaintenance: 0,
                latePenalty: 0,
                totalAmount: monthlyRent,
                status: daysUntilDue < 0 ? "Overdue" : "Pending",
                landlordName: a.landlordName || "Landlord",
                landlordPreferredPaymentMethod: a.landlordPreferredPaymentMethod || a.landlordBankName,
                landlordBankName: a.landlordBankName,
                landlordAccountNumber: a.landlordAccountNumber,
                landlordAccountHolderName: a.landlordAccountHolderName || a.landlordName,
                requestCode: a.requestCode,
              });
            }
          }
        }
      });

      setRawAgreementInvoices(tenantInvs);
      setRawLandlordCollections(landlordCols);
    } catch (err) {
      console.warn("Failed to load active agreements for payment page:", err);
    } finally {
      setIsLoadingAgreements(false);
    }
  }, [checkIsSettled]);

  useEffect(() => {
    fetchAgreements();
  }, [fetchAgreements]);

  // Handle return redirect from Chapa checkout (?tx_ref=...&status=success)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const txRef = params.get("tx_ref");
    const status = params.get("status");

    if (txRef && (status === "success" || !status)) {
      const currentSession = getSession();
      if (currentSession?.token) {
        verifyPayment(currentSession.token, txRef)
          .then((res) => {
            console.log("Verified Chapa payment on return:", res);
            try {
              const stored = localStorage.getItem("grams_paid_invoice_ids");
              const set = new Set<string>(stored ? JSON.parse(stored) : []);
              if (res.agreementId) {
                set.add(`agr-inv-${res.agreementId}`);
                set.add(res.agreementId);
              }
              if (res.requestCode) {
                set.add(`agr-inv-${res.requestCode}`);
                set.add(res.requestCode);
              }
              set.add(txRef);
              localStorage.setItem("grams_paid_invoice_ids", JSON.stringify(Array.from(set)));
              setPaidIds(set);

              const recId = `rec-${res.txRef}`;
              const receipt = {
                id: recId,
                receiptCode: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
                propertyName: res.propertyTitle || "Leased Property",
                paymentMethod: (res.paymentMethod || "Telebirr") as any,
                amount: res.amount || 0,
                status: "Paid" as const,
                transactionRef: res.txRef,
                payerName: res.tenantName || (currentSession.user ? `${currentSession.user.firstName || ""} ${currentSession.user.lastName || ""}`.trim() : "Citizen Tenant"),
                taxRegistrationNumber: currentSession.user?.taxIdentificationNumber || currentSession.user?.tinNumber || "",
              };
              const storedReceipts = localStorage.getItem("grams_completed_receipts");
              const list = storedReceipts ? JSON.parse(storedReceipts) : [];
              const updatedList = [receipt, ...list.filter((r: any) => r.id !== receipt.id)];
              localStorage.setItem("grams_completed_receipts", JSON.stringify(updatedList));
            } catch (err) {
              console.warn("Could not save paid invoice id:", err);
            }

            try {
              confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
            } catch {}

            setChapaSuccessNotice({
              txRef: res.txRef,
              amount: res.amount,
              landlordName: res.landlordName,
              bankName: res.landlordBankName,
            });

            fetchAgreements();

            // Clear URL query parameters cleanly without reload
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, "", cleanUrl);
          })
          .catch((err) => {
            console.warn("Could not verify returned Chapa payment:", err);
          });
      }
    }
  }, [fetchAgreements]);

  // Real-time SSE listener
  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession?.user?.email) return;

    const userEmail = currentSession.user.email;
    sseManager.connect(userEmail);

    const unsubscribeNotification = sseManager.onNotification((notification) => {
      if (
        notification.type === "LANDLORD_PAYOUT_UPDATED" ||
        notification.type === "PAYMENT_METHOD_UPDATED" ||
        notification.type === "AGREEMENT_APPROVED" ||
        notification.module === "PAYMENT" ||
        notification.message?.toLowerCase().includes("payout") ||
        notification.message?.toLowerCase().includes("payment")
      ) {
        fetchAgreements();
        setRealtimeUpdated(true);
        setTimeout(() => setRealtimeUpdated(false), 8000);
      }
    });

    let channel: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
      try {
        channel = new BroadcastChannel("addis_rental_events");
        channel.onmessage = (event) => {
          if (event.data?.type === "LANDLORD_PAYOUT_UPDATED" || event.data?.type === "PAYMENT_COMPLETED") {
            fetchAgreements();
            setRealtimeUpdated(true);
            setTimeout(() => setRealtimeUpdated(false), 8000);
          }
        };
      } catch (err) {
        console.warn("Could not create BroadcastChannel:", err);
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "grams_payout_updated_at" || e.key === "grams_paid_invoice_ids") {
        fetchAgreements();
        setRealtimeUpdated(true);
        setTimeout(() => setRealtimeUpdated(false), 8000);
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      unsubscribeNotification();
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, [fetchAgreements]);

  // -------------------------------------------------------------------------------------------
  // REQUIREMENT 2: REMOVE PAID BILLS FROM PAYMENTS MENU & ONLY DISPLAY PENDING UNPAID BILLS
  // -------------------------------------------------------------------------------------------
  const pendingTenantInvoices = useMemo(() => {
    const map = new Map<string, Invoice>();

    // 1. Add real agreement invoices
    rawAgreementInvoices.forEach((inv) => {
      const isCycle = /-m\d+/i.test(inv.id);
      const isPaid = isCycle
        ? inv.status === "Paid" ||
          paidIds.has(inv.id) ||
          Boolean(inv.requestCode && paidIds.has(`${inv.requestCode}-m${inv.id.match(/-m(\d+)/i)?.[1]}`))
        : inv.status === "Paid" ||
          paidIds.has(inv.id) ||
          (inv.requestCode && paidIds.has(inv.requestCode)) ||
          (inv.requestCode && paidIds.has(`agr-inv-${inv.requestCode}`));

      // Only include if NOT paid (Pending / Overdue)
      if (!isPaid) {
        map.set(inv.id, inv);
      }
    });

    return Array.from(map.values());
  }, [rawAgreementInvoices, paidIds]);

  // Landlord: Maintain all collections with reactive status (Cleared vs Pending vs Overdue)
  const resolvedLandlordCollections = useMemo(() => {
    return rawLandlordCollections.map((col) => {
      const cycleMatch = col.id.match(/-m(\d+)/i);
      const isCycle = Boolean(cycleMatch);
      const cycleNum = cycleMatch ? cycleMatch[1] : null;

      const isCleared = isCycle
        ? col.status === "Cleared" ||
          paidIds.has(col.id) ||
          (col.agreementId && paidIds.has(`agr-inv-${col.agreementId}-m${cycleNum}`)) ||
          (col.requestCode && paidIds.has(`${col.requestCode}-m${cycleNum}`))
        : col.status === "Cleared" ||
          paidIds.has(col.id);

      return {
        ...col,
        status: (isCleared ? "Cleared" : col.status) as "Cleared" | "Pending" | "Overdue",
      };
    });
  }, [rawLandlordCollections, paidIds]);

  const pendingLandlordCollections = useMemo(() => {
    return resolvedLandlordCollections.filter((col) => col.status === "Pending" || col.status === "Overdue");
  }, [resolvedLandlordCollections]);

  const clearedLandlordCollections = useMemo(() => {
    return resolvedLandlordCollections.filter((col) => col.status === "Cleared");
  }, [resolvedLandlordCollections]);

  const [landlordStatusFilter, setLandlordStatusFilter] = useState<"all" | "pending" | "cleared">("all");

  // Auto-select tab on load for citizen role with collections
  useEffect(() => {
    if (isBoth) {
      if (pendingTenantInvoices.length === 0 && resolvedLandlordCollections.length > 0) {
        setActiveTab("landlord");
      }
    }
  }, [isBoth, pendingTenantInvoices.length, resolvedLandlordCollections.length]);

  // Selected Tenant Invoice
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");
  useEffect(() => {
    if (pendingTenantInvoices.length > 0) {
      if (!selectedInvoiceId || !pendingTenantInvoices.some((i) => i.id === selectedInvoiceId)) {
        setSelectedInvoiceId(pendingTenantInvoices[0].id);
      }
    } else {
      setSelectedInvoiceId("");
    }
  }, [pendingTenantInvoices, selectedInvoiceId]);

  const selectedInvoice =
    pendingTenantInvoices.find((i) => i.id === selectedInvoiceId) || pendingTenantInvoices[0];

  // Filtered & Paginated Tenant Invoices
  const filteredPendingTenantInvoices = useMemo(() => {
    return pendingTenantInvoices.filter(
      (inv) =>
        inv.invoiceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.landlordName && inv.landlordName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [pendingTenantInvoices, searchQuery]);

  const totalTenantPages = Math.ceil(filteredPendingTenantInvoices.length / itemsPerPage) || 1;
  const paginatedPendingTenantInvoices = useMemo(() => {
    const start = (tenantPage - 1) * itemsPerPage;
    return filteredPendingTenantInvoices.slice(start, start + itemsPerPage);
  }, [filteredPendingTenantInvoices, tenantPage, itemsPerPage]);

  // Filtered Landlord Collections by status and search
  const filteredByStatusLandlordCollections = useMemo(() => {
    if (landlordStatusFilter === "pending") {
      return pendingLandlordCollections;
    }
    if (landlordStatusFilter === "cleared") {
      return clearedLandlordCollections;
    }
    return resolvedLandlordCollections;
  }, [landlordStatusFilter, pendingLandlordCollections, clearedLandlordCollections, resolvedLandlordCollections]);

  const filteredLandlordCollections = useMemo(() => {
    return filteredByStatusLandlordCollections.filter(
      (col) =>
        col.requestCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        col.agreementNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        col.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        col.tenantName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [filteredByStatusLandlordCollections, searchQuery]);

  const totalLandlordPages = Math.ceil(filteredLandlordCollections.length / itemsPerPage) || 1;
  const paginatedLandlordCollections = useMemo(() => {
    const start = (landlordPage - 1) * itemsPerPage;
    return filteredLandlordCollections.slice(start, start + itemsPerPage);
  }, [filteredLandlordCollections, landlordPage, itemsPerPage]);

  // Selected Landlord Collection Item
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  useEffect(() => {
    if (filteredLandlordCollections.length > 0) {
      if (!selectedCollectionId || !filteredLandlordCollections.some((c) => c.id === selectedCollectionId)) {
        setSelectedCollectionId(filteredLandlordCollections[0].id);
      }
    } else if (resolvedLandlordCollections.length > 0) {
      setSelectedCollectionId(resolvedLandlordCollections[0].id);
    } else {
      setSelectedCollectionId("");
    }
  }, [filteredLandlordCollections, resolvedLandlordCollections, selectedCollectionId]);

  const selectedCollection =
    resolvedLandlordCollections.find((c) => c.id === selectedCollectionId) ||
    filteredLandlordCollections[0] ||
    resolvedLandlordCollections[0];

  const handleOpenPay = (invoice: Invoice) => {
    router.push(`/citizen/dashboard/payments/${invoice.id}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
     

      {/* --------------------------------------------------------------------------------------- */}
      {/* REQUIREMENT 1: ROLE-BASED ACCESS CONTROLS (Tenant Only, Landlord Only, or Citizen Both) */}
      {/* --------------------------------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        {/* If Citizen / Both: Show tab buttons to toggle between Tenant and Landlord views */}
        {isBoth ? (
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab("tenant");
                setTenantPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "tenant"
                  ? "bg-[#00450d] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Bills to Pay</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  activeTab === "tenant" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {pendingTenantInvoices.length} Pending
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("landlord");
                setLandlordPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "landlord"
                  ? "bg-[#00450d] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Rental Collections</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  activeTab === "landlord" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {resolvedLandlordCollections.length} Total{pendingLandlordCollections.length > 0 ? ` (${pendingLandlordCollections.length} Due)` : ""}
              </span>
            </button>
          </div>
        ) : isTenantOnly ? (
          /* Tenant Only View Header */
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
            <CreditCard className="w-4 h-4 text-blue-700" />
            <span className="text-xs font-bold text-blue-900">Bills to Pay (Tenant View)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-200 text-blue-900">
              {pendingTenantInvoices.length} Pending
            </span>
          </div>
        ) : (
          /* Landlord Only View Header */
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
            <Landmark className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-emerald-900">Rental Collections (Landlord View)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-200 text-emerald-900">
              {resolvedLandlordCollections.length} Total{pendingLandlordCollections.length > 0 ? ` • ${pendingLandlordCollections.length} Due` : ""}
            </span>
          </div>
        )}
      </div>

      {/* Real-Time Notification Banner */}
      {realtimeUpdated && (
        <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div className="text-xs">
              <span className="font-bold block text-emerald-900">
                Payment Status Synchronized in Real-Time!
              </span>
              <span className="text-emerald-800">
                Landlord payout settings and payment clearances updated. Settled bills have moved to Bills &amp; Invoices.
              </span>
            </div>
          </div>
          <button
            onClick={() => setRealtimeUpdated(false)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold px-2 py-1 rounded hover:bg-emerald-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Post-Payment Settlement Notice */}
      {chapaSuccessNotice && (
        <div className="flex items-center justify-between p-4 bg-emerald-900 text-white rounded-xl animate-in fade-in slide-in-from-top-2 duration-300 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/30 flex items-center justify-center shrink-0 border border-emerald-400/40">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <span>Chapa Advance Rent Cleared!</span>
                <span className="font-mono text-[11px] font-normal text-emerald-300 bg-white/10 px-2 py-0.5 rounded">
                  {chapaSuccessNotice.txRef}
                </span>
              </div>
              <p className="text-emerald-200">
                Advance rent {chapaSuccessNotice.amount ? `of ETB ${chapaSuccessNotice.amount.toLocaleString()}` : ""} was verified and settled. This bill has been removed from Payments and archived in Bills &amp; Invoices.
              </p>
              <div className="pt-1.5 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/citizen/dashboard/bills/rec-${chapaSuccessNotice.txRef}`)}
                  className="h-7 text-xs bg-white/20 hover:bg-white/30 text-white border-white/40 gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Receipt in Bills &amp; Invoices</span>
                </Button>
              </div>
            </div>
          </div>
          <button
            onClick={() => setChapaSuccessNotice(null)}
            className="text-xs text-emerald-300 hover:text-white font-bold px-2 py-1 rounded hover:bg-white/10 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* --------------------------------------------------------------------------------------- */}
      {/* TENANT VIEW: Bills to Pay (Pending Only) */}
      {/* --------------------------------------------------------------------------------------- */}
      {(!isLandlordOnly && activeTab === "tenant") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Tenant Pending Invoices Table */}
          <div className="lg:col-span-2 space-y-4">
            {pendingTenantInvoices.length === 0 ? (
              /* Empty State: All Bills Settled */
              <div className="p-8 text-center space-y-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">All Rental Bills Settled!</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    You have no pending rental bills due. All completed advance payments and official receipts are safely archived in Bills &amp; Invoices.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={() => router.push("/citizen/dashboard/bills")}
                    className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-8 px-4 font-bold cursor-pointer gap-1.5 shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Paid Receipts in Bills &amp; Invoices</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="bg-white border-slate-200 shadow-clean">
                <CardHeader className="p-1 pl-4 pb-1 border-b border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                        <span>Pending Rental Bills to Pay</span>
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Property / Description</TableHead>
                        <TableHead>Landlord Payout Account</TableHead>
                        <TableHead>Amount (ETB)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPendingTenantInvoices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-xs text-slate-400">
                            No pending rental bills match your search filter.
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedPendingTenantInvoices.map((inv) => {
                          const isSelected = selectedInvoice?.id === inv.id;
                          const hasPayout = Boolean(
                            inv.landlordAccountNumber && inv.landlordAccountNumber.trim().length > 0
                          );

                          return (
                            <TableRow
                              key={inv.id}
                              onClick={() => setSelectedInvoiceId(inv.id)}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? "bg-slate-50 font-small" : "hover:bg-slate-50/50"
                              }`}
                            >
                              <TableCell className="font-mono text-xs text-slate-900">
                                <div className="text-[9px]">{inv.invoiceCode}</div>
                                <span className={`text-[10px] font-normal block ${inv.status === "Overdue" ? "text-rose-600 font-medium" : "text-slate-400"}`}>
                                  Due: {inv.dueDate}
                                </span>
                              </TableCell>

                              <TableCell className="text-xs">
                                <div className="font-medium text-slate-900">{inv.propertyTitle}</div>
                                <div className="text-[11px] text-slate-500 font-normal">{inv.period}</div>
                              </TableCell>

                              <TableCell className="text-xs">
                                <div className="font-medium text-slate-900">
                                  {inv.landlordName || "Landlord"}
                                </div>
                                {hasPayout ? (
                                  <div className="flex items-center gap-1 text-[11px] text-emerald-800 transition-all duration-300">
                                    <span className="font-mono font-medium text-[8px]">
                                      {inv.landlordBankName || inv.landlordPreferredPaymentMethod}
                                    </span>
                                    <span className="text-slate-400">•</span>
                                    <span className="font-mono text-[8px]">{inv.landlordAccountNumber}</span>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                    <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                                    Payout not set
                                  </span>
                                )}
                              </TableCell>

                              <TableCell className="font-semibold text-xs text-slate-900">
                                ETB {inv.totalAmount.toLocaleString()}
                              </TableCell>

                              <TableCell>
                                {inv.status === "Overdue" ? (
                                  <Badge className="text-[10px] bg-rose-50 text-rose-800 border-rose-200 font-semibold gap-1">
                                    <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                                    <span>Overdue</span>
                                  </Badge>
                                ) : (
                                  <Badge variant="pending" className="text-[10px]">
                                    Pending
                                  </Badge>
                                )}
                              </TableCell>

                              <TableCell className="text-right">
                                {hasPayout ? (
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenPay(inv);
                                    }}
                                    className={`h-7 px-3 text-xs bg-[#00450d] hover:bg-[#1b5e20] text-white font-medium shadow-2xs cursor-pointer transition-all duration-300 ${
                                      realtimeUpdated ? "ring-2 ring-emerald-500 ring-offset-1" : ""
                                    }`}
                                  >
                                    Pay Now
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenPay(inv);
                                    }}
                                    className="h-7 px-2.5 text-[11px] text-amber-800 border-amber-300 bg-amber-50 hover:bg-amber-100 cursor-pointer"
                                  >
                                    View Invoice
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination Controls */}
                  <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Showing{" "}
                      {filteredPendingTenantInvoices.length > 0 ? (tenantPage - 1) * itemsPerPage + 1 : 0} to{" "}
                      {Math.min(tenantPage * itemsPerPage, filteredPendingTenantInvoices.length)} of{" "}
                      {filteredPendingTenantInvoices.length} pending bills
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={tenantPage <= 1}
                        onClick={() => setTenantPage(tenantPage - 1)}
                        className="h-7 w-7 p-0 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Button>
                      <span className="px-2 font-medium text-slate-700 text-xs">
                        Page {tenantPage} of {totalTenantPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={tenantPage >= totalTenantPages}
                        onClick={() => setTenantPage(tenantPage + 1)}
                        className="h-7 w-7 p-0 cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Tenant Payment Breakdown Card */}
          <div>
            {selectedInvoice ? (
              <Card className="bg-white border-slate-200 shadow-clean sticky top-24">
                <CardHeader className="p-5 pb-3.5 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        Invoice Breakdown
                      </span>
                      <CardTitle className="text-base font-semibold text-slate-900 mt-0.5">
                        {selectedInvoice.invoiceCode}
                      </CardTitle>
                    </div>
                    <Badge variant="pending" className="text-[10px]">
                      Pending
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{selectedInvoice.propertyTitle}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Due: {selectedInvoice.dueDate}</span>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Advance Rent Cost Breakdown */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Period Coverage</span>
                      <span className="font-semibold text-slate-900">{selectedInvoice.period}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>Calculated Base Rent</span>
                      <span className="font-semibold text-slate-900">
                        ETB {selectedInvoice.baseRent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span className="flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-slate-400" />
                        Water Utility
                      </span>
                      <span className="font-semibold text-slate-900">
                        ETB {selectedInvoice.waterUtility.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-slate-400" />
                        Electricity &amp; Maintenance
                      </span>
                      <span className="font-semibold text-slate-900">
                        ETB {selectedInvoice.electricityMaintenance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Total Due Banner */}
                    <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                      <span className="text-xs font-semibold uppercase text-slate-500">Total Due</span>
                      <span className="text-xl font-bold text-slate-900">
                        ETB {selectedInvoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Landlord Payout Info Box */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                      Landlord Payout Account
                    </span>

                    {selectedInvoice.landlordAccountNumber && selectedInvoice.landlordAccountNumber.trim().length > 0 ? (
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-lg space-y-1.5 text-xs transition-all duration-300">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Landlord:</span>
                          <span className="font-semibold text-slate-900">{selectedInvoice.landlordName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Bank / Provider:</span>
                          <span className="font-semibold text-emerald-900">
                            {selectedInvoice.landlordBankName || selectedInvoice.landlordPreferredPaymentMethod || "Bank Account"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Account Number:</span>
                          <span className="font-mono font-bold text-slate-900">{selectedInvoice.landlordAccountNumber}</span>
                        </div>
                        {selectedInvoice.landlordAccountHolderName && (
                          <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-emerald-100">
                            <span>Account Holder:</span>
                            <span>{selectedInvoice.landlordAccountHolderName}</span>
                          </div>
                        )}
                        <div className="pt-1 flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                          <Check className="w-3.5 h-3.5" />
                          <span>Ready for Direct Transfer</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1 text-amber-900 transition-all duration-300">
                        <div className="flex items-center gap-1.5 font-semibold text-amber-800">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Payout Method Not Configured</span>
                        </div>
                        <p className="text-[11px] text-amber-700">
                          The landlord (<strong>{selectedInvoice.landlordName}</strong>) has not configured their bank or Telebirr account yet.
                        </p>
                        <p className="text-[10px] text-amber-600 font-medium">
                          Payment button is disabled until the landlord adds their payout details in Profile settings.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pay Action Button */}
                  <div className="pt-2">
                    {selectedInvoice.landlordAccountNumber && selectedInvoice.landlordAccountNumber.trim().length > 0 ? (
                      <Button
                        onClick={() => handleOpenPay(selectedInvoice)}
                        className={`w-full bg-[#00450d] hover:bg-[#1b5e20] text-white font-medium h-10 gap-2 shadow-xs rounded-lg cursor-pointer transition-all duration-300 ${
                          realtimeUpdated ? "ring-2 ring-emerald-500 ring-offset-2 animate-bounce" : ""
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>View Details &amp; Pay Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <div className="space-y-1.5">
                        <Button
                          variant="outline"
                          onClick={() => handleOpenPay(selectedInvoice)}
                          className="w-full text-slate-700 font-medium h-10 gap-2 rounded-lg border border-slate-300 text-xs hover:bg-slate-50 cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4 text-slate-500" />
                          <span>View Invoice &amp; Terms</span>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        </Button>
                        <p className="text-[10px] text-amber-700 text-center font-medium">
                          ⚠️ Awaiting Landlord Payout Setup
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 justify-center pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified via Ethiopian Housing &amp; Treasury System</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-6 text-center text-xs text-slate-500 bg-white border-slate-200 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-semibold text-slate-800">No Pending Payments</p>
                <p className="text-[11px] text-slate-400">
                  All rental bills are settled. Review completed receipts in the Bills &amp; Invoices menu.
                </p>
                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push("/citizen/dashboard/bills")}
                    className="text-xs h-7.5 border-slate-300 cursor-pointer"
                  >
                    <span>Go to Bills &amp; Invoices</span>
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------------------------- */}
      {/* LANDLORD VIEW: Rental Collections & Settlements */}
      {/* --------------------------------------------------------------------------------------- */}
      {(!isTenantOnly && activeTab === "landlord") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Landlord Collections Table */}
          <div className="lg:col-span-2 space-y-4">
            {resolvedLandlordCollections.length === 0 ? (
              /* Empty State: No rental collections */
              <div className="p-8 text-center space-y-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">No Rental Collections Yet</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    When tenants lease your properties and rental agreements are created, incoming rental collection settlements will appear here.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <Button
                    onClick={() => router.push("/citizen/dashboard/agreements/active")}
                    className="bg-[#00450d] hover:bg-[#1b5e20] text-white text-xs h-8 px-4 font-bold cursor-pointer gap-1.5 shadow-xs"
                  >
                    <span>View Active Agreements</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="bg-white border-slate-200 shadow-clean">
                <CardHeader className="p-4 pb-3 border-b border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                        <span>Incoming Rental Collections</span>
                        {pendingLandlordCollections.length > 0 ? (
                          <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">
                            {pendingLandlordCollections.length} Awaiting Payment
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                            All Settled &amp; Deposited
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Advance rent settlements and clearance history for your leased properties.
                      </p>
                    </div>

                    {/* Filter Tabs: All, Pending, Cleared */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setLandlordStatusFilter("all");
                          setLandlordPage(1);
                        }}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                          landlordStatusFilter === "all"
                            ? "bg-white text-slate-900 shadow-2xs font-bold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        All ({resolvedLandlordCollections.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLandlordStatusFilter("pending");
                          setLandlordPage(1);
                        }}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                          landlordStatusFilter === "pending"
                            ? "bg-white text-slate-900 shadow-2xs font-bold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Pending ({pendingLandlordCollections.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLandlordStatusFilter("cleared");
                          setLandlordPage(1);
                        }}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                          landlordStatusFilter === "cleared"
                            ? "bg-white text-slate-900 shadow-2xs font-bold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Cleared ({clearedLandlordCollections.length})
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agreement / Request</TableHead>
                        <TableHead>Leased Property</TableHead>
                        <TableHead>Tenant Payer</TableHead>
                        <TableHead>Receiving Account</TableHead>
                        <TableHead>Advance Rent (ETB)</TableHead>
                        <TableHead>Settlement Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLandlordCollections.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10 text-xs text-slate-400">
                            <div>No rental collections match the selected filter.</div>
                            {landlordStatusFilter !== "all" && (
                              <button
                                onClick={() => {
                                  setLandlordStatusFilter("all");
                                  setLandlordPage(1);
                                }}
                                className="mt-2 text-emerald-800 font-semibold underline text-xs cursor-pointer block mx-auto"
                              >
                                View all {resolvedLandlordCollections.length} collections
                              </button>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedLandlordCollections.map((col) => {
                          const isSelected = selectedCollection?.id === col.id;

                          return (
                            <TableRow
                              key={col.id}
                              onClick={() => setSelectedCollectionId(col.id)}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? "bg-slate-50 font-medium" : "hover:bg-slate-50/50"
                              }`}
                            >
                              <TableCell className="font-mono font-semibold text-xs text-slate-900">
                                <div>{col.requestCode}</div>
                                <span className="text-[10px] text-slate-400 font-normal">
                                  Agreement: {col.agreementNumber}
                                </span>
                              </TableCell>

                              <TableCell className="text-xs">
                                <div className="font-medium text-slate-900">{col.propertyTitle}</div>
                                <div className="text-[11px] text-slate-500 font-normal">
                                  {col.periodLabel || `First ${col.advancePaymentMonths} Months Advance`}
                                </div>
                              </TableCell>

                              <TableCell className="text-xs">
                                <div className="font-medium text-slate-900">{col.tenantName}</div>
                                <div className="text-[11px] text-slate-500 font-normal">{col.tenantPhone}</div>
                              </TableCell>

                              <TableCell className="text-xs">
                                {col.hasPayoutConfigured ? (
                                  <div className="space-y-0.5">
                                    <span className="font-medium text-emerald-900 block">
                                      {col.landlordBankName || "Bank Account"}
                                    </span>
                                    <span className="font-mono text-slate-600 text-[11px]">
                                      {col.landlordAccountNumber}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                                    Not Set
                                  </span>
                                )}
                              </TableCell>

                              <TableCell className="font-semibold text-xs text-slate-900">
                                ETB {col.totalAmount.toLocaleString()}
                              </TableCell>

                              <TableCell>
                                {col.status === "Cleared" ? (
                                  <Badge className="text-[10px] bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold gap-1">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                    <span>Cleared &amp; Deposited</span>
                                  </Badge>
                                ) : col.status === "Overdue" ? (
                                  <Badge className="text-[10px] bg-rose-50 text-rose-800 border-rose-200 font-semibold gap-1">
                                    <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                                    <span>Overdue</span>
                                  </Badge>
                                ) : (
                                  <Badge className="text-[10px] bg-amber-50 text-amber-800 border-amber-200 font-semibold gap-1">
                                    <Clock className="w-2.5 h-2.5 text-amber-600" />
                                    <span>Awaiting Payment</span>
                                  </Badge>
                                )}
                              </TableCell>

                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(
                                      `/citizen/dashboard/agreements/active/${col.requestCode}/payment-history`
                                    );
                                  }}
                                  className="h-7 px-2 text-[11px] text-emerald-800 border-emerald-300 hover:bg-emerald-50 font-semibold cursor-pointer"
                                >
                                  <span>see payment history -&gt;</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination Controls */}
                  <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Showing{" "}
                      {filteredLandlordCollections.length > 0
                        ? (landlordPage - 1) * itemsPerPage + 1
                        : 0}{" "}
                      to{" "}
                      {Math.min(landlordPage * itemsPerPage, filteredLandlordCollections.length)} of{" "}
                      {filteredLandlordCollections.length} collections
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={landlordPage <= 1}
                        onClick={() => setLandlordPage(landlordPage - 1)}
                        className="h-7 w-7 p-0 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Button>
                      <span className="px-2 font-medium text-slate-700 text-xs">
                        Page {landlordPage} of {totalLandlordPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={landlordPage >= totalLandlordPages}
                        onClick={() => setLandlordPage(landlordPage + 1)}
                        className="h-7 w-7 p-0 cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Landlord Collection Breakdown Card */}
          <div>
            {selectedCollection ? (
              <Card className="bg-white border-slate-200 shadow-clean sticky top-24">
                <CardHeader className="p-5 pb-3.5 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                        {selectedCollection.status === "Cleared"
                          ? "Cleared Collection Details"
                          : selectedCollection.status === "Overdue"
                          ? "Overdue Collection Details"
                          : "Pending Collection Details"}
                      </span>
                      <CardTitle className="text-base font-semibold text-slate-900 mt-0.5">
                        {selectedCollection.requestCode}
                      </CardTitle>
                    </div>
                    {selectedCollection.status === "Cleared" ? (
                      <Badge className="text-[10px] bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Cleared &amp; Deposited</span>
                      </Badge>
                    ) : selectedCollection.status === "Overdue" ? (
                      <Badge className="text-[10px] bg-rose-50 text-rose-800 border-rose-200 font-semibold gap-1">
                        <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                        <span>Overdue</span>
                      </Badge>
                    ) : (
                      <Badge className="text-[10px] bg-amber-50 text-amber-800 border-amber-200 font-semibold gap-1">
                        <Clock className="w-2.5 h-2.5 text-amber-600" />
                        <span>Awaiting Payment</span>
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{selectedCollection.propertyTitle}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Agreement Start: {selectedCollection.dueDate}</span>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Tenant Payer Information */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Tenant (Payer) Information
                    </span>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        Name:
                      </span>
                      <span className="font-semibold text-slate-900">{selectedCollection.tenantName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        Phone:
                      </span>
                      <span className="font-mono text-slate-800">{selectedCollection.tenantPhone}</span>
                    </div>
                    {selectedCollection.tenantEmail && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          Email:
                        </span>
                        <span className="text-slate-700">{selectedCollection.tenantEmail}</span>
                      </div>
                    )}
                  </div>

                  {/* Financial Settlement Breakdown */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Monthly Rental Rate</span>
                      <span className="font-semibold text-slate-900">
                        ETB {selectedCollection.monthlyRent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>Advance Coverage</span>
                      <span className="font-semibold text-slate-900">
                        {selectedCollection.advancePaymentMonths} Months Advance
                      </span>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                      <span className="text-xs font-semibold uppercase text-slate-500">
                        {selectedCollection.status === "Cleared" ? "Total Amount Deposited" : "Total Payout Expected"}
                      </span>
                      <span className="text-xl font-bold text-slate-900">
                        ETB {selectedCollection.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Receiving Account Status */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                      Your Deposited Bank Account
                    </span>

                    {selectedCollection.hasPayoutConfigured ? (
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-lg space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Bank Name:</span>
                          <span className="font-semibold text-emerald-900">
                            {selectedCollection.landlordBankName || "Bank Account"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Account Number:</span>
                          <span className="font-mono font-bold text-slate-900">
                            {selectedCollection.landlordAccountNumber}
                          </span>
                        </div>
                        {selectedCollection.landlordAccountHolderName && (
                          <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-emerald-100">
                            <span>Account Holder:</span>
                            <span>{selectedCollection.landlordAccountHolderName}</span>
                          </div>
                        )}
                        <div className="pt-1 flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            {selectedCollection.status === "Cleared"
                              ? "Cleared & Deposited to Account"
                              : "Active Payout Account"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-2 text-amber-900">
                        <div className="flex items-center gap-1.5 font-semibold text-amber-800">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Receiving Account Missing</span>
                        </div>
                        <p className="text-[11px] text-amber-700">
                          Your tenant cannot transfer rent until you configure your receiving bank account in Profile Settings.
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push("/citizen/dashboard/profile/payment-settings")}
                          className="w-full text-xs h-7.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300 font-bold gap-1 cursor-pointer"
                        >
                          <span>Configure Payout Method</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Actions for Landlord */}
                  <div className="pt-2 space-y-2">
                    <Button
                      onClick={() =>
                        router.push(
                          `/citizen/dashboard/agreements/active/${selectedCollection.requestCode}/payment-history`
                        )
                      }
                      className="w-full bg-[#00450d] hover:bg-[#1b5e20] text-white font-medium h-10 gap-2 shadow-xs rounded-lg text-xs cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>see payment history -&gt;</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 justify-center pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Direct Ethiopian Bank Clearing Verified</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-6 text-center text-xs text-slate-500 bg-white border-slate-200 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-semibold text-slate-800">Collections Up to Date</p>
                <p className="text-[11px] text-slate-400">
                  All tenant advance payments are cleared and deposited into your designated bank account.
                </p>
                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push("/citizen/dashboard/bills")}
                    className="text-xs h-7.5 border-slate-300 cursor-pointer"
                  >
                    <span>Go to Bills &amp; Invoices</span>
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
