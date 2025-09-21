import { Button } from "@/components/ui/button";
import { WeeklyCalendar } from "@/components/WeeklyCalendar";
import { useState } from "react";
import { format, addWeeks, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FormModal } from "@/components/FormModal";
import { ListFilter, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Home = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'consulta' | 'bloqueio'>('all');

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
  const [selectedDateTime, setSelectedDateTime] = useState<{
    day: number;
    month: number;
    year: number;
    hour: string;
  } | null>(null);

  const handleDateClick = (
    date: { day: number; month: number; year: number },
    hour: string
  ) => {
    setSelectedDateTime({ ...date, hour });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

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
            <p className="w-[300px] capitalize">
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
          <div className="flex items-center gap-2">
            <Select value={filterType} onValueChange={(value: 'all' | 'consulta' | 'bloqueio') => setFilterType(value)}>
              <SelectTrigger className="w-[230px] !h-[48px] cursor-pointer !text-[16px] font-normal bg-[#141736] hover:bg-blue-950 text-white border-[#141736] [&>svg]:text-white">
                <div className="flex items-center gap-2">
                  <ListFilter className="w-4 h-4 text-white" />
                  <SelectValue placeholder="Filtrar por" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[16px]">Ver todos</SelectItem>
                <SelectItem value="consulta" className="text-[16px]">Apenas Consultas</SelectItem>
                <SelectItem value="bloqueio" className="text-[16px]">Apenas Bloqueios</SelectItem>
              </SelectContent>
            </Select>

            <Button className="h-[48px] !text-[16px] font-normal bg-[#141736] hover:bg-blue-950" onClick={() => {
              setIsModalOpen(true)
            }}>
              <Plus /> Novo Agendamento
            </Button>
          </div>
        </div>
      </header>
      <div className="flex">
        <WeeklyCalendar
          events={[
            {
              id: 1,
              title: "Reunião de Equipe",
              start: "09:00",
              end: "10:30",
              day: "Segunda",
              month: "09",
              year: 2025,
              type: "bloqueio",
            },
            {
              id: 2,
              title: "Consulta Médica",
              start: "14:00",
              end: "15:00",
              day: "Terça",
              month: "09",
              year: 2025,
              type: "consulta",
            },
            {
              id: 3,
              title: "Apresentação",
              start: "10:00",
              end: "11:30",
              day: "Quarta",
              month: "09",
              year: 2025,
              type: "bloqueio",
            },
            {
              id: 4,
              title: "Reunião Curta",
              start: "11:30",
              end: "12:00",
              day: "Quinta",
              month: "09",
              year: 2025,
              type: "bloqueio",
            },
            {
              id: 5,
              title: "Evento Longo",
              start: "11:30",
              end: "12:30",
              day: "Sexta",
              month: "12",
              year: 2025,
              type: "consulta",
            },
            {
              id: 6,
              title: "Evento de Janeiro",
              start: "08:00",
              end: "09:00",
              day: "Segunda",
              month: "01",
              year: 2025,
              type: "consulta",
            },
            {
              id: 7,
              title: "Evento de Novembro",
              start: "16:00",
              end: "17:00",
              day: "Terça",
              month: "11",
              year: 2025,
              type: "bloqueio",
            },
          ]}
          currentDate={currentDate}
          onDateClick={handleDateClick}
          filterType={filterType}
        />

        {/* <div className="w-fit flex flex-col gap-4 border-l border-l-[#DADCE0] p-2 h-[calc(100vh-85px)]">
          <div className="h-[340px]">
            <Calendar
              mode="single"
              locale={ptBR}
              selected={date}
              onSelect={handleDateSelect}
              onMonthChange={handleMonthChange}
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

          <section className="px-2 font-medium">
            <p>Próximos Agendamentos</p>
          </section> 
        </div> 
        */}
      </div>
      <FormModal
        isOpen={isModalOpen}
        selectedDateTime={selectedDateTime}
        onClose={handleCloseModal}
      />
    </div>
  );
};
