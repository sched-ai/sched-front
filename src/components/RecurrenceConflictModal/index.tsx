import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
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

  const conflictCount = conflicts.length;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 animate-in fade-in duration-200 px-4">
      <div
        ref={ref}
        className="w-full max-w-[520px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        <div className="p-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-amber-100">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="mt-1">
              <h2 className="text-lg font-semibold text-slate-900 leading-none">
                Encontramos conflitos na recorrência
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Algumas ocorrências caem em datas ou horários que não podem ser usados.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Ocorrências válidas</div>
              <div className="text-2xl font-semibold text-emerald-600 mt-1">{validCount}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Com conflito</div>
              <div className="text-2xl font-semibold text-amber-600 mt-1">{conflictCount}</div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-[1fr_1.4fr] bg-slate-100 text-xs font-medium text-slate-600 px-3 py-2">
              <div>Data</div>
              <div>Problema</div>
            </div>
            <div className="max-h-[260px] overflow-y-auto">
              {conflicts.map((c, i) => (
                <div
                  key={`${c.date}-${i}`}
                  className="grid grid-cols-[1fr_1.4fr] px-3 py-2 text-sm border-t border-slate-100 first:border-t-0"
                >
                  <div className="text-slate-800">
                    {formatBR(c.date)}{" "}
                    <span className="text-slate-400 text-xs">{formatTime(c.startDate)}</span>
                  </div>
                  <div className="text-slate-600">
                    {reasonLabel[c.reason] || c.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="text-slate-700 bg-white hover:bg-slate-100 px-4"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending || validCount === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4"
          >
            {isPending ? "Salvando..." : "Criar apenas ocorrências válidas"}
          </Button>
        </div>
      </div>
    </div>
  );
};
