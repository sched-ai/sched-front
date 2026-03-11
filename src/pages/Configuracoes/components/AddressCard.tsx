import { MapPin, Globe, Home } from "lucide-react";

type DayKey = "Dom" | "Seg" | "Ter" | "Qua" | "Qui" | "Sex" | "Sáb";

interface DaySchedule {
  active: boolean;
  hours: string; // e.g. "09h–20h"
}

interface AddressCardProps {
  locationName: string;
  nickname?: string;
  street: string;
  neighborhood?: string;
  complement: string;
  rooms: number;
  city: string;
  state: string;
  schedule: Record<DayKey, DaySchedule>;
  online?: boolean;
  homeVisit?: boolean;
  onEdit?: () => void;
}

const DAY_LABELS: DayKey[] = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const AddressCard = ({
  locationName,
  nickname,
  street,
  neighborhood,
  complement,
  rooms,
  city,
  state,
  schedule,
  online = false,
  homeVisit = false,
  onEdit,
}: AddressCardProps) => {
  const isOnline = nickname?.toLowerCase() === "online";
  onEdit
  return (
    <div className="flex flex-col md:flex-row gap-6 py-5 border-b border-[#DADCE0] last:border-0">
      {/* Left: location info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          {isOnline ? (
            <Globe size={16} className="text-[#0177FB] flex-shrink-0" />
          ) : (
            <MapPin size={16} className="text-[#121535] flex-shrink-0" />
          )}
          <span className="text-[#121535] font-semibold text-sm">
            {isOnline ? "Atendimento Online" : locationName}
          </span>
          {/* <button
            onClick={onEdit}
            className="text-gray-400 hover:text-[#121535] transition-colors cursor-pointer"
            aria-label={`Editar ${locationName}`}
          >
            <Pencil size={13} />
          </button> */}
        </div>
        {isOnline ? (
          <div className="text-gray-500 text-sm pl-6">
            <p>Consultas realizadas por vídeo ou chamada remota.</p>
          </div>
        ) : (
          <div className="text-gray-500 text-sm space-y-0.5 pl-6">
            <p>Rua: {street}</p>
            {neighborhood && <p>Bairro: {neighborhood}</p>}
            <p>Complemento: {complement}</p>
            <p>Número de salas: {rooms}</p>
            <p>Cidade: {city} | Estado: {state}</p>
          </div>
        )}
      </div>

      {/* Center: days / hours */}
      <div className="flex-[1.5] min-w-0">
        <p className="text-sm font-medium text-[#121535] mb-3">
          Dias / Horários de Atendimento:
        </p>
        <div className="flex flex-wrap gap-2">
          {DAY_LABELS.map((day) => {
            const info = schedule[day];
            const active = info?.active ?? false;
            return (
              <div
                key={day}
                className={`flex flex-col items-center justify-center rounded-md border text-xs font-medium px-2.5 py-1.5 min-w-[42px] transition-all ${
                  active
                    ? "bg-[#121535] text-white border-[#121535]"
                    : "bg-white text-[#6b7280] border-[#DADCE0]"
                }`}
              >
                <span>{day}</span>
                {active && info?.hours && (
                  <span className="text-[10px] font-normal mt-0.5 text-blue-200">
                    {info.hours}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: service type */}
      <div className="flex flex-col justify-center gap-2 min-w-[120px]">
        {online && (
          <div className="flex items-center gap-2 text-sm text-[#121535]">
            <Globe size={15} className="text-[#0177FB]" />
            <span>Online</span>
          </div>
        )}
        {homeVisit && (
          <div className="flex items-center gap-2 text-sm text-[#121535]">
            <Home size={15} className="text-[#121535]" />
            <span>A domicílio</span>
          </div>
        )}
      </div>
    </div>
  );
};
