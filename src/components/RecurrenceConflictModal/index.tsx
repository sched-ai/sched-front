import { Button } from "@/components/ui/button";
import { AlertTriangle, CalendarDays, Clock } from "lucide-react";
import { useEffect, useRef } from "react";
import type {
  IPreviewRecurrenceConflict,
  RecurrenceConflictReason,
} from "@/hooks/api/usePreviewAppointmentRecurrence";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  validCount: number;
  conflicts: IPreviewRecurrenceConflict[];
  isPending?: boolean;
  /**
   * "summary": exibe contadores e tabela (usado na criação de recorrência).
   * "single": apenas informa o conflito do dia editado (usado no edit de recorrência).
   */
  mode?: "summary" | "single";
}

const reasonLabel: Record<RecurrenceConflictReason, string> = {
  NON_WORKING_DAY: "Dia sem funcionamento",
  OUTSIDE_WORKING_HOURS: "Fora do horário de funcionamento",
  TIME_BLOCK: "Horário bloqueado",
  APPOINTMENT_CONFLICT: "Já existe agendamento",
};

const formatBR = (iso: string) => {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
};

const formatTime = (isoDate: string) => {
  const date = new Date(isoDate);
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

export const RecurrenceConflictModal = ({
  isOpen,
  onClose,
  onConfirm,
  validCount,
  conflicts,
  isPending = false,
  mode = "summary",
}: IProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        if (!isPending) onClose();
      }
    };
    const t = setTimeout(() => document.addEventListener("mousedown", handleClickOutside), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, isPending]);

  if (!isOpen) return null;

  if (mode === "single") {
    // Mostra apenas a info do conflito do dia editado.
    const first = conflicts[0];
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 animate-in fade-in duration-200 px-4">
        <div
          ref={ref}
          className="w-full max-w-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        >
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-amber-100">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-base font-semibold text-slate-900 leading-tight">
                Conflito de horário
              </h2>
            </div>

            {first ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-4 text-sm text-slate-800">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <CalendarDays className="w-4 h-4 text-slate-500" />
                    {formatBR(first.date)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4 text-slate-500" />
                    {formatTime(first.startDate)}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-2 leading-snug">
                  {reasonLabel[first.reason] || first.reason}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-600 mt-3 leading-snug">
                Esse dia e horário está em conflito.
              </p>
            )}
          </div>

          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="text-slate-700 bg-white hover:bg-slate-100 px-5 h-9"
            >
              Entendi
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const conflictCount = conflicts.length;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 animate-in fade-in duration-200 px-4">
      <div
        ref={ref}
        className="w-full max-w-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-amber-100">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-slate-900 leading-tight">
                Encontramos conflitos na recorrência
              </h2>
              <p className="text-sm text-slate-500 mt-1 leading-snug">
                Algumas ocorrências caem em datas ou horários que não podem ser usados.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
              <span className="text-base font-semibold leading-none">{validCount}</span>
              válidas
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-medium">
              <span className="text-base font-semibold leading-none">{conflictCount}</span>
              com conflito
            </span>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-[110px_1fr] bg-slate-100 text-xs font-medium text-slate-600 px-3 py-1.5">
              <div>Data</div>
              <div>Problema</div>
            </div>
            <div className="max-h-[240px] overflow-y-auto">
              {conflicts.map((c, i) => (
                <div
                  key={`${c.date}-${i}`}
                  className="grid grid-cols-[110px_1fr] items-center px-3 py-2 text-sm border-t border-slate-100 first:border-t-0"
                >
                  <div className="text-slate-800 font-medium tabular-nums">
                    <div>{formatBR(c.date)}</div>
                    <div className="text-slate-400 text-xs font-normal">{formatTime(c.startDate)}</div>
                  </div>
                  <div className="text-slate-600">
                    {reasonLabel[c.reason] || c.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="text-slate-700 bg-white hover:bg-slate-100 px-4 h-9"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending || validCount === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 h-9"
          >
            {isPending ? "Salvando..." : "Criar apenas válidas"}
          </Button>
        </div>
      </div>
    </div>
  );
};
