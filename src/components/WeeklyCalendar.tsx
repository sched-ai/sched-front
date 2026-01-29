import React, { useRef, useEffect, useState } from "react";
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
			const left = leftColumnRef.current?.offsetWidth ?? 90;
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
										<p className={`text-lg ${isToday ? "font-bold bg-blue-600 text-white rounded-full h-7 w-7 text-center" : ""}`}>
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
												<div className="flex relative">
							<div className="flex flex-col max-w-[90px] pl-5 w-full">
																{/* coluna de horários (referência usada para posicionar a linha atual) */}
																<div ref={leftColumnRef} className="w-full">
																	{hours.map((hour) => (
																		<div
																			key={hour}
																			className="h-[80px] text-md text-right pr-2 flex items-center max-w-[50px]"
																		>
																			{hour}
																		</div>
																	))}
																</div>
														</div>
														{/* linha indicadora do horário atual */}
														{nowIndicator && (
															<div
																className="absolute pointer-events-none"
																style={{
																	left: nowIndicator.left,
																	top: `${nowIndicator.top}px`,
																	width: `calc(100% - ${nowIndicator.left}px)`,
																	zIndex: 40,
																}}
															>
																<div style={{ position: "relative" }}>
																	<div
																		style={{ position: "absolute", left: -8, top: -6, width: 10, height: 10, borderRadius: 9999, backgroundColor: "#ef4444" }}
																	/>
																	<div style={{ height: 2, backgroundColor: "#ef4444", width: "100%" }} />
																</div>
															</div>
														)}
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
												onClick={(e) => handleCellClick(dayIdx, hour, e)}
											></div>
										))}
										{eventMap
											.filter((ev) => ev.dayIdx === dayIdx)
											.map((ev) => {
												const cellHeight = 80;
												const top = ev.startPos.totalPosition * cellHeight;
												const height = (ev.endPos.totalPosition - ev.startPos.totalPosition) * cellHeight;
												const bgColor = ev.type === "consulta"
													? "#60a5fa"
													: dayIdx >= 5
														? "#60a5fa"
														: "#050a35";
												return (
													<div
														key={ev.id}
														className="absolute w-full rounded border border-white text-white px-2 py-1 text-xs shadow-md hover:scale-105 cursor-pointer hover:animate-pulse transition-all"
														style={{
															top: `${top}px`,
															height: `${height}px`,
															minHeight: `${Math.max(height, 20)}px`,
															zIndex: 20,
															backgroundColor: bgColor,
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
