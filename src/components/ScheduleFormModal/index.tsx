import { X, GripHorizontal } from "lucide-react";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import type { SetStateAction } from "react";
import type { TimePickerProps } from "antd";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DndContext, useDraggable } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import type { EventType } from "@/components/WeeklyCalendar";
import { BlockContent } from "./BlockContent";
import { AppoimentContent } from "./AppoimentContent";
import { useSearchClients } from "@/hooks/api/useSearchClients";
import { useNavigate } from "react-router-dom";
import type { AvailableHours } from "@/hooks/api/useGetCalendar";
import { useIsMobile } from "@/hooks/use-mobile";

const MODAL_WIDTH = 400;
const MODAL_HEIGHT = 600;
const MINUTES_IN_DAY = 24 * 60;

const timeToMinutes = (time?: string) => {
  if (!time || !time.includes(":")) return null;
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const minutesToTime = (minutes: number) => {
  const safeMinutes = Math.max(0, Math.min(MINUTES_IN_DAY - 1, minutes));
  const h = Math.floor(safeMinutes / 60);
  const m = safeMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

interface FormModalProps {
  isOpen?: boolean;
  selectedDateTime?: {
    day: number;
    month?: number;
    year?: number;
    hour: string;
    endHour?: string;
  } | null;
  selectedEvent?: EventType | null;
  onClose?: () => void;
  clickPosition?: { x: number; y: number } | null;
  onDraftChange?: (draft: {
    day: number;
    month: number;
    year: number;
    startHour: string;
    endHour?: string;
    type?: 'consulta' | 'bloqueio';
  } | null) => void;
  availableHours?: AvailableHours;
  calendarEvents?: EventType[];
  onNavigateWeekToDate?: (date: { day: number; month: number; year: number }) => void;
}

const DraggableModalContent = ({
  children,
  position,
}: {
  children: React.ReactNode;
  position: { x: number; y: number };
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "draggable-modal",
  });

  const initialPosition = useMemo(() => {
    return {
      x: (window.innerWidth - MODAL_WIDTH) / 2,
      y: (window.innerHeight - MODAL_HEIGHT) / 2,
    };
  }, []);

  // const initialPosition = getInitialPosition();

  const x = initialPosition.x + (transform?.x ?? 0) + position.x;
  const y = initialPosition.y + (transform?.y ?? 0) + position.y;

  const style = {
    left: `${x}px`,
    top: `${y}px`,
    background: "#121535",
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        maxHeight: "calc(100vh - 40px)",
      }}
      className="fixed z-50 min-w-[400px] max-w-[95vw] shadow-2xl rounded-2xl border-none bg-cover flex flex-col"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-0 right-0 left-0 h-8 pl-2 cursor-move flex items-center justify-start bg-white/5 rounded-t-lg z-10 transition-colors"
        style={{ userSelect: "none" }}
      >
        <GripHorizontal size={20} className="text-white/70" />
      </div>
      <div className="flex-1 overflow-y-auto py-8 custom-scrollbar">
        {children}
      </div>
    </div>
  );
};

