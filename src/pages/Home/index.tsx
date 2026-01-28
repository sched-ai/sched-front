import { Button } from "@/components/ui/button";
import { WeeklyCalendar, type EventType } from "@/components/WeeklyCalendar";
import { useState } from "react";
import { format, addWeeks, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScheduleFormModal } from "@/components/ScheduleFormModal";
import { ListFilter, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useGetCalendar from "@/hooks/api/useGetCalendar";
import { Spinner } from "@/components/ui/spinner";
import { ScheduleViewModal } from "@/components/ScheduleViewModal";
import { capitalizeFirst } from "@/util/helper";

export const Home = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "consulta" | "bloqueio">(
    "all",
  );

  const handlePreviousWeek = () => {
    setCurrentDate((prev) => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => addWeeks(prev, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now));
  };
  const [scheduleFormSelectedDateTime, setScheduleFormSelectedDateTime] = useState<{
    day: number;
    month: number;
    year: number;
    hour: string;
  } | null>(null);

  const [isScheduleViewOpen, setIsScheduleViewOpen] = useState(false);
  const [scheduleViewDetails, setScheduleViewDetails] = useState<{
    title: string;
    localDateTime?: Date | null;
    start?: string;
    end?: string;
    services?: string[];
    workplaceName?: string;
    type?: 'consulta' | 'bloqueio';
  } | null>(null);
  
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [viewModalPosition, setViewModalPosition] = useState<{ top: number; left: number } | null>(null);
  


  const { data: calendar = [], isLoading } = useGetCalendar({
    referenceDate: currentDate,
  });

  const handleDateClick = (
    date: { day: number; month: number; year: number },
    hour: string,
  ) => {
    setScheduleFormSelectedDateTime({ ...date, hour });
    setSelectedEvent(null);
    setIsScheduleFormOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsScheduleFormOpen(false);
    setScheduleFormSelectedDateTime(null);
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


    console.log('Event clicked:', event);

    setScheduleViewDetails({
      title: event.title,
      localDateTime,
      start: event.start,
      end: event.end,
      services: (event as EventType).services ?? [],
      workplaceName: (event as EventType).workplaceName,
      type: (event as EventType).type,
    }); 

    setSelectedEvent(event);
    
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
    setIsScheduleViewOpen(true);
  };

  const scheduleViewModalProps = {
    isOpen: isScheduleViewOpen,
    onClose: handleCloseViewModal,
    details: scheduleViewDetails,
    onEdit: handleEditEvent,
    position: viewModalPosition,
  };

  return (
    <div className="w-full flex flex-col">
      <header className="border-b border-b-[#DADCE0] max-h-[80px]">
        <div className="p-4 text-[30px] flex items-center gap-4 justify-between">
          <div className="font-medium text-[#141736] flex items-center gap-4">
            <Button
              variant="outline"
              className="text-[#141736] border-[#141736] p-4"
              onClick={handleToday}
            >
              HOJE
            </Button>
            <h1 className="w-[235px] text-[24px]">
              {`${capitalizeFirst(format(currentDate, "MMMM", { locale: ptBR }))} de ${format(currentDate, "yyyy", { locale: ptBR })}`}
            </h1>
            <div className="flex">
              <Button
                variant="ghost"
                className="text-[#141736] p-4"
                onClick={handlePreviousWeek}
              >
                &lt;
              </Button>
              <Button
                variant="ghost"
                className="text-[#141736] p-4"
                onClick={handleNextWeek}
              >
                &gt;
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="h-[48px] !text-[16px] font-normal bg-[#141736] hover:bg-blue-950"
              onClick={() => {
                setIsScheduleViewOpen(false);
                setScheduleViewDetails(null);
                setScheduleFormSelectedDateTime(null);
                setIsScheduleFormOpen(true);
              }}
            >
              <Plus /> Agendar
            </Button>
            <Select
              value={filterType}
              onValueChange={(value: "all" | "consulta" | "bloqueio") =>
                setFilterType(value)
              }
            >
              <SelectTrigger className="w-[155px] !h-[48px] cursor-pointer !text-[16px] font-normal text-[#141736] hover:bg-blue-50 border-[#141736] [&>svg]:text-white">
                <div className="flex items-center gap-2">
                  <ListFilter className="w-4 h-4 text-[#141736]" />
                  <SelectValue placeholder="Filtrar por" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[16px]">
                  Ver todos
                </SelectItem>
                <SelectItem value="consulta" className="text-[16px]">
                  Consultas
                </SelectItem>
                <SelectItem value="bloqueio" className="text-[16px]">
                  Bloqueios
                </SelectItem>
              </SelectContent>
            </Select>
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
              events={calendar}
              currentDate={currentDate}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
              filterType={filterType}
            />
          )}
        </div>
      </div>
      <ScheduleFormModal
        isOpen={isScheduleFormOpen}
        selectedDateTime={scheduleFormSelectedDateTime}
        selectedEvent={selectedEvent}
        onClose={handleCloseFormModal}
      />
      <ScheduleViewModal {...scheduleViewModalProps} />
    </div>
  );
};
