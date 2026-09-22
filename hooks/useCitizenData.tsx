"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Property,
  RentalAgreement,
  Invoice,
  Receipt,
  ActivityNotification,
  LeaseRequest,
  NavPage,
  UserRole,
} from "@/types";
import {
  INITIAL_PROPERTIES,
  INITIAL_LEASE_REQUESTS,
  INITIAL_AGREEMENTS,
  INITIAL_INVOICES,
  INITIAL_RECEIPTS,
} from "@/data/mockData";
import { getMyProperties, registerProperty as apiRegisterProperty, getSession, clearSession, getNotifications, getUnreadNotificationCount, markAllNotificationsAsRead } from "@/lib/api";

export interface CitizenContextType {
  // Role & Navigation
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  userEmail: string;
  currentPage: NavPage;
  setCurrentPage: (page: NavPage) => void;
  selectedProperty: Property | null;
  setSelectedProperty: (prop: Property | null) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (v: boolean) => void;
  
  // Agreement Sub-views
  activeAgreementView: 'list' | 'landlord-review' | 'tenant-signing';
  setActiveAgreementView: (view: 'list' | 'landlord-review' | 'tenant-signing') => void;
  selectedLeaseRequest: LeaseRequest | null;
  setSelectedLeaseRequest: (req: LeaseRequest | null) => void;

  // Data
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  agreements: RentalAgreement[];
  setAgreements: React.Dispatch<React.SetStateAction<RentalAgreement[]>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  receipts: Receipt[];
  setReceipts: React.Dispatch<React.SetStateAction<Receipt[]>>;
  leaseRequests: LeaseRequest[];
  setLeaseRequests: React.Dispatch<React.SetStateAction<LeaseRequest[]>>;
  notifications: ActivityNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<ActivityNotification[]>>;

  // Search & Theme
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean | ((prev: boolean) => boolean)) => void;

  // Modals
  isNewAgreementModalOpen: boolean;
  setIsNewAgreementModalOpen: (v: boolean) => void;
  isRegisterPropertyModalOpen: boolean;
  setIsRegisterPropertyModalOpen: (v: boolean) => void;
  payingInvoice: Invoice | null;
  setPayingInvoice: (inv: Invoice | null) => void;
  bookingVisitProperty: Property | null;
  setBookingVisitProperty: (prop: Property | null) => void;
  applyingLeaseProperty: Property | null;
  setApplyingLeaseProperty: (prop: Property | null) => void;
  viewingReceipt: Receipt | null;
  setViewingReceipt: (rec: Receipt | null) => void;
  viewingAgreement: RentalAgreement | null;
  setViewingAgreement: (agr: RentalAgreement | null) => void;
  isLogoutModalOpen: boolean;
  setIsLogoutModalOpen: (v: boolean) => void;

  // Actions
  handleLogout: () => void;
  handleNavigate: (page: NavPage) => void;
  handleSelectProperty: (property: Property) => void;
  handleBackFromPropertyDetails: () => void;
  handleCreateAgreement: (newAgr: RentalAgreement) => void;
  handleRegisterProperty: (newProp: Property) => void;
  handleAcceptLeaseRequest: (req: LeaseRequest) => void;
  handleDeclineLeaseRequest: (reqId: string, reason?: string) => void;
  handleOpenLandlordReview: (req: LeaseRequest) => void;
  handleOpenTenantSigning: (req: LeaseRequest) => void;
  handleSignAgreementByTenant: (req: LeaseRequest) => void;
  handleWithdrawLeaseRequest: (reqId: string) => void;
  handlePaymentSuccess: (invoiceId: string, receipt: Receipt) => void;
  handleBookVisitSuccess: (details: { date: string; time: string; name: string }) => void;
  handleApplyLeaseSuccess: (newReq: LeaseRequest) => void;
  handleViewAgreementForProperty: (propTitle: string) => void;
  handleNotificationClick: (notif: ActivityNotification) => void;
  handleClearNotifications: () => void;
  handleAddNotification: (notif: ActivityNotification) => void;
}

