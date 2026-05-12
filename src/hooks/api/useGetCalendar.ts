import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import useAPI from "./useAPI";
import type { EventType } from "@/components/WeeklyCalendar";
import { getUserDateTimeParts } from "@/lib/dateTime";

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
  frequency?: string | null;
  isInfiniteRecurring?: boolean;
}


interface AppointmentAPI {
  id: string;
  startDate: string;
  endDate: string;
  clientName?: string | null;
  serviceName?: string | null;
  serviceId?: string | null;
  workplaceId?: string | null;
  workplaceName?: string | null;
  employeeId?: string | null;
  professionalName?: string | null;
  createdByAI?: boolean | null;
  frequency?: string | null;
  isInfiniteRecurring?: boolean;
}

interface ICalendar {
  timeBlocks: TimeBlockOccurrenceAPI[];
  appointments: AppointmentAPI[];
  availableHours?: Record<string, { startMinute: number | null; endMinute: number | null }>;
}

export type AvailableHours = Record<string, { startMinute: number | null; endMinute: number | null }>;

interface CalendarResponse {
  events: EventType[];
  availableHours?: AvailableHours;
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
type ApiDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  dayIdx: number;
};

const parseApiDateParts = (value: string): ApiDateParts => {
  const raw = String(value).trim();
  const hasExplicitTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw);
  const wallClockMatch = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/
  );

  if (wallClockMatch && !hasExplicitTimezone) {
    const [, yearStr, monthStr, dayStr, hourStr, minuteStr] = wallClockMatch;
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    const hour = Number(hourStr);
    const minute = Number(minuteStr);
    const dayIdx = new Date(year, month - 1, day).getDay();

    return {
      year,
      month,
      day,
      hour,
      minute,
      dayIdx,
    };
  }

  const parts = getUserDateTimeParts(value);
  if (parts) return parts;

  const date = new Date(value);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    dayIdx: date.getUTCDay(),
  };
};

const timeFromParts = (p: Pick<ApiDateParts, "hour" | "minute">) => `${pad(p.hour)}:${pad(p.minute)}`;
const monthFromParts = (p: Pick<ApiDateParts, "month">) => pad(p.month);
const yearFromParts = (p: Pick<ApiDateParts, "year">) => p.year;

const toTimeBlockEvent = (tb: TimeBlockOccurrenceAPI): EventType => {
  const start = parseApiDateParts(tb.startDate);
  const end = parseApiDateParts(tb.endDate);

  return {
    id: tb.id,
    title: tb.reason || "Bloqueio",
    day: weekDaysPt[start.dayIdx],
    dayNumber: start.day,
    start: timeFromParts(start),
    end: timeFromParts(end),
    month: monthFromParts(start),
    year: yearFromParts(start),
    type: "bloqueio",
    isRecurring: !!tb.frequency || !!tb.isInfiniteRecurring,
  };
};


const toAppointmentEvent = (a: AppointmentAPI): EventType => {
  const start = parseApiDateParts(a.startDate);
  const end = parseApiDateParts(a.endDate);

  const titleParts: string[] = [];
  if (a.clientName) titleParts.push(a.clientName);

  return {
    id: a.id,
    title: titleParts.length ? titleParts.join(" ") : a.clientName || "Consulta",
    workplaceId: a.workplaceId ?? undefined,
    workplaceName: a.workplaceName ?? undefined,
    serviceId: a.serviceId ?? undefined,
    services: a.serviceName ? [a.serviceName] : [],
    employeeId: a.employeeId ?? undefined,
    professionalName: a.professionalName ?? undefined,
    createdByAI: Boolean(a.createdByAI),
    day: weekDaysPt[start.dayIdx],
    dayNumber: start.day,
    start: timeFromParts(start),
    end: timeFromParts(end),
    month: monthFromParts(start),
    year: yearFromParts(start),
    type: "consulta",
    isRecurring: !!a.frequency || !!a.isInfiniteRecurring,
  };
};

export const useGetCalendar = ({ referenceDate, month, year, enabled = true }: UseGetCalendarParams = {}) => {
  const { get } = useAPI<ICalendar>();

  const m = month ?? (referenceDate ? Number(format(referenceDate, "MM")) : Number(format(new Date(), "MM")));
  const y = year ?? (referenceDate ? Number(format(referenceDate, "yyyy")) : Number(format(new Date(), "yyyy")));

  return useQuery<CalendarResponse, Error>({
    queryKey: ["calendar", m, y],
    enabled,
    queryFn: async () => {
      const q = `calendar?month=${m}&year=${y}`;
      const resp = await get({ endpoint: q, label: "Calendário", showSuccessFeedback: false });

      if (!resp) return { events: [] };

      const { timeBlocks = [], appointments = [], availableHours } = resp;

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

      return { events: combined, availableHours };
    },
  });
};

export default useGetCalendar;