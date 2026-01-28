import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import useAPI from "./useAPI";
import type { EventType } from "@/components/WeeklyCalendar";

interface UseGetCalendarParams {
  referenceDate?: Date;
  month?: number;
  year?: number;
  enabled?: boolean;
}

interface TimeBlockOccurrenceAPI {
  id: string;
  startDate: string;
  endDate: string;
  reason?: string | null;
}

interface AppointmentAPI {
  id: string;
  startDate: string;
  endDate: string;
  clientName?: string | null;
  service?: { name?: string } | null;
  workplaceId?: string | null;
  workplaceName?: string | null;
}

interface ICalendar {
  timeBlocks: TimeBlockOccurrenceAPI[];
  appointments: AppointmentAPI[];
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

const pad = (v: number) => String(v).padStart(2, "0");
const timeFromUTC = (d: Date) => `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
const monthFromUTC = (d: Date) => pad(d.getUTCMonth() + 1);
const yearFromUTC = (d: Date) => d.getUTCFullYear();

const toTimeBlockEvent = (tb: TimeBlockOccurrenceAPI): EventType => {
  const start = new Date(tb.startDate);
  const end = new Date(tb.endDate);
  const dayIdx = start.getUTCDay();

  return {
    id: tb.id,
    title: tb.reason || "Bloqueio",
    day: weekDaysPt[dayIdx],
    dayNumber: start.getUTCDate(),
    start: timeFromUTC(start),
    end: timeFromUTC(end),
    month: monthFromUTC(start),
    year: yearFromUTC(start),
    type: "bloqueio",
  };
};

const toAppointmentEvent = (a: AppointmentAPI): EventType => {
  const start = new Date(a.startDate);
  const end = new Date(a.endDate);
  const dayIdx = start.getUTCDay();

  const titleParts: string[] = [];
  if (a.clientName) titleParts.push(a.clientName);
  if (a.service && a.service.name) titleParts.push(`(${a.service.name})`);

  return {
    id: a.id,
    title: titleParts.length ? titleParts.join(" ") : a.clientName || "Consulta",
    workplaceId: a.workplaceId ?? undefined,
    workplaceName: a.workplaceName ?? undefined,
    day: weekDaysPt[dayIdx],
    dayNumber: start.getUTCDate(),
    start: timeFromUTC(start),
    end: timeFromUTC(end),
    month: monthFromUTC(start),
    year: yearFromUTC(start),
    type: "consulta",
  };
};

export const useGetCalendar = ({ referenceDate, month, year, enabled = true }: UseGetCalendarParams = {}) => {
  const { get } = useAPI<ICalendar>();

  const m = month ?? (referenceDate ? Number(format(referenceDate, "MM")) : Number(format(new Date(), "MM")));
  const y = year ?? (referenceDate ? Number(format(referenceDate, "yyyy")) : Number(format(new Date(), "yyyy")));

  return useQuery<EventType[], Error>({
    queryKey: ["calendar", m, y],
    enabled,
    queryFn: async () => {
      const q = `calendar?month=${m}&year=${y}`;
      const resp = await get({ endpoint: q, label: "Calendário", showSuccessFeedback: false });

      if (!resp) return [];

      const { timeBlocks = [], appointments = [] } = resp;

      const tbEvents: EventType[] = Array.isArray(timeBlocks) ? timeBlocks.map(toTimeBlockEvent) : [];
      const apptEvents: EventType[] = Array.isArray(appointments) ? appointments.map(toAppointmentEvent) : [];

      const combined = [...tbEvents, ...apptEvents];

      combined.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        if (a.month !== b.month) return Number(a.month) - Number(b.month);
        const [aH, aM] = a.start.split(":").map(Number);
        const [bH, bM] = b.start.split(":").map(Number);
        return aH !== bH ? aH - bH : aM - bM;
      });

      return combined;
    },
  });
};

export default useGetCalendar;