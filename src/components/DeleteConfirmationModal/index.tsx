import { Button } from "@/components/ui/button";
import { capitalizeFirst } from "@/util/helper";
import { CalendarDays, Clock, TriangleAlert } from "lucide-react";
import { useEffect, useRef } from "react";
import { useDeleteAppointment } from "@/hooks/api/useDeleteAppointment";
import { useDeleteTimeBlock } from "@/hooks/api/useDeleteTimeBlock";
import type { EventType } from "../WeeklyCalendar";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedEvent: EventType | null;
  formattedDate: string;
}

export const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onSuccess,
  selectedEvent,
  formattedDate
}: IProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const { mutate: deleteAppointment } = useDeleteAppointment({
    onSuccessFn: onSuccess
  });

  const { mutate: deleteTimeBlock } = useDeleteTimeBlock({
    onSuccessFn: onSuccess
  });

  const confirmDelete = () => {
    if (!selectedEvent) return;
    if (selectedEvent.type === 'consulta') {
       deleteAppointment(String(selectedEvent.id));
    } else if (selectedEvent.type === 'bloqueio') {
       deleteTimeBlock(String(selectedEvent.id));
    }
  };

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

  if (!isOpen || !selectedEvent) return null;

  const isBlock = selectedEvent.type === 'bloqueio';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
          ref={ref}
          className="w-[400px] bg-[#121535] border border-slate-700 text-slate-100 rounded-lg shadow-2xl overflow-hidden flex flex-col p-6 animate-in zoom-in-95 duration-200"
      >
          <div className="flex items-center gap-2 mb-4">
            <TriangleAlert className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-white">{isBlock ? "Confirmar Exclusão" : "Confirmar Cancelamento"}</h2>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-3 mb-4 border border-slate-700/50">
              <h3 className="text-base font-semibold text-white mb-2">{capitalizeFirst(selectedEvent.title)}</h3>
              <div className="flex flex-col gap-1 text-xs text-slate-400">
                  <span className="flex items-center gap-2">
                      <CalendarDays className="w-3.5 h-3.5 text-blue-400" /> {formattedDate}
                  </span>
                  {selectedEvent.start && selectedEvent.end && (
                      <span className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-purple-400" /> {selectedEvent.start} - {selectedEvent.end}
                      </span>
                  )}
              </div>
          </div>

          <p className="text-slate-300 text-sm mb-4 leading-relaxed whitespace-pre-line">
            {isBlock 
              ? "Tem certeza que deseja excluir este bloqueio? \n\nATENÇÃO: Caso este bloqueio seja recorrente, TODAS as ocorrências futuras também serão excluídas."
              : "Tem certeza que deseja cancelar esta consulta? Essa ação não pode ser desfeita."
            }
          </p>

          <div className="flex gap-3 mt-auto justify-end">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="border-slate-600 !text-slate-300 hover:bg-slate-800 hover:text-white px-2"
            >
              Não, Fechar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-2"
            >
              {isBlock ? "Excluir" : "Sim, Cancelar"}
            </Button>
          </div>
      </div>
    </div>
  );
};
