import { useLocation, useNavigate } from "react-router-dom";
import type { ComponentType } from "react";
import { useSidebar } from "../ui/sidebar";

interface NavItemProps {
  title: string;
  icon: ComponentType<{ size?: number }>;
  href: string;
  isSidebarOpen?: boolean;
  iconSize?: number;
}

export const NavItem = ({
  title,
  icon: Icon,
  href,
  isSidebarOpen,
  iconSize,
}: NavItemProps) => {
  const location = useLocation();
  const isActive = href === "/" 
    ? location.pathname === "/" 
    : location.pathname.startsWith(href);
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <div
      onClick={() => {
        navigate(href);
        if (isMobile) {
          setOpenMobile(false);
        }
      }}
      className={`flex items-center font-medium gap-3 p-3 border-l-4 rounded-none justify-start hover:text-white border-transparent cursor-pointer hover:bg-[#0177FB]/10 pl-6 ${
        !isActive ? "text-[#fff]" : "text-[#0177FB] border-l-[#0177FB]"
      }`}
    >
      <Icon size={iconSize || 20} />
      {isSidebarOpen && <span className="truncate">{title}</span>}
    </div>
  );
};
