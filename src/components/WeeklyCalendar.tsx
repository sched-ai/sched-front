import React, { useState } from "react";

const weekDays = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
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

  return (
    <div className="overflow-x-auto w-full">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-8 border-b bg-white sticky top-0 z-10">
          <div className="bg-white"></div>
          {weekDays.map((day, idx) => (
            <div
              key={day}
              className={`py-2 px-2 text-center font-semibold border-l ${
                idx >= 5 ? "bg-gray-50" : "bg-white"
              }`}
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-8">
          <div className="flex flex-col max-w-[50px] ml-8">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-[80px] text-md text-right pr-2 flex items-center"
              >
                {hour}
              </div>
            ))}
          </div>
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
      {modalInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 min-w-[300px] text-center relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setModalInfo(null)}
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-2">Informações Selecionadas</h2>
            <p><b>Dia:</b> {modalInfo.day}</p>
            <p><b>Horário:</b> {modalInfo.hour}</p>
          </div>
        </div>
      )}
    </div>
  );
};
