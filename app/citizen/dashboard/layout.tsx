import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { CitizenSidebarWrapper } from "./sidebar-wrapper"
import CitizenHeader from "@/components/citizen-header"

export default function CitizenDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <CitizenSidebarWrapper />
      <SidebarInset>
        <CitizenHeader />

        <main className="flex-1">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
