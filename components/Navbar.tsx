"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function Navbar() {
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const user = localStorage.getItem("username");
    if (token && user) setUsername(user);
  }, []);

  function handleLogout() {
    localStorage.removeItem("jwt");
    localStorage.removeItem("username");
    setUsername(null);
    router.push("/");
  }

  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10 py-3">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/citizen" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-sm group-hover:bg-emerald-500/30 transition">
            🇪🇹
          </div>
          <div className="flex flex-col">
            <span className="text-white text-base font-bold tracking-wider uppercase drop-shadow leading-tight">
              GRAMS
            </span>
            <span className="text-[10px] text-emerald-400 font-medium tracking-widest uppercase">
              Citizen Portal
            </span>
          </div>
        </Link>

        {/* Right side */}
        {username ? (
          <div className="flex items-center gap-3">
            {/* Profile avatar + username */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1.5 rounded-full">
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold uppercase shadow">
                {username.charAt(0)}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-white">{username}</span>
            </div>
            <Link
              href="/citizen/dashboard"
              className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition"
            >
              Dashboard
            </Link>
            <Button 
              onClick={handleLogout}
              variant="destructive"
              size="sm"
            >
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/citizen/login"
              className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg border border-white/20 transition backdrop-blur-sm"
            >
              Sign In
            </Link>
            <Link
              href="/citizen/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-lg shadow-emerald-900/30 transition"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
