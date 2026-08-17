"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Property } from "@/types/index";
import { Calendar, CheckCircle2 } from "lucide-react";

interface BookVisitModalProps {
  open: boolean;
  onClose: () => void;
  property: Property | null;
  onBookSuccess: (visitDetails: { date: string; time: string; name: string }) => void;
}

export const BookVisitModal: React.FC<BookVisitModalProps> = ({
  open,
  onClose,
  property,
  onBookSuccess,
}) => {
  const [date, setDate] = useState("2024-10-05");
  const [time, setTime] = useState("10:00 AM");
  const [name, setName] = useState("Dagmawit Mesfin");
  const [phone, setPhone] = useState("+251 91 123 4567");
  const [notes, setNotes] = useState("Would like to inspect the backup generator and parking spot.");
  const [isDone, setIsDone] = useState(false);

  if (!property) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDone(true);
    setTimeout(() => {
      onBookSuccess({ date, time, name });
      setIsDone(false);
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-slate-900 mb-1">
            <Calendar className="w-4 h-4 text-slate-500" />
            <DialogTitle>Schedule Property Inspection</DialogTitle>
          </div>
          <DialogDescription>
            Book an on-site visit for <span className="font-semibold text-slate-900">{property.title}</span>.
          </DialogDescription>
        </DialogHeader>

        {isDone ? (
          <div className="py-5 text-center space-y-2.5 animate-in fade-in">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Visit Requested</h4>
            <p className="text-xs text-slate-500">
              A verification SMS and inspection pass have been dispatched to your phone.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Preferred Date
                </label>
                <Input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Time Slot
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full h-8.5 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="09:00 AM">09:00 AM - Morning</option>
                  <option value="10:00 AM">10:00 AM - Morning</option>
                  <option value="02:00 PM">02:00 PM - Afternoon</option>
                  <option value="04:30 PM">04:30 PM - Late Afternoon</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                Contact Phone
              </label>
              <Input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                Additional Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-1">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="default" className="bg-[#00450d] hover:bg-[#1b5e20]">
                Confirm Booking
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
