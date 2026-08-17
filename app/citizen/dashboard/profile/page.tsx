"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  User,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Star,
  Save
} from "lucide-react";

export const ProfilePage: React.FC = () => {
  const [fullName, setFullName] = useState("Dagmawit Mesfin");
  const [nationalId, setNationalId] = useState("ET-NID-00892418");
  const [tinNumber, setTinNumber] = useState("ET-TIN-00892418");
  const [email, setEmail] = useState("dagmawit.mesfin@moud.gov.et");
  const [phone, setPhone] = useState("+251 91 123 4567");
  const [subCity, setSubCity] = useState("Bole Sub City, Woreda 03");
  const [telebirrAccount, setTelebirrAccount] = useState("0911234567");
  const [cbeAccount, setCbeAccount] = useState("1000293847192");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/60">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Citizen Profile & Credentials
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your verified Ethiopian citizen digital ID, municipal ties, and payment channels.
        </p>
      </div>

      {/* Citizen ID Card Banner */}
      <div className="bg-slate-900 rounded-xl p-5 sm:p-6 text-white shadow-clean relative overflow-hidden">
        <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
          <Star className="w-44 h-44 fill-current text-white" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOeGxWiEl2NeKDuJV16b8MGWdq1uN--G_FLPzSrdoJLC5VPsEwf_UhVCtt6qeecVysb57w5n6kvUYdE4n8hL_RHukdIM8E8aI39k6ODc74SpAm4BJOZanJy-4qNGJ6cZjX3dotzJEwv-uYJ6VzGv-H1k_JS3TR8W2YujNBsMi1W6HFeDVP8NzopWHOfi_FUDcNA5TqKqXOSAEid3CvgiOAcESPWIFcTF_kbnrbXgnhIH1-Z7h5oTKMaQ"
              alt="Dagmawit Mesfin"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border-2 border-white/20 shadow-sm"
            />
            <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-2.5 h-2.5" />
              VERIFIED
            </span>
          </div>

          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="text-xl font-bold text-white tracking-tight">{fullName}</h3>
              <Badge className="bg-white/10 text-white border-white/20 font-medium text-[10px] self-center sm:self-auto">
                Government Official & Citizen
              </Badge>
            </div>
            <p className="text-xs text-slate-300">
              Ministry of Urban Development & Housing • Addis Ababa Administration
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1.5 text-xs text-slate-300">
              <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-[11px] border border-white/10">
                Fayda NID: {nationalId}
              </span>
              <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-[11px] border border-white/10">
                TIN: {tinNumber}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-5">
        <Card className="bg-white border-slate-200 shadow-clean">
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              Personal & Municipal Registration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Full Legal Name
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Official Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Mobile Number (SMS Alert Enabled)
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Registered Residence (Sub-City / Woreda)
                </label>
                <Input
                  value={subCity}
                  onChange={(e) => setSubCity(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Linked Payment Accounts */}
        <Card className="bg-white border-slate-200 shadow-clean">
          <CardHeader className="p-4 sm:p-5 pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-500" />
              Linked Payment Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Telebirr Linked Mobile
                </label>
                <Input
                  value={telebirrAccount}
                  onChange={(e) => setTelebirrAccount(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Commercial Bank of Ethiopia (CBE) Account
                </label>
                <Input
                  value={cbeAccount}
                  onChange={(e) => setCbeAccount(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button & Confirmation */}
        <div className="flex items-center justify-between pt-1">
          {isSaved ? (
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-lg animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Profile updated and synchronized with National Registry!
            </div>
          ) : (
            <div />
          )}

          <Button
            type="submit"
            className="bg-[#00450d] hover:bg-[#1b5e20] text-white font-medium gap-2 px-5 h-9 rounded-lg text-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
