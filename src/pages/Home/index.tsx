import { Button } from "@/components/ui/button";
import { WeeklyCalendar, type EventType } from "@/components/WeeklyCalendar";
import { useEffect, useState } from "react";
import { format, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScheduleFormModal } from "@/components/ScheduleFormModal";
import { Plus } from "lucide-react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import useGetCalendar from "@/hooks/api/useGetCalendar";
import { Spinner } from "@/components/ui/spinner";
import { ScheduleViewModal } from "@/components/ScheduleViewModal";
import { capitalizeFirst } from "@/util/helper";
import { useUser } from "@/context/user";
import { PackageBindModal } from "@/components/PackageBindModal";
import { PackagePlus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const Home = () => {
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [viewModeTouched, setViewModeTouched] = useState(false);
  // const [filterType, setFilterType] = useState<"all" | "consulta" | "bloqueio">(
  //   "all",
  // );

  const handlePreviousRange = () => {
    setCurrentDate((prev) => (viewMode === "day" ? subDays(prev, 1) : subWeeks(prev, 1)));
  };

  const handleNextRange = () => {
    setCurrentDate((prev) => (viewMode === "day" ? addDays(prev, 1) : addWeeks(prev, 1)));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now));
  };

  useEffect(() => {
    if (viewModeTouched) return;
    setViewMode(isMobile ? "day" : "week");
  }, [isMobile, viewModeTouched]);
  const [scheduleFormSelectedDateTime, setScheduleFormSelectedDateTime] = useState<{
    day: number;
    month: number;
    year: number;
    hour: string;
    endHour?: string;
  } | null>(null);
  const [scheduleDraftEvent, setScheduleDraftEvent] = useState<{
    day: number;
    month: number;
    year: number;
    startHour: string;
    endHour?: string;
    type?: 'consulta' | 'bloqueio';
  } | null>(null);

  const [isScheduleViewOpen, setIsScheduleViewOpen] = useState(false);
  const [scheduleViewDetails, setScheduleViewDetails] = useState<{
    title: string;
    localDateTime?: Date | null;
    start?: string;
    end?: string;
    services?: string[];
    serviceId?: string;
    workplaceName?: string;
    professionalName?: string;
    type?: 'consulta' | 'bloqueio';
  } | null>(null);
  
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [viewModalPosition, setViewModalPosition] = useState<{ top: number; left: number } | null>(null);
  const [scheduleFormPosition, setScheduleFormPosition] = useState<{ x: number; y: number } | null>(null);

  


  const { userData } = useUser();
  const { data = { events: [] }, isLoading } = useGetCalendar({
    referenceDate: currentDate,
    enabled: !!userData && userData.onboardingStep >= 5
  });

  const handleDateClick = (
    date: { day: number; month: number; year: number },
    hour: string,
    rect?: DOMRect
  ) => {
    const weekStart = new Date(date.year, date.month - 1, date.day);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // get sunday

    const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

    const dayEvents = data.events.filter((ev: EventType) => {
      const evMonth = typeof ev.month === 'string' ? Number(ev.month) : ev.month;
      const evYear = Number(ev.year);
      
      let evDateMatches = false;
      if (typeof ev.dayNumber === 'number') {
        evDateMatches = ev.dayNumber === date.day && evMonth === date.month && evYear === date.year;
      } else {
        const dayIndex = dayNames.indexOf(ev.day);
        const eventDate = new Date(weekStart);
        eventDate.setDate(weekStart.getDate() + dayIndex);
        evDateMatches = eventDate.getDate() === date.day && (eventDate.getMonth() + 1) === date.month && eventDate.getFullYear() === date.year;
      }
      return evDateMatches;
    });

    const [startH = "0", startM = "0"] = hour.split(":");
    const hourMin = Number(startH) * 60 + Number(startM);
    let nextStartMin = hourMin + 60; // Max 1 hour

    for (const ev of dayEvents) {
      if (!ev.start) continue;
      const [evH = "0", evM = "0"] = ev.start.split(":");
      const evMin = Number(evH) * 60 + Number(evM);
      if (evMin > hourMin && evMin < nextStartMin) {
        nextStartMin = evMin;
      }
    }

    const nextHourRaw = Math.floor(nextStartMin / 60);
    const nextMinRaw = nextStartMin % 60;
    const defaultEnd = `${String(nextHourRaw).padStart(2, "0")}:${String(nextMinRaw).padStart(2, "0")}`;

    setScheduleFormSelectedDateTime({ ...date, hour, endHour: defaultEnd });
    setScheduleDraftEvent({ ...date, startHour: hour, endHour: defaultEnd, type: 'consulta' });
    setSelectedEvent(null);
    
    if (rect && !isMobile) {
      let x = rect.right + 12;
      let y = rect.top;

      // Basic overflow check
      if (x + 400 > window.innerWidth) {
        x = rect.left - 412; // 400 width + 12 gap
      }
      if (y + 500 > window.innerHeight) {
        y = window.innerHeight - 520;
      }
      if (y < 20) y = 20;
      
      setScheduleFormPosition({ x, y });
    } else {
      setScheduleFormPosition(null);
    }

    setIsScheduleViewOpen(false);
    setIsScheduleFormOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsScheduleFormOpen(false);
    setScheduleFormSelectedDateTime(null);
    setScheduleDraftEvent(null);
    setSelectedEvent(null);
  };

  const handleCloseViewModal = () => {
    setIsScheduleViewOpen(false);
    setScheduleViewDetails(null);
    setSelectedEvent(null);
    setViewModalPosition(null);
  };

  const handleEditEvent = () => {
    setIsScheduleViewOpen(false);
    setIsScheduleFormOpen(true);
    setViewModalPosition(null);
  };

  const handleEventClick = (event: EventType, rect: DOMRect) => {
    // Calcula a data do evento dentro da semana atual
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());

    const dayNames = [
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ];
    const dayIndex = dayNames.indexOf(event.day);

    const eventDate = new Date(weekStart);
    eventDate.setDate(weekStart.getDate() + dayIndex);

    const [startH = "0", startM = "0"] = (event.start || "00:00").split(":");
    const localDateTime = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate(),
      Number(startH),
      Number(startM),
    );

    setScheduleViewDetails({
      title: event.title,
      localDateTime,
      start: event.start,
      end: event.end,
      services: (event as EventType).services ?? [],
      serviceId: (event as EventType).serviceId ?? '',
      workplaceName: (event as EventType).workplaceName,
      professionalName: (event as EventType).professionalName,
      type: (event as EventType).type,
    }); 

    setSelectedEvent(event);
  setScheduleDraftEvent(null);
    
    // Position Logic
    const targetRect = rect || {
        top: window.innerHeight / 2 - 200,
        left: window.innerWidth / 2 - 200,
        right: window.innerWidth / 2 + 200,
        bottom: window.innerHeight / 2 + 200,
        width: 400,
        height: 400,
        x: 0,
        y: 0,
        toJSON: () => {}
    } as DOMRect;

    if (!rect) console.warn("handleEventClick: rect is missing, using fallback");

    if (!isMobile) {
      let left = targetRect.right + 12;
      let top = targetRect.top;

      if (left + 425 > window.innerWidth) {
         left = targetRect.left - 437; // 12px gap + 425px width
      }
      
      if (top + 400 > window.innerHeight) {
          top = window.innerHeight - 420;
      }
      if (top < 10) top = 10;

      setViewModalPosition({ top, left });
    } else {
      setViewModalPosition(null);
    }
    setIsScheduleFormOpen(false);
    setIsScheduleViewOpen(true);
  };

  const scheduleViewModalProps = {
    isOpen: isScheduleViewOpen,
    onClose: handleCloseViewModal,
    details: scheduleViewDetails,
    onEdit: handleEditEvent,
    position: viewModalPosition,
    selectedEvent: selectedEvent
  };

  return (
    <div className="w-full flex flex-col">
      <header className="border-b border-b-[#DADCE0]">
        <div className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="text-gray-700 font-medium border-gray-200 h-10 px-5 rounded-lg hover:bg-gray-50 hover:text-blue-600 hover:border-blue-100 transition-colors shadow-sm"
              onClick={handleToday}
            >
              HOJE
            </Button>
            <h1 className="text-lg md:text-2xl font-semibold text-gray-800 tracking-tight">
              {`${capitalizeFirst(format(currentDate, "MMMM", { locale: ptBR }))} de ${format(currentDate, "yyyy", { locale: ptBR })}`}
            </h1>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 w-10 h-10 rounded-full p-0"
                onClick={handlePreviousRange}
              >
                &lt;
              </Button>
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 w-10 h-10 rounded-full p-0"
                onClick={handleNextRange}
              >
                &gt;
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap sm:justify-end">
            <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => {
                  setViewMode("day");
                  setViewModeTouched(true);
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                  viewMode === "day"
                    ? "bg-[#141736] text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Dia
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode("week");
                  setViewModeTouched(true);
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                  viewMode === "week"
                    ? "bg-[#141736] text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Semana
              </button>
            </div>

            <Button
              className="h-[48px] !text-[15px] font-medium bg-[#141736] text-white transition-all duration-300 hover:shadow-emerald-500/30 rounded-xl px-6"
              onClick={() => setIsPackageModalOpen(true)}
            >
              <PackagePlus className="w-5 h-5 mr-1" /> Vincular Pacote
            </Button>
            <Button
              className="hidden lg:inline-flex h-[48px] !text-[15px] font-medium bg-gradient-to-r bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:shadow-blue-500/30 rounded-xl px-6"
              onClick={() => {
                setIsScheduleViewOpen(false);
                setScheduleViewDetails(null);
                setScheduleFormSelectedDateTime(null);
                setIsScheduleFormOpen(true);
              }}
            >
              <Plus className="w-5 h-5 mr-1" /> Agendar
            </Button>
            {/* <Select
              value={filterType}
              onValueChange={(value: "all" | "consulta" | "bloqueio") =>
                setFilterType(value)
              }
            >
              <SelectTrigger className="w-[160px] !h-[48px] cursor-pointer !text-[14px] font-medium text-gray-700 bg-white hover:bg-gray-50 border-gray-200 rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-blue-100">
                <div className="flex items-center gap-2.5">
                  <ListFilter className="w-4 h-4 text-gray-500" />
                  <SelectValue placeholder="Filtrar por" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl border-gray-100">
                <SelectItem value="all" className="text-[14px] py-3 cursor-pointer">
                  Ver todos
                </SelectItem>
                <SelectItem value="consulta" className="text-[14px] py-3 cursor-pointer">
                  Consultas
                </SelectItem>
                <SelectItem value="bloqueio" className="text-[14px] py-3 cursor-pointer">
                  Bloqueios
                </SelectItem>
              </SelectContent>
            </Select> */}
          </div>
        </div>
      </header>
      <div className="flex">
        <div className="relative w-full">
          {isLoading ? (
            <div className="flex justify-center items-center h-[400px]">
              <Spinner className="text-primary" />
            </div>
          ) : (
            <WeeklyCalendar
              events={data.events}
              availableHours={data.availableHours}
              currentDate={currentDate}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
              filterType={'all'}
              isDraftVisible={isScheduleFormOpen}
              draftEvent={scheduleDraftEvent}
              viewMode={viewMode}
              onNavigatePrev={handlePreviousRange}
              onNavigateNext={handleNextRange}
            />
          )}
        </div>
      </div>
      <ScheduleFormModal
        isOpen={isScheduleFormOpen}
        selectedDateTime={scheduleFormSelectedDateTime}
        selectedEvent={selectedEvent}
        onClose={handleCloseFormModal}
        clickPosition={isMobile ? null : scheduleFormPosition}
        onDraftChange={setScheduleDraftEvent}
        availableHours={data.availableHours}
        calendarEvents={data.events}
        onNavigateWeekToDate={(date) => {
          setCurrentDate(new Date(date.year, date.month - 1, date.day));
        }}
      />
      <ScheduleViewModal {...scheduleViewModalProps} position={isMobile ? null : viewModalPosition} />
      <PackageBindModal isOpen={isPackageModalOpen} onClose={() => setIsPackageModalOpen(false)} />
    </div>
  );
};
