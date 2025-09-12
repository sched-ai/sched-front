import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

export const NavItem = ({ title, icon, href }: { title: string; icon: ReactNode; href: string }) => {
  const location = useLocation();
  const isActive = location.pathname === href;
  const navigate = useNavigate();
  return (
    <Button
      variant="ghost"
      onClick={() => {
        navigate(href);
      }}
      className={`flex items-center font-medium gap-3 p-3 border-l-4 rounded-none text-[16px] justify-start hover:text-white border-transparent cursor-pointer hover:bg-[#0177FB]/10 ${!isActive ? "text-[#fff]" : "text-[#0177FB] border-l-[#0177FB]"}`}
    >
      {icon}
      <span>{title}</span>
    </Button>
  );
}