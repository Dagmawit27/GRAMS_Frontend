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
    <nav className="w-full fixed top-0 left-0 z-50 bg-black/40 backdrop-blur-sm border-b border-white/10 py-2">
      <div className="max-w-6xl mx-auto px-4 py-1 flex items-center justify-between">
        {/* Logo */}
        <Link href="/citizen" className="text-green-400 text-lg font-semibold tracking-widest uppercase drop-shadow">
          Rental System
        </Link>

        {/* Right side */}
        {username ? (
          <div className="flex items-center gap-4">
            {/* Profile avatar + username */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold uppercase">
                {username.charAt(0)}
              </div>
              <span className="text-sm font-semibold text-white">{username}</span>
            </div>
            <Button 
              onClick={handleLogout}
              variant="destructive"
              >
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            {/*<Link
              href="/login"
              className="px-6 py-2 text-sm font-bold text-green-500 border-2 border-green-500 rounded tracking-widest uppercase hover:bg-green-50 transition-colors"
            >
              Login
            </Link> */}

            <Button 
              variant="default"
              className="px-8 py-5 text-lg"
              >
              <Link
                href="/citizen/register"
              >
                Signup
              </Link>
            </Button>
            
            
            <Button 
              
              variant="outline"
              className="px-8 py-5 text-lg cursor-pointer"
              >
                <Link href="/citizen/login">
                  Login
                </Link>
              
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
