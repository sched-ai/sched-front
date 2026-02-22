import { Pencil } from "lucide-react";

interface ClinicHeaderProps {
  name?: string;
  category?: string;
  cnpj?: string;
  area?: string;
  photoUrl?: string;
}

export const ClinicHeader = ({
  name = "Clínica Bem Estar",
  category = "Empresa",
  cnpj = "45.646.498/0001-00",
  area = "Odontologia",
  photoUrl,
}: ClinicHeaderProps) => {
  return (
    <div className="flex items-center gap-6 py-4">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-[#121535] flex items-center justify-center">
            <span className="text-white text-3xl font-semibold">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-[#121535] text-xl font-semibold">{name}</h2>
          <button
            className="text-gray-400 hover:text-[#121535] transition-colors cursor-pointer"
            aria-label="Editar nome da clínica"
          >
            <Pencil size={15} />
          </button>
        </div>
        <p className="text-gray-500 text-sm">
          Categoria: {category}&nbsp;&nbsp;|&nbsp;&nbsp;CNPJ {cnpj}&nbsp;&nbsp;|&nbsp;&nbsp;Área: {area}
        </p>
      </div>
    </div>
  );
};
