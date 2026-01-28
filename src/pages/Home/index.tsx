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

  const { data: calendar = [], isLoading } = useGetCalendar({
    referenceDate: currentDate,
  });

  const handleDateClick = (
    date: { day: number; month: number; year: number },
    hour: string,
  ) => {
    setScheduleFormSelectedDateTime({ ...date, hour });
    setIsScheduleFormOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsScheduleFormOpen(false);
    setScheduleFormSelectedDateTime(null);
  };

  const handleCloseViewModal = () => {
    setIsScheduleViewOpen(false);
    setScheduleViewDetails(null);
  };

  const handleEventClick = (event: EventType) => {
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
    setIsScheduleViewOpen(true);
  };

  const scheduleViewModalProps = {
    isOpen: isScheduleViewOpen,
    onClose: handleCloseViewModal,
    details: scheduleViewDetails,
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
            <h1 className="w-[290px]">
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
        onClose={handleCloseFormModal}
      />
      <ScheduleViewModal {...scheduleViewModalProps} />
    </div>
  );
};
