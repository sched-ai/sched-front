import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WeeklyCalendar } from "@/components/WeeklyCalendar";
import { useState } from "react";

export const Home = () => {
  const [calendarView, setCalendarView] = useState('semana');
  return (
    <div className="w-full">
      <header className="border-b border-b-[#DADCE0]">
        <div className="p-4 text-[30px] flex items-center gap-4">
          <p>1-7 Janeiro 2025</p>
          <Select defaultValue="semana" onValueChange={setCalendarView}>
            <SelectTrigger className="w-[180px] text-[#141736] border-[#141736] [&_svg]:text-[#141736] cursor-pointer">
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
      { calendarView === 'semana' &&
        <WeeklyCalendar events={[]} />
      }
    </div>
  );
};
