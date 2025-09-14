import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WeeklyCalendar } from "@/components/WeeklyCalendar";
import { useState } from "react";
import { format, addWeeks, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";

export const Home = () => {
  const [calendarView, setCalendarView] = useState("semana");
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePreviousWeek = () => {
    setCurrentDate((prev) => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => addWeeks(prev, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setDate(now);
  };

  const handleDateClick = (day: string, hour: string) => {
    console.log(`Clicou em ${day} às ${hour}`);
  };

	const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="w-full">
      <header className="border-b border-b-[#DADCE0]">
        <div className="p-4 text-[30px] flex items-center gap-4 justify-between">
          <div className="font-medium text-[#141736] flex items-center gap-4">
            <Button
              variant="outline"
              className="text-[#141736] border-[#141736] p-4"
              onClick={handleToday}
            >
              HOJE
            </Button>
            <p className="w-[300px]">
              {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </p>
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
          <Select defaultValue="semana" onValueChange={setCalendarView}>
            <SelectTrigger className="w-[180px] text-[#141736] border-[#141736] [&_svg]:text-[#141736] cursor-pointer !h-[48px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent className="cursor-pointer">
              <SelectItem value="semana">Semana</SelectItem>
              <SelectItem value="dia">Dia</SelectItem>
              <SelectItem value="mes">Mês</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>
      <div className="flex">
        {calendarView === "semana" && (
          <WeeklyCalendar
            events={[]}
            currentDate={currentDate}
            onDateClick={handleDateClick}
          />
        )}
        <div className="h-full max-w-[280px] w-full flex justify-center">
          <Calendar
            mode="single"
            locale={ptBR}
            selected={date}
            onSelect={setDate}
            className="rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};
