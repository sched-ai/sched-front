import { ClockPlus, X, GripHorizontal, Notebook } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "../ui/input";
import { DatePicker } from "../DatePicker";
import { Switch } from "../ui/switch";
import { DndContext, useDraggable } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { Label } from "../ui/label";

export type EventType = {
  id: number;
  title: string;
  day: string;
  start: string;
  end: string;
  month: string;
  year: number;
  type?: "consulta" | "bloqueio";
};

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
        className="absolute top-0 right-0 left-0 h-8 pl-2 cursor-move flex items-center justify-start bg-blue-600 rounded-t-lg z-10 transition-colors"
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

export const FormModal = ({
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
        setLocation("");
        setService("");
        setRepeatEnabled(false);
        setWeekDays([false, false, false, false, false, false, false]);
        setEndOption("never");
        setOccurrences(1);
        if (
          typeof (selectedEvent).day !== "undefined" &&
          typeof (selectedEvent).month !== "undefined" &&
          typeof (selectedEvent).year !== "undefined"
        ) {
          const d = Number((selectedEvent).day);
          const m = Number((selectedEvent).month);
          const y = Number((selectedEvent).year);
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
                {selectedEvent ? "Editar Agendamento" : "Novo Agendamento"}
              </div>
              <div className="text-[14px] text-[#A4A4A4]">
                {selectedEvent
                  ? "Edite as informações do agendamento selecionado."
                  : "Preencha o formulário para criar um novo agendamento."}
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
                Agendamento
              </TabsTrigger>
              <TabsTrigger
                value="bloqueio"
                className="data-[state=active]:text-[#141736] data-[state=inactive]:text-background cursor-pointer h-[38px]"
              >
                Bloqueio
              </TabsTrigger>
            </TabsList>
            <TabsContent value="bloqueio" className="text-white">
              <form>
                <div className="relative mt-8">
                  <input
                    id="tituloBloqueio"
                    name="tituloBloqueio"
                    type="text"
                    placeholder=" "
                    className="peer h-12 w-full border-2 px-2 bg-white/5 rounded-lg border-gray-300 placeholder-transparent focus:outline-none focus:border-blue-600 focus:border-2 text-white border-x-0 border-t-0 outline-0 border-b-[2px] !border-b-[#0177FB]"
                    value={title ?? ''}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <label
                    htmlFor="tituloBloqueio"
                    className="absolute left-0 -top-6 text-sm text-white transition-all 
                    peer-placeholder-shown:left-3 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                    peer-focus:-top-6 peer-focus:text-sm peer-focus:left-0"
                  >
                    Adicionar Título
                  </label>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2 items-center text-[16px] mt-5">
                    <ClockPlus />
                    <span className="text-sm">Confirme a data e hora:</span>
                  </div>
                  <div className="flex gap-4 items-center justify-between">
                    <DatePicker
                      initialValue={
                        selectedDateTime &&
                        selectedDateTime.day &&
                        selectedDateTime.month &&
                        selectedDateTime.year
                          ? `${selectedDateTime.day
                              .toString()
                              .padStart(2, "0")}/${selectedDateTime.month
                              .toString()
                              .padStart(2, "0")}/${selectedDateTime.year}`
                          : undefined
                      }
                    />
                    <div className="flex items-center gap-3">
                      De
                      <input
                        id="inicio"
                        type="time"
                        className="border-white border p-2 py-3 h-full rounded-lg max-w-[100px] lightInput"
                        value={startHour}
                        onChange={(e) => setStartHour(e.target.value)}
                      />
                      Até
                      <input
                        type="time"
                        className="border-white border p-2 py-3 h-full rounded-lg max-w-[100px] lightInput"
                        value={endHour}
                        onChange={(e) => setEndHour(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 items-center text-[16px]">
                    <Switch
                      checked={repeatEnabled}
                      onCheckedChange={(val) => setRepeatEnabled(Boolean(val))}
                      className="data-[state=checked]:bg-[#0177FB] data-[state=unchecked]:bg-[#5E5E5E]"
                    />{" "}
                    Repetir
                  </div>
                  {repeatEnabled && (
                    <div>
                      <div className=" w-full">
                        <label className="text-sm text-white/90">Repetir em</label>
                        <div className="flex justify-around mt-2">
                          {['D','S','T','Q','Q','S','S'].map((label, idx) => {
                            const selected = weekDays[idx];
                            return (
                              <button
                                key={idx}
                                type="button"
                                aria-pressed={selected}
                                onClick={() =>
                                  setWeekDays((prev) => {
                                    const copy = [...prev];
                                    copy[idx] = !copy[idx];
                                    return copy;
                                  })
                                }
                                className={`w-10 h-10 rounded-full cursor-pointer flex items-center justify-center text-sm font-medium transition-colors ${
                                  selected ? 'bg-[#0177FB] text-white' : 'bg-white/10 text-white/80'
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="text-sm text-white/90">Encerra em</label>
                        <div className="flex flex-col gap-2 mt-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="endOption"
                              checked={endOption === 'never'}
                              onChange={() => setEndOption('never')}
                            />
                            <span className="ml-2 text-white">Nunca</span>
                          </label>

                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="endOption"
                              checked={endOption === 'onDate'}
                              onChange={() => setEndOption('onDate')}
                            />
                            <span className="ml-2 text-white">Em:</span>
                            <DatePicker
                              initialValue={endDate}
                              onChange={(val?: string) => setEndDate(val)}
                            />
                          </label>

                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="endOption"
                              checked={endOption === 'afterOccurrences'}
                              onChange={() => setEndOption('afterOccurrences')}
                            />
                            <span className="ml-2 text-white">Após:</span>
                            <input
                              type="number"
                              value={occurrences ?? ''}
                              min={1}
                              onChange={(e) => {
                                const v = e.target.value;
                                if (!v) {
                                  setOccurrences(undefined);
                                  return;
                                }
                                const n = Number(v);
                                if (Number.isNaN(n) || n <= 0) {
                                  setOccurrences(1);
                                } else {
                                  setOccurrences(n);
                                }
                              }}
                              disabled={endOption !== 'afterOccurrences'}
                              className="ml-2 border border-white text-white p-2 rounded w-20"
                            />
                            <span className="text-white ml-2">ocorrências</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                  <Button
                    className="self-end !text-[16px] mt-4"
                    type="submit"
                    variant="seccondary"
                  >
                    Salvar
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="consulta" className="text-white">
              <form>
                <Input
                  type="text"
                  className="text-white placeholder:text-white/80 border-x-0 border-t-0 rounded-[10px] bg-white/15 outline-0 w-full border-b-[2px] !border-b-[#0177FB] mt-[12px]"
                  placeholder="Adicionar Paciente"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2 items-center text-[16px] mt-5">
                    <ClockPlus />
                    <span>Confirme a data e hora:</span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <DatePicker
                      initialValue={
                        selectedDateTime &&
                        selectedDateTime.day &&
                        selectedDateTime.month &&
                        selectedDateTime.year
                          ? `${selectedDateTime.day
                              .toString()
                              .padStart(2, "0")}/${selectedDateTime.month
                              .toString()
                              .padStart(2, "0")}/${selectedDateTime.year}`
                          : undefined
                      }
                    />
                    <Input
                      type="time"
                      className="bg-white/15 border-white max-w-[100px]"
                      value={startHour}
                      onChange={(e) => setStartHour(e.target.value)}
                    />
                    -
                    <Input
                      type="time"
                      className="bg-white/15 border-white max-w-[100px]"
                      value={endHour}
                      onChange={(e) => setEndHour(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-4 w-full">
                    <div className="flex gap-2 items-center text-[16px] mt-5">
                      <Notebook />
                      <span>Informações do serviço:</span>
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="w-full flex flex-col gap-2">
                        <Label className="text-white">
                          Local de atendimento
                        </Label>
                        <Input
                          type="text"
                          className="bg-white/15 border-white text-white placeholder:text-white/80"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>

                      <div className="w-full flex flex-col gap-2">
                        <Label className="text-white">Serviço</Label>
                        <Input
                          type="text"
                          className="bg-white/15 border-white text-white placeholder:text-white/80"
                          value={service}
                          onChange={(e) => setService(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
               
                  <Button
                    className="self-end !text-[16px] mt-4"
                    type="submit"
                    variant="seccondary"
                  >
                    Salvar
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DraggableModalContent>
    </DndContext>
  );
};
