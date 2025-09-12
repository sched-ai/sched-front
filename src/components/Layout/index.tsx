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
        <main className="w-full ml-66">
          {children}
        </main>
      </SidebarProvider>
    </div>
  )
}
