"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Lock, Smartphone, ArrowRight, User, AlertCircle } from "lucide-react";
import { loginCitizen, saveSession } from "@/lib/api";

export const CitizenLoginPage: React.FC = () => {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<"fayda" | "phone">("fayda");
  const [faydaId, setFaydaId] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const loginIdentifier = authMethod === "fayda" ? faydaId.trim() : phone.trim();

    try {
      const result = await loginCitizen({ loginIdentifier, password });
      saveSession(result);
      router.push("/citizen/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-md space-y-6">
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => { setAuthMethod("fayda"); setError(""); }}
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
                onClick={() => { setAuthMethod("phone"); setError(""); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  authMethod === "phone"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Phone & Password
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="pl-9 h-10 text-xs"
                        required
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
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

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                256-bit GovSec Encrypted
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CitizenLoginPage;
