import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { capitalizeFirst } from "@/util/helper";
import { CalendarDays, Clock, Layers, Pencil, Trash2, MapPin, X } from "lucide-react";
import { useEffect, useRef } from "react";

interface Details {
  title: string;
  localDateTime?: Date | null;
  start?: string;
  end?: string;
  services?: string[];
  workplaceName?: string;
  type?: 'consulta' | 'bloqueio';
}

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  details: Details | null;
  position?: { top: number; left: number } | null;
}

export const ScheduleViewModal = ({
  isOpen,
  onClose,
  details,
  onEdit,
  onDelete,
  position
}: IProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
  }, [isOpen, onClose]);

  if (!details || !isOpen || !position) return null;

  const formattedDate = details.localDateTime
    ? details.localDateTime.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "Data não informada";

  const formattedYear = details.localDateTime?.getFullYear();
  const isBlock = details.type === 'bloqueio';

  return (
    <div 
        ref={ref}
        className="fixed z-50 w-[400px] bg-[#121535] border border-slate-700 text-slate-100 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col"
        style={{ top: position.top, left: position.left }}
    >
      <div className="p-6 pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-white pr-4 leading-none">
                {capitalizeFirst(details.title)}
              </h2>
              <p className="text-slate-400 text-sm">
                {isBlock ? "Detalhes do bloqueio" : "Detalhes da consulta"}
              </p>
            </div>

            <div className="flex items-center gap-1 -mt-1 ml-auto">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onEdit}
                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                title="Editar"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onDelete}
                className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
      </div>

        <div className="p-6 pt-2 space-y-6">
          
          <div className="bg-[#1a1e45] rounded-xl p-4 flex flex-col gap-3 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 p-2 rounded-full">
                <CalendarDays className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200 capitalize">
                  {formattedDate}
                </p>
                <p className="text-xs text-slate-400">{formattedYear}</p>
              </div>
            </div>

            <Separator className="bg-slate-700/50" />

            {details.start && details.end && (
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/10 p-2 rounded-full">
                  <Clock className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {details.start} - {details.end}
                  </p>
                  <p className="text-xs text-slate-400">Horário previsto</p>
                </div>
              </div>
            )}

            {details.workplaceName && (
              <>
                <Separator className="bg-slate-700/50" />
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/10 p-2 rounded-full">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {details.workplaceName  }
                    </p>
                    <p className="text-xs text-slate-400">Local de atendimento</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {details.type === 'consulta' && (
            <div className="space-y-3 pb-4">
              <div className="flex items-center gap-2 text-slate-300">
                <Layers className="w-4 h-4" />
                <h4 className="text-sm font-semibold uppercase tracking-wider">
                  Serviços
                </h4>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {details.services && details.services.length > 0 ? (
                  details.services.map((service, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary" 
                      className="bg-slate-700/50 hover:bg-slate-700 text-slate-200 px-3 py-1 text-sm font-normal border-transparent"
                    >
                      {service}
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
  );
};