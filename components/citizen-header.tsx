"use client"

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Settings, User } from "lucide-react";
import { getSession, clearSession } from "@/lib/api";
import { useRouter } from "next/navigation";
import { UserSummary } from "@/lib/api";

export default function CitizenHeader() {
  const router = useRouter();
  const [user, setUser] = useState<UserSummary | null>(null);

  useEffect(() => {
    const session = getSession()
    if (!session) { router.push("/citizen/login"); return }
    if (session.user.userType !== "CITIZEN") { router.push("/citizen/login"); return }
    setUser(session.user)
  }, [router])

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "?"

  function handleLogout() {
    clearSession()
    router.push("/citizen")
  }

  return (
    <header className="flex h-14 items-center gap-3 border-b border-gray-100 bg-white px-4 w-full">
      
      {/* Page title area — left side */}
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-700">
          Welcome, {user?.firstName ?? "Citizen"} 
        </p>
      </div>

      {/* Right side — user avatar */}
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarFallback className="bg-green-600 text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-800 leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-gray-400 leading-tight">Citizen</p>
            </div>
          </button>
        } />
        <DropdownMenuContent align="end" className="w-44">
          
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-semibold text-sm">
              {user?.firstName} {user?.lastName}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
