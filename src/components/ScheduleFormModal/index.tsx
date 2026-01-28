import { X, GripHorizontal } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DndContext, useDraggable } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import type { EventType } from "@/components/WeeklyCalendar";
import { BlockContent } from "./BlockContent";
import { AppoimentContent } from "./AppoimentContent";

interface FormModalProps {
  isOpen?: boolean;
  selectedDateTime?: {
    day: number;
    month?: number;
    year?: number;
    hour: string;
  } | null;
  selectedEvent?: EventType | null;
  onClose?: () => void;
}

const DraggableModalContent = ({
  children,
  position,
}: {
  children: React.ReactNode;
  position: { x: number; y: number };
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "draggable-modal",
  });

  const getInitialPosition = useCallback(() => {
    const modalWidth = 400;
    const modalHeight = 720;

    return {
      x: (window.innerWidth - modalWidth) / 2,
      y: (window.innerHeight - modalHeight) / 2,
    };
  }, []);

  const initialPosition = getInitialPosition();

  const x = initialPosition.x + (transform?.x ?? 0) + position.x;
  const y = initialPosition.y + (transform?.y ?? 0) + position.y;

  const style = {
    left: `${x}px`,
    top: `${y}px`,
    background: "#121535",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="fixed z-50 min-w-[400px] max-w-[95vw] max-h-[90vh] shadow-2xl rounded-2xl border-none bg-cover flex flex-col"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-0 right-0 left-0 h-8 pl-2 cursor-move flex items-center justify-start bg-white/15 rounded-t-lg z-10 transition-colors"
        style={{ userSelect: "none" }}
      >
        <GripHorizontal size={20} className="text-white/70" />
      </div>
      <div className="flex-1 overflow-y-auto py-8 custom-scrollbar">
        {children}
      </div>
    </div>
  );
};

