import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import bgWaves from "@/assets/abstract_waves.jpg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DayKey = "Dom" | "Seg" | "Ter" | "Qua" | "Qui" | "Sex" | "Sáb";
const ALL_DAYS: DayKey[] = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DAY_FULL: Record<DayKey, string> = {
  Dom: "Domingo",
  Seg: "Segunda-Feira",
  Ter: "Terça-Feira",
  Qua: "Quarta-Feira",
  Qui: "Quinta-Feira",
  Sex: "Sexta-Feira",
  Sáb: "Sábado",
};

export interface LocationData {
  id?: string;
  address: string;
  neighborhood: string;
  complement: string;
  rooms: string;
  scheduleType: "fixed" | "flexible";
  fixedDays: DayKey[];
  fixedStart: string;
  fixedEnd: string;
  flexibleSchedule: Record<DayKey, { active: boolean; start: string; end: string }>;
}

const defaultFlexible = (): LocationData["flexibleSchedule"] =>
  Object.fromEntries(
    ALL_DAYS.map((d) => [d, { active: d !== "Dom" && d !== "Sáb", start: "09:00", end: "18:00" }])
  ) as LocationData["flexibleSchedule"];

interface LocationModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  location?: LocationData | null;
  onSave?: (data: LocationData) => void;
}

const inputCls =
  "w-full bg-transparent border border-white/70 rounded-[10px] px-3 py-2 text-sm text-white placeholder-white/50 outline-none focus:border-white transition";

const timeCls =
  "bg-transparent border border-white/70 rounded-[8px] px-2 py-1 text-sm text-white outline-none focus:border-white w-[90px] lightInput";

