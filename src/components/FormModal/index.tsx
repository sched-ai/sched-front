import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClockPlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "../ui/input";
import background from "../../assets/schedule_modal_background.png";
import { NaturalLanguagePicker } from "../NaturalLanguagePicker";
import { Switch } from "../ui/switch";
interface FormModalProps {
  isOpen?: boolean;
  selectedDateTime?: { day: string; hour: string } | null;
  onClose?: () => void;
}

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

  useEffect(() => {
    if (isOpen && selectedDateTime) {
      setStartHour(selectedDateTime.hour);
      setEndHour(getEndHour(selectedDateTime.hour));
    } else if (isOpen && !selectedDateTime) {
      setStartHour("");
      setEndHour("");
    }
  }, [isOpen, selectedDateTime]);

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="border-none overflow-hidden bg-cover py-8"
        showCloseButton={false}
        style={{ backgroundImage: `url(${background})` }}
      >
        <DialogHeader className="flex-row justify-between">
          <div>
            <DialogTitle className="text-white font-medium">
              Novo Agendamento
            </DialogTitle>
            <DialogDescription className="text-[14px] text-[#A4A4A4]">
              Preencha o formulário para criar um novo agendamento.
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            className="bg-transparent !p-0 hover:bg-transparent h-fit"
            onClick={onClose}
          >
            <X className="text-white cursor-pointer" size={20} />
          </Button>
        </DialogHeader>
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
                  <NaturalLanguagePicker />
                  <Input
                    type="time"
                    className="bg-white/15 border-white max-w-[100px]"
                    value={startHour}
                    onChange={e => setStartHour(e.target.value)}
                  />
                  -
                  <Input
                    type="time"
                    className="bg-white/15 border-white max-w-[100px]"
                    value={endHour}
                    onChange={e => setEndHour(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 items-center text-[16px]">
                  <Switch className="data-[state=checked]:bg-[#0177FB] data-[state=unchecked]:bg-[#5E5E5E]" />{" "}
                  Repetir
                </div>
                <textarea className="border p-3 min-h-[100px] border-white bg-white/15 rounded-[10px]" placeholder="Descrição do bloqueio"/>
                <Button className="self-end !text-[16px] mt-4" type="submit" variant='seccondary'>Salvar</Button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="consulta">Change your consulta here.</TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
