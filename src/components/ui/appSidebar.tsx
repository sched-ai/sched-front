import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
} from "../../components/ui/sidebar"
import backgroundImage from "../../assets/abstract_sidebar.png"

export function AppSidebar() {
	return (
		<Sidebar
		>
			<div 
				className="absolute inset-0 bg-cover bg-center" 
				style={{ backgroundImage: `url(${backgroundImage})` }}
			/>
			<div className="absolute inset-0 backdrop-blur-2xl" />
			<div className="absolute inset-0 bg-black opacity-45" />
			<div className="relative z-10">
				<SidebarHeader>
					<h1 className="text-4xl font-semibold text-white italic p-4">
						SCHED
					</h1>
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup />
					<SidebarGroup />
				</SidebarContent>
				<SidebarFooter />
			</div>
		</Sidebar>
	)
}
