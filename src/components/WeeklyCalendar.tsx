import React, { useRef, useEffect, useState } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { BotMessageSquare, Plus } from "lucide-react";
import type { AvailableHours } from "@/hooks/api/useGetCalendar";
import { useIsMobile } from "@/hooks/use-mobile";

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
  serviceId?: string;
	services?: string[];
	type?: 'consulta' | 'bloqueio';
	employeeId?: string;
	professionalName?: string;
	isRecurring?: boolean;
  createdByAI?: boolean;
};


interface WeeklyCalendarProps {
	events: EventType[];
	currentDate: Date;
	onDateClick?: (date: { day: number; month: number; year: number }, hour: string, rect?: DOMRect) => void;
	onEventClick?: (event: EventType, rect: DOMRect) => void;
	filterType?: 'all' | 'consulta' | 'bloqueio';
	availableHours?: AvailableHours;
  isDraftVisible?: boolean;
  draftEvent?: {
    day: number;
    month: number;
    year: number;
    startHour: string;
    endHour?: string;
    type?: 'consulta' | 'bloqueio';
  } | null;
  viewMode?: "week" | "day";
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
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

function addMinutesToTime(time: string, minutesToAdd: number) {
  const [hourStr = "0", minuteStr = "0"] = time.split(":");
  const startMinutes = Number(hourStr) * 60 + Number(minuteStr);
  const maxMinutesInDay = 23 * 60 + 59;
  const nextMinutes = Math.min(Math.max(startMinutes + minutesToAdd, 0), maxMinutesInDay);
  const nextHour = Math.floor(nextMinutes / 60);
  const nextMinute = nextMinutes % 60;
  return `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ 
  events, 
  currentDate,
  onDateClick,
  onEventClick,
  filterType = 'all',
  availableHours,
  isDraftVisible = true,
  draftEvent = null,
  viewMode = "week",
  onNavigatePrev,
  onNavigateNext,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const swipeAreaRef = useRef<HTMLDivElement>(null);
  const swipeStateRef = useRef<{ startX: number; startY: number; isSwiping: boolean } | null>(null);
  const isMobile = useIsMobile();
  const timeColumnWidth = isMobile ? 56 : 70;
  const [isSwipeEnabled, setIsSwipeEnabled] = useState(false);
  const [swipeAreaWidth, setSwipeAreaWidth] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipeAnimating, setIsSwipeAnimating] = useState(false);
  const [nowIndicator, setNowIndicator] = useState<{
    top: number;
    dayIdx: number;
    left: number;
  } | null>(null);
  const [tempBox, setTempBox] = useState<{
    dayIdx: number;
    startHour: string;
    endHour: string;
    date: Date;
    type?: 'consulta' | 'bloqueio';
  } | null>(null);
  const [blink, setBlink] = useState(false);
  const CELL_HEIGHT = isMobile ? 64 : 80;
  const rangeSize = viewMode === "day" ? 1 : 7;
  const rangeStart = React.useMemo(() => {
    if (viewMode === "day") {
      return new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    }
    return startOfWeek(currentDate, { weekStartsOn: 0 });
  }, [currentDate, viewMode]);
  const activeDates = React.useMemo(() => {
    return Array.from({ length: rangeSize }, (_, index) => addDays(rangeStart, index));
  }, [rangeStart, rangeSize]);
  const isSwipeReady = isSwipeEnabled && swipeAreaWidth > 0;
  const renderedDates = React.useMemo(() => {
    if (!isSwipeReady) return activeDates;
    const start = addDays(rangeStart, -rangeSize);
    return Array.from({ length: rangeSize * 3 }, (_, index) => addDays(start, index));
  }, [activeDates, isSwipeReady, rangeStart, rangeSize]);
  const renderRangeCount = isSwipeReady ? 3 : 1;
  const swipeBaseOffset = isSwipeReady ? -swipeAreaWidth : 0;
  const swipeTranslateX = swipeBaseOffset + swipeOffset;

  useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollPosition = 6 * CELL_HEIGHT;
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, [currentDate]);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsSwipeEnabled(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!swipeAreaRef.current) return;
    const element = swipeAreaRef.current;
    const update = () => setSwipeAreaWidth(element.offsetWidth);
    update();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    const observer = new ResizeObserver(() => update());
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isSwipeEnabled) {
      setSwipeOffset(0);
      setIsSwipeAnimating(false);
      swipeStateRef.current = null;
    }
  }, [isSwipeEnabled]);

  useEffect(() => {
    if (!isSwipeEnabled) return;
    setSwipeOffset(0);
    setIsSwipeAnimating(false);
  }, [currentDate, viewMode, swipeAreaWidth, isSwipeEnabled]);

  const isCellAllowed = React.useCallback((date: Date, hourIdx: number) => {
    const cellDate = new Date(date);
    cellDate.setHours(hourIdx, 0, 0, 0);
    const now = new Date();

    if (cellDate < now) {
      return false;
    }

    if (availableHours) {
      const dayData = availableHours[String(cellDate.getDay())];
      if (!dayData || dayData.startMinute === null || dayData.endMinute === null) {
        return false;
      }

      const blockStartMin = hourIdx * 60;
      const blockEndMin = (hourIdx + 1) * 60;
      if (blockEndMin <= dayData.startMinute || blockStartMin >= dayData.endMinute) {
        return false;
      }
    }

    return true;
  }, [availableHours]);

  const controlledTempBox = React.useMemo(() => {
    if (!draftEvent) return null;

    const dayIdx = renderedDates.findIndex((d) =>
      d.getDate() === draftEvent.day &&
      d.getMonth() + 1 === draftEvent.month &&
      d.getFullYear() === draftEvent.year,
    );

    if (dayIdx === -1) return null;

    const startPos = getHourPosition(draftEvent.startHour);
    const endPos = getHourPosition(draftEvent.endHour ?? draftEvent.startHour);
    if (Number.isNaN(startPos.totalPosition) || Number.isNaN(endPos.totalPosition)) return null;

    const previewHourIdx = Math.floor(startPos.totalPosition);
    const targetDate = renderedDates[dayIdx];
    if (!targetDate || !isCellAllowed(targetDate, previewHourIdx)) return null;

    const endHour = endPos.totalPosition > startPos.totalPosition
      ? (draftEvent.endHour ?? draftEvent.startHour)
      : addMinutesToTime(draftEvent.startHour, 5);

    return {
      dayIdx,
      startHour: draftEvent.startHour,
      endHour,
      date: targetDate,
      type: draftEvent.type,
    };
  }, [draftEvent, isCellAllowed, renderedDates]);

  const tempBoxInCurrentRange = React.useMemo(() => {
    if (!tempBox) return null;
    const isInRange = renderedDates.some((d) => isSameDay(d, tempBox.date));
    return isInRange ? tempBox : null;
  }, [tempBox, renderedDates]);

  const renderedTempBox = isDraftVisible ? (controlledTempBox ?? tempBoxInCurrentRange) : null;

  useEffect(() => {
    if (!isDraftVisible && tempBox) {
      setTempBox(null);
    }
  }, [isDraftVisible, tempBox]);

  useEffect(() => {
    if (tempBox && !tempBoxInCurrentRange) {
      setTempBox(null);
    }
  }, [tempBox, tempBoxInCurrentRange]);

  // Efeito para piscar a caixinha temporária
  useEffect(() => {
    if (renderedTempBox) {
      setBlink(true);
      const timeout = setTimeout(() => setBlink(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [renderedTempBox]);

  useEffect(() => {
    let mounted = true;
    const updateNow = () => {
      const now = new Date();
      const dayIdxNow = renderedDates.findIndex((d) => isSameDay(d, now));
      if (dayIdxNow === -1) {
        if (mounted) setNowIndicator(null);
        return;
      }
      const timeStr = format(now, "HH:mm");
      const pos = getHourPosition(timeStr);
      const left = leftColumnRef.current?.offsetWidth ?? timeColumnWidth;
      if (mounted)
        setNowIndicator({ top: pos.totalPosition * CELL_HEIGHT, dayIdx: dayIdxNow, left });
    };

    updateNow();
    const id = setInterval(updateNow, 30 * 1000);
    return () => {
      mounted = false;
      clearInterval(id);
    };

  }, [CELL_HEIGHT, timeColumnWidth, renderedDates]);

  // Filtra eventos para o intervalo exibido (semana ou dia)
  const filteredEventsByRange = events.filter((event) => {
		const eventMonthNum = typeof event.month === 'string' ? Number(event.month) : event.month;
		const eventYearNum = Number(event.year);

		if (typeof event.dayNumber === 'number') {
      return renderedDates.some((d) =>
				d.getDate() === event.dayNumber &&
				d.getMonth() + 1 === eventMonthNum &&
				d.getFullYear() === eventYearNum,
			);
		}
    return renderedDates.some((d) =>
			d.getMonth() + 1 === eventMonthNum &&
			d.getFullYear() === eventYearNum &&
			weekDays[d.getDay()] === event.day,
		);
	});

  let filteredEvents = filteredEventsByRange;
	if (filterType !== 'all') {
		filteredEvents = filteredEvents.filter((event) => event.type === filterType);
	}

	const eventMap = filteredEvents.map((event) => {
		const eventMonthNum = typeof event.month === 'string' ? Number(event.month) : event.month;
		const eventYearNum = Number(event.year);

    const dayIdx = typeof event.dayNumber === 'number'
      ? renderedDates.findIndex((d) =>
				d.getDate() === event.dayNumber &&
				d.getMonth() + 1 === eventMonthNum &&
				d.getFullYear() === eventYearNum,
			)
      : renderedDates.findIndex((d) =>
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
  }).filter(event => {
    // Hide block events if the day is entirely unavailable
    if (event.type === 'bloqueio' && availableHours && event.dayIdx >= 0) {
      const dayOfWeek = renderedDates[event.dayIdx]?.getDay();
      const dayData = dayOfWeek !== undefined ? availableHours[String(dayOfWeek)] : undefined;
      if (!dayData || dayData.startMinute === null || dayData.endMinute === null) {
        return false;
      }
    }
    return true;
  });

  const blockedCells = React.useMemo(() => {
    const blocked = new Set<string>();

    eventMap.forEach((event) => {
      if (event.type !== 'bloqueio' || event.dayIdx < 0) return;

      for (let hourIdx = 0; hourIdx < 24; hourIdx++) {
          const cellStart = hourIdx;
          const cellEnd = hourIdx + 1;

          // Calculate how much of the hour is overlapped by the event (in hours)
          const overlap = Math.min(event.endPos.totalPosition, cellEnd) - Math.max(event.startPos.totalPosition, cellStart);

          // Only mark the whole hour as blocked if the event covers the full hour (overlap >= 1 hour)
          if (overlap >= 1) {
            blocked.add(`${event.dayIdx}-${hourIdx}`);
          }
        }
    });

    return blocked;
  }, [eventMap]);

  const handleCellClick = (dayIdx: number, hour: string, e: React.MouseEvent<HTMLDivElement>) => {
    const dateObj = renderedDates[dayIdx];
    if (!dateObj) return;
    const defaultEndHour = addMinutesToTime(hour, 5);
    setTempBox({ dayIdx, startHour: hour, endHour: defaultEndHour, date: dateObj, type: 'consulta' });
    if (onDateClick) {
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
		e.stopPropagation();
		if (onEventClick) {
			onEventClick(event, e.currentTarget.getBoundingClientRect());
		}
  
  
	};

  const swipeTrackStyle = isSwipeReady
    ? {
        width: `${renderRangeCount * 100}%`,
        transform: `translateX(${swipeTranslateX}px)`,
        transition: isSwipeAnimating ? "transform 200ms ease-out" : "none",
        willChange: "transform",
      }
    : { width: "100%" };

  const calendarMinWidthClass = viewMode === "week" && !isSwipeEnabled ? "min-w-[900px]" : "min-w-0";

		return (
			<div className="w-full bg-white h-[calc(100vh-80px)] flex flex-col rounded-tl-2xl overflow-hidden border border-gray-200/50 shadow-sm">
  			<div 
          ref={scrollContainerRef}
          className="overflow-auto w-full h-full custom-scrollbar relative"
          onTouchStart={(event) => {
            if (!isSwipeReady || isSwipeAnimating) return;
            const touch = event.touches[0];
            swipeStateRef.current = {
              startX: touch.clientX,
              startY: touch.clientY,
              isSwiping: false,
            };
          }}
          onTouchMove={(event) => {
            if (!isSwipeReady || isSwipeAnimating) return;
            const state = swipeStateRef.current;
            if (!state) return;
            const touch = event.touches[0];
            const dx = touch.clientX - state.startX;
            const dy = touch.clientY - state.startY;

            if (!state.isSwiping) {
              if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
                state.isSwiping = true;
              } else if (Math.abs(dy) > 12) {
                return;
              }
            }

            if (state.isSwiping) {
              event.preventDefault();
              const width = swipeAreaWidth || swipeAreaRef.current?.offsetWidth || 0;
              const clamped = width ? Math.max(Math.min(dx, width), -width) : dx;
              setSwipeOffset(clamped);
            }
          }}
          onTouchEnd={() => {
            if (!isSwipeReady || isSwipeAnimating) return;
            const state = swipeStateRef.current;
            swipeStateRef.current = null;
            if (!state?.isSwiping) return;

            const width = swipeAreaWidth || swipeAreaRef.current?.offsetWidth || 0;
            if (!width) {
              setSwipeOffset(0);
              return;
            }
            const threshold = Math.min(120, width * 0.2);

            if (Math.abs(swipeOffset) > threshold) {
              const toRight = swipeOffset > 0;
              setIsSwipeAnimating(true);
              setSwipeOffset(toRight ? width : -width);

              window.setTimeout(() => {
                if (toRight) {
                  onNavigatePrev?.();
                } else {
                  onNavigateNext?.();
                }
                setSwipeOffset(0);
                setIsSwipeAnimating(false);
              }, 200);
            } else {
              setIsSwipeAnimating(true);
              setSwipeOffset(0);
              window.setTimeout(() => setIsSwipeAnimating(false), 160);
            }
          }}
          >
            <div className={calendarMinWidthClass}>
              {/* Header Sticky */}
              <div className="flex sticky top-0 z-[36] isolate bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div
                  className="w-full border-r border-gray-200 bg-gray-50/30 flex-shrink-0"
                  style={{ minWidth: `${timeColumnWidth}px`, maxWidth: `${timeColumnWidth}px`, width: `${timeColumnWidth}px` }}
                ></div>
                <div className="flex-1 overflow-hidden">
                  <div
                    className="grid w-full divide-x divide-gray-200"
                    style={{ gridTemplateColumns: `repeat(${renderedDates.length}, minmax(0, 1fr))`, ...swipeTrackStyle }}
                  >
                    {renderedDates.map((currentDayDate, idx) => {
                      const isToday = isSameDay(currentDayDate, new Date());
                      const isWeekend = currentDayDate.getDay() >= 5;
                      const dayLabel = weekDays[currentDayDate.getDay()];
                      return (
                        <div
                          key={`${currentDayDate.toISOString()}-${idx}`}
                          className={`py-3 text-center flex flex-col items-center gap-1.5 ${isWeekend ? 'bg-gray-50/40' : ''}`}
                        >
                          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                            {viewMode === "day" ? dayLabel : dayLabel.substring(0, 3)}
                          </span>
                          <div className={`text-[14px] font-medium flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300 ${
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
              </div>

              <div className="flex relative" style={{ minHeight: `${CELL_HEIGHT * 24}px` }}>
                {/* Time Column */}
                <div
                  className="flex flex-col w-full bg-white border-r border-gray-200 sticky left-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex-shrink-0"
                  style={{ minWidth: `${timeColumnWidth}px`, maxWidth: `${timeColumnWidth}px`, width: `${timeColumnWidth}px` }}
                >
                  <div ref={leftColumnRef} className="w-full">
                    {hours.map((hour, i) => (
                      <div
                        key={hour}
                        className="text-[11px] font-medium text-gray-400 relative"
                        style={{ height: `${CELL_HEIGHT}px` }}
                      >
                        <span className={`absolute right-3 bg-white px-1 text-gray-400 font-sans tracking-tight ${i === 0 ? 'top-2' : '-top-3'}`}>
                          {hour}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calendar Grid */}
                <div ref={swipeAreaRef} className="flex-1 overflow-hidden">
                  <div
                    className="grid w-full divide-x divide-gray-200"
                    style={{ gridTemplateColumns: `repeat(${renderedDates.length}, minmax(0, 1fr))`, ...swipeTrackStyle }}
                  >
                    {renderedDates.map((date, dayIdx) => (
                      <div
                        key={date.toISOString()}
                        className={`flex flex-col relative ${
                          date.getDay() >= 5 ? "bg-gray-50/20" : ""
                        }`}
                      >
                        {/* Temporary blinking box (Google Calendar style) */}
                        {renderedTempBox && renderedTempBox.dayIdx === dayIdx && (
                          (() => {
                            const startPos = getHourPosition(renderedTempBox.startHour);
                            const endPos = getHourPosition(renderedTempBox.endHour);
                            const previewHeight = Math.max((endPos.totalPosition - startPos.totalPosition) * CELL_HEIGHT - 4, 28);
                            return (
                              <div
                                className={`absolute left-0 w-full z-10 pointer-events-none transition-all duration-200 
                                  ${blink ? 'animate-pulse' : ''}`}
                                style={{
                                  top: `${startPos.totalPosition * CELL_HEIGHT + 2}px`,
                                  height: `${previewHeight}px`,
                                  background: renderedTempBox.type === 'bloqueio' ? 'rgba(71, 85, 105, 0.18)' : 'rgba(37, 99, 235, 0.18)',
                                  border: renderedTempBox.type === 'bloqueio' ? '2px solid #475569' : '2px solid #2563eb',
                                  borderRadius: '0.6rem',
                                  boxShadow: renderedTempBox.type === 'bloqueio'
                                    ? '0 2px 12px 0 rgba(71,85,105,0.10)'
                                    : '0 2px 12px 0 rgba(37,99,235,0.10)',
                                }}
                              />
                            );
                          })()
                        )}
                        {/* Current Time Indicator */}
                        {nowIndicator && nowIndicator.dayIdx === dayIdx && (
                          <div
                            className="absolute pointer-events-none z-30 flex items-center w-full"
                            style={{
                              top: `${nowIndicator.top}px`,
                            }}
                          >
                            <div
                              className="absolute -left-[5px] -top-1.5 w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-50 shadow-sm"
                            />
                            <div className="h-[2px] w-full bg-gradient-to-r from-red-500/80 to-red-500/20 shadow-[0_1px_4px_rgba(239,68,68,0.3)]" />
                          </div>
                        )}
                        {/* Grid Lines */}
                        {hours.map((hour, hourIdx) => {
                          const isAllowed = isCellAllowed(date, hourIdx);
                          const isBlockedByEvent = blockedCells.has(`${dayIdx}-${hourIdx}`);
                          const isInteractive = isAllowed && !isBlockedByEvent;

                          return (
                            <div
                              key={hour}
                              className={`border-b border-gray-200 relative group transition-colors ${
                                isInteractive ? 'hover:bg-blue-50/20 cursor-pointer' : 'cursor-not-allowed bg-[#f5f5f5]'
                              }`}
                              style={{ height: `${CELL_HEIGHT}px` }}
                              onClick={(e) => {
                                if (isInteractive) handleCellClick(dayIdx, hour, e);
                              }}
                            >
                              {/* Hover Plus Icon */}
                              {isInteractive && (
                                <div className="absolute inset-0 z-[35] pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <div className="w-8 h-8 rounded-full bg-blue-50/80 flex items-center justify-center backdrop-blur-sm shadow-sm ring-1 ring-blue-100">
                                    <Plus className="w-5 h-5 text-blue-500" />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Events */}
                        {(() => {
                          const PROFESSIONAL_COLORS = [
                            { bg: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", border: "border-blue-400/30", text: "#fff", accent: "bg-blue-300/40", hoverShadow: "shadow-blue-500/20" },
                            { bg: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", border: "border-purple-400/30", text: "#fff", accent: "bg-purple-300/40", hoverShadow: "shadow-purple-500/20" },
                            { bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)", border: "border-emerald-400/30", text: "#fff", accent: "bg-emerald-300/40", hoverShadow: "shadow-emerald-500/20" },
                            { bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", border: "border-amber-400/30", text: "#fff", accent: "bg-amber-300/40", hoverShadow: "shadow-amber-500/20" },
                            { bg: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", border: "border-red-400/30", text: "#fff", accent: "bg-red-300/40", hoverShadow: "shadow-red-500/20" },
                            { bg: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)", border: "border-cyan-400/30", text: "#fff", accent: "bg-cyan-300/40", hoverShadow: "shadow-cyan-500/20" },
                            { bg: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", border: "border-pink-400/30", text: "#fff", accent: "bg-pink-300/40", hoverShadow: "shadow-pink-500/20" },
                          ];

                          const BLOCK_COLOR = { bg: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)", border: "border-slate-500/10", text: "#1e293b", accent: "bg-slate-400/30", hoverShadow: "shadow-slate-500/10" };

                          // Get events for this day
                          const dayEvents = eventMap.filter((ev) => ev.dayIdx === dayIdx);

                          // Build a map of employeeId → color index
                          const profColorMap = new Map<string, number>();
                          let colorIdx = 0;
                          for (const ev of dayEvents) {
                            if (ev.employeeId && !profColorMap.has(ev.employeeId)) {
                              profColorMap.set(ev.employeeId, colorIdx % PROFESSIONAL_COLORS.length);
                              colorIdx++;
                            }
                          }

                          // Group overlapping events
                          const sorted = [...dayEvents].sort((a, b) => a.startPos.totalPosition - b.startPos.totalPosition);

                          // Assign columns to overlapping events
                          const columns: number[] = new Array(sorted.length).fill(0);
                          const maxCols: number[] = new Array(sorted.length).fill(1);

                          for (let i = 0; i < sorted.length; i++) {
                            const usedCols = new Set<number>();
                            for (let j = 0; j < i; j++) {
                              // Check if events j and i overlap
                              if (sorted[j].endPos.totalPosition > sorted[i].startPos.totalPosition &&
                                  sorted[j].startPos.totalPosition < sorted[i].endPos.totalPosition) {
                                usedCols.add(columns[j]);
                              }
                            }
                            // Find first available column
                            let col = 0;
                            while (usedCols.has(col)) col++;
                            columns[i] = col;
                          }

                          // Calculate max columns for each event (how many concurrent events)
                          for (let i = 0; i < sorted.length; i++) {
                            let max = columns[i] + 1;
                            for (let j = 0; j < sorted.length; j++) {
                              if (i === j) continue;
                              if (sorted[j].endPos.totalPosition > sorted[i].startPos.totalPosition &&
                                  sorted[j].startPos.totalPosition < sorted[i].endPos.totalPosition) {
                                max = Math.max(max, columns[j] + 1);
                              }
                            }
                            maxCols[i] = max;
                          }

                          return sorted.map((ev, idx) => {
                            const cellHeight = CELL_HEIGHT;
                            const top = ev.startPos.totalPosition * cellHeight;
                            const height = (ev.endPos.totalPosition - ev.startPos.totalPosition) * cellHeight;
                            const isShort = height <= 50;
                            const isConsultation = ev.type === 'consulta';
                            const hasOverlap = maxCols[idx] > 1;
                            const shouldShowAIBadge = Boolean(ev.createdByAI) && isConsultation && !isShort;

                            const col = columns[idx];
                            const totalCols = maxCols[idx];

                            // Get color for this event
                            const color = isConsultation
                              ? (ev.employeeId ? PROFESSIONAL_COLORS[profColorMap.get(ev.employeeId) ?? 0] : PROFESSIONAL_COLORS[0])
                              : BLOCK_COLOR;

                            // Calculate width and left position
                            const widthPercent = hasOverlap ? (100 / totalCols) : 100;
                            const leftPercent = hasOverlap ? (col * widthPercent) : 0;

                            const tooltipText = [
                              ev.professionalName && `👤 ${ev.professionalName}`,
                              ev.title && `📋 ${ev.title}`,
                              `🕐 ${ev.start} - ${ev.end}`,
                            ].filter(Boolean).join('\n');

                            return (
                              <div
                                key={ev.id}
                                title={tooltipText}
                                className={`absolute rounded-lg border ${color.border} ${
                                  `z-20` + (isConsultation ? ` hover:shadow-md ${color.hoverShadow}` : '')
                                } ${hasOverlap ? 'px-1.5 py-1' : 'px-2.5 py-2'} cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:z-30 active:scale-[0.98] overflow-hidden group shadow-sm`}
                                style={{
                                  top: `${top + 1}px`,
                                  height: `${height - 3}px`,
                                  minHeight: `${Math.max(height - 3, 26)}px`,
                                  left: hasOverlap ? `calc(${leftPercent}% + 2px)` : '4px',
                                  width: hasOverlap ? `calc(${widthPercent}% - 4px)` : 'calc(100% - 8px)',
                                  background: color.bg,
                                  color: color.text,
                                  pointerEvents: 'auto',
                                }}
                                onClick={(e) => handleEventClick(ev, e)}
                              >
                                <div className="flex flex-col h-full relative">
                                  {/* Left accent bar */}
                                  <div className={`absolute left-[-6px] top-0 bottom-0 w-[3px] ${color.accent} rounded-full`}></div>

                                  <div className={`font-semibold ${hasOverlap ? 'text-[10px]' : 'text-xs'} truncate leading-tight pr-1 tracking-tight`}>
                                    {ev.title}
                                  </div>
                                  {!isShort && !hasOverlap && (
                                    <div className={`text-[10px] flex items-center gap-1 mt-0.5 font-medium tracking-tight ${isConsultation ? 'opacity-80' : 'text-slate-500'}`}>
                                      {ev.start} - {ev.end}
                                    </div>
                                  )}
                                  {!isShort && hasOverlap && ev.professionalName && (
                                    <div className={`text-[9px] truncate mt-0.5 font-medium tracking-tight opacity-80`}>
                                      {ev.professionalName}
                                    </div>
                                  )}

                                  {shouldShowAIBadge && (
                                    <div className="absolute right-0 bottom-0 rounded-tl-md px-1 py-0.5" title="Agendamento criado por IA">
                                      <BotMessageSquare className="w-3 h-3 opacity-90" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
};
