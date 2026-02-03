import React, { useRef, useEffect, useState } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { Plus } from "lucide-react";

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
	id: number | string;
	title: string;
	day: string;
	dayNumber?: number;
	start: string;
	end: string;
	month: string;
	year: number;
	workplaceId?: string;
	workplaceName?: string;
	services?: string[];
	type?: 'consulta' | 'bloqueio';
};

interface WeeklyCalendarProps {
	events: EventType[];
	currentDate: Date;
	onDateClick?: (date: { day: number; month: number; year: number }, hour: string, rect?: DOMRect) => void;
	onEventClick?: (event: EventType, rect: DOMRect) => void;
	filterType?: 'all' | 'consulta' | 'bloqueio';
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
	const leftColumnRef = useRef<HTMLDivElement>(null);
	const [nowIndicator, setNowIndicator] = useState<{
		top: number;
		dayIdx: number;
		left: number;
	} | null>(null);
	const CELL_HEIGHT = 80;
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  
  const weekDates = Array.from({ length: 7 }, (_, index) => 
    addDays(weekStart, index)
  );

  useEffect(() => {
    if (scrollContainerRef.current) {
			const scrollPosition = 6 * CELL_HEIGHT;
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, [currentDate]);

	useEffect(() => {
		let mounted = true;
		const updateNow = () => {
			const now = new Date();
			const dayIdxNow = weekDates.findIndex((d) => isSameDay(d, now));
			if (dayIdxNow === -1) {
				if (mounted) setNowIndicator(null);
				return;
			}
			const timeStr = format(now, "HH:mm");
			const pos = getHourPosition(timeStr);
			const left = leftColumnRef.current?.offsetWidth ?? 80;
			if (mounted)
				setNowIndicator({ top: pos.totalPosition * CELL_HEIGHT, dayIdx: dayIdxNow, left });
		};

		updateNow();
		const id = setInterval(updateNow, 30 * 1000);
		return () => {
			mounted = false;
			clearInterval(id);
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Filtra eventos para a semana exibida (não apenas por mês/ano)
	const filteredEventsByWeek = events.filter((event) => {
		const eventMonthNum = typeof event.month === 'string' ? Number(event.month) : event.month;
		const eventYearNum = Number(event.year);

		if (typeof event.dayNumber === 'number') {
			return weekDates.some((d) =>
				d.getDate() === event.dayNumber &&
				d.getMonth() + 1 === eventMonthNum &&
				d.getFullYear() === eventYearNum,
			);
		}
		return weekDates.some((d) =>
			d.getMonth() + 1 === eventMonthNum &&
			d.getFullYear() === eventYearNum &&
			weekDays[d.getDay()] === event.day,
		);
	});

	let filteredEvents = filteredEventsByWeek;
	if (filterType !== 'all') {
		filteredEvents = filteredEvents.filter((event) => event.type === filterType);
	}

	const eventMap = filteredEvents.map((event) => {
		const eventMonthNum = typeof event.month === 'string' ? Number(event.month) : event.month;
		const eventYearNum = Number(event.year);

		const dayIdx = typeof event.dayNumber === 'number'
			? weekDates.findIndex((d) =>
				d.getDate() === event.dayNumber &&
				d.getMonth() + 1 === eventMonthNum &&
				d.getFullYear() === eventYearNum,
			)
			: weekDates.findIndex((d) =>
				d.getMonth() + 1 === eventMonthNum &&
				d.getFullYear() === eventYearNum &&
				weekDays[d.getDay()] === event.day,
			);
		const startPos = getHourPosition(event.start);
		const endPos = getHourPosition(event.end);
		return {
			...event,
			dayIdx,
			startPos,
			endPos,
			duration: endPos.totalPosition - startPos.totalPosition
		};
	});

	const handleCellClick = (dayIdx: number, hour: string, e: React.MouseEvent<HTMLDivElement>) => {
		if (onDateClick) {
			const dateObj = weekDates[dayIdx];
			const rect = e.currentTarget.getBoundingClientRect();
			onDateClick(
				{
					day: dateObj.getDate(),
					month: dateObj.getMonth() + 1,
					year: dateObj.getFullYear(),
				},
				hour,
				rect
			);
		}
	};

	const handleEventClick = (event: EventType, e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation(); // Previne que o clique na célula seja acionado
		if (onEventClick) {
			onEventClick(event, e.currentTarget.getBoundingClientRect());
		}
	};

		return (
			<div className="w-full bg-white h-[calc(100vh-80px)] flex flex-col rounded-tl-2xl overflow-hidden border border-gray-200/50 shadow-sm">
				<div 
        ref={scrollContainerRef}
        className="overflow-auto w-full h-full custom-scrollbar relative"
        >
          <div className="min-w-[900px]">
            {/* Header Sticky */}
            <div className="flex z-40 sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="min-w-[70px] max-w-[70px] w-full border-r border-gray-200 bg-gray-50/30"></div>
              <div className="grid grid-cols-7 w-full divide-x divide-gray-200">
                {weekDays.map((day, idx) => {
                  const currentDayDate = weekDates[idx];
                  const isToday = isSameDay(currentDayDate, new Date());
                  return (
                    <div
                      key={day}
                      className={`py-4 text-center flex flex-col items-center gap-1.5 ${idx >= 5 ? 'bg-gray-50/40' : ''}`}
                    >
                      <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                        {day.substring(0, 3)}
                      </span>
                      <div className={`text-xl font-medium flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 ${
                        isToday 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110" 
                          : "text-gray-700 hover:bg-gray-100"
                      }`}>
                        {format(currentDayDate, "d")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex relative min-h-[1920px]">
              {/* Time Column */}
              <div className="flex flex-col min-w-[70px] max-w-[70px] w-full bg-white border-r border-gray-200 sticky left-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                <div ref={leftColumnRef} className="w-full">
                  {hours.map((hour, i) => (
                    <div
                      key={hour}
                      className="h-[80px] text-[11px] font-medium text-gray-400 relative"
                    >
                      <span className={`absolute right-3 bg-white px-1 text-gray-400 font-sans tracking-tight ${i === 0 ? 'top-2' : '-top-3'}`}>
                        {hour}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Time Indicator */}
              {nowIndicator && (
                <div
                  className="absolute pointer-events-none z-30 flex items-center w-full"
                  style={{
                    top: `${nowIndicator.top}px`,
                  }}
                >
                  <div className="w-[70px] flex justify-end pr-2 absolute left-0">
                    {/* Text removed as requested */}
                  </div>
                  <div className="flex-1 relative w-full" style={{ marginLeft: '70px' }}>
                    <div
                      className="absolute -left-[5px] -top-1.5 w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-50 shadow-sm"
                    />
                    <div className="h-[2px] w-full bg-gradient-to-r from-red-500/80 to-red-500/20 shadow-[0_1px_4px_rgba(239,68,68,0.3)]" />
                  </div>
                </div>
              )}

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 w-full divide-x divide-gray-200">
                {weekDays.map((day, dayIdx) => (
                  <div
                    key={day}
                    className={`flex flex-col relative ${
                      dayIdx >= 5 ? "bg-gray-50/20" : ""
                    }`}
                  >
                    {/* Grid Lines */}
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="h-[80px] border-b border-gray-200 relative group transition-colors hover:bg-blue-50/20 cursor-pointer"
                        onClick={(e) => handleCellClick(dayIdx, hour, e)}
                      >
                        {/* Hover Plus Icon */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="w-8 h-8 rounded-full bg-blue-50/80 flex items-center justify-center backdrop-blur-sm shadow-sm ring-1 ring-blue-100">
                              <Plus className="w-5 h-5 text-blue-500" />
                            </div>
                        </div>
                      </div>
                    ))}

                    {/* Events */}
                    {eventMap
                      .filter((ev) => ev.dayIdx === dayIdx)
                      .map((ev) => {
                        const cellHeight = 80;
                        const top = ev.startPos.totalPosition * cellHeight;
                        const height = (ev.endPos.totalPosition - ev.startPos.totalPosition) * cellHeight;
                        const isShort = height <= 50;
                        const isConsultation = ev.type === 'consulta';
                        
                        return (
                          <div
                            key={ev.id}
                            className={`absolute w-[calc(100%-8px)] left-1 rounded-lg border ${
                              isConsultation
                                ? 'border-blue-400/20 shadow-sm shadow-blue-500/10 z-20 hover:shadow-md hover:shadow-blue-500/20' 
                                : 'border-slate-500/10 z-10'
                            } px-2.5 py-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] overflow-hidden group`}
                            style={{
                              top: `${top + 1}px`, // Slight offset
                              height: `${height - 3}px`, // Slight gap
                              minHeight: `${Math.max(height - 3, 30)}px`,
                              background: isConsultation 
                                  ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" 
                                  : "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                              color: isConsultation ? "#fff" : "#1e293b",
                            }}
                            onClick={(e) => handleEventClick(ev, e)}
                          >
                            <div className="flex flex-col h-full relative">
                               {/* Left accent bar */}
                              <div className={`absolute left-[-10px] top-0 bottom-0 w-[4px] ${isConsultation ? 'bg-white/30' : 'bg-slate-400/30'}`}></div>

                              <div className="font-semibold text-xs truncate leading-tight pr-1 tracking-tight">
                                {ev.title}
                              </div>
                              {!isShort && (
                                <div className={`text-[10px] flex items-center gap-1 mt-0.5 font-medium tracking-tight ${isConsultation ? 'text-blue-100' : 'text-slate-500'}`}>
                                  {ev.start} - {ev.end}
                                </div>
                              )}
                            </div>
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
