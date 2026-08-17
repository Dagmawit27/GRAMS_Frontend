import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowRight, ShieldCheck, FileCheck2, CreditCard, LogIn, UserPlus, Sparkles } from "lucide-react";

export default function CitizenHome() {
  return (
    <div className="relative min-h-screen flex flex-col m-0 p-0 overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0 bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat pointer-events-none transform scale-105 transition-transform duration-1000"
        aria-hidden="true" 
      />
      
      {/* Dark Ambient Gradient Overlay */}
      <div 
        className="fixed inset-0 z-0 bg-gradient-to-b from-black/80 via-black/55 to-black/85 backdrop-blur-[0.5px] pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Navigation */}
      <Navbar />

      {/* Hero Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-white px-4 sm:px-6 pt-24 pb-12">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center space-y-6">
          
          {/* Government Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-emerald-300 text-xs sm:text-sm font-medium tracking-wide">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Federal Democratic Republic of Ethiopia</span>
            <span className="text-white/40">•</span>
            <span className="text-white/80 font-normal">Official Citizen Portal</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.15] text-white drop-shadow-lg text-balance">
            Digital Rental Agreement <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400">
              Management System
            </span>
          </h1>

          {/* Ethiopian Tri-Color Bar */}
          <div className="flex items-center justify-center gap-1.5 py-1">
            <div className="w-8 h-1 rounded-full bg-emerald-500 shadow-sm" />
            <div className="w-8 h-1 rounded-full bg-amber-400 shadow-sm" />
            <div className="w-8 h-1 rounded-full bg-rose-500 shadow-sm" />
          </div>

          {/* Subtitle / Description */}
          <p className="text-base sm:text-lg md:text-xl text-white/85 max-w-2xl font-light leading-relaxed drop-shadow">
            The national digital platform for Ethiopian citizens to register rental properties,
            legally sign lease agreements, and manage secure tenancy payments online.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full sm:w-auto">
            <Link
              href="/citizen/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-base shadow-xl shadow-emerald-950/50 hover:shadow-emerald-900/60 hover:-translate-y-0.5 transition-all duration-200"
            >
              <UserPlus className="w-5 h-5" />
              <span>Create Citizen Account</span>
              <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/citizen/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base backdrop-blur-md border border-white/25 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              <LogIn className="w-5 h-5 opacity-80" />
              <span>Sign In to Portal</span>
            </Link>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-10 w-full text-left">
            <div className="group p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-emerald-400/40 hover:bg-white/15 transition-all duration-300 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 mb-3.5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-white font-semibold text-base mb-1.5">Fayda ID Verified</h2>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                National digital identity verification ensuring fraud-free, authenticated tenancy records.
              </p>
            </div>

            <div className="group p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-emerald-400/40 hover:bg-white/15 transition-all duration-300 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 mb-3.5 group-hover:scale-110 transition-transform">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h2 className="text-white font-semibold text-base mb-1.5">Legally Binding Leases</h2>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                Standardized, compliant rental contracts digitally signed and registered under Ethiopian law.
              </p>
            </div>

            <div className="group p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-emerald-400/40 hover:bg-white/15 transition-all duration-300 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 mb-3.5 group-hover:scale-110 transition-transform">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-white font-semibold text-base mb-1.5">Digital Rent & Invoicing</h2>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                Instant digital receipts, automated monthly billing, and official financial tracking.
              </p>
            </div>
          </div>

          {/* Bottom Security / Official Trust Indicator */}
          <div className="pt-6 text-white/50 text-xs flex flex-wrap items-center justify-center gap-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              256-Bit SSL Encrypted
            </span>
            <span>•</span>
            <span>Ministry of Housing & Urban Development</span>
            <span>•</span>
            <span>National Fayda Integrated</span>
          </div>

        </div>
      </main>
    </div>
  );
}
