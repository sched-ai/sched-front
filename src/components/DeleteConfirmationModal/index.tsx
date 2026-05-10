import { Button } from "@/components/ui/button";
import { capitalizeFirst } from "@/util/helper";
import { CalendarDays, Clock, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDeleteAppointment } from "@/hooks/api/useDeleteAppointment";
import { useDeleteAppointmentInstance } from "@/hooks/api/useDeleteAppointmentInstance";
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
  const [reason, setReason] = useState("");

  const { mutate: deleteAppointment, isPending: isDeletingAppt } = useDeleteAppointment({
    onSuccessFn: onSuccess
  });

  const { mutate: deleteAppointmentInstance, isPending: isDeletingApptInstance } = useDeleteAppointmentInstance({
    onSuccessFn: onSuccess
  });

  const { mutate: deleteTimeBlock, isPending: isDeletingBlock } = useDeleteTimeBlock({
    onSuccessFn: onSuccess
  });

  const { mutate: deleteTimeBlockInstance, isPending: isDeletingInstance } = useDeleteTimeBlockInstance({
    onSuccessFn: onSuccess
  });

  const isPending = isDeletingAppt || isDeletingApptInstance || isDeletingBlock || isDeletingInstance;

  const confirmDelete = () => {
    if (!selectedEvent) return;

    const pad = (v: number) => String(v).padStart(2, "0");

    if (selectedEvent.type === 'consulta') {
      if (selectedEvent.isRecurring) {
        const dateISO = `${selectedEvent.year}-${pad(Number(selectedEvent.month))}-${pad(Number(selectedEvent.dayNumber))}`;
        deleteAppointmentInstance({ id: String(selectedEvent.id), date: dateISO, deleteType });
      } else {
        deleteAppointment({ id: String(selectedEvent.id) });
      }
    } else if (selectedEvent.type === 'bloqueio') {
       if (selectedEvent.isRecurring) {
         const dateISO = `${selectedEvent.year}-${pad(Number(selectedEvent.month))}-${pad(Number(selectedEvent.dayNumber))}`;
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
      setReason("");
      setTimeout(() => document.addEventListener("mousedown", handleClickOutside), 0);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !selectedEvent) return null;

  const isBlock = selectedEvent.type === 'bloqueio';
  const isRecurring = !!selectedEvent.isRecurring;
  const showRecurrenceOptions = isRecurring;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 animate-in fade-in duration-300 px-4">
      <div 
        ref={ref}
        className="w-full max-w-[460px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        <div className="p-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
              <TriangleAlert className="w-6 h-6 text-red-600" />
            </div>
            <div className="mt-1">
              <h2 className="text-lg font-semibold text-slate-900 leading-none">
                {isBlock ? "Excluir bloqueio" : isRecurring ? "Excluir agendamento recorrente" : "Cancelar agendamento"}
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                {isBlock
                  ? isRecurring
                    ? "Este bloqueio faz parte de uma série recorrente. O que você deseja excluir?"
                    : "Tem certeza que deseja excluir este bloqueio?"
                  : isRecurring
                    ? "Este agendamento faz parte de uma série recorrente. O que você deseja excluir?"
                    : "Tem certeza que deseja cancelar este agendamento?"}
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl border border-slate-200 bg-slate-50">
            <h3 className="font-medium text-slate-900 mb-3 leading-none">
              {capitalizeFirst(selectedEvent.title)}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CalendarDays className="w-4 h-4 text-slate-400" />
                <span>{formattedDate}</span>
              </div>
              {selectedEvent.start && selectedEvent.end && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{selectedEvent.start} - {selectedEvent.end}</span>
                </div>
              )}
            </div>
          </div>

          {!isBlock && (
            <div className="mt-5 animate-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Motivo do cancelamento (opcional)
              </label>
              <textarea
                className="w-full min-h-[80px] p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#141736]/20 focus:border-[#141736] outline-none text-sm transition-all resize-none"
                placeholder="Descreva o motivo (será enviado por WhatsApp ao paciente)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          )}

          {showRecurrenceOptions && (
            <div className="mt-5 space-y-3">
              <label
                className={`relative flex cursor-pointer rounded-xl border p-4 transition-all focus:outline-none hover:bg-slate-50 ${
                  deleteType === "single" 
                  ? "border-[#141736] bg-[#141736]/5 shadow-sm" 
                  : "border-slate-200 bg-white"
                }`}
                onClick={() => setDeleteType("single")}
              >
                <div className="flex flex-1">
                  <div className="flex flex-col">
                    <span className={`block text-sm font-medium ${deleteType === "single" ? "text-[#141736]" : "text-slate-900"}`}>
                      {isBlock ? "Apenas este bloqueio" : "Apenas este agendamento"}
                    </span>
                    <span className="mt-1 flex items-center text-xs text-slate-500 pr-4">
                      Exclui este dia específico e mantém o resto da série intacta.
                    </span>
                  </div>
                </div>
                {deleteType === "single" ? (
                   <div className="flex-shrink-0 h-5 w-5 rounded-full border-[5px] border-[#141736]" />
                ) : (
                   <div className="flex-shrink-0 h-5 w-5 rounded-full border-2 border-slate-300" />
                )}
              </label>

              <label
                className={`relative flex cursor-pointer rounded-xl border p-4 transition-all focus:outline-none hover:bg-slate-50 ${
                  deleteType === "following" 
                  ? "border-[#141736] bg-[#141736]/5 shadow-sm" 
                  : "border-slate-200 bg-white"
                }`}
                onClick={() => setDeleteType("following")}
              >
                <div className="flex flex-1">
                  <div className="flex flex-col">
                    <span className={`block text-sm font-medium ${deleteType === "following" ? "text-[#141736]" : "text-slate-900"}`}>
                      {isBlock ? "Este e os bloqueios futuros" : "Este e os agendamentos futuros"}
                    </span>
                    <span className="mt-1 flex items-center text-xs text-slate-500 pr-4">
                      Remove esta e todas as ocorrências seguintes da série.
                    </span>
                  </div>
                </div>
                {deleteType === "following" ? (
                   <div className="flex-shrink-0 h-5 w-5 rounded-full border-[5px] border-[#141736]" />
                ) : (
                   <div className="flex-shrink-0 h-5 w-5 rounded-full border-2 border-slate-300" />
                )}
              </label>
            </div>
          )}
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isPending}
            className="text-slate-700 bg-white hover:bg-slate-100 px-2"
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={confirmDelete} 
            disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white font-medium w-fit px-4"
          >
              {isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      </div>
    </div>
  );
};
