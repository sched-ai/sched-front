import { Button } from "@/components/ui/button";
import { capitalizeFirst } from "@/util/helper";
import { CalendarDays, Clock, TriangleAlert, Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDeleteAppointment } from "@/hooks/api/useDeleteAppointment";
import { useDeleteTimeBlock } from "@/hooks/api/useDeleteTimeBlock";
import { useDeleteTimeBlockInstance } from "@/hooks/api/useDeleteTimeBlockInstance";
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
  const [deleteType, setDeleteType] = useState<"single" | "following">("single");

  const { mutate: deleteAppointment, isPending: isDeletingAppt } = useDeleteAppointment({
    onSuccessFn: onSuccess
  });

  const { mutate: deleteTimeBlock, isPending: isDeletingBlock } = useDeleteTimeBlock({
    onSuccessFn: onSuccess
  });

  const { mutate: deleteTimeBlockInstance, isPending: isDeletingInstance } = useDeleteTimeBlockInstance({
    onSuccessFn: onSuccess
  });

  const isPending = isDeletingAppt || isDeletingBlock || isDeletingInstance;

  const confirmDelete = () => {
    if (!selectedEvent) return;
    
    console.log('Confirm Delete:', { 
      type: selectedEvent.type, 
      id: selectedEvent.id, 
      isRecurring: selectedEvent.isRecurring,
      deleteType
    });

    if (selectedEvent.type === 'consulta') {
       deleteAppointment(String(selectedEvent.id));
    } else if (selectedEvent.type === 'bloqueio') {
       if (selectedEvent.isRecurring) {
         const pad = (v: number) => String(v).padStart(2, "0");
         const dateISO = `${selectedEvent.year}-${pad(Number(selectedEvent.month))}-${pad(Number(selectedEvent.dayNumber))}`;
         console.log('Deleting Instance:', { id: selectedEvent.id, dateISO, deleteType });
         deleteTimeBlockInstance({ 
           id: String(selectedEvent.id), 
           date: dateISO, 
           deleteType 
         });
       } else {
         deleteTimeBlock(String(selectedEvent.id));
       }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      setDeleteType("single");
      setTimeout(() => document.addEventListener("mousedown", handleClickOutside), 0);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !selectedEvent) return null;

  const isBlock = selectedEvent.type === 'bloqueio';
  const showRecurrenceOptions = isBlock && selectedEvent.isRecurring;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300 px-4">
      <div 
          ref={ref}
          className="w-full max-w-[440px] bg-[#121535] border border-slate-700/50 text-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-8 animate-in zoom-in-95 duration-200 ring-1 ring-white/5"
      >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <TriangleAlert className="w-6 h-6 text-red-500" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white leading-tight">
                    {isBlock ? "Excluir Bloqueio" : "Cancelar Consulta"}
                </h2>
                <p className="text-slate-400 text-sm">Esta ação não poderá ser desfeita.</p>
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-xl p-4 mb-6 border border-slate-700/30 backdrop-blur-sm">
              <h3 className="text-base font-semibold text-white mb-2 leading-tight">
                  {capitalizeFirst(selectedEvent.title)}
              </h3>
              <div className="flex flex-col gap-2 text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-2">
                       <div className="w-1 h-1 rounded-full bg-blue-500" />
                       <CalendarDays className="w-3.5 h-3.5 text-blue-400" /> {formattedDate}
                  </span>
                  {selectedEvent.start && selectedEvent.end && (
                      <span className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-purple-500" />
                          <Clock className="w-3.5 h-3.5 text-purple-400" /> {selectedEvent.start} - {selectedEvent.end}
                      </span>
                  )}
              </div>
          </div>

          {!showRecurrenceOptions ? (
             <p className="text-slate-300 text-sm mb-8 leading-relaxed">
               Tem certeza que deseja {isBlock ? 'excluir este bloqueio' : 'cancelar esta consulta'}? 
               {isBlock ? ' Todas as informações serão removidas permanentemente.' : ' O horário ficará livre para novos agendamentos.'}
             </p>
          ) : (
            <div className="space-y-4 mb-8">
                <div className="flex items-start gap-2 text-blue-400 bg-blue-500/5 p-3 rounded-lg border border-blue-500/10 mb-4">
                    <Info size={16} className="mt-0.5 shrink-0" />
                    <p className="text-xs leading-relaxed text-blue-200/80">
                        Este é um bloqueio recorrente. Como você deseja proceder com a exclusão?
                    </p>
                </div>

                <div className="grid gap-3">
                    <button
                        onClick={() => setDeleteType("single")}
                        className={`flex flex-col items-start p-4 rounded-xl border transition-all text-left group ${
                            deleteType === "single" 
                            ? "bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                            : "bg-slate-800/10 border-slate-700/50 hover:bg-slate-800/30 hover:border-slate-600"
                        }`}
                    >
                        <span className={`text-sm font-semibold mb-0.5 ${deleteType === "single" ? "text-blue-400" : "text-slate-200"}`}>
                            Apenas este
                        </span>
                        <span className="text-[11px] text-slate-400 group-hover:text-slate-300">
                            Exclui somente o bloqueio exibido nesta data específica.
                        </span>
                    </button>

                    <button
                        onClick={() => setDeleteType("following")}
                        className={`flex flex-col items-start p-4 rounded-xl border transition-all text-left group ${
                            deleteType === "following" 
                            ? "bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                            : "bg-slate-800/10 border-slate-700/50 hover:bg-slate-800/30 hover:border-slate-600"
                        }`}
                    >
                        <span className={`text-sm font-semibold mb-0.5 ${deleteType === "following" ? "text-blue-400" : "text-slate-200"}`}>
                            Este e todos os seguintes
                        </span>
                        <span className="text-[11px] text-slate-400 group-hover:text-slate-300">
                            Exclui esta e todas as ocorrências futuras deste bloqueio.
                        </span>
                    </button>
                </div>
            </div>
          )}

          <div className="flex gap-4 mt-auto">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isPending}
              className="flex-1 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl h-11"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isPending}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 font-bold shadow-lg shadow-red-900/30"
            >
              {isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
      </div>
    </div>
  );
};
