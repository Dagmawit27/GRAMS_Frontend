"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Building2,
  CreditCard,
  UserCircle,
  Search,
  LogOut,
  Receipt
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"


const navListNavigation = [
  { title: "Dashboard", url: "/citizen/dashboard", icon: LayoutDashboard },
  { title: "Search House", url: "/citizen/dashboard/search", icon: Search },
]

const navListAccount = [
  { title: "My Profile", url: "/citizen/dashboard/profile", icon: UserCircle },
]

const navListPayments = [
  { title: "Payments", url: "/citizen/dashboard/payments", icon: CreditCard },
  { title: "Bills", url: "/citizen/dashboard/bills", icon: Receipt },
]
const navListManagement = [
  { title: "Rental Agreements", url: "/citizen/dashboard/agreements", icon: FileText },
  { title: "Properties", url: "/citizen/dashboard/properties", icon: Building2 },
]

interface CitizenSidebarProps {
  userName?: string
  onLogout?: () => void
}

export function CitizenSidebar({ userName, onLogout }: CitizenSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar className="[--sidebar-accent:theme(colors.green.100)]" collapsible="icon">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-700 flex items-center justify-center shrink-0 group-data-[collapsible=icon]:hidden">
              <span className="text-white text-base font-bold">★</span>
            </div>

            <div className="group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-bold leading-tight">
                GRAMS
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Citizen Portal
              </p>
            </div>
          </div>
          <div>
            <SidebarTrigger className="-ml-3 text-green-500" />
          </div>
        </div>
        <Separator />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <Separator />
          <SidebarGroupContent>
            <SidebarMenu>
              {navListNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.url.split("?")[0]}
                    render={<Link href={item.url} />}
                  >
                    <item.icon className="h-4 w-4 text-green-500" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <Separator />
          <SidebarGroupContent>
            <SidebarMenu>
              {navListManagement.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.url.split("?")[0]}
                    render={<Link href={item.url} />}
                  >
                    <item.icon className="h-4 w-4 text-green-500" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Payment</SidebarGroupLabel>
          <Separator />
          <SidebarGroupContent>
            <SidebarMenu>
              {navListPayments.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.url.split("?")[0]}
                    render={<Link href={item.url} />}
                  >
                    <item.icon className="h-4 w-4 text-green-500" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <Separator />
          <SidebarGroupContent>
            <SidebarMenu>
              {navListAccount.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.url.split("?")[0]}
                    render={<Link href={item.url} />}
                  >
                    <item.icon className="h-4 w-4 text-green-500" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter className="px-4 py-4">
        <Separator className="mb-3" />

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground truncate max-w-[130px] group-data-[collapsible=icon]:hidden">
            {userName ?? "Citizen"}
          </span>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="group-data-[collapsible=icon]:hidden">
                Logout
              </span>
            </button>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground mt-2 leading-tight group-data-[collapsible=icon]:hidden">
          Ministry of Urban Development
          <br />
          Addis Ababa, Ethiopia
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
