/* eslint-disable no-constant-binary-expression */
import { Button } from "../ui/button";
import { DatePicker } from "../DatePicker";
import { Switch } from "../ui/switch";
import { Clock, Repeat } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useCreateTimeBlock, type DayOfWeek } from "@/hooks/api/useCreateTimeBlock";
import { useUpdateTimeBlock } from "@/hooks/api/useUpdateTimeBlock";

interface IProps {
  title: string | undefined;
  setTitle: (val: string) => void;
  selectedDateTime: {
    day: number;
    month?: number;
    year?: number;
    hour: string;
  } | null;
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
  onClose?: () => void;
  timeBlockId?: string;
}

export const BlockContent = ({
  title,
  selectedDateTime,
  startHour,
  setStartHour,
  endHour,
  setEndHour,
  repeatEnabled,
  setRepeatEnabled,
  weekDays,
  endOption,
  setEndOption,
  endDate,
  occurrences,
  setEndDate,
  setOccurrences,
  onClose,
  timeBlockId
}: IProps) => {
  const { mutate: createTimeBlock, isPending: isCreating } = useCreateTimeBlock({
    onSuccessFn: () => {
      if (onClose) onClose();
    },
  });

  const { mutate: updateTimeBlock, isPending: isUpdating } = useUpdateTimeBlock({
    onSuccessFn: () => {
      if (onClose) onClose();
    },
  });

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

    const formattedDate = convertDateFormat(endDate);

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

    const startDateUtc = new Date(Date.UTC(
      Number(yearStr),
      Number(monthStr) - 1,
      Number(dayStr),
      Number(startHStr) ?? 0,
      Number(startMStr) ?? 0,
    ));

    const endDateUtc = new Date(Date.UTC(
      Number(yearStr),
      Number(monthStr) - 1,
      Number(dayStr),
      Number(endHStr) ?? 0,
      Number(endMStr) ?? 0,
    ));

    const payload = {
      startDate: startDateUtc,
      endDate: endDateUtc,
      reason: title,
      isInfiniteRecurring: Boolean(repeatEnabled && endOption === "never"),
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
            />
            <div className="flex items-center gap-2">
              <input
                id="inicio"
                type="time"
                style={{ colorScheme: "dark" }}
                className="bg-transparent border-b border-gray-600 focus:border-blue-500 text-white p-1 w-24 text-center focus:outline-none"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
              />
              <span className="text-gray-400">-</span>
              <input
                type="time"
                style={{ colorScheme: "dark" }}
                className="bg-transparent border-b border-gray-600 focus:border-blue-500 text-white p-1 w-24 text-center focus:outline-none"
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
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
                    <label className="text-sm text-gray-400 mb-2 block">Encerra</label>
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="endOption"
                          checked={endOption === "never"}
                          onChange={() => setEndOption("never")}
                          className="accent-blue-600 w-4 h-4 cursor-pointer"
                        />
                        <span className="ml-2 text-white group-hover:text-blue-400 transition-colors">Nunca</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer group">
                         <div className="flex items-center">
                            <input
                              type="radio"
                              name="endOption"
                              checked={endOption === "onDate"}
                              onChange={() => setEndOption("onDate")}
                              className="accent-blue-600 w-4 h-4 cursor-pointer"
                            />
                            <span className="ml-2 mr-2 text-white group-hover:text-blue-400 transition-colors">Em</span>
                         </div>
                        <DatePicker
                          initialValue={endDate}
                          onChange={(val?: string) => setEndDate(val)}
                        />
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="flex items-center">
                            <input
                              type="radio"
                              name="endOption"
                              checked={endOption === "afterOccurrences"}
                              onChange={() => setEndOption("afterOccurrences")}
                              className="accent-blue-600 w-4 h-4 cursor-pointer"
                            />
                            <span className="ml-2 mr-2 text-white group-hover:text-blue-400 transition-colors">Após</span>
                        </div>
                        <input
                          type="number"
                          value={occurrences ?? ""}
                          min={1}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (!v) {
                              setOccurrences(undefined);
                              return;
                            }
                            const n = Number(v);
                            setOccurrences(Number.isNaN(n) || n <= 0 ? 1 : n);
                          }}
                          disabled={endOption !== "afterOccurrences"}
                          className="bg-transparent border-b border-gray-600 focus:border-blue-500 text-white w-12 text-center focus:outline-none disabled:opacity-50"
                        />
                        <span className="text-white text-sm">ocorrências</span>
                      </label>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button
          type="button"
          onClick={handleCreateTimeBlock}
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 py-2 min-w-[100px]"
        >
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
};
