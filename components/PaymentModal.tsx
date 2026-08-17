"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Invoice, Receipt } from "@/types/index";
import { CreditCard, CheckCircle2, QrCode, Phone, ShieldCheck, ArrowRight, Loader2, Building } from "lucide-react";
import confetti from "canvas-confetti";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onPaymentSuccess: (invoiceId: string, receipt: Receipt) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  invoice,
  onPaymentSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<"Telebirr" | "CBE Transfer" | "Bank Transfer" | "Awash Birr">("Telebirr");
  const [phoneNumber, setPhoneNumber] = useState("0911234567");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<Receipt | null>(null);

  if (!invoice) return null;

  const handlePay = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // ignore if canvas not supported
      }

      const receipt: Receipt = {
        id: `rec-${Date.now()}`,
        receiptCode: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        propertyName: invoice.propertyTitle,
        paymentMethod: paymentMethod,
        amount: invoice.totalAmount,
        status: "Paid",
        transactionRef: `${paymentMethod.slice(0, 3).toUpperCase()}-${Math.floor(1000000 + Math.random() * 9000000)}-ET`,
        payerName: "Dagmawit Mesfin",
        taxRegistrationNumber: "ET-TIN-00892418"
      };

      setGeneratedReceipt(receipt);
      onPaymentSuccess(invoice.id, receipt);
    }, 1200);
  };

  const handleClose = () => {
    setIsCompleted(false);
    setIsProcessing(false);
    setGeneratedReceipt(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent onClose={handleClose} className="max-w-md">
        {!isCompleted ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 text-slate-900 mb-1">
                <CreditCard className="w-4 h-4 text-slate-500" />
                <DialogTitle>Secure Payment Portal</DialogTitle>
              </div>
              <DialogDescription>
                Pay municipal rent and utility fees directly to the treasury ledger.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Summary Card */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Invoice: {invoice.invoiceCode}</span>
                  <span>Period: {invoice.period}</span>
                </div>
                <div className="font-semibold text-xs text-slate-900">{invoice.propertyTitle}</div>
                <div className="h-px bg-slate-200 my-1.5" />
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-500">Total Due:</span>
                  <span className="text-lg font-bold text-slate-900">
                    ETB {invoice.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Select Payment Provider
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Telebirr")}
                    className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                      paymentMethod === "Telebirr"
                        ? "border-slate-900 bg-slate-50 font-semibold text-slate-900 ring-1 ring-slate-900/10"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs">Telebirr</span>
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">Instant Mobile Birr</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CBE Transfer")}
                    className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                      paymentMethod === "CBE Transfer"
                        ? "border-slate-900 bg-slate-50 font-semibold text-slate-900 ring-1 ring-slate-900/10"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs">CBE Birr</span>
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">Commercial Bank of Eth</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Awash Birr")}
                    className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                      paymentMethod === "Awash Birr"
                        ? "border-slate-900 bg-slate-50 font-semibold text-slate-900 ring-1 ring-slate-900/10"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs">Awash Birr</span>
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">Awash Bank Portal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Bank Transfer")}
                    className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                      paymentMethod === "Bank Transfer"
                        ? "border-slate-900 bg-slate-50 font-semibold text-slate-900 ring-1 ring-slate-900/10"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs">Direct Transfer</span>
                      <QrCode className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">Inter-bank RTGS</span>
                  </button>
                </div>
              </div>

              {/* Input for Phone / Account */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  {paymentMethod === "Telebirr" || paymentMethod === "CBE Transfer"
                    ? "Registered Mobile Number"
                    : "Account / Ref Number"}
                </label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0911234567"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Protected with 256-bit Ministry of Innovation & Tech encryption</span>
              </div>
            </div>

            <DialogFooter className="mt-5 gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handlePay}
                disabled={isProcessing}
                className="bg-[#00450d] hover:bg-[#1b5e20] min-w-[130px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <span>Confirm & Pay</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          /* Payment Success View */
          <div className="py-3 text-center space-y-3.5 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Payment Successful</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Transaction Ref: <span className="font-mono font-medium text-slate-900">{generatedReceipt?.transactionRef}</span>
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg text-left text-xs space-y-1.5 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Paid Amount:</span>
                <span className="font-semibold text-slate-900">ETB {invoice.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-medium text-slate-900">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient:</span>
                <span className="font-medium text-slate-900">GRAMS Municipal Treasury</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded text-[10px]">
                  VERIFIED & CLEARED
                </span>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
              <Button
                variant="default"
                className="w-full bg-[#00450d] hover:bg-[#1b5e20]"
                onClick={handleClose}
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
