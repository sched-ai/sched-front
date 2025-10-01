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
import { CalendarFold, LogOutIcon, NotepadText } from "lucide-react";
import logoFull from "@/assets/logoFull.png"
import logo from "@/assets/logo.png"
import { logout } from "@/services/storage";
import { useNavigate } from "react-router-dom";

export function AppSidebar() {
	const { state } = useSidebar();
	const isSidebarOpen = state === "expanded";
	const sidebarLogo = isSidebarOpen ? logoFull : logo;
  const navigate = useNavigate()

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
						(isSidebarOpen ? "p-4 px-8 text-4xl" : "text-start p-5")
					}
				>
					<img src={sidebarLogo}/>
				</SidebarHeader>
				<SidebarContent className="flex flex-col justify-between h-full">
					<div>
						<SidebarGroup title="Agenda" className="p-0 pt-20 gap-2">
							<NavItem
								title="Agenda"
								icon={CalendarFold}
								iconSize={isSidebarOpen ? 24 : 28}
								href="/"
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
					</div>
					<SidebarGroup title="Logout" className="p-0 gap-2">
						<button className="flex items-center font-medium gap-3 text-red-500 p-3 border-l-4 rounded-none justify-start hover:text-white border-transparent cursor-pointer hover:bg-[#0177FB]/10 pl-6" 
            onClick={() => {
							logout()
              navigate('/signin')
              }}><LogOutIcon/>Sair</button>
					</SidebarGroup>
				</SidebarContent>
				<SidebarFooter />
			</div>
		</Sidebar>
	);
}
