import { type ReactNode } from "react"
import { AppSidebar } from "../ui/appSidebar"
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar"

interface LayoutProps {
  children: ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
      <SidebarProvider>
        <div className="lg:hidden fixed left-4 top-4 z-50">
          <SidebarTrigger className="h-11 w-11 rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg hover:bg-slate-50" />
        </div>
        <AppSidebar />
        <main className="relative flex-1 min-w-0 md:ml-1 pt-14 lg:pt-0">
          {children}
        </main>
      </SidebarProvider>
    </div>
  )
}
