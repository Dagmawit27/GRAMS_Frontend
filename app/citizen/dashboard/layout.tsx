"use client";

import React, { useEffect } from "react";
import { SidebarWrapper } from "@/app/citizen/dashboard/sidebar-wrapper";
import { TopAppBar } from "@/components/TopAppBar";
import { useCitizenData } from "@/hooks/useCitizenData";
import { getSession, validateSession } from "@/lib/api";
import { UserRole } from "@/types";

// Interactive Modals
import { NewAgreementModal } from "@/components/NewAgreementModal";
import { RegisterPropertyModal } from "@/components/RegisterPropertyModal";
import { PaymentModal } from "@/components/PaymentModal";
import { BookVisitModal } from "@/components/BookVisitModal";
import { ApplyLeaseModal } from "@/components/ApplyLeaseModal";
import { ReceiptModal } from "@/components/ReceiptModal";
import { AgreementViewModal } from "@/components/AgreementViewModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CitizenRoleGuard, getResolvedCitizenRole } from "@/components/CitizenRoleGuard";

export const CitizenDashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    userRole,
    setUserRole,
    isSidebarCollapsed,
    setIsMobileMenuOpen,
    globalSearch,
    setGlobalSearch,
    currentPage,
    handleNavigate,
    setSelectedProperty,
    notifications,
    handleNotificationClick,
    handleClearNotifications,
    handleAddNotification,
    isDarkMode,
    setIsDarkMode,
    
    // Modals
    isNewAgreementModalOpen,
    setIsNewAgreementModalOpen,
    properties,
    handleCreateAgreement,
    isRegisterPropertyModalOpen,
    setIsRegisterPropertyModalOpen,
    handleRegisterProperty,
    payingInvoice,
    setPayingInvoice,
    handlePaymentSuccess,
    bookingVisitProperty,
    setBookingVisitProperty,
    handleBookVisitSuccess,
    applyingLeaseProperty,
    setApplyingLeaseProperty,
    handleApplyLeaseSuccess,
    viewingReceipt,
    setViewingReceipt,
    viewingAgreement,
    setViewingAgreement,
    isLogoutModalOpen,
    setIsLogoutModalOpen,

    //action
    handleLogout,
  } = useCitizenData();

  const router = useRouter();

  // On mount: sync userRole from localStorage so it always reflects the
  // role written by saveSession() before navigating here.
  useEffect(() => {
    const sessionValidation = validateSession();
    if (!sessionValidation.valid) {
      router.push("/citizen");
      return;
    }

    const session = sessionValidation.session;
    if (!session) {
      router.push("/citizen");
      return;
    }

    // Derive the correct role from getResolvedCitizenRole
    const resolvedRole = (getResolvedCitizenRole() || "citizen") as UserRole;

    if (resolvedRole !== userRole) {
      setUserRole(resolvedRole);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] flex flex-col font-sans transition-colors">
      {/* Side Navigation Bar */}
      <SidebarWrapper />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? "md:pl-[72px]" : "md:pl-[260px]"
        }`}
      >
        {/* Top App Bar */}
        <TopAppBar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onClearNotifications={handleClearNotifications}
          onAddNotification={handleAddNotification}
          isDarkMode={isDarkMode}
          onLogoutClick={() => setIsLogoutModalOpen(true)}
          onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <CitizenRoleGuard>
            {children}
          </CitizenRoleGuard>
        </main>
      </div>

      {/* Global Interactive Modals */}
      <NewAgreementModal
        open={isNewAgreementModalOpen}
        onClose={() => setIsNewAgreementModalOpen(false)}
        properties={properties}
        onCreateAgreement={handleCreateAgreement}
      />

      <RegisterPropertyModal
        open={isRegisterPropertyModalOpen}
        onClose={() => setIsRegisterPropertyModalOpen(false)}
        onRegister={handleRegisterProperty}
      />

      <PaymentModal
        open={!!payingInvoice}
        onClose={() => setPayingInvoice(null)}
        invoice={payingInvoice}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <BookVisitModal
        open={!!bookingVisitProperty}
        onClose={() => setBookingVisitProperty(null)}
        property={bookingVisitProperty}
        onBookSuccess={handleBookVisitSuccess}
      />

      <ApplyLeaseModal
        open={!!applyingLeaseProperty}
        onClose={() => setApplyingLeaseProperty(null)}
        property={applyingLeaseProperty}
        onApplySuccess={handleApplyLeaseSuccess}
      />

      <ReceiptModal
        open={!!viewingReceipt}
        onClose={() => setViewingReceipt(null)}
        receipt={viewingReceipt}
      />

      <AgreementViewModal
        open={!!viewingAgreement}
        onClose={() => setViewingAgreement(null)}
        agreement={viewingAgreement}
      />

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent onClose={() => setIsLogoutModalOpen(false)} className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out of the GRAMS Citizen Portal?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-4">
            <Button variant="outline" onClick={() => setIsLogoutModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleLogout();
                router.push("/citizen");
              }}
            >
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CitizenDashboardLayout;