export const ScheduleFormModal = ({
  isOpen = false,
  selectedDateTime = null,
  selectedEvent = null,
  onClose = () => {},
}: FormModalProps) => {
  function getEndHour(startHour: string | undefined) {
    if (!startHour) return "";
    const [h, m] = startHour.split(":").map(Number);
    let endH = h + 1;
    if (endH > 23) endH = 23;
    return `${String(endH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  const [startHour, setStartHour] = useState("");
  const [endHour, setEndHour] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");
  const [activeTab, setActiveTab] = useState("consulta");
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [weekDays, setWeekDays] = useState<boolean[]>([false, false, false, false, false, false, false]);
  const [endOption, setEndOption] = useState<"never" | "onDate" | "afterOccurrences">("never");
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [occurrences, setOccurrences] = useState<number | undefined>(1);
  

  useEffect(() => {
    const formatDate = (d: Date) => {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };

    const resetAll = (keepEndDate?: boolean) => {
      setStartHour("");
      setEndHour("");
      setTitle("");
      setLocation("");
      setService("");
      setActiveTab("consulta");
      setRepeatEnabled(false);
      setWeekDays([false, false, false, false, false, false, false]);
      setEndOption("never");
      if (!keepEndDate) setEndDate(formatDate(new Date()));
      setOccurrences(1);
    };

    if (isOpen) {
      if (selectedEvent) {
        setTitle(selectedEvent.title);
        setStartHour(selectedEvent.start);
        setEndHour(selectedEvent.end);
        setActiveTab(selectedEvent.type || "consulta");
        setLocation(selectedEvent.workplaceId || "");
        setService("");
        setRepeatEnabled(false);
        setWeekDays([false, false, false, false, false, false, false]);
        setEndOption("never");
        setOccurrences(1);
        if (
          (typeof selectedEvent.day !== "undefined" || typeof selectedEvent.dayNumber !== "undefined") &&
          typeof selectedEvent.month !== "undefined" &&
          typeof selectedEvent.year !== "undefined"
        ) {
          const d = typeof selectedEvent.dayNumber === 'number' ? selectedEvent.dayNumber : Number(selectedEvent.day);
          const m = Number(selectedEvent.month);
          const y = Number(selectedEvent.year);
          if (!Number.isNaN(d) && !Number.isNaN(m) && !Number.isNaN(y)) {
            setEndDate(`${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`);
          } else {
            setEndDate(formatDate(new Date()));
          }
        } else {
          setEndDate(formatDate(new Date()));
        }
      } else if (selectedDateTime) {
        setStartHour(selectedDateTime.hour);
        setEndHour(getEndHour(selectedDateTime.hour));
        setTitle("");
        setLocation("");
        setService("");
        setActiveTab("consulta");
        setRepeatEnabled(false);
        setWeekDays([false, false, false, false, false, false, false]);
        setEndOption("never");
        setOccurrences(1);
        if (
          typeof selectedDateTime.day !== "undefined" &&
          typeof selectedDateTime.month !== "undefined" &&
          typeof selectedDateTime.year !== "undefined"
        ) {
          setEndDate(`${String(selectedDateTime.day).padStart(2, "0")}/${String(selectedDateTime.month).padStart(2, "0")}/${selectedDateTime.year}`);
        } else {
          setEndDate(formatDate(new Date()));
        }
      } else {
        resetAll();
      }
    } else {
      resetAll();
    }

    if (!isOpen) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, selectedDateTime, selectedEvent]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { delta } = event;
    setPosition((prev) => ({
      x: prev.x + delta.x,
      y: prev.y + delta.y,
    }));
  };

  if (!isOpen) return null;

  const effectiveSelectedDateTime = selectedDateTime || (selectedEvent && (typeof selectedEvent.dayNumber === 'number' || !Number.isNaN(Number(selectedEvent.day))) ? {
    day: typeof selectedEvent.dayNumber === 'number' ? selectedEvent.dayNumber : Number(selectedEvent.day),
    month: Number(selectedEvent.month),
    year: Number(selectedEvent.year),
    hour: selectedEvent.start
  } : null);

  const blockProps = {
    title,
    setTitle,
    selectedDateTime: effectiveSelectedDateTime,
    startHour,
    setStartHour,
    endHour,
    setEndHour,
    repeatEnabled,
    setRepeatEnabled,
    weekDays,
    setWeekDays,
    endOption,
    setEndOption,
    endDate,
    occurrences,
    setEndDate,
    setOccurrences,
    onClose,
    timeBlockId: selectedEvent?.type === 'bloqueio' ? String(selectedEvent.id) : undefined
  };

  const appointmentProps = {
    title,
    setTitle,
    selectedDateTime: effectiveSelectedDateTime,
    startHour,
    setStartHour,
    endHour,
    setEndHour,
    location,
    setLocation,
    service,
    setService,
    onClose,
    appointmentId: selectedEvent?.type === 'consulta' ? String(selectedEvent.id) : undefined
  };

  return (
    <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
      <DraggableModalContent position={position}>
        <div
          className="relative flex flex-col w-full px-6"
          style={{
            minHeight: 400,
            paddingTop: 32,
          }}
        >
          <div className="flex-row justify-between flex items-start mb-4">
            <div>
              <div className="text-white font-medium text-xl">
                {selectedEvent ? "Editar Consulta" : "Nova Consulta"}
              </div>
              <div className="text-[14px] text-[#A4A4A4]">
                {selectedEvent
                  ? "Edite as informações da consulta selecionada."
                  : "Preencha o formulário para criar uma nova consulta."}
              </div>
            </div>
            <Button
              variant="ghost"
              className="bg-transparent !p-0 hover:bg-transparent h-fit"
              onClick={onClose}
            >
              <X className="text-white cursor-pointer" size={20} />
            </Button>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="bg-white/5 border border-white h-[48px]">
              <TabsTrigger
                value="consulta"
                className="data-[state=active]:text-[#141736] data-[state=inactive]:text-background cursor-pointer h-[38px]"
              >
                Consulta
              </TabsTrigger>
              <TabsTrigger
                value="bloqueio"
                className="data-[state=active]:text-[#141736] data-[state=inactive]:text-background cursor-pointer h-[38px]"
              >
                Bloqueio
              </TabsTrigger>
            </TabsList>
            <TabsContent value="bloqueio" className="text-white">
             <BlockContent {...blockProps} />
            </TabsContent>
            <TabsContent value="consulta" className="text-white">
              <AppoimentContent {...appointmentProps} />
            </TabsContent>
          </Tabs>
        </div>
      </DraggableModalContent>
    </DndContext>
  );
};