export const LocationModal = ({
  isOpen,
  setIsOpen,
  location,
  onSave,
}: LocationModalProps) => {
  const isEdit = !!location;

  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [complement, setComplement] = useState("");
  const [rooms, setRooms] = useState("1");
  const [scheduleType, setScheduleType] = useState<"fixed" | "flexible">("fixed");
  const [fixedDays, setFixedDays] = useState<DayKey[]>(["Seg", "Ter", "Qua", "Qui", "Sex"]);
  const [fixedStart, setFixedStart] = useState("09:00");
  const [fixedEnd, setFixedEnd] = useState("18:00");
  const [flexibleSchedule, setFlexibleSchedule] = useState<LocationData["flexibleSchedule"]>(defaultFlexible());

  useEffect(() => {
    if (isOpen) {
      if (location) {
        setAddress(location.address);
        setNeighborhood(location.neighborhood);
        setComplement(location.complement);
        setRooms(location.rooms);
        setScheduleType(location.scheduleType);
        setFixedDays(location.fixedDays);
        setFixedStart(location.fixedStart);
        setFixedEnd(location.fixedEnd);
        setFlexibleSchedule(location.flexibleSchedule);
      } else {
        setAddress("");
        setNeighborhood("");
        setComplement("");
        setRooms("1");
        setScheduleType("fixed");
        setFixedDays(["Seg", "Ter", "Qua", "Qui", "Sex"]);
        setFixedStart("09:00");
        setFixedEnd("18:00");
        setFlexibleSchedule(defaultFlexible());
      }
    }
  }, [isOpen, location]);

  const toggleFixedDay = (day: DayKey) =>
    setFixedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );

  const toggleFlexDay = (day: DayKey) =>
    setFlexibleSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], active: !prev[day].active },
    }));

  const setFlexTime = (day: DayKey, field: "start" | "end", val: string) =>
    setFlexibleSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: val },
    }));

  const handleClose = () => setIsOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.({
      id: location?.id,
      address,
      neighborhood,
      complement,
      rooms,
      scheduleType,
      fixedDays,
      fixedStart,
      fixedEnd,
      flexibleSchedule,
    });
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent showCloseButton={false} className="fixed left-1/2 top-1/2 z-50 w-[680px] max-w-[98%] overflow-hidden -translate-x-1/2 -translate-y-1/2 px-0 rounded-2xl border border-[#1C3760] bg-[rgba(3,8,22,0.85)] shadow-2xl">
        {/* Background wave */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: `url(${bgWaves})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "blur(45px) brightness(0.6)",
            transform: "scale(1.02)",
          }}
        />
        <div className="absolute inset-0 -z-10 bg-[rgba(8,18,40,0.55)]" />

        <div className="relative z-10 p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <DialogTitle className="text-lg text-white font-semibold">
                {isEdit ? "Editar Localização" : "Adicionar Localização"}
              </DialogTitle>
              <DialogDescription className="text-sm text-white/70 mt-0.5">
                Preencha o formulário para {isEdit ? "editar o" : "adicionar um novo"} endereço
              </DialogDescription>
            </div>
            <button
              aria-label="Fechar"
              onClick={handleClose}
              className="text-white/80 hover:text-white text-lg leading-none cursor-pointer"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Address — large with pencil */}
            <div className="relative">
              <input
                type="text"
                placeholder="Endereço Novo"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`${inputCls} pr-9 h-[44px]`}
                required
              />
              <Pencil size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60" />
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Bairro"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className={`${inputCls} pr-9 h-[44px]`}
                required
              />
              <Pencil size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60" />
            </div>

            {/* Complement + Rooms row */}
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Complemento"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                className={`${inputCls} h-[40px] flex-1`}
              />
              <Select value={rooms} onValueChange={setRooms}>
                <SelectTrigger className="w-[140px] h-[40px] border-white/70 text-white bg-transparent rounded-[10px] data-[placeholder]:text-white/50 text-sm flex-shrink-0">
                  <SelectValue placeholder="Nº de Salas" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} {n === 1 ? "sala" : "salas"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ── Fixed schedule ───────────────────────────────── */}
            <div className="border border-white/20 rounded-xl p-4 flex flex-col gap-3">
              {/* Radio label row */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="scheduleType"
                  checked={scheduleType === "fixed"}
                  onChange={() => setScheduleType("fixed")}
                  className="accent-white w-4 h-4 flex-shrink-0"
                />
                <span className="text-white text-sm font-medium">Horário Fixo</span>
                <span className="text-white/50 text-xs">selecione os dias de funcionamento</span>
              </label>

              {scheduleType === "fixed" && (
                <>
                  {/* Time range on its own row */}
                  <div className="flex items-center gap-2 pl-7">
                    <input
                      type="time"
                      value={fixedStart}
                      onChange={(e) => setFixedStart(e.target.value)}
                      className={timeCls}
                    />
                    <span className="text-white/60 text-sm">–</span>
                    <input
                      type="time"
                      value={fixedEnd}
                      onChange={(e) => setFixedEnd(e.target.value)}
                      className={timeCls}
                    />
                  </div>

                  {/* Day buttons */}
                  <div className="flex flex-wrap gap-2 pl-7">
                    {ALL_DAYS.map((day) => {
                      const active = fixedDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleFixedDay(day)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer ${
                            active
                              ? "bg-[#121535] border-[#121535] text-white"
                              : "bg-transparent border-white/40 text-white/60 hover:border-white/70"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* ── Flexible schedule ─────────────────────────────── */}
            <div className="border border-white/20 rounded-xl p-4 flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="scheduleType"
                  checked={scheduleType === "flexible"}
                  onChange={() => setScheduleType("flexible")}
                  className="accent-white w-4 h-4"
                />
                <span className="text-white text-sm font-medium">Horário Flexível</span>
              </label>

              {scheduleType === "flexible" && (
                <div className="flex flex-col gap-2 mt-1">
                  {ALL_DAYS.map((day) => {
                    const info = flexibleSchedule[day];
                    return (
                      <div key={day} className="flex items-center gap-3">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={info.active}
                          onChange={() => toggleFlexDay(day)}
                          className="accent-white w-4 h-4 flex-shrink-0 cursor-pointer"
                        />
                        {/* Day label */}
                        <span
                          className={`text-sm w-28 flex-shrink-0 ${
                            info.active ? "text-white" : "text-white/50"
                          }`}
                        >
                          {DAY_FULL[day]}
                        </span>

                        {/* Time pickers or "Fechado" */}
                        {info.active ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={info.start}
                              onChange={(e) => setFlexTime(day, "start", e.target.value)}
                              className={timeCls}
                            />
                            <span className="text-white/60 text-sm">–</span>
                            <input
                              type="time"
                              value={info.end}
                              onChange={(e) => setFlexTime(day, "end", e.target.value)}
                              className={timeCls}
                            />
                          </div>
                        ) : (
                          <span className="text-white/40 text-xs italic ml-1">Fechado</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Save */}
            <div className="flex justify-end mt-1">
              <Button type="submit" className="bg-white text-[#141736] px-5 py-2 rounded-[10px] text-sm font-medium hover:bg-white/90">
                Salvar
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
