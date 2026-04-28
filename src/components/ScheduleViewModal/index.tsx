import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { capitalizeFirst } from "@/util/helper";
import { BotMessageSquare, CalendarDays, Clock, Layers, Pencil, Trash2, MapPin, X, Loader2, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { EventType } from "../WeeklyCalendar";
import { DeleteConfirmationModal } from "../DeleteConfirmationModal";
import { useGetService } from "@/hooks/api/useGetService";

interface Details {
  title: string;
  localDateTime?: Date | null;
  start?: string;
  end?: string;
  services?: string[];
  serviceId?: string;
  workplaceName?: string;
  professionalName?: string;
  type?: 'consulta' | 'bloqueio';
}

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  details: Details | null;
  position?: { top: number; left: number } | null;
  selectedEvent: EventType | null; 
}

export const ScheduleViewModal = ({
  isOpen,
  onClose,
  details,
  onEdit,
  position,
  selectedEvent
}: IProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const hasServiceFallback = Boolean(details?.services && details.services.length > 0);

  const { data: service, isLoading: isLoadingService } = useGetService(
    details?.serviceId ?? "",
    isOpen && !!details?.serviceId && !hasServiceFallback
  );

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };
  
  const handleSuccessDelete = () => {
      setIsDeleteModalOpen(false);
      onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDeleteModalOpen) return;
      
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      setTimeout(() => document.addEventListener("mousedown", handleClickOutside), 0);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, isDeleteModalOpen]);

  if (!details || !isOpen || !position) return null;

  const formattedDate = details.localDateTime
    ? details.localDateTime.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "Data não informada";

  const isBlock = details.type === 'bloqueio';

  return (
    <>
      <div 
          ref={ref}
          className="fixed z-50 w-[400px] bg-white border border-slate-200 text-slate-900 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col"
          style={{ top: position.top, left: position.left }}
      >
        <div className="p-6 pb-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 pr-4 leading-none truncate max-w-[250px]">
                      {capitalizeFirst(details.title)}
                    </h2>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-800 border-slate-700 text-slate-100 max-w-[300px] break-words">
                    <p>{capitalizeFirst(details.title)}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center gap-1 -mt-1 ml-auto">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onEdit}
                  className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleDeleteClick}
                  className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
        </div>

        <div className="flex items-center px-6 gap-2 w-full justify-between">
          <p className="text-slate-500 text-sm">
            {isBlock ? "Detalhes do bloqueio" : "Detalhes"}
          </p>
          {selectedEvent?.createdByAI && details.type === "consulta" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[11px] font-medium text-cyan-700">
              <BotMessageSquare className="h-3 w-3" />
              Criado por IA
            </span>
          )}
        </div>
        
        <div className="p-6 pt-2 space-y-6">
          <div className="bg-slate-50 rounded-xl p-3 flex flex-col gap-2 border border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-y-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-slate-700 capitalize">
                  {details.localDateTime?.toLocaleDateString("pt-BR", { weekday: 'short', day: 'numeric', month: 'long' }) ?? formattedDate}
                </span>
              </div>

              {details.start && details.end && (
                <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-slate-700">
                    {details.start} - {details.end}
                  </span>
                </div>
              )}
            </div>

            {details.workplaceName && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200 mt-1">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-slate-700">
                  {details.workplaceName}
                </span>
              </div>
            )}

            {details.professionalName && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200 mt-1">
                <User className="w-4 h-4 text-indigo-500" />
                <span className="text-sm text-slate-700">
                  {details.professionalName}
                </span>
              </div>
            )}
          </div>

          {details.type === 'consulta' && (
            <div className="space-y-3 pb-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Layers className="w-4 h-4" />
                <h4 className="text-sm font-semibold uppercase tracking-wider">
                  Serviço
                </h4>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {isLoadingService ? (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Carregando serviço...</span>
                  </div>
                ) : service ? (
                    <Badge 
                      variant="secondary" 
                      className="flex justify-between w-full bg-slate-100 text-slate-700 px-3 py-1 text-sm font-normal border-transparent rounded-md hover:bg-slate-200"
                    >
                      {service.name}
                    </Badge>

                ) : details.services && details.services.length > 0 ? (
                  details.services.map((svc, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary" 
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 text-sm font-normal border-transparent"
                    >
                      {svc}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic">
                    Nenhum serviço especificado.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal} 
        onSuccess={handleSuccessDelete}
        selectedEvent={selectedEvent}
        formattedDate={formattedDate}
      />
    </>
  );
};