const CitizenContext = createContext<CitizenContextType | null>(null);

const VALID_ROLES: UserRole[] = [
  "citizen",
  "tenant",
  "landlord",
  "woreda_officer",
  "woreda_supervisor",
];

export const CitizenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Role & Navigation State — always start with a stable SSR default, then sync from localStorage on mount
  const [userRole, setUserRoleState] = useState<UserRole>("citizen");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("userRole");

    if (saved && VALID_ROLES.includes(saved as UserRole)) {
      setUserRoleState(saved as UserRole);
      return;
    }

    const rawUser = localStorage.getItem("user");

    if (rawUser) {
      try {
        const user = JSON.parse(rawUser);
        const role = user.roles?.[0]?.toLowerCase();

        if (role && VALID_ROLES.includes(role as UserRole)) {
          setUserRoleState(role as UserRole);
        }
      } catch {
        // Ignore invalid user data
      }
    }
  }, []);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    if (typeof window !== "undefined") {
      localStorage.setItem("userRole", role);
    }
  };

  useEffect(() => {
    // Listen for storage events (e.g. login from another tab or modal)
    const handleStorage = () => {
      const saved = localStorage.getItem("userRole");
      if (saved && VALID_ROLES.includes(saved as UserRole)) {
        setUserRoleState(saved as UserRole);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);
  const [currentPage, setCurrentPage] = useState<NavPage>("landing");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Agreement sub-views
  const [activeAgreementView, setActiveAgreementView] = useState<'list' | 'landlord-review' | 'tenant-signing'>('list');
  const [selectedLeaseRequest, setSelectedLeaseRequest] = useState<LeaseRequest | null>(null);

  // App Data State
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [leaseRequests, setLeaseRequests] = useState<LeaseRequest[]>(INITIAL_LEASE_REQUESTS);
  const [agreements, setAgreements] = useState<RentalAgreement[]>(INITIAL_AGREEMENTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [receipts, setReceipts] = useState<Receipt[]>(INITIAL_RECEIPTS);
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);

  useEffect(() => {
    const session = getSession();
    // Set user email from session
    if (session && session.user?.email) {
      setUserEmail(session.user.email);
    }
    
    // Load properties for landlord users
    if (session && session.user.userType !== "GOVERNMENT_EMPLOYEE") {
      const userRole = session.user.roles?.[0]?.toLowerCase();
      if (userRole === "landlord" || userRole === "both") {
        void getMyProperties(session.token).then(data => {
          const mapped: Property[] = data.map(pr => ({
            id: pr.id,
            title: pr.propertyCode || pr.propertyType + " Property",
            type: pr.propertyType as any,
            price: pr.monthlyRent,
            location: pr.address?.city || "",
            subCity: pr.address?.subCity || "",
            woreda: pr.address?.woreda || "",
            houseNo: pr.houseNumber || "",
            bedrooms: pr.bedroomCount || 0,
            bathrooms: pr.bathroomCount || 0,
            area: pr.areaSqMeter || 0,
            floor: pr.floorNumber || "",
            status: pr.status === 'LISTED' ? 'Available' : 'Under Maintenance',
            verified: pr.status === 'VERIFIED' || pr.status === 'LISTED',
            featuredImage: pr.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
            galleryImages: pr.images?.map(i => i.imageUrl) || [],
            description: pr.description || "",
            amenities: [],
            securityDepositMonths: 2,
            minLeasePeriod: "1 Year",
            utilitiesIncluded: false,
            availableFrom: pr.createdAt || new Date().toISOString(),
            landlordName: session.user.firstName + " " + session.user.lastName,
          }));
          
          setProperties(prev => {
            const newIds = new Set(mapped.map(p => p.id));
            return [...mapped, ...prev.filter(p => !newIds.has(p.id))];
          });
        }).catch(err => console.error("Failed to load properties:", err));
      }
    }

    // Load notifications from backend
    if (session && session.token) {
      void getNotifications(session.token, 0, 10).then(data => {
        const mapped: ActivityNotification[] = data.content.map(n => ({
          id: n.id,
          type: n.type.toLowerCase() as any,
          title: n.type.replace(/_/g, ' '),
          description: n.message,
          timestamp: new Date(n.createdAt).toLocaleString(),
          read: n.read,
          linkPage: undefined
        }));
        setNotifications(mapped);
      }).catch(err => console.error("Failed to load notifications:", err));
    }
  }, []);

  // Search & Theme State
  const [globalSearch, setGlobalSearch] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Modal States
  const [isNewAgreementModalOpen, setIsNewAgreementModalOpen] = useState(false);
  const [isRegisterPropertyModalOpen, setIsRegisterPropertyModalOpen] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [bookingVisitProperty, setBookingVisitProperty] = useState<Property | null>(null);
  const [applyingLeaseProperty, setApplyingLeaseProperty] = useState<Property | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);
  const [viewingAgreement, setViewingAgreement] = useState<RentalAgreement | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    clearSession();

    setIsLogoutModalOpen(false);
    setSelectedProperty(null);
    setSelectedLeaseRequest(null);
    setActiveAgreementView("list");
  };

  const handleNavigate = (page: NavPage) => {
    setSelectedProperty(null);
    setActiveAgreementView('list');
    setSelectedLeaseRequest(null);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackFromPropertyDetails = () => {
    setSelectedProperty(null);
  };

  const handleOpenLandlordReview = (req: LeaseRequest) => {
    setSelectedLeaseRequest(req);
    setActiveAgreementView('landlord-review');
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenTenantSigning = (req: LeaseRequest) => {
    setSelectedLeaseRequest(req);
    setActiveAgreementView('tenant-signing');
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreateAgreement = (newAgr: RentalAgreement) => {
    setAgreements((prev) => [newAgr, ...prev]);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: "agreement",
        title: "Agreement Registered",
        description: `${newAgr.agreementCode} for ${newAgr.propertyTitle} created.`,
        timestamp: "Just now",
        read: false,
        linkPage: "agreements",
      },
      ...prev,
    ]);
  };

  const handleRegisterProperty = async (newProp: Property) => {
    try {
      const session = getSession();
      if (session) {
        const reqData = {
          propertyType: newProp.type,
          address: {
            city: newProp.location || "Addis Ababa",
            subCity: newProp.subCity || "Bole",
            woreda: newProp.woreda || "01",
          },
          houseNumber: newProp.houseNo,
          floorNumber: newProp.floor,
          bedroomCount: newProp.bedrooms,
          bathroomCount: newProp.bathrooms,
          areaSqMeter: newProp.area,
          monthlyRent: newProp.price,
          description: newProp.description,
        };
        const backendProp = await apiRegisterProperty(session.token, reqData as any);
        newProp.id = backendProp.id;
        newProp.verified = backendProp.status === 'VERIFIED' || backendProp.status === 'LISTED';
      }
    } catch (error) {
      console.error("Failed to register property with backend:", error);
    }

    setProperties((prev) => [newProp, ...prev]);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: "system",
        title: "Property Registered",
        description: `${newProp.title} registered in municipal title registry.`,
        timestamp: "Just now",
        read: false,
        linkPage: "properties",
      },
      ...prev,
    ]);
  };

  const handleAcceptLeaseRequest = (req: LeaseRequest) => {
    // If landlord accepts, generate agreement or transition
    setLeaseRequests((prev) =>
      prev.map((r) =>
        r.id === req.id
          ? {
              ...r,
              status: "Ready to Sign" as const,
              landlordSigned: true,
              landlordSignedDate: "Just now",
              landlordSignatureHash: `SHA256-${Math.random().toString(36).substring(2, 10)}`,
              statusNote: "Approved by landlord. Sent to tenant for final digital signature.",
            }
          : r
      )
    );

    const newAgr: RentalAgreement = {
      id: `agr-${Date.now()}`,
      agreementCode: req.requestCode.replace("RA-", "AG-"),
      propertyTitle: req.propertyTitle,
      propertyLocation: req.propertyLocation,
      propertyImage: req.propertyImage,
      unitNumber: req.unitNumber,
      area: req.area,
      counterpartyName: req.counterpartyName,
      counterpartyInitials:
        req.counterpartyName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "TN",
      counterpartyRole: "Tenant",
      startDate: req.startDate || "01 Sep 2023",
      endDate: req.endDate || "31 Aug 2024",
      monthlyRent: req.proposedRent,
      status: "Active",
      depositAmount: req.securityDeposit || req.proposedRent * 2,
      termsSummary: req.notes || "Standard 1-year verified residential lease contract.",
      landlordSigned: true,
      tenantSigned: true,
      landlordName: "Dagmawit Mesfin",
      tenantName: req.counterpartyName,
    };

    setAgreements((prev) => [newAgr, ...prev]);
    setActiveAgreementView('list');
    setSelectedLeaseRequest(null);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: "agreement",
        title: "Lease Request Accepted",
        description: `Contract ${newAgr.agreementCode} generated for ${req.counterpartyName}.`,
        timestamp: "Just now",
        read: false,
        linkPage: "agreements",
      },
      ...prev,
    ]);
  };

  const handleDeclineLeaseRequest = (reqId: string, reason?: string) => {
    setLeaseRequests((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? {
              ...r,
              status: "Declined" as const,
              declineReason: reason || "Request declined by landlord based on current occupancy criteria.",
            }
          : r
      )
    );
    setActiveAgreementView('list');
    setSelectedLeaseRequest(null);
  };

  const handleSignAgreementByTenant = (req: LeaseRequest) => {
    const updatedRequests = leaseRequests.map((r) =>
      r.id === req.id
        ? {
            ...r,
            status: "Accepted" as const,
            tenantSigned: true,
            tenantSignedDate: "Just now",
            tenantSignatureHash: `SHA256-${Math.random().toString(36).substring(2, 10)}`,
          }
        : r
    );
    setLeaseRequests(updatedRequests);

    // Create or activate the official agreement
    const newAgr: RentalAgreement = {
      id: `agr-${Date.now()}`,
      agreementCode: req.requestCode.replace("RA-", "AG-"),
      propertyTitle: req.propertyTitle,
      propertyLocation: req.propertyLocation,
      propertyImage: req.propertyImage,
      unitNumber: req.unitNumber,
      area: req.area,
      counterpartyName: req.landlordName || "Kibrom Tadesse",
      counterpartyInitials: req.landlordInitials || "KT",
      counterpartyRole: "Landlord",
      startDate: req.startDate || "01 Nov 2023",
      endDate: req.endDate || "31 Oct 2024",
      monthlyRent: req.proposedRent,
      status: "Active",
      depositAmount: req.securityDeposit || req.proposedRent * 2,
      termsSummary: "Standard 1-year verified residential lease contract signed digitally with Fayda verification.",
      landlordSigned: true,
      tenantSigned: true,
      landlordName: req.landlordName || "Kibrom Tadesse",
      tenantName: "Dagmawit Mesfin",
    };

    setAgreements((prev) => [newAgr, ...prev]);
    setActiveAgreementView('list');
    setSelectedLeaseRequest(null);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: "agreement",
        title: "Agreement Digitally Signed!",
        description: `Tenancy ${newAgr.agreementCode} is now officially Active and recorded with Housing Bureau.`,
        timestamp: "Just now",
        read: false,
        linkPage: "agreements",
      },
      ...prev,
    ]);
  };

  const handleWithdrawLeaseRequest = (reqId: string) => {
    setLeaseRequests((prev) => prev.filter((r) => r.id !== reqId));
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: "system",
        title: "Application Withdrawn",
        description: "Your lease application was successfully withdrawn.",
        timestamp: "Just now",
        read: false,
      },
      ...prev,
    ]);
  };

  const handlePaymentSuccess = (invoiceId: string, receipt: Receipt) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: "Paid" } : inv))
    );
    setReceipts((prev) => [receipt, ...prev]);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: "payment",
        title: "Payment Cleared",
        description: `ETB ${receipt.amount.toLocaleString()} settled for ${receipt.propertyName}.`,
        timestamp: "Just now",
        read: false,
        linkPage: "bills",
      },
      ...prev,
    ]);
  };

  const handleBookVisitSuccess = (details: { date: string; time: string; name: string }) => {
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: "system",
        title: "Visit Inspection Confirmed",
        description: `Inspection pass issued for ${details.date} at ${details.time}.`,
        timestamp: "Just now",
        read: false,
      },
      ...prev,
    ]);
  };

  const handleApplyLeaseSuccess = (newReq: LeaseRequest) => {
    setLeaseRequests((prev) => [newReq, ...prev]);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: "agreement",
        title: "Application Received",
        description: `Application ${newReq.requestCode} submitted for review.`,
        timestamp: "Just now",
        read: false,
        linkPage: "agreements",
      },
      ...prev,
    ]);
  };

  const handleViewAgreementForProperty = (propTitle: string) => {
    const agr =
      agreements.find((a) => a.propertyTitle.toLowerCase().includes(propTitle.toLowerCase())) ||
      agreements[0];
    if (agr) {
      setViewingAgreement(agr);
    }
  };

  const handleNotificationClick = (notif: ActivityNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
  };

  const handleClearNotifications = async () => {
    const session = getSession();
    if (session && session.token) {
      try {
        await markAllNotificationsAsRead(session.token);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch (err) {
        console.error("Failed to mark all notifications as read:", err);
        // Fallback to local update
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } else {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const handleAddNotification = (notification: ActivityNotification) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  return (
    <CitizenContext.Provider
      value={{
        userRole,
        setUserRole,
        userEmail,
        currentPage,
        setCurrentPage,
        selectedProperty,
        setSelectedProperty,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        activeAgreementView,
        setActiveAgreementView,
        selectedLeaseRequest,
        setSelectedLeaseRequest,
        properties,
        setProperties,
        agreements,
        setAgreements,
        invoices,
        setInvoices,
        receipts,
        setReceipts,
        leaseRequests,
        setLeaseRequests,
        notifications,
        setNotifications,
        globalSearch,
        setGlobalSearch,
        isDarkMode,
        setIsDarkMode,
        isNewAgreementModalOpen,
        setIsNewAgreementModalOpen,
        isRegisterPropertyModalOpen,
        setIsRegisterPropertyModalOpen,
        payingInvoice,
        setPayingInvoice,
        bookingVisitProperty,
        setBookingVisitProperty,
        applyingLeaseProperty,
        setApplyingLeaseProperty,
        viewingReceipt,
        setViewingReceipt,
        viewingAgreement,
        setViewingAgreement,
        isLogoutModalOpen,
        setIsLogoutModalOpen,
        handleLogout,
        handleNavigate,
        handleSelectProperty,
        handleBackFromPropertyDetails,
        handleCreateAgreement,
        handleRegisterProperty,
        handleAcceptLeaseRequest,
        handleDeclineLeaseRequest,
        handleOpenLandlordReview,
        handleOpenTenantSigning,
        handleSignAgreementByTenant,
        handleWithdrawLeaseRequest,
        handlePaymentSuccess,
        handleBookVisitSuccess,
        handleApplyLeaseSuccess,
        handleViewAgreementForProperty,
        handleNotificationClick,
        handleClearNotifications,
        handleAddNotification,
      }}
    >
      {children}
    </CitizenContext.Provider>
  );
};

export function useCitizenData(): CitizenContextType {
  const context = useContext(CitizenContext);
  if (!context) {
    throw new Error("useCitizenData must be used within a CitizenProvider");
  }
  return context;
}
