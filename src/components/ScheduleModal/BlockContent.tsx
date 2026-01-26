/* eslint-disable no-constant-binary-expression */
import { Button } from "../ui/button";
import { DatePicker } from "../DatePicker";
import { Switch } from "../ui/switch";
import { ClockPlus } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useCreateTimeBlock, type DayOfWeek } from "@/hooks/api/useCreateTimeBlock";

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
}

export const BlockContent = ({
  title,
  setTitle,
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
  onClose
}: IProps) => {
  const { mutate: createTimeBlock } = useCreateTimeBlock({
    onSuccessFn: () => {
      if (onClose) onClose();
    },
  });

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

    createTimeBlock({
      startDate: startDateUtc,
      endDate: endDateUtc,
      reason: title,
      isInfiniteRecurring: Boolean(repeatEnabled && endOption === "never"),
      recurringUntilDate:
        endOption === "onDate" && endDate ? convertDateFormat(endDate) : null,
      recurringOccurrences:
        endOption === "afterOccurrences" ? occurrences : null,
    });
  };
  return (
    <form>
      <div className="relative mt-7">
        <input
          id="tituloBloqueio"
          name="tituloBloqueio"
          type="text"
          placeholder=" "
          className="peer h-12 w-full border-2 px-2 bg-white/5 rounded-lg border-gray-300 placeholder-transparent focus:outline-none focus:border-blue-600 focus:border-2 text-white border-x-0 border-t-0 outline-0 border-b-[2px] !border-b-[#0177FB]"
          value={title ?? ""}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label
          htmlFor="tituloBloqueio"
          className="absolute left-0 -top-6 text-sm text-white transition-all 
                    peer-placeholder-shown:left-3 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                    peer-focus:-top-6 peer-focus:text-sm peer-focus:left-0"
        >
          Adicionar Título
        </label>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 items-center text-[16px] mt-4">
          <ClockPlus />
          <span className="text-sm">Confirme a data e hora:</span>
        </div>
        <div className="flex gap-4 items-center justify-between">
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
          <div className="flex items-center gap-3">
            De
            <input
              id="inicio"
              type="time"
              className="border-white border p-2 py-3 h-full rounded-lg max-w-[100px] lightInput"
              value={startHour}
              onChange={(e) => setStartHour(e.target.value)}
            />
            Até
            <input
              type="time"
              className="border-white border p-2 py-3 h-full rounded-lg max-w-[100px] lightInput"
              value={endHour}
              onChange={(e) => setEndHour(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2 items-center text-[16px]">
          <Switch
            checked={repeatEnabled}
            onCheckedChange={(val) => setRepeatEnabled(Boolean(val))}
            className="data-[state=checked]:bg-[#0177FB] data-[state=unchecked]:bg-[#5E5E5E]"
          />{" "}
          Repetir
        </div>
        {repeatEnabled && (
          <div>
            {/* <div className=" w-full">
              <label className="text-sm text-white/90">Repetir em</label>
              <div className="flex justify-around mt-2">
                {["D", "S", "T", "Q", "Q", "S", "S"].map((label, idx) => {
                  const selected = weekDays[idx];
                  return (
                    <button
                      key={idx}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        setWeekDays((prev: any) => {
                          const copy = [...prev];
                          copy[idx] = !copy[idx];
                          return copy;
                        })
                      }
                      className={`w-10 h-10 rounded-full cursor-pointer flex items-center justify-center text-sm font-medium transition-colors ${
                        selected
                          ? "bg-[#0177FB] text-white"
                          : "bg-white/10 text-white/80"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div> */}

            <div className="mt-4">
              <label className="text-sm text-white/90">Encerra em</label>
              <div className="flex flex-col gap-2 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="endOption"
                    checked={endOption === "never"}
                    onChange={() => setEndOption("never")}
                  />
                  <span className="ml-2 text-white">Nunca</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="endOption"
                    checked={endOption === "onDate"}
                    onChange={() => setEndOption("onDate")}
                  />
                  <span className="ml-2 text-white">Em:</span>
                  <DatePicker
                    initialValue={endDate}
                    onChange={(val?: string) => setEndDate(val)}
                  />
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="endOption"
                    checked={endOption === "afterOccurrences"}
                    onChange={() => setEndOption("afterOccurrences")}
                  />
                  <span className="ml-2 text-white">Após:</span>
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
                      if (Number.isNaN(n) || n <= 0) {
                        setOccurrences(1);
                      } else {
                        setOccurrences(n);
                      }
                    }}
                    disabled={endOption !== "afterOccurrences"}
                    className="ml-2 border border-white text-white p-2 rounded w-20"
                  />
                  <span className="text-white ml-2">ocorrências</span>
                </label>
              </div>
            </div>
          </div>
        )}
        <Button
          className="self-end !text-[16px] mt-4"
          type="submit"
          variant="seccondary"
          onClick={handleCreateTimeBlock}
        >
          Salvar
        </Button>
      </div>
    </form>
  );
};
