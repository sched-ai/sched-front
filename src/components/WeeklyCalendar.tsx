import React, { useState } from "react";

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
};

interface WeeklyCalendarProps {
	events: EventType[];
}

function getDayIndex(day: string) {
	return weekDays.indexOf(day);
}

function getHourIndex(time: string) {
	return parseInt(time.split(":")[0], 10);
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ events }) => {
	const [modalInfo, setModalInfo] = useState<{day: string, hour: string} | null>(null);
	const eventMap = events.map((event) => {
		const dayIdx = getDayIndex(event.day);
		const startIdx = getHourIndex(event.start);
		const endIdx = getHourIndex(event.end);
		return { ...event, dayIdx, startIdx, endIdx };
	});
  const dayNumber = 1; // Placeholder for the day number

  console.log(modalInfo);

	return (
		<div className="overflow-x-auto w-full">
			<div className="min-w-[900px]">
				<div className="flex">

				<div className="bg-white border-b max-w-[120px] w-full"></div>
				<div className="grid grid-cols-7 border-b bg-white sticky top-0 z-10 w-full">
					{weekDays.map((day, idx) => (
						<div
						key={day}
						className={`py-2 px-2 text-center font-semibold border-l flex justify-center flex-col ${
							idx >= 5 ? "bg-gray-50" : "bg-white"
						}`}
						>
							<p>
                {day} 
              </p>
              {dayNumber}
						</div>
					))}
				</div>
				</div>
				<div className="flex">
					<div className="flex flex-col max-w-[120px] pl-6 w-full">
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
								className="h-[80px] border-b border-gray-200 cursor-pointer hover:bg-blue-50"
								onClick={() => setModalInfo({ day, hour })}
								></div>
							))}
							{eventMap
								.filter((ev) => ev.dayIdx === dayIdx)
								.map((ev) => {
									const top = ev.startIdx * 80;
									const height = (ev.endIdx - ev.startIdx + 1) * 80;
									return (
										<div
											key={ev.id}
											className="absolute left-2 right-2 rounded bg-blue-500 text-white px-2 py-1 text-xs shadow-md"
											style={{
												top: top,
												height: height,
												minHeight: 80,
												zIndex: 20,
												backgroundColor: dayIdx >= 5 ? "#60a5fa" : "#2563eb",
											}}
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
	);
};
