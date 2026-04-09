/* eslint-disable no-constant-binary-expression */
import { Button } from "../ui/button";
import { DatePicker } from "../DatePicker";
import { Switch } from "../ui/switch";
import { Clock, Repeat } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useCreateTimeBlock, type DayOfWeek } from "@/hooks/api/useCreateTimeBlock";
import { useUpdateTimeBlock } from "@/hooks/api/useUpdateTimeBlock";
import type { Matcher } from "react-day-picker";
import type { TimePickerProps } from "antd";
import { TimePickerField } from "./TimePickerField";

interface IProps {
  title: string | undefined;
  setTitle: (val: string) => void;
  selectedDateTime: {
    day: number;
    month: number;
    year: number;
    hour: string; // Keep hour for compatibility if needed, though we track startHour separately
  } | {
    day: number;
    month: number;
    year: number;
  } | null;
  setSelectedDateTime: Dispatch<SetStateAction<{ day: number; month: number; year: number } | null>>;
  startHour: string;
  setStartHour: (val: string) => void;
  endHour: string;
  setEndHour: (val: string) => void;
  repeatEnabled: boolean;
  setRepeatEnabled: (val: boolean) => void;
  weekDays: boolean[];
  setWeekDays: Dispatch<SetStateAction<boolean[]>>;
  endOption: "never" | "onDate" | "afterOccurrences";
  setEndOption: (val: "never" | "onDate" | "afterOccurrences") => void;
  endDate: string | undefined;
  setEndDate: (val: string | undefined) => void;
  occurrences: number | undefined;
  setOccurrences: (val: number | undefined) => void;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  setFrequency: (val: "DAILY" | "WEEKLY" | "MONTHLY") => void;
  onClose?: () => void;
  timeBlockId?: string;
  disableDate?: Matcher | Matcher[];
  startMinTime?: string;
  startMaxTime?: string;
  endMinTime?: string;
  endMaxTime?: string;
  startDisabledTime?: TimePickerProps["disabledTime"];
  endDisabledTime?: TimePickerProps["disabledTime"];
}


