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
import { BriefcaseBusiness, CalendarFold, LogOut, NotepadText, Users, Settings, BotMessageSquare } from "lucide-react";
import logo from "@/assets/logo.png";
import { logout } from "@/services/storage";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/user";

export function AppSidebar() {
  const { state } = useSidebar();
  const isSidebarOpen = state === "expanded";
  const navigate = useNavigate();
  const { userData, userLoading } = useUser();

  return (
    <Sidebar
      collapsible="icon"
      className="!max-w-[260px] md:w-[260px] w-auto fixed z-50"
    >
      <div className="relative z-10 h-full flex flex-col">
        <SidebarTrigger className="absolute top-16 right-0 translate-x-1/2 z-30 shadow-lg bg-[#141736] text-white border border-white" />
        <SidebarHeader
          className={
            "flex items-center transition-all duration-300 " +
            (isSidebarOpen ? "justify-center py-6" : "justify-center py-4")
          }
        > 
          <img 
            src={logo} 
            className={`transition-all duration-300 ${isSidebarOpen ? "w-14" : "w-12"}`}
          />
        </SidebarHeader>
        <SidebarContent className="flex flex-col justify-between scrollbar-none">
          <div>
            <SidebarGroup>
              {userLoading ? (
                <div className="px-4 pt-6 space-y-2">
                  <div className="h-4 bg-gray-600 rounded w-3/4 animate-pulse"></div>
                  <div className="h-5 bg-gray-500 rounded w-1/2 animate-pulse"></div>
                </div>
              ) : (isSidebarOpen) && (
                <div className="mx-4 mt-6 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-inner group transition-all duration-300 hover:bg-white/10">
                  <p className='text-blue-100/70 text-xs font-medium mb-1 uppercase tracking-wider'>Bem vindo(a)</p>
                  <p className="text-white text-xl font-bold truncate tracking-wide text-shadow-sm">{userData?.name?.trim().split(/\s+/)[0]}</p>
                </div>
              )}
            </SidebarGroup>
            <SidebarGroup title="Agenda" className="p-0 pt-10 gap-2">
              <NavItem
                title="Agenda"
                icon={CalendarFold}
                iconSize={isSidebarOpen ? 24 : 28}
                href="/"
                isSidebarOpen={isSidebarOpen}
              />
            </SidebarGroup>
             <SidebarGroup title="Inteligência Sched" className="p-0 gap-2">
              <NavItem
                title="Sched AI"
                icon={BotMessageSquare}
                iconSize={isSidebarOpen ? 24 : 28}
                href="/sched-ai"
                isSidebarOpen={isSidebarOpen}
              />
            </SidebarGroup>
            <SidebarGroup title="Atendimentos" className="p-0">
              <NavItem
                title="Atendimentos"
                icon={NotepadText}
                iconSize={isSidebarOpen ? 24 : 28}
                href="/appointment"
                isSidebarOpen={isSidebarOpen}
              />
            </SidebarGroup>
            <SidebarGroup title="Pacientes" className="p-0">
              <NavItem
                title="Pacientes"
                icon={Users}
                iconSize={isSidebarOpen ? 24 : 28}
                href="/patients"
                isSidebarOpen={isSidebarOpen}
                />
            </SidebarGroup>
            <SidebarGroup title="Serviços" className="p-0 gap-2">
              <NavItem
                title="Serviços"
                icon={BriefcaseBusiness}
                iconSize={isSidebarOpen ? 24 : 28}
                href="/services"
                isSidebarOpen={isSidebarOpen}
              />
            </SidebarGroup>
            <SidebarGroup title="Configurações" className="p-0 gap-2">
              <NavItem
                title="Configurações"
                icon={Settings}
                iconSize={isSidebarOpen ? 24 : 28}
                href="/settings"
                isSidebarOpen={isSidebarOpen}
              />
            </SidebarGroup>
          </div>
        </SidebarContent>
        <SidebarFooter className="p-2">
          <button
            className="flex items-center font-medium gap-3 text-red-500 p-3 border-l-4 rounded-none justify-start hover:text-white border-transparent cursor-pointer hover:bg-[#0177FB]/10 pl-6"
            onClick={() => {
              logout();
              navigate("/signin");
            }}
          >
            <LogOut />
            <span className={`${isSidebarOpen ? "" : "hidden"}`}>Sair</span>
          </button>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
