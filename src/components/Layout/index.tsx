import { type ReactNode } from "react"
import { AppSidebar } from "../ui/appSidebar"
import { SidebarProvider } from "../ui/sidebar"

interface LayoutProps {
  children: ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <main className="relative flex-1 min-w-0 md:ml-1">
          {children}
        </main>
      </SidebarProvider>
    </div>
  )
}
