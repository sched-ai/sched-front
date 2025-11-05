import CustomRadioInput from "@/components/CustomRadioInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { DayKey, DaySchedule, Location } from "@/types";

interface Step3Props {
  scheduleMode: "fixo" | "flexivel" | "porLocal";
  setScheduleMode: (v: "fixo" | "flexivel" | "porLocal") => void;
  fixedStart: string;
  setFixedStart: (v: string) => void;
  fixedEnd: string;
  setFixedEnd: (v: string) => void;
  fixedDays: DayKey[];
  toggleFixedDay: (day: DayKey) => void;
  schedule: Record<DayKey, DaySchedule>;
  handleScheduleChange: (
    day: DayKey,
    field: "working" | "start" | "end",
    value: string | boolean
  ) => void;
  singleLocationMode: boolean | null;
  locations: Location[];
  singleLocation?: Location | null;
  step?: number;
  setStep?: (step: number | ((prev: number) => number)) => void;
  prevStep?: () => void;
  /** nó opcional para renderizar acima do título (por exemplo, seta para voltar) */
  headerLeft?: React.ReactNode;
}

export default function Step3({
  scheduleMode,
  setScheduleMode,
  fixedStart,
  setFixedStart,
  fixedEnd,
  setFixedEnd,
  fixedDays,
  toggleFixedDay,
  schedule,
  handleScheduleChange,
  singleLocationMode,
  locations,
  singleLocation,
  step,
  setStep,
  prevStep,
  headerLeft,
}: Step3Props) {
  void step;
  void setStep;
  void prevStep;
  // construir a lista de locais para exibir os horários:
  const locationsForSchedule =
    singleLocationMode === true
      ? singleLocation
        ? [singleLocation]
        : []
      : locations || [];

  return (
    <>
  <div className="mb-8 flex flex-col items-start">
        {headerLeft && <div className="mb-3">{headerLeft}</div>}
        <div>
          <h4 className="mb-0 font-semibold text-lg text-[30px]">Seus horários de trabalho</h4>
          <p className="text-muted-foreground mb-4 text-[20px]">Defina seus horários padrão. Você poderá alterá-los depois.</p>
        </div>
      </div>
      <div className="">
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomRadioInput
              label="Horário Fixo"
              htmlFor="horarioFixo"
              name="tipoHorario"
              Icon={undefined}
              value="fixo"
              checked={scheduleMode === "fixo"}
              subtitle="Tenho horários iguais todos os dias"
              onChange={() => setScheduleMode("fixo")}
            />
          </div>
          <div className="flex-1">
            <CustomRadioInput
              label="Horário Flexível"
              htmlFor="flexivel"
              name="tipoHorario"
              Icon={undefined}
              value="flexivel"
              checked={scheduleMode === "flexivel"}
              subtitle="Tenho horários diferentes"
              onChange={() => setScheduleMode("flexivel")}
            />
          </div>
          <div className={`flex-1 ${locationsForSchedule.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
            <CustomRadioInput
              label="Horário por local"
              htmlFor="porLocal"
              name="tipoHorario"
              Icon={undefined}
              value="porLocal"
              checked={scheduleMode === "porLocal"}
              subtitle="Tenho horários diferentes para cada local"
              onChange={() => {
                if (locationsForSchedule.length > 0) setScheduleMode("porLocal");
              }}
            />
          </div>
        </div>

        {scheduleMode === "fixo" && (
          <div className="mt-6 grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-4">
              <p className="font-semibold">Selecione o horário de trabalho:</p>
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Horário de Início</Label>
                  <Input type="time" value={fixedStart} onChange={(e) => setFixedStart(e.target.value)} />
                </div>
                -
                <div className="flex flex-col gap-2">
                  <Label>Horário de Término</Label>
                  <Input type="time" value={fixedEnd} onChange={(e) => setFixedEnd(e.target.value)} />
                </div>
              </div>
            </div>
            <p className="font-semibold">Selecione os dias da semana:</p>
            <div className="mt-2 grid gap-2">
              {( [
                "segunda",
                "terça",
                "quarta",
                "quinta",
                "sexta",
                "sábado",
                "domingo",
              ] as DayKey[]).map((d) => {
                const isSelected = fixedDays.includes(d);
                return (
                  <div
                    key={d}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleFixedDay(d)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleFixedDay(d);
                      }
                    }}
                    className={`flex items-center justify-between gap-4 border p-4 rounded-lg transition-discrete ${!isSelected ? "bg-gray-100" : "bg-white hover:shadow-[3px_4px_35px_#1417362B]"}`}
                  >
                    <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={isSelected} onCheckedChange={() => toggleFixedDay(d)} onClick={(e) => e.stopPropagation()} />
                      <div className="w-32 capitalize">{d}</div>
                    </div>
                    {/* lado direito vazio para combinar com o layout flexível */}
                    <div className="w-40" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {scheduleMode === "flexivel" && (
          <div className="mt-6 grid gap-2">
            {(Object.keys(schedule) as DayKey[]).map((day) => {
              const isWorking = Boolean(schedule[day].working);
              return (
                <div
                  key={day}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleScheduleChange(day, "working", !isWorking)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleScheduleChange(day, "working", !isWorking);
                    }
                  }}
                  className={`flex items-center justify-between gap-4 border p-4 rounded-lg transition-discrete ${!isWorking ? "bg-gray-100" : "bg-white hover:shadow-[3px_4px_35px_#1417362B]"}`}
                >
                  <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={schedule[day].working} onCheckedChange={(v) => handleScheduleChange(day, "working", Boolean(v))} onClick={(e) => e.stopPropagation()} />
                    <div className="w-32 capitalize">{day}</div>
                  </div>

                  <div className={`flex items-center gap-2 ${!isWorking ? "opacity-60" : ""}`} onClick={(e) => e.stopPropagation()}>
                    <Input type="time" value={schedule[day].start} onChange={(e) => handleScheduleChange(day, "start", e.target.value)} disabled={!isWorking} />
                    <span>-</span>
                    <Input type="time" value={schedule[day].end} onChange={(e) => handleScheduleChange(day, "end", e.target.value)} disabled={!isWorking} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {scheduleMode === "porLocal" && (
          <div className="mt-6">
            {locationsForSchedule.length === 0 ? (
              <div className="text-sm text-muted-foreground">Nenhum local cadastrado.</div>
            ) : (
              locationsForSchedule.map((loc) => (
                <Accordion type="single" collapsible key={loc.id}>
                  <AccordionItem value={`loc-${loc.id}`} className="!border rounded-lg mb-4 hover:shadow-[3px_4px_35px_#1417362B] transition-shadow">
                    <AccordionTrigger className="cursor-pointer !no-underline p-4">
                      <div className="flex flex-col">
                        <p className="font-semibold">{loc.name || `${loc.address} ${loc.number}`}</p>
                        <p className="text-sm text-muted-foreground">{loc.city} / {loc.state}</p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="border-t py-2 grid min-[1600px]:grid-cols-2 gap-4 px-2 max-h-[400px] overflow-y-auto custom-scrollbar ">
                      {(Object.keys(schedule) as DayKey[]).map((day) => {
                        const isWorking = Boolean(schedule[day].working);
                        return (
                          <div
                            key={day}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleScheduleChange(day, "working", !isWorking)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleScheduleChange(day, "working", !isWorking);
                              }
                            }}
                            className={`flex items-center justify-between gap-4 border px-4 rounded-lg transition-discrete py-2 ${!isWorking ? "bg-gray-100" : "bg-white hover:shadow-[3px_4px_35px_#1417362B]"}`}
                          >
                            <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                              <Checkbox checked={schedule[day].working} onCheckedChange={(v) => handleScheduleChange(day, "working", Boolean(v))} onClick={(e) => e.stopPropagation()} />
                              <div className="w-24 capitalize">{day}</div>
                            </div>

                            <div className={`flex items-center gap-2 ${!isWorking ? "opacity-60" : ""}`} onClick={(e) => e.stopPropagation()}>
                              <Input type="time" value={schedule[day].start} onChange={(e) => handleScheduleChange(day, "start", e.target.value)} disabled={!isWorking} />
                              <span>-</span>
                              <Input type="time" value={schedule[day].end} onChange={(e) => handleScheduleChange(day, "end", e.target.value)} disabled={!isWorking} />
                            </div>
                          </div>
                        );
                      })}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
