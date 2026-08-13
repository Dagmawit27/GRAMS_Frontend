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
import {
  Avatar,
  AvatarFallback
} from "@/components/ui/avatar";
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
  

  const initials = `${user?.firstName[0]}${user?.lastName[0]}`.toUpperCase() 

  function handleLogout() {
    clearSession()
    router.push("/citizen")
  }

  return (
    <header className="flex h-7 items-center gap-3 border-b px-4 w-full align-middle">
      <div className="ml-auto h-7 w-10 flex items-center rounded-full bg-white-700 px-2 py-2 text-white mr-2">
        <div >        
          <DropdownMenu>
            <DropdownMenuTrigger >
              <Avatar>
                <AvatarFallback className="bg-green-700 text-white ">{initials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                
                <DropdownMenuLabel className="font-semibold">
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
                  className={"bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40"} 
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2"  />
                    Logout
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
      </div>
    </header>
    
  )}