export const BlockContent = ({
  title,
  selectedDateTime,
  setSelectedDateTime,
  startHour,
  setStartHour,
  endHour,
  setEndHour,
  repeatEnabled,
  setRepeatEnabled,
  weekDays,
  setWeekDays,
  endOption,
  endDate,
  occurrences,
  frequency,
  setFrequency,
  onClose,
  timeBlockId,
  disableDate,
  startMinTime,
  startMaxTime,
  endMinTime,
  endMaxTime,
  startDisabledTime,
  endDisabledTime,
}: IProps) => {

  const { mutate: createTimeBlock, isPending: isCreating, error: createError } = useCreateTimeBlock({
    onSuccessFn: () => {
      if (onClose) onClose();
    },
  });

  const { mutate: updateTimeBlock, isPending: isUpdating, error: updateError } = useUpdateTimeBlock({
    onSuccessFn: () => {
      if (onClose) onClose();
    },
  });

  const error = createError || updateError;

  const isPending = isCreating || isUpdating;

  const handleCreateTimeBlock = (e: React.FormEvent) => {
    e.preventDefault();

    const convertDateFormat = (dateStr: string | undefined): string | null => {
      if (!dateStr) return null;
      const [day, month, year] = dateStr.split("/");
      return `${year}-${month}-${day}`;
    };

    const indexToDayOfWeek = (index: number): DayOfWeek => {
      const days: DayOfWeek[] = [
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
      ];
      return days[index];
    };

    // Use selectedDateTime for the block start date if available
    let blockDateStr = endDate; // Fallback? No, endDate is for recurrence end.
    
    // We need to construct the Start Date from selectedDateTime
    if (selectedDateTime && selectedDateTime.day && selectedDateTime.month && selectedDateTime.year) {
        blockDateStr = `${String(selectedDateTime.day).padStart(2,'0')}/${String(selectedDateTime.month).padStart(2,'0')}/${selectedDateTime.year}`;
    }

    const formattedDate = convertDateFormat(blockDateStr);

    if (!formattedDate || !startHour || !endHour) {
      console.error("Data ou hora inválida");
      return;
    }

    const selectedDays: DayOfWeek[] = weekDays
      .map((isSelected, index) => (isSelected ? indexToDayOfWeek(index) : null))
      .filter((day): day is DayOfWeek => day !== null);
    
      console.log("Selected Days for Recurrence disabled:", selectedDays);

    if (!formattedDate) return;

    const [yearStr, monthStr, dayStr] = formattedDate.split("-");

    const [startHStr = "0", startMStr = "0"] = (startHour || "00:00").split(":");
    const [endHStr = "0", endMStr = "0"] = (endHour || "00:00").split(":");

    const startDateLocal = new Date(
      Number(yearStr),
      Number(monthStr) - 1,
      Number(dayStr),
      Number(startHStr) ?? 0,
      Number(startMStr) ?? 0,
    );

    const endDateLocal = new Date(
      Number(yearStr),
      Number(monthStr) - 1,
      Number(dayStr),
      Number(endHStr) ?? 0,
      Number(endMStr) ?? 0,
    );

    const payload = {
      startDate: startDateLocal,
      endDate: endDateLocal,
      reason: title,
      isInfiniteRecurring: repeatEnabled,
      frequency: repeatEnabled ? frequency : null,
      days_of_week: repeatEnabled && frequency === "WEEKLY" 
        ? weekDays.map((isSelected, i) => (isSelected ? i : -1)).filter((i) => i !== -1)
        : [],
      recurringUntilDate:
        endOption === "onDate" && endDate ? convertDateFormat(endDate) : null,
      recurringOccurrences:
        endOption === "afterOccurrences" ? occurrences : null,
    };


    if (timeBlockId) {
      updateTimeBlock({ id: timeBlockId, payload });
    } else {
      createTimeBlock(payload);
    }
  };
  return (
    <form className="flex flex-col gap-5">
      {/* Date & Time Section */}
      <div className="flex items-start gap-4">
        <div className="mt-2.5">
          <Clock className="text-gray-400" size={20} />
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <DatePicker
              initialValue={
                selectedDateTime &&
                selectedDateTime.day &&
                selectedDateTime.month &&
                selectedDateTime.year
                  ? `${selectedDateTime.day
                      .toString()
                      .padStart(2, "0")}/${selectedDateTime.month
                      .toString()
                      .padStart(2, "0")}/${selectedDateTime.year}`
                  : undefined
              }
              onChange={(val) => {
                if (!val) return;
                const [d, m, y] = val.split("/").map(Number);
                if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
                    setSelectedDateTime({ day: d, month: m, year: y });
                }
              }}
              disabled={disableDate}
            />
            <div className="flex items-center gap-2">
              <TimePickerField
                id="inicio"
                value={startHour}
                minTime={startMinTime}
                maxTime={startMaxTime}
                ariaLabel="Início do bloqueio"
                disabledTime={startDisabledTime}
                onChange={(next) => setStartHour(next)}
              />
              <span className="text-gray-400">-</span>
              <TimePickerField
                id="fim"
                value={endHour}
                minTime={endMinTime}
                maxTime={endMaxTime}
                ariaLabel="Fim do bloqueio"
                disabledTime={endDisabledTime}
                onChange={(next) => setEndHour(next)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Repeat Section */}
      <div className="flex items-start gap-4">
        <div className="mt-0.5">
          <Repeat className={`transform transition-colors ${repeatEnabled ? "text-blue-500" : "text-gray-400"}`} size={20} />
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-white">Repetir</span>
            <Switch
              checked={repeatEnabled}
              onCheckedChange={(val) => setRepeatEnabled(Boolean(val))}
              className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-600"
            />
          </div>

          {repeatEnabled && (
            <div className="pl-0 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="border-l-2 border-gray-700 pl-4 space-y-4">
                 <div>
                    <label className="text-sm text-gray-400 mb-2 block">Frequência</label>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-2">
                        {(["DAILY", "WEEKLY", "MONTHLY"] as const).map((opt) => (
                           <Button
                              key={opt}
                              type="button"
                              onClick={() => setFrequency(opt)}
                              className={`rounded-full px-4 h-8 text-xs font-medium transition-all ${
                                frequency === opt 
                                ? "bg-blue-600 text-white hover:bg-blue-700" 
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700"
                              }`}
                           >
                              {opt === 'DAILY' ? 'Diário' : opt === 'WEEKLY' ? 'Semanal' : 'Mensal'}
                           </Button>
                        ))}
                      </div>

                      {frequency === "WEEKLY" && (
                        <div className="flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
                          <label className="text-xs text-gray-400">Repetir em:</label>
                          <div className="flex gap-1.5 flex-wrap">
                            {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setWeekDays(prev => {
                                    const next = [...prev];
                                    next[i] = !next[i];
                                    return next;
                                  });
                                }}
                                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                                  weekDays[i]
                                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40 transform scale-110"
                                    : "bg-gray-800/40 border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                                }`}
                              >
                                {day}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="h-[60px] w-full flex items-center justify-center">
        {error ? (
            <div className="bg-red-900/20 border border-red-900/50 rounded-md p-3 text-sm text-red-400 w-full leading-tight">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(error as any)?.response?.data?.error || (error as any)?.response?.data?.message || (error as any)?.message || "Ocorreu um erro"}
            </div>
          ) : null}
        </div>
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleCreateTimeBlock}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 py-2 min-w-[100px]"
          >
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </form>
  );
};
