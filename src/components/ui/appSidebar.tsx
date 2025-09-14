import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "../../components/ui/sidebar";
import { NavItem } from "../NavItem";
import { CalendarFold, NotepadText } from "lucide-react";
export function AppSidebar() {
  const { state } = useSidebar();
  const isSidebarOpen = state === "expanded";
  const sidebarTitle = isSidebarOpen ? "SCHED.AI" : "SCHED";
  return (
    <Sidebar
      collapsible="icon"
      className="!max-w-[260px] md:w-[260px] w-auto fixed z-50"
    >
      <div className="relative z-10">
        <SidebarTrigger className="absolute top-16 right-0 translate-x-1/2 z-30 shadow-lg bg-[#141736] text-white border border-white" />
        <SidebarHeader
          className={
            "font-semibold text-white italic flex truncate " +
            (isSidebarOpen ? "p-4 text-4xl" : "text-start px-2")
          }
        >
          {sidebarTitle}
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="pt-20">
            <p className={
            "font-semibold text-white truncate mb-2  " +
            (isSidebarOpen ? "text-2xl px-6" : "text-[16px]")
          }>Menu</p>
          </SidebarGroup>
          <SidebarGroup title="Agenda" className="p-0 gap-2">
            <NavItem
              title="Página Inicial"
              icon={CalendarFold}
              iconSize={isSidebarOpen ? 24 : 28}
              href="/home"
              isSidebarOpen={isSidebarOpen}
            />
          </SidebarGroup>
          <SidebarGroup title="Navegação" className="p-0 gap-2">
            <NavItem
              title="Atendimentos"
              icon={NotepadText}
              iconSize={isSidebarOpen ? 24 : 28}
              href="/atendimentos"
              isSidebarOpen={isSidebarOpen}
            />
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
      </div>
    </Sidebar>
  );
}
