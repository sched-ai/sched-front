import { useLocation, useNavigate } from "react-router-dom";
import type { ComponentType } from "react";

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
  const isActive = location.pathname === href;
  const navigate = useNavigate();
  return (
    <div
      onClick={() => {
        navigate(href);
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
