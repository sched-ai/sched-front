import React, { useRef, useEffect } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";

const weekDays = [
  "Domingo",
	"Segunda",
	"Terça",
	"Quarta",
	"Quinta",
	"Sexta",
	"Sábado",
];

const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

export type EventType = {
	id: number;
	title: string;
	day: string;
	start: string;
	end: string;
	month: string;
	year: number;
	type?: 'consulta' | 'bloqueio';
};

interface WeeklyCalendarProps {
	events: EventType[];
	currentDate: Date;
	onDateClick?: (date: { day: number; month: number; year: number }, hour: string) => void;
	onEventClick?: (event: EventType) => void;
	filterType?: 'all' | 'consulta' | 'bloqueio';
}

function getDayIndex(day: string) {
	return weekDays.indexOf(day);
}

function getHourPosition(time: string) {
	const [hours, minutes] = time.split(":").map(Number);
	const hourIndex = hours;
	const minuteOffset = minutes / 60;
	return {
		hourIndex,
		minuteOffset,
		totalPosition: hourIndex + minuteOffset
	};
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ 
  events, 
  currentDate,
  onDateClick,
  onEventClick,
  filterType = 'all'
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  
  const weekDates = Array.from({ length: 7 }, (_, index) => 
    addDays(weekStart, index)
  );

  useEffect(() => {
    if (scrollContainerRef.current) {
      const cellHeight = 80;
      const scrollPosition = 6 * cellHeight;
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, [currentDate]);

	const currentMonth = format(currentDate, 'MM');
	const currentYear = Number(format(currentDate, "yyyy"))
	
	// Primeiro filtra por mês e ano, depois por tipo
	let filteredEvents = events.filter(event => event.month === currentMonth && event.year === currentYear);
	
	// Aplica filtro por tipo se não for 'all'
	if (filterType !== 'all') {
		filteredEvents = filteredEvents.filter(event => event.type === filterType);
	}

	const eventMap = filteredEvents.map((event) => {
		const dayIdx = getDayIndex(event.day);
		const startPos = getHourPosition(event.start);
		const endPos = getHourPosition(event.end);
		return { 
			...event, 
			dayIdx, 
			startPos, 
			endPos 
		};
	});

	const handleCellClick = (dayIdx: number, hour: string) => {
		if (onDateClick) {
			const dateObj = weekDates[dayIdx];
			onDateClick(
				{
					day: dateObj.getDate(),
					month: dateObj.getMonth() + 1,
					year: dateObj.getFullYear(),
				},
				hour
			);
		}
	};

	const handleEventClick = (event: EventType, e: React.MouseEvent) => {
		e.stopPropagation(); // Previne que o clique na célula seja acionado
		if (onEventClick) {
			onEventClick(event);
		}
	};

		return (
			<div className="overflow-x-auto w-full custom-scrollbar">
				<div className="min-w-[900px]">
					<div className="flex">
						<div className="bg-white border-b max-w-[90px] w-full"></div>
						<div className="grid grid-cols-7 border-b bg-white sticky top-0 z-10 w-full pr-[10px]">
							{weekDays.map((day, idx) => {
								const currentDayDate = weekDates[idx];
								const isToday = isSameDay(currentDayDate, new Date());
								return (
									<div
										key={day}
										className={`py-2 px-2 text-center font-semibold flex justify-center items-center flex-col ${
											idx >= 5 ? "bg-gray-50" : "bg-white"
										} ${isToday ? "bg-blue-100 text-blue-600" : ""}`}
									>
										<p className="text-sm">{day}</p>
										<p className={`text-lg ${isToday ? "font-bold bg-blue-600 text-white w-fit rounded-full px-2 text-center" : ""}`}>
											{format(currentDayDate, "d")}
										</p>
									</div>
								);
							})}
						</div>
					</div>
					  <div 
						ref={scrollContainerRef}
						className="overflow-auto h-[calc(100vh-150px)] custom-scrollbar"
					  >
						<div className="flex">
							<div className="flex flex-col max-w-[90px] pl-5 w-full">
								{hours.map((hour) => (
									<div
										key={hour}
										className="h-[80px] text-md text-right pr-2 flex items-center max-w-[50px]"
									>
										{hour}
									</div>
								))}
							</div>
							<div className="grid grid-cols-7 w-full">
								{weekDays.map((day, dayIdx) => (
									<div
										key={day}
										className={`flex flex-col relative border-l ${
											dayIdx >= 5 ? "bg-gray-50" : "bg-white"
										}`}
									>
										{hours.map((hour) => (
											<div
												key={hour}
												className="h-[80px] border-b border-gray-200 hover:bg-blue-50"
												onClick={() => handleCellClick(dayIdx, hour)}
											></div>
										))}
										{eventMap
											.filter((ev) => ev.dayIdx === dayIdx)
											.map((ev) => {
												const cellHeight = 80;
												const top = ev.startPos.totalPosition * cellHeight;
												const height = (ev.endPos.totalPosition - ev.startPos.totalPosition) * cellHeight;
												return (
													<div
														key={ev.id}
														className="absolute w-full rounded bg-blue-500 text-white px-2 py-1 text-xs shadow-md hover:scale-105 cursor-pointer hover:animate-pulse transition-all"
														style={{
															top: `${top}px`,
															height: `${height}px`,
															minHeight: `${Math.max(height, 20)}px`,
															zIndex: 20,
															backgroundColor: dayIdx >= 5 ? "#60a5fa" : "#050a35",
														}}
														onClick={(e) => handleEventClick(ev, e)}
													>
														{ev.title}
														<span className="block text-[10px] mt-1">
															{ev.start} - {ev.end}
														</span>
													</div>
												);
											})}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
};
