import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, endOfWeek } from "date-fns";
import useAPI from "./useAPI";
import type { EventType } from "@/components/WeeklyCalendar";

interface UseGetTimeBlocksParams {
  referenceDate?: Date;
  start?: Date;
  end?: Date;
  enabled?: boolean;
}

interface TimeBlockOccurrenceAPI {
  id: string;
  occurrenceId?: string;
  startDate: string;
  endDate: string;
  reason?: string | null;
}

const weekDaysPt = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
] as const;

const toEvent = (tb: TimeBlockOccurrenceAPI): EventType => {
  const start = new Date(tb.startDate);
  const end = new Date(tb.endDate);
  const dayIdx = start.getDay();

  return {
    id: tb.occurrenceId || tb.id,
    title: tb.reason || "Bloqueio",
    day: weekDaysPt[dayIdx],
    start: format(start, "HH:mm"),
    end: format(end, "HH:mm"),
    month: format(start, "MM"),
    year: Number(format(start, "yyyy")),
    type: "bloqueio",
  };
};

export const useGetTimeBlocks = ({ referenceDate, start, end, enabled = true }: UseGetTimeBlocksParams = {}) => {
  const { get } = useAPI<TimeBlockOccurrenceAPI[]>();

  const rangeStart = start ?? startOfWeek(referenceDate ?? new Date(), { weekStartsOn: 0 });
  const rangeEnd = end ?? endOfWeek(referenceDate ?? new Date(), { weekStartsOn: 0 });

  return useQuery<EventType[], Error>({
    queryKey: ["time-blocks", rangeStart.toISOString(), rangeEnd.toISOString()],
    enabled,
    queryFn: async () => {
      const resp = await get({
        endpoint: `time-blocks?start=${encodeURIComponent(rangeStart.toISOString())}&end=${encodeURIComponent(rangeEnd.toISOString())}`,
        label: "Bloqueios",
        showSuccessFeedback: false,
      });

      if (!resp || !Array.isArray(resp)) {
        return [];
      }

      return resp.map(toEvent);
    },
  });
};

export default useGetTimeBlocks;
