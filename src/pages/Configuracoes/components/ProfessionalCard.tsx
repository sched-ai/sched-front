import { Pencil } from "lucide-react";

type Role = "Administrador" | "Profissional" | "Assistente" | string;

interface ProfessionalCardProps {
  name: string;
  phone: string;
  email: string;
  role: Role;
  onEdit?: () => void;
}

export const ProfessionalCard = ({
  name,
  phone,
  email,
  role,
  onEdit,
}: ProfessionalCardProps) => {
  return (
    <div className="flex items-start justify-between gap-4 border border-[#DADCE0] rounded-lg p-4 bg-white shadow-sm min-w-[200px] flex-1">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[#121535] font-semibold text-sm truncate">{name}</span>
        <span className="text-gray-500 text-xs truncate">{phone}</span>
        <span className="text-gray-500 text-xs truncate">{email}</span>
        <span className="text-gray-400 text-xs mt-1">{role}</span>
      </div>
      <button
        onClick={onEdit}
        className="text-gray-400 hover:text-[#121535] transition-colors flex-shrink-0 cursor-pointer mt-0.5"
        aria-label={`Editar ${name}`}
      >
        <Pencil size={14} />
      </button>
    </div>
  );
};
