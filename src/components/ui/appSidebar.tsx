import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "../../components/ui/sidebar";
import backgroundImage from "../../assets/abstract_sidebar.png";
import { NavItem } from "../NavItem";
import { CalendarFold, NotepadText } from "lucide-react";

export function AppSidebar() {
  return (
  <Sidebar collapsible="none" className="!max-w-[260px] md:w-[260px] w-auto" >
      <div
        className="absolute inset-0 bg-cover bg-center !max-w-[260px] md:w-[260px] w-auto"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 backdrop-blur-2xl !max-w-[260px] md:w-[260px] w-auto" />
      <div className="absolute inset-0 bg-black opacity-45 !max-w-[260px] md:w-[260px] w-auto" />
      <div className="relative z-10">
        <SidebarHeader>
          <h1 className="text-4xl font-semibold text-white italic p-4">
            SCHED
          </h1>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="p-2">
						<p className="font-semibold text-white px-4 pt-2">Bem Vindo!</p>
						<p className="font-medium text-[#A5B4CB] px-4">Fulano</p>
					</SidebarGroup>
          <SidebarGroup title="Navegação" className="p-0 gap-2">
            <NavItem title="Página Inicial" icon={<CalendarFold />} href="/home" />
						<NavItem title="Atendimentos" icon={<NotepadText />} href="/atendimentos" />
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
      </div>
    </Sidebar>
  );
}
