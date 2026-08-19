"use client";

import React from "react";
import { ArrowRight, LogIn, UserPlus, LayoutDashboard, ShieldCheck } from "lucide-react";

interface NavbarProps {
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
  onOpenDashboard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLogin,
  onOpenRegister,
  onOpenDashboard,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 px-4 sm:px-8 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Identity: Matches Image 1 */}
        <div 
          onClick={onOpenDashboard}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#007a3d] text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform border border-emerald-400/30">
            ET
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg tracking-wider text-white leading-tight drop-shadow-sm group-hover:text-emerald-300 transition-colors">
              GRAMS
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-400 tracking-widest uppercase -mt-0.5">
              CITIZEN PORTAL
            </span>
          </div>
        </div>

        {/* Right Navigation CTAs */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {onOpenDashboard && (
            <button
              onClick={onOpenDashboard}
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 text-xs sm:text-sm font-medium transition-all"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Dashboard</span>
            </button>
          )}

          <button
            onClick={onOpenLogin}
            className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-black/40 hover:bg-white/15 text-white font-medium text-xs sm:text-sm backdrop-blur-md border border-white/20 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <LogIn className="w-3.5 h-3.5 opacity-80" />
            <span>Sign In</span>
          </button>

          <button
            onClick={onOpenRegister}
            className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-[#007a3d] hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/60 hover:-translate-y-0.5 transition-all duration-200 border border-emerald-400/30"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
