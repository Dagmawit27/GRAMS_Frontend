"use client";
import React, { useState } from "react";
import { useCitizenData } from "@/hooks/useCitizenData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Lock, Smartphone, ArrowRight, User } from "lucide-react";

export const CitizenLoginPage: React.FC = () => {
  const { handleNavigate } = useCitizenData();
  const [authMethod, setAuthMethod] = useState<"fayda" | "phone">("fayda");
  const [faydaId, setFaydaId] = useState("ET-NID-00892418");
  const [phone, setPhone] = useState("+251 91 123 4567");
  const [otp, setOtp] = useState("582914");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      handleNavigate("dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base mx-auto">
            G
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            GRAMS Citizen Login
          </h2>
          <p className="text-xs text-slate-500">
            Sign in with National Fayda Digital ID or Verified Phone
          </p>
        </div>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setAuthMethod("fayda")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  authMethod === "fayda"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Fayda Digital ID
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("phone")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  authMethod === "phone"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Phone & OTP
              </button>
            </div>
          </CardHeader>

          <CardContent className="pt-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {authMethod === "fayda" ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Fayda National ID / FIN
                    </label>
                    <div className="relative">
                      <Input
                        value={faydaId}
                        onChange={(e) => setFaydaId(e.target.value)}
                        placeholder="e.g. ET-NID-12345678"
                        className="pl-9 h-10 text-xs font-mono"
                        required
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Security PIN / Password
                    </label>
                    <div className="relative">
                      <Input
                        type="password"
                        defaultValue="••••••••"
                        placeholder="Enter password"
                        className="pl-9 h-10 text-xs"
                        required
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Registered Mobile Number
                    </label>
                    <div className="relative">
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+251 91 123 4567"
                        className="pl-9 h-10 text-xs font-mono"
                        required
                      />
                      <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      6-Digit SMS Verification Code
                    </label>
                    <Input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="000000"
                      className="h-10 text-xs font-mono text-center tracking-widest text-base"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#00450d] hover:bg-[#1b5e20] text-white h-10 text-xs font-semibold rounded-lg mt-2"
              >
                {isLoading ? "Authenticating..." : "Sign In to Citizen Portal"}
                <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                256-bit GovSec Encrypted
              </span>
              <button
                type="button"
                onClick={() => handleNavigate("dashboard")}
                className="text-slate-700 font-semibold hover:underline"
              >
                Quick Preview
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CitizenLoginPage;