export const ScheduleFormModal = ({
  isOpen = false,
  selectedDateTime = null,
  selectedEvent = null,
  onClose = () => {},
  clickPosition,
  onDraftChange,
  availableHours,
  calendarEvents = [],
  onNavigateWeekToDate,
}: FormModalProps) => {
  const isMobile = useIsMobile();
  function getEndHour(startHour: string | undefined) {
    if (!startHour) return "";
    const [h, m] = startHour.split(":").map(Number);
    let endH = h + 1;
    if (endH > 23) endH = 23;
    return `${String(endH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  const [startHour, setStartHour] = useState("");
  const [endHour, setEndHour] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");
  const [professional, setProfessional] = useState("");
  const [activeTab, setActiveTab] = useState("consulta");
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [weekDays, setWeekDays] = useState<boolean[]>([false, false, false, false, false, false, false]);
  const [endOption, setEndOption] = useState<"never" | "onDate" | "afterOccurrences">("never");
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [occurrences, setOccurrences] = useState<number | undefined>(1);
  const [frequency, setFrequency] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("DAILY");
  const [clientId, setClientId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wasOpenRef = useRef(false);
  const initSourceKeyRef = useRef<string | null>(null);

  const navigate = useNavigate();

  const getDayAvailability = useCallback((date: Date) => {
    const dayData = availableHours?.[String(date.getDay())];
    if (!dayData || dayData.startMinute === null || dayData.endMinute === null) return null;
    if (dayData.endMinute <= dayData.startMinute) return null;
    return { startMinute: dayData.startMinute, endMinute: dayData.endMinute };
  }, [availableHours]);

  const getEffectiveBounds = useCallback((date: Date) => {
    const availability = getDayAvailability(date);
    if (!availability) return null;

    return availability;
  }, [getDayAvailability]);

  const isDateSelectable = useCallback((date: Date) => {
    const candidate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (candidate < todayStart) return false;
    return Boolean(getEffectiveBounds(candidate));
  }, [getEffectiveBounds]);

  const findNextAvailableDate = useCallback((from: Date) => {
    const base = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    for (let i = 0; i <= 365; i++) {
      const candidate = new Date(base);
      candidate.setDate(base.getDate() + i);
      if (isDateSelectable(candidate)) {
        return candidate;
      }
    }
    return null;
  }, [isDateSelectable]);

  // Search clients when tab is 'consulta' and we have a title
  const { data: clients, isLoading: isLoadingClients } = useSearchClients({
      search: activeTab === 'consulta' ? title : undefined
  });

  // Initialize with Today's date to avoid null state in "Agendar" flow
  const [selectedDateState, setSelectedDateState] = useState<{ day: number, month: number, year: number } | null>(() => {
      const now = new Date();
      return { day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear() };
  });

  useEffect(() => {
    const formatDate = (d: Date) => {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };

    const resetAll = (keepEndDate?: boolean) => {
      setFrequency("DAILY");
      const now = new Date();
      const fallbackDate = findNextAvailableDate(now) ?? now;
      const bounds = getEffectiveBounds(fallbackDate);
      const fallbackStart = bounds
        ? minutesToTime(bounds.startMinute)
        : `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const fallbackEndMinute = bounds
        ? Math.min(bounds.endMinute, bounds.startMinute + 60)
        : Math.min(MINUTES_IN_DAY - 1, now.getHours() * 60 + now.getMinutes() + 60);
      const fallbackEnd = minutesToTime(Math.max((timeToMinutes(fallbackStart) ?? 0) + 1, fallbackEndMinute));

      setStartHour(fallbackStart);
      setEndHour(fallbackEnd);
      setTitle("");
      setLocation("");
      setService("");
      setProfessional("");
      setActiveTab("consulta");
      setRepeatEnabled(false);
      setWeekDays([false, false, false, false, false, false, false]);
      setEndOption("never");
      if (!keepEndDate) setEndDate(formatDate(fallbackDate));
      setOccurrences(1);
      setClientId(null);
      setShowSuggestions(false);
      setSelectedDateState({
        day: fallbackDate.getDate(),
        month: fallbackDate.getMonth() + 1,
        year: fallbackDate.getFullYear(),
      });
    };

    const selectedEventKey = selectedEvent
      ? `event:${String(selectedEvent.id)}:${selectedEvent.start}:${selectedEvent.end}:${selectedEvent.dayNumber ?? selectedEvent.day}:${selectedEvent.month}:${selectedEvent.year}:${selectedEvent.type ?? "consulta"}`
      : null;
    const selectedDateTimeKey = selectedDateTime
      ? `date:${selectedDateTime.day}:${selectedDateTime.month ?? ""}:${selectedDateTime.year ?? ""}:${selectedDateTime.hour}:${selectedDateTime.endHour ?? ""}`
      : null;
    const sourceKey = selectedEventKey ?? selectedDateTimeKey ?? "new";

    const justOpened = isOpen && !wasOpenRef.current;
    wasOpenRef.current = isOpen;

    if (!isOpen) {
      initSourceKeyRef.current = null;
      resetAll();
      return;
    }

    if (!justOpened && initSourceKeyRef.current === sourceKey) {
      return;
    }

    initSourceKeyRef.current = sourceKey;

    if (selectedEvent) {
      setTitle(selectedEvent.title);
      setStartHour(selectedEvent.start);
      setEndHour(selectedEvent.end);
      setActiveTab(selectedEvent.type || "consulta");
      setLocation(selectedEvent.workplaceId || "");
      setService(selectedEvent.serviceId || "");
      setProfessional(selectedEvent.employeeId || "");
      setRepeatEnabled(false);
      setWeekDays([false, false, false, false, false, false, false]);
      setEndOption("never");
      setOccurrences(1);
      setClientId((selectedEvent as EventType & { clientId?: string }).clientId || null);
      setShowSuggestions(false);

      if (
        (typeof selectedEvent.day !== "undefined" || typeof selectedEvent.dayNumber !== "undefined") &&
        typeof selectedEvent.month !== "undefined" &&
        typeof selectedEvent.year !== "undefined"
      ) {
        const d = typeof selectedEvent.dayNumber === "number" ? selectedEvent.dayNumber : Number(selectedEvent.day);
        const m = Number(selectedEvent.month);
        const y = Number(selectedEvent.year);

        if (!Number.isNaN(d) && !Number.isNaN(m) && !Number.isNaN(y)) {
          setSelectedDateState({ day: d, month: m, year: y });
          setEndDate(`${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`);
        } else {
          const today = new Date();
          setSelectedDateState({ day: today.getDate(), month: today.getMonth() + 1, year: today.getFullYear() });
          setEndDate(formatDate(today));
        }
      } else {
        const today = new Date();
        setSelectedDateState({ day: today.getDate(), month: today.getMonth() + 1, year: today.getFullYear() });
        setEndDate(formatDate(today));
      }

      return;
    }

    if (selectedDateTime) {
      setStartHour(selectedDateTime.hour);
      setEndHour(selectedDateTime.endHour || getEndHour(selectedDateTime.hour));
      setTitle("");
      setLocation("");
      setService("");
      setProfessional("");
      setActiveTab("consulta");
      setRepeatEnabled(false);
      setWeekDays([false, false, false, false, false, false, false]);
      setEndOption("never");
      setOccurrences(1);
      setClientId(null);
      setShowSuggestions(false);

      if (
        typeof selectedDateTime.day !== "undefined" &&
        typeof selectedDateTime.month !== "undefined" &&
        typeof selectedDateTime.year !== "undefined"
      ) {
        setSelectedDateState({
          day: selectedDateTime.day,
          month: selectedDateTime.month!,
          year: selectedDateTime.year!,
        });
        setEndDate(`${String(selectedDateTime.day).padStart(2, "0")}/${String(selectedDateTime.month).padStart(2, "0")}/${selectedDateTime.year}`);
      } else {
        const today = new Date();
        setSelectedDateState({ day: today.getDate(), month: today.getMonth() + 1, year: today.getFullYear() });
        setEndDate(formatDate(today));
      }

      return;
    }

    resetAll();
  }, [findNextAvailableDate, getEffectiveBounds, isOpen, selectedDateTime, selectedEvent]);

  useEffect(() => {
    if (!isOpen || !selectedDateState) return;

    const selectedDate = new Date(selectedDateState.year, selectedDateState.month - 1, selectedDateState.day);

    if (!isDateSelectable(selectedDate)) {
      const nextAvailable = findNextAvailableDate(new Date());
      if (!nextAvailable) return;

      setSelectedDateState({
        day: nextAvailable.getDate(),
        month: nextAvailable.getMonth() + 1,
        year: nextAvailable.getFullYear(),
      });
      return;
    }

    const bounds = getEffectiveBounds(selectedDate);
    if (!bounds) return;

    const rawStartMinutes = timeToMinutes(startHour) ?? bounds.startMinute;
    const startMinutes = Math.min(Math.max(rawStartMinutes, bounds.startMinute), bounds.endMinute - 1);

    if (startMinutes !== rawStartMinutes) {
      setStartHour(minutesToTime(startMinutes));
    }

    const rawEndMinutes = timeToMinutes(endHour) ?? Math.min(bounds.endMinute, startMinutes + 60);
    const safeEndFloor = Math.min(bounds.endMinute, startMinutes + 1);
    const endMinutes = Math.min(Math.max(rawEndMinutes, safeEndFloor), bounds.endMinute);

    if (endMinutes !== rawEndMinutes) {
      setEndHour(minutesToTime(endMinutes));
    }
  }, [endHour, findNextAvailableDate, getEffectiveBounds, isDateSelectable, isOpen, selectedDateState, startHour]);

  useEffect(() => {
    if (clickPosition) {
       const initialX = (window.innerWidth - MODAL_WIDTH) / 2;
       const initialY = (window.innerHeight - MODAL_HEIGHT) / 2;

       // Calculate desired top/left based on click
       let targetX = clickPosition.x;
       let targetY = clickPosition.y;

       // Boundary checks (padding 20px)
       const PADDING = 20;
       
       // If right edge goes off-screen
       if (targetX + MODAL_WIDTH > window.innerWidth - PADDING) {
           targetX = window.innerWidth - MODAL_WIDTH - PADDING;
       }
       // If bottom edge goes off-screen (approximate height check)
       if (targetY + MODAL_HEIGHT > window.innerHeight - PADDING) {
           targetY = window.innerHeight - MODAL_HEIGHT - PADDING;
       }
       
       // If left/top go off-screen (negative)
       if (targetX < PADDING) targetX = PADDING;
       if (targetY < PADDING) targetY = PADDING;

       
       setPosition({
         x: targetX - initialX,
         y: targetY - initialY
       });
    } else {
       setPosition({ x: 0, y: 0 }); // 0 means use initial centered position
    }
  }, [clickPosition, isOpen]);

  useEffect(() => {
    if (!onDraftChange) return;

    if (!isOpen) {
      onDraftChange(null);
      return;
    }

    if (!selectedDateState || !startHour) return;

    onDraftChange({
      day: selectedDateState.day,
      month: selectedDateState.month,
      year: selectedDateState.year,
      startHour,
      endHour,
      type: activeTab === 'bloqueio' ? 'bloqueio' : 'consulta',
    });
  }, [activeTab, endHour, isOpen, onDraftChange, selectedDateState, startHour]);

  useEffect(() => {
    return () => {
      onDraftChange?.(null);
    };
  }, [onDraftChange]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { delta } = event;
    setPosition((prev) => ({
      x: prev.x + delta.x,
      y: prev.y + delta.y,
    }));
  };

  const handleSelectedDateChange = (next: SetStateAction<{ day: number; month: number; year: number } | null>) => {
    setSelectedDateState((prev) => {
      const resolvedNext = typeof next === "function" ? next(prev) : next;
      if (resolvedNext) {
        onNavigateWeekToDate?.(resolvedNext);
      }
      return resolvedNext;
    });
  };

  const selectedDateAsDate = selectedDateState
    ? new Date(selectedDateState.year, selectedDateState.month - 1, selectedDateState.day)
    : null;

  const selectedBounds = selectedDateAsDate ? getEffectiveBounds(selectedDateAsDate) : null;

  const blockedIntervalsForSelectedDate = useMemo(() => {
    if (!selectedDateState) return [] as Array<{ startMinute: number; endMinute: number }>;

    return calendarEvents
      .filter((event) => {
        if (event.type !== "bloqueio") return false;

        const eventDay = Number(event.dayNumber ?? event.day);
        const eventMonth = Number(event.month);
        const eventYear = Number(event.year);

        if (Number.isNaN(eventDay) || Number.isNaN(eventMonth) || Number.isNaN(eventYear)) return false;

        const isSameDate =
          eventDay === selectedDateState.day &&
          eventMonth === selectedDateState.month &&
          eventYear === selectedDateState.year;

        if (!isSameDate) return false;

        if (
          selectedEvent?.type === "bloqueio" &&
          String(selectedEvent.id) === String(event.id)
        ) {
          return false;
        }

        return true;
      })
      .map((event) => ({
        startMinute: timeToMinutes(event.start) ?? -1,
        endMinute: timeToMinutes(event.end) ?? -1,
      }))
      .filter((interval) => interval.startMinute >= 0 && interval.endMinute > interval.startMinute)
      .sort((a, b) => a.startMinute - b.startMinute);
  }, [calendarEvents, selectedDateState, selectedEvent]);

  const startDisabledTime: TimePickerProps["disabledTime"] = useCallback(() => {
    if (activeTab !== "consulta") {
      return {
        disabledHours: () => [],
        disabledMinutes: () => [],
      };
    }

    const isMinuteBlocked = (totalMinute: number) =>
      blockedIntervalsForSelectedDate.some(
        (interval) => totalMinute >= interval.startMinute && totalMinute < interval.endMinute,
      );

    const disabledHours = Array.from({ length: 24 }, (_, hour) => hour).filter((hour) => {
      for (let minute = 0; minute < 60; minute++) {
        if (!isMinuteBlocked(hour * 60 + minute)) return false;
      }
      return true;
    });

    return {
      disabledHours: () => disabledHours,
      disabledMinutes: (hour: number) =>
        Array.from({ length: 60 }, (_, minute) => minute).filter((minute) =>
          isMinuteBlocked(hour * 60 + minute),
        ),
    };
  }, [activeTab, blockedIntervalsForSelectedDate]);

  const startMinutes = timeToMinutes(startHour) ?? selectedBounds?.startMinute ?? 0;

  const nextBlockStartMinute =
    activeTab === "consulta"
      ? blockedIntervalsForSelectedDate.find((interval) => interval.startMinute > startMinutes)?.startMinute ?? null
      : null;

  const effectiveEndLimitMinute = selectedBounds
    ? Math.min(selectedBounds.endMinute, nextBlockStartMinute ?? selectedBounds.endMinute)
    : null;

  const startMinTime = selectedBounds ? minutesToTime(selectedBounds.startMinute) : undefined;
  const startMaxTime = selectedBounds ? minutesToTime(Math.max(selectedBounds.startMinute, selectedBounds.endMinute - 1)) : undefined;
  const endMinTime = selectedBounds
    ? minutesToTime(Math.min(selectedBounds.endMinute, Math.max(selectedBounds.startMinute + 1, startMinutes + 1)))
    : undefined;
  const endMaxTime = effectiveEndLimitMinute !== null ? minutesToTime(effectiveEndLimitMinute) : undefined;

  useEffect(() => {
    if (!isOpen || !selectedDateState || activeTab !== "consulta") return;

    const selectedDate = new Date(selectedDateState.year, selectedDateState.month - 1, selectedDateState.day);
    const bounds = getEffectiveBounds(selectedDate);
    if (!bounds) return;

    const startMinutesRaw = timeToMinutes(startHour);
    if (startMinutesRaw === null) return;

    const overlap = blockedIntervalsForSelectedDate.find(
      (interval) => startMinutesRaw >= interval.startMinute && startMinutesRaw < interval.endMinute,
    );

    if (overlap) {
      const nextStart = Math.min(Math.max(overlap.endMinute, bounds.startMinute), bounds.endMinute - 1);
      if (nextStart !== startMinutesRaw) {
        setStartHour(minutesToTime(nextStart));
        return;
      }
    }

    const nextBlockStart = blockedIntervalsForSelectedDate.find(
      (interval) => interval.startMinute > startMinutesRaw,
    )?.startMinute;

    const endCeiling = Math.min(bounds.endMinute, nextBlockStart ?? bounds.endMinute);
    const endMinutesRaw = timeToMinutes(endHour);
    if (endMinutesRaw === null) return;

    const minEnd = Math.min(endCeiling, Math.max(bounds.startMinute + 1, startMinutesRaw + 1));
    const clampedEnd = Math.min(Math.max(endMinutesRaw, minEnd), endCeiling);

    if (clampedEnd !== endMinutesRaw) {
      setEndHour(minutesToTime(clampedEnd));
    }
  }, [
    activeTab,
    blockedIntervalsForSelectedDate,
    endHour,
    getEffectiveBounds,
    isOpen,
    selectedDateState,
    setEndHour,
    setStartHour,
    startHour,
  ]);

  const blockProps = {
    title,
    setTitle,
    selectedDateTime: selectedDateState,
  setSelectedDateTime: handleSelectedDateChange,
    startHour,
    setStartHour,
    endHour,
    setEndHour,
    repeatEnabled,
    setRepeatEnabled,
    weekDays,
    setWeekDays,
    endOption,
    setEndOption,
    endDate,
    occurrences,
    setEndDate,
    setOccurrences,
    frequency,
    setFrequency,
    onClose,
    timeBlockId: selectedEvent?.type === 'bloqueio' ? String(selectedEvent.id) : undefined,
    disableDate: (date: Date) => !isDateSelectable(date),
    startMinTime,
    startMaxTime,
    endMinTime,
    endMaxTime,
    startDisabledTime,
  };

  const appointmentProps = {
    title,
    setTitle,
    selectedDateTime: selectedDateState,
  setSelectedDateTime: handleSelectedDateChange,
    startHour,
    setStartHour,
    endHour,
    setEndHour,
    location,
    setLocation,
    service,
    setService,
    professional,
    setProfessional,
    onClose,
    appointmentId: selectedEvent?.type === 'consulta' ? String(selectedEvent.id) : undefined,
    clientId,
    disableDate: (date: Date) => !isDateSelectable(date),
    startMinTime,
    startMaxTime,
    endMinTime,
    endMaxTime,
    startDisabledTime,
  };

  if (!isOpen) return null;

  const modalInner = (
    <div className={`flex flex-col w-full ${isMobile ? "max-w-none" : "max-w-[446px]"}`}>
      {/* Header Actions (Close) - Grip is handled by wrapper */}
      <div className={isMobile ? "flex items-center justify-between px-4 pt-3" : "flex justify-end pr-2 pt-2"}>
        {isMobile && <div className="h-1.5 w-10 rounded-full bg-white/20" />}
        <Button
          variant="ghost"
          className="bg-transparent hover:bg-white/10 h-8 w-8 rounded-full p-0 z-50"
          onClick={onClose}
        >
          <X className="text-gray-400 hover:text-white" size={20} />
        </Button>
      </div>

      <div className={isMobile ? "px-4 pb-6 pt-2 flex flex-col gap-4" : "px-6 pt-0 flex flex-col gap-4"}>
        {/* Title Input moved down */}

        {/* Tabs / Type Switcher */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex items-center gap-2 mb-4">
            <TabsList className="bg-transparent p-0 h-auto gap-2 border-0 w-full justify-start">
              <TabsTrigger
                value="consulta"
                disabled={Boolean(selectedEvent)}
                className="rounded-md px-6 py-2 text-sm font-medium border border-[#2d3152] bg-[#1a1e45] text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 hover:bg-blue-600/20 data-[state=active]:hover:bg-blue-700 transition-all cursor-pointer h-auto w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Consulta
              </TabsTrigger>
              <TabsTrigger
                value="bloqueio"
                disabled={Boolean(selectedEvent)}
                className="rounded-md px-6 py-2 text-sm font-medium border border-[#2d3152] bg-[#1a1e45] text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100 data-[state=active]:border-gray-500 hover:bg-gray-700/50 data-[state=active]:hover:bg-gray-600 transition-all cursor-pointer h-auto w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Bloqueio
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="w-full relative">
            <input
              type="text"
              placeholder={activeTab === 'consulta' ? "Nome do paciente" : "Adicionar título"}
              className="w-full bg-transparent border-0 border-b border-gray-600 text-2xl font-normal text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-0 py-2 transition-colors"
              value={title ?? ""}
              onChange={(e) => {
                setTitle(e.target.value);
                if (activeTab === 'consulta') {
                  setShowSuggestions(true);
                  setClientId(null);
                }
              }}
              onFocus={() => {
                if (activeTab === 'consulta') setShowSuggestions(true);
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              disabled={Boolean(selectedEvent)}
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-1">
              {activeTab === 'consulta' ? 'Adicione o nome do paciente para a consulta' : 'Defina um título para o bloqueio e agenda'}
            </p>

            {/* Suggestions List */}
            {showSuggestions && activeTab === 'consulta' && title && title.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 bg-[#1e224e] border border-gray-700 rounded-b-md shadow-lg max-h-60 overflow-y-auto mt-1">
                {/* Loading */}
                {isLoadingClients && (
                  <div className="p-3 text-sm text-gray-400">Carregando...</div>
                )}

                {/* Results */}
                {!isLoadingClients && clients && clients.length > 0 && (
                  <ul>
                    {clients.map((client) => (
                      <li
                        key={client.id}
                        className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white text-sm flex flex-col"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setTitle(client.name);
                          setClientId(client.id);
                          setShowSuggestions(false);
                        }}
                      >
                        <span>{client.name}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* No Results - Add Patient */}
                {!isLoadingClients && clients && clients.length === 0 && (
                  <div
                    className="px-4 py-3 hover:bg-white/10 cursor-pointer text-blue-400 text-sm flex items-center gap-2"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      navigate(`/patients/new?name=${encodeURIComponent(title || '')}`);
                    }}
                  >
                    <span>+ Adicionar paciente "{title}"</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <TabsContent value="bloqueio" className="mt-4">
            <BlockContent {...blockProps} />
          </TabsContent>
          <TabsContent value="consulta" className="mt-4">
            <AppoimentContent {...appointmentProps} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-[85%] max-w-[520px] max-h-[90vh] overflow-y-auto rounded-2xl bg-[#121535] shadow-2xl">
          {modalInner}
        </div>
      </div>
    );
  }

  return (
    <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
      <DraggableModalContent position={position}>
        {modalInner}
      </DraggableModalContent>
    </DndContext>
  );
};
