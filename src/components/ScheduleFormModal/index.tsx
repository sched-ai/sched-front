import { X, GripHorizontal } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DndContext, useDraggable } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import type { EventType } from "@/components/WeeklyCalendar";
import { BlockContent } from "./BlockContent";
import { AppoimentContent } from "./AppoimentContent";

const MODAL_WIDTH = 400;
const MODAL_HEIGHT = 600; // Estimated height for initial centering

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
  clickPosition?: { x: number; y: number } | null;
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

  const initialPosition = useMemo(() => {
    return {
      x: (window.innerWidth - MODAL_WIDTH) / 2,
      y: (window.innerHeight - MODAL_HEIGHT) / 2,
    };
  }, []);

  // const initialPosition = getInitialPosition();

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
      style={{
        ...style,
        maxHeight: "calc(100vh - 40px)",
      }}
      className="fixed z-50 min-w-[400px] max-w-[95vw] shadow-2xl rounded-2xl border-none bg-cover flex flex-col"
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
  clickPosition
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

  // Initialize with Today's date to avoid null state in "Agendar" flow
  const [selectedDateState, setSelectedDateState] = useState<{ day: number, month: number, year: number } | null>(() => {
      const now = new Date();
      return { day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear() };
  });

  useEffect(() => {
    const formatDate = (d: Date) => {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };

    const resetAll = (keepEndDate?: boolean) => {
      // Default to current time for 'Agendar' flow
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      // Round to next 30 minutes or hour? Just use current time nicely formatted
      const startStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const endH = h + 1 > 23 ? 23 : h + 1;
      const endStr = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      
      setStartHour(startStr);
      setEndHour(endStr);
      setTitle("");
      setLocation("");
      setService("");
      setActiveTab("consulta");
      setRepeatEnabled(false);
      setWeekDays([false, false, false, false, false, false, false]);
      setEndOption("never");
      if (!keepEndDate) setEndDate(formatDate(new Date()));
      setOccurrences(1);
      
      setSelectedDateState({ day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear() });
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
        
        // Date Logic for Event
        if (
          (typeof selectedEvent.day !== "undefined" || typeof selectedEvent.dayNumber !== "undefined") &&
          typeof selectedEvent.month !== "undefined" &&
          typeof selectedEvent.year !== "undefined"
        ) {
          const d = typeof selectedEvent.dayNumber === 'number' ? selectedEvent.dayNumber : Number(selectedEvent.day);
          const m = Number(selectedEvent.month);
          const y = Number(selectedEvent.year);
          
          if (!Number.isNaN(d) && !Number.isNaN(m) && !Number.isNaN(y)) {
            setSelectedDateState({ day: d, month: m, year: y });
            setEndDate(`${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`);
          } else {
             const today = new Date();
             setSelectedDateState({ day: today.getDate(), month: today.getMonth() + 1, year: today.getFullYear() });
             setEndDate(formatDate(today)); 
          }
        } else {
           const today = new Date();
           setSelectedDateState({ day: today.getDate(), month: today.getMonth() + 1, year: today.getFullYear() });
           setEndDate(formatDate(today));
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
        
        // Date Logic for DateTime (Prop)
        if (
          typeof selectedDateTime.day !== "undefined" &&
          typeof selectedDateTime.month !== "undefined" &&
          typeof selectedDateTime.year !== "undefined"
        ) {
           setSelectedDateState({ 
             day: selectedDateTime.day, 
             month: selectedDateTime.month!, 
             year: selectedDateTime.year! 
           });
           setEndDate(`${String(selectedDateTime.day).padStart(2, "0")}/${String(selectedDateTime.month).padStart(2, "0")}/${selectedDateTime.year}`);
        } else {
           const today = new Date();
           setSelectedDateState({ day: today.getDate(), month: today.getMonth() + 1, year: today.getFullYear() });
           setEndDate(formatDate(today));
        }
      } else {
        // No event, no date (Add button scenario)
        resetAll();
      }
    } else {
      resetAll();
    }


  }, [isOpen, selectedDateTime, selectedEvent]);

  useEffect(() => {
    if (clickPosition) {
       const initialX = (window.innerWidth - MODAL_WIDTH) / 2;
       const initialY = (window.innerHeight - MODAL_HEIGHT) / 2;

       // Calculate desired top/left based on click
       let targetX = clickPosition.x;
       let targetY = clickPosition.y;

       // Boundary checks (padding 20px)
       const PADDING = 20;
       
       // If right edge goes off-screen
       if (targetX + MODAL_WIDTH > window.innerWidth - PADDING) {
           targetX = window.innerWidth - MODAL_WIDTH - PADDING;
       }
       // If bottom edge goes off-screen (approximate height check)
       if (targetY + MODAL_HEIGHT > window.innerHeight - PADDING) {
           targetY = window.innerHeight - MODAL_HEIGHT - PADDING;
       }
       
       // If left/top go off-screen (negative)
       if (targetX < PADDING) targetX = PADDING;
       if (targetY < PADDING) targetY = PADDING;

       
       setPosition({
         x: targetX - initialX,
         y: targetY - initialY
       });
    } else {
       setPosition({ x: 0, y: 0 }); // 0 means use initial centered position
    }
  }, [clickPosition, isOpen]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { delta } = event;
    setPosition((prev) => ({
      x: prev.x + delta.x,
      y: prev.y + delta.y,
    }));
  };

  if (!isOpen) return null;

  const blockProps = {
    title,
    setTitle,
    selectedDateTime: selectedDateState,
    setSelectedDateTime: setSelectedDateState,
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
    selectedDateTime: selectedDateState,
    setSelectedDateTime: setSelectedDateState,
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
        <div className="flex flex-col w-full max-w-[446px]">
          {/* Header Actions (Close) - Grip is handled by wrapper */}
          <div className="flex justify-end pr-2 pt-2">
            <Button
              variant="ghost"
              className="bg-transparent hover:bg-white/10 h-8 w-8 rounded-full p-0 z-50"
              onClick={onClose}
            >
              <X className="text-gray-400 hover:text-white" size={20} />
            </Button>
          </div>

          <div className="px-6 pt-0 flex flex-col gap-4">
             {/* Title Input moved down */}

            {/* Tabs / Type Switcher */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="flex items-center gap-2 mb-4">
                <TabsList className="bg-transparent p-0 h-auto gap-2 border-0 w-full justify-start">
                  <TabsTrigger
                    value="consulta"
                    className="rounded-md px-6 py-2 text-sm font-medium border border-[#2d3152] bg-[#1a1e45] text-gray-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 hover:bg-blue-600/20 data-[state=active]:hover:bg-blue-700 transition-all cursor-pointer h-auto w-full"
                  >
                    Consulta
                  </TabsTrigger>
                  <TabsTrigger
                    value="bloqueio"
                    className="rounded-md px-6 py-2 text-sm font-medium border border-[#2d3152] bg-[#1a1e45] text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100 data-[state=active]:border-gray-500 hover:bg-gray-700/50 data-[state=active]:hover:bg-gray-600 transition-all cursor-pointer h-auto w-full"
                  >
                    Bloqueio
                  </TabsTrigger>
                </TabsList>
              </div>

               {/* Title Input */}
               <div className="w-full">
               <input
                type="text"
                placeholder={activeTab === 'consulta' ? "Nome do paciente" : "Adicionar título"}
                className="w-full bg-transparent border-0 border-b border-gray-600 text-2xl font-normal text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-0 py-2 transition-colors"
                value={title ?? ""}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
               <p className="text-xs text-gray-400 mt-1">
                 {activeTab === 'consulta' ? 'Adicione o nome do paciente para a consulta' : 'Defina um título para o bloqueio e agenda'}
               </p>
            </div>

              <TabsContent value="bloqueio" className="mt-4">
               <BlockContent {...blockProps} />
              </TabsContent>
              <TabsContent value="consulta" className="mt-4">
                <AppoimentContent {...appointmentProps} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DraggableModalContent>
    </DndContext>
  );
};
