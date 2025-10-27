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
  step?: number;
  setStep?: (step: number | ((prev: number) => number)) => void;
  prevStep?: () => void;
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
  step,
  setStep,
  prevStep,
}: Step3Props) {
  const goPrev = () => {
    if (prevStep) return prevStep();
    if (setStep) return setStep((p) => p - 1);
    return;
  };
  return (
    <>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h4 className="mb-0 font-semibold text-lg text-[30px]">Seus horários de trabalho</h4>
          <p className="text-muted-foreground mb-4 text-[20px]">Defina seus horários padrão. Você poderá alterá-los depois.</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          className={
            "font-semibold text-[#141736] flex items-center gap-2 px-6 py-3 bg-transparent border-none shadow-none" +
            (step === 1 ? " hidden" : "")
          }
          onClick={goPrev}
        >
          <span aria-hidden>←</span> VOLTAR
        </Button>
      </div>
      <div className="">
        <div className="flex gap-4">
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
          {singleLocationMode === false && (
            <CustomRadioInput
              label="Horário por local de trabalho"
              htmlFor="porLocal"
              name="tipoHorario"
              Icon={undefined}
              value="porLocal"
              checked={scheduleMode === "porLocal"}
              subtitle="Tenho horários diferentes para cada local"
              onChange={() => setScheduleMode("porLocal")}
            />
          )}
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
            <div className="flex flex-wrap justify-center gap-4">
              {([
                "segunda",
                "terça",
                "quarta",
                "quinta",
                "sexta",
                "sábado",
                "domingo",
              ] as DayKey[]).map((d) => (
                <div key={d} className="flex items-center justify-between gap-4 border p-2 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Checkbox checked={fixedDays.includes(d)} onCheckedChange={() => toggleFixedDay(d)} />
                    <div className="w-24 capitalize">{d}</div>
                  </div>
                </div>
              ))}
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
                  className={`flex items-center justify-between gap-4 border p-2 rounded-lg transition-discrete ${!isWorking ? "bg-gray-100" : "bg-white hover:shadow-[3px_4px_35px_#1417362B]"}`}
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
          </div>
        )}

        {scheduleMode === "porLocal" && (
          <div className="mt-6">
            {locations.map((loc) => (
              <Accordion type="single" collapsible key={loc.id}>
                <AccordionItem value="item-1" className="!border rounded-lg mb-4 hover:shadow-[3px_4px_35px_#1417362B] transition-shadow">
                  <AccordionTrigger className="cursor-pointer !no-underline p-4">
                    <div className="flex flex-col">
                      <p className="font-semibold">Apelido do local</p>
                      <p className="text-sm text-muted-foreground">cidade / estado</p>
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
                          className={`flex items-center justify-between gap-4 border px-2 rounded-lg transition-discrete py-1 ${!isWorking ? "bg-gray-100" : "bg-white hover:shadow-[3px_4px_35px_#1417362B]"}`}
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
            ))}
          </div>
        )}
      </div>
    </>
  );
}
