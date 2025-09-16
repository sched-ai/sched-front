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
import { Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormModal } from "@/components/FormModal";

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
    setCurrentDate(new Date(now));
    setDate(undefined);
    setTimeout(() => setDate(new Date(now)), 0);
  };

  const handleDateClick = (day: string, hour: string) => {
    console.log(`Clicou em ${day} às ${hour}`);
  };

  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="w-full flex flex-col">
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
          <Select
            defaultValue="semana"
            onValueChange={setCalendarView}
            disabled
          >
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
        <div className="w-fit flex flex-col gap-4 border-l border-l-[#DADCE0] p-2 h-[calc(100vh-85px)]">
          <div className="h-[340px]">
            <Calendar
              mode="single"
              locale={ptBR}
              selected={date}
              onSelect={setDate}
              className="rounded-lg"
            />
          </div>

          <Button className="!text-[16px] font-normal">
            <Plus /> Novo Agendamento
          </Button>
          <div className="px-2">
            <p className="text-[16px] mb-2">Filtrar por</p>
            <div className="flex items-center gap-2 mb-1">
              <Checkbox
                className="border-foreground text-foreground cursor-pointer"
                title="bloqueios"
              />
              <label>Bloqueios</label>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Checkbox
                className="border-foreground cursor-pointer text-foreground"
                title="agendamentos"
              />
              <label>Agendamentos</label>
            </div>
          </div>

          {/* <section className="px-2 font-medium">
            <p>Próximos Agendamentos</p>
          </section> */}
        </div>
      </div>
      <FormModal isOpen/>
    </div>
  );
};
