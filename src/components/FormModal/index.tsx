import { ClockPlus, X, GripHorizontal, Notebook } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "../ui/input";
import background from "../../assets/schedule_modal_background.png";
import { DatePicker } from "../DatePicker";
import { Switch } from "../ui/switch";
import { DndContext, useDraggable } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { Label } from "../ui/label";

interface FormModalProps {
  isOpen?: boolean;
  selectedDateTime?: {
    day: number;
    month?: number;
    year?: number;
    hour: string;
  } | null;
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
    const modalHeight = 700;
    
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
    backgroundImage: `url(${background})`,
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
        className="absolute top-0 right-0 left-0 h-12 cursor-move flex items-center justify-center bg-[#2C2D43] rounded-t-lg z-10 transition-colors"
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

  useEffect(() => {
    if (isOpen && selectedDateTime) {
      setStartHour(selectedDateTime.hour);
      setEndHour(getEndHour(selectedDateTime.hour));
    } else if (isOpen && !selectedDateTime) {
      setStartHour("");
      setEndHour("");
    }
    
    // Resetar posição quando o modal for fechado
    if (!isOpen) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, selectedDateTime]);

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
          className="relative flex flex-col w-full px-6 pb-6"
          style={{
            minHeight: 400,
            paddingTop: 32,
          }}
        >
          <div className="flex-row justify-between flex items-start mb-4">
            <div>
              <div className="text-white font-medium text-xl">
                Novo Agendamento
              </div>
              <div className="text-[14px] text-[#A4A4A4]">
                Preencha o formulário para criar um novo agendamento.
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
          <Tabs defaultValue="bloqueio" className="w-full">
            <TabsList className="bg-white/5 border border-white h-[48px]">
              <TabsTrigger
                value="bloqueio"
                className="data-[state=active]:text-[#141736] data-[state=inactive]:text-background cursor-pointer h-[38px]"
              >
                Bloqueio
              </TabsTrigger>
              <TabsTrigger
                value="consulta"
                className="data-[state=active]:text-[#141736] data-[state=inactive]:text-background cursor-pointer h-[38px]"
              >
                Consulta
              </TabsTrigger>
            </TabsList>
            <TabsContent value="bloqueio" className="text-white">
              <form>
                <Input
                  className="text-white placeholder:text-white/80 border-x-0 border-t-0 rounded-[10px] bg-white/15 outline-0 w-full border-b-[2px] !border-b-[#0177FB] mt-[12px]"
                  placeholder="Adicionar Título"
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
                  <div className="flex gap-2 items-center text-[16px]">
                    <Switch className="data-[state=checked]:bg-[#0177FB] data-[state=unchecked]:bg-[#5E5E5E]" />{" "}
                    Repetir
                  </div>
                  <textarea
                    className="border p-3 min-h-[100px] border-white bg-white/15 rounded-[10px]"
                    placeholder="Descrição do bloqueio"
                  />
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
                  className="text-white placeholder:text-white/80 border-x-0 border-t-0 rounded-[10px] bg-white/15 outline-0 w-full border-b-[2px] !border-b-[#0177FB] mt-[12px]"
                  placeholder="Adicionar Paciente"
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
                  <div className="flex gap-2 items-center text-[16px]">
                    <Switch className="data-[state=checked]:bg-[#0177FB] data-[state=unchecked]:bg-[#5E5E5E]" />{" "}
                    Repetir
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
                          className="bg-white/15 border-white"
                        />
                      </div>

                       <div className="w-full flex flex-col gap-2">
                        <Label className="text-white">
                          Serviço
                        </Label>
                        <Input
                          type="text"
                          className="bg-white/15 border-white"
                        />
                      </div>
                    </div>
                  </div>
                  <textarea
                    className="border p-3 min-h-[100px] border-white bg-white/15 rounded-[10px]"
                    placeholder="Descrição da consulta"
                  />
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
