import { Clock, MapPin, Briefcase, Repeat } from "lucide-react";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { DatePicker } from "../DatePicker";
import type { Dispatch, SetStateAction } from "react";
import { useEffect } from "react";
import { useUser } from "@/context/user";
import {
  Select,
  SelectContent,  
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetAllServices, type IService } from "@/hooks/api/useGetAllServices";
import { useCreateAppointment } from "@/hooks/api/useCreateAppointment";
import { useUpdateAppointment } from "@/hooks/api/useUpdateAppointment";
import { useGetClientCredits } from "@/hooks/api/useGetClientCredits";
import type { Matcher } from "react-day-picker";
import type { TimePickerProps } from "antd";
import { TimePickerField } from "./TimePickerField";
import { Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const buildLocalIso = (date: { day: number; month: number; year: number }, hour: string) => {
  const [hStr = "0", mStr = "0"] = hour.split(":");
  const h = Number(hStr);
  const m = Number(mStr);

  const yyyy = String(date.year).padStart(4, "0");
  const mm = String(date.month).padStart(2, "0");
  const dd = String(date.day).padStart(2, "0");
  const hh = String(h).padStart(2, "0");
  const min = String(m).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}T${hh}:${min}:00`;
};

interface IProps {
  title: string | undefined;
  setTitle: Dispatch<SetStateAction<string | undefined>>;
  selectedDateTime: {
    day: number;
    month: number;
    year: number;
  } | null;
  setSelectedDateTime: Dispatch<SetStateAction<{ day: number; month: number; year: number } | null>>;
  startHour: string;
  setStartHour: Dispatch<SetStateAction<string>>;
  endHour: string;
  setEndHour: Dispatch<SetStateAction<string>>;
  location: string;
  setLocation: Dispatch<SetStateAction<string>>;
  service: string;
  setService: Dispatch<SetStateAction<string>>;
  serviceName?: string;
  locationName?: string;
  professional: string;
  setProfessional: Dispatch<SetStateAction<string>>;
  onClose?: () => void;
  appointmentId?: string;
  clientId?: string | null;
  disableDate?: Matcher | Matcher[];
  startMinTime?: string;
  startMaxTime?: string;
  endMinTime?: string;
  endMaxTime?: string;
  startDisabledTime?: TimePickerProps["disabledTime"];
  endDisabledTime?: TimePickerProps["disabledTime"];
  repeatEnabled: boolean;
  setRepeatEnabled: (val: boolean) => void;
  weekDays: boolean[];
  setWeekDays: Dispatch<SetStateAction<boolean[]>>;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  setFrequency: (val: "DAILY" | "WEEKLY" | "MONTHLY") => void;
  recurringEndDate: string | undefined;
  setRecurringEndDate: (val: string | undefined) => void;
  occurrences: number | undefined;
  setOccurrences: (val: number | undefined) => void;
  endOption: "never" | "onDate" | "afterOccurrences";
  setEndOption: (val: "never" | "onDate" | "afterOccurrences") => void;
}

export const AppoimentContent = ({
  selectedDateTime,
  setSelectedDateTime,
  startHour,
  setStartHour,
  endHour,
  setEndHour,
  location,
  setLocation,
  service,
  setService,
  serviceName,
  locationName,
  professional,
  onClose,
  appointmentId,
  clientId,
  disableDate,
  startMinTime,
  startMaxTime,
  endMinTime,
  endMaxTime,
  startDisabledTime,
  endDisabledTime,
  repeatEnabled,
  setRepeatEnabled,
  weekDays,
  setWeekDays,
  frequency,
  setFrequency,
  recurringEndDate,
  setRecurringEndDate,
  occurrences,
  setOccurrences,
  endOption,
  setEndOption,
}: IProps) => {
  const { userData, userLoading } = useUser();
  const { data: services } = useGetAllServices();
  
  const { data: credits } = useGetClientCredits({ clientId });
  const matchingCredit = credits?.find(c => c.serviceId === service);

  // const { data: professionals } = useListCompanyMemberships();
  const { mutate: createAppointment, isPending: isCreating } = useCreateAppointment({
      onSuccessFn: () => {
        if (onClose) {
          onClose();
        }
      },
    });

  const { mutate: updateAppointment, isPending: isUpdating } = useUpdateAppointment({
    onSuccessFn: () => {
      if (onClose) {
        onClose();
      }
    },
  });

  const isPending = isCreating || isUpdating;

  const rawWorkplaces = userData?.membership.company.workplaces;
  const allWorkplaces = Array.isArray(rawWorkplaces)
    ? rawWorkplaces
    : rawWorkplaces
      ? [rawWorkplaces]
      : [];

  const workplaces = allWorkplaces.filter(wp => {
    if (appointmentId && String(wp.id) === location) return true;
    if (!selectedDateTime || !startHour) return true;
    
    const dayOfWeek = new Date(
      selectedDateTime.year, 
      selectedDateTime.month - 1, 
      selectedDateTime.day
    ).getDay();

    const sched = wp.schedule?.[String(dayOfWeek)];
    if (!sched || sched.startMinute === null || sched.endMinute === null) {
      return false;
    }

    const [hStr, mStr] = startHour.split(":");
    const startMins = Number(hStr) * 60 + Number(mStr);

    if (startMins < sched.startMinute || startMins >= sched.endMinute) {
      return false;
    }

    if (endHour) {
      const [eH, eM] = endHour.split(":");
      const endMins = Number(eH) * 60 + Number(eM);
      if (endMins > sched.endMinute) {
        return false;
      }
    }

    return true;
  });

  const rawAvailableServices = services?.filter((s) => {
    if (appointmentId && String(s.id) === service) return true;
    if (s.type === "PACKAGE") return false;
    if (s.workplaces && s.workplaces.length > 0) {
      return s.workplaces.some(swp => workplaces.some(w => String(w.id) === String(swp.id)));
    }
    return true;
  }) || [];

  const effectiveServiceId = service || (appointmentId && serviceName ? "mock-service-id" : service);
  const effectiveLocationId = location || (appointmentId && locationName ? "mock-location-id" : location);

  const availableServices = [...rawAvailableServices];
  if (appointmentId && effectiveServiceId && !rawAvailableServices.find(s => String(s.id) === effectiveServiceId)) {
    availableServices.push({
      id: effectiveServiceId,
      name: serviceName || "Serviço Atual",
      // Adicionando mocks para as propriedades obrigatórias
      description: null,
      duration: null,
      price: null,
      department: null,
      employee: null,
      workplaces: null,
    } as any);
  }

  const rawAvailableWorkplaces = workplaces.filter(w => {
    if (appointmentId && String(w.id) === location) return true;
    if (!service) return true;
    const selectedServiceObj = services?.find(s => String(s.id) === String(service));
    if (!selectedServiceObj?.workplaces || selectedServiceObj.workplaces.length === 0) return true;
    return selectedServiceObj.workplaces.some(swp => String(swp.id) === String(w.id));
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const availableWorkplacesForService = [...rawAvailableWorkplaces];
  if (appointmentId && effectiveLocationId && !rawAvailableWorkplaces.find(w => String(w.id) === effectiveLocationId)) {
    availableWorkplacesForService.push({
      id: effectiveLocationId,
      nickname: locationName || "Local Atual",
      // Adicionando propriedades de mock se o tipo exigir
      companyId: "",
      address: "",
      number: "",
      neighborhood: "",
      city: "",
      schedule: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
  }

  useEffect(() => {
    if (appointmentId) return;
    if (availableWorkplacesForService.length > 0 && (!location || !availableWorkplacesForService.find((w) => String(w.id) === location))) {
      setLocation(String(availableWorkplacesForService[0].id));
    } else if (availableWorkplacesForService.length === 0 && location) {
      setLocation("");
    }
  }, [availableWorkplacesForService, location, setLocation, appointmentId]);

  const handleCreateConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;
    if (!selectedDateTime) {
        console.error("No selectedDateTime");
        return;
    }

    const { day, month, year } = selectedDateTime;
    if (!day || !month || !year) {
        console.error("Invalid date components", selectedDateTime);
        return;
    }

    const [startH = 0, startM = 0] = startHour.split(":").map((s) => Number(s));
    if (Number.isNaN(startH) || Number.isNaN(startM)) {
      console.error("Invalid start hour", startHour);
      return;
    }

    let duration: number | undefined = undefined;
    if (endHour) {
      const [endH = 0, endM = 0] = endHour.split(":").map((s) => Number(s));
      if (Number.isNaN(endH) || Number.isNaN(endM)) {
        console.error("Invalid end hour", endHour);
        return;
      }

      const startTotalMinutes = startH * 60 + startM;
      const endTotalMinutes = endH * 60 + endM;
      const diffMinutes = endTotalMinutes - startTotalMinutes;

      if (diffMinutes > 0) {
        duration = diffMinutes;
      }
    }

    const convertDateFormat = (dateStr: string | undefined): string | null => {
      if (!dateStr) return null;
      const [d, m, y] = dateStr.split("/");
      return `${y}-${m}-${d}`;
    };

    const payload = {
      clientId: clientId || undefined,
      serviceId: service || undefined,
      workplaceId: location || undefined,
      employeeId: professional || undefined,
      startDate: buildLocalIso({ day, month, year }, startHour),
      duration,
      packageCreditId: matchingCredit?.id,
      ...(repeatEnabled && !appointmentId && {
        isInfiniteRecurring: repeatEnabled,
        frequency: frequency,
        days_of_week:
          frequency === "WEEKLY"
            ? weekDays.map((sel, i) => (sel ? i : -1)).filter((i) => i !== -1)
            : [],
        recurringUntilDate:
          endOption === "onDate" && recurringEndDate
            ? convertDateFormat(recurringEndDate)
            : null,
        recurringOccurrences:
          endOption === "afterOccurrences" ? occurrences : null,
      }),
    };

    if (appointmentId) {
      updateAppointment({ id: appointmentId, payload });
    } else {
      createAppointment(payload);
    }
  };
  
  return (
    <form onSubmit={handleCreateConsultation} className="flex flex-col gap-5">
      {/* Date & Time Section */}
      <div className="flex items-start gap-3">
        <div className="mt-2.5">
          <Clock className="text-gray-400" size={20} />
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
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
              onChange={(val) => {
                if (!val) return;
                const [d, m, y] = val.split("/").map(Number);
                if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
                    setSelectedDateTime({ day: d, month: m, year: y });
                }
              }}
              disabled={disableDate}
            />
            <div className="flex items-center gap-2">
              <TimePickerField
                id="inicioConsulta"
                value={startHour}
                minTime={startMinTime}
                maxTime={startMaxTime}
                ariaLabel="Início da consulta"
                disabledTime={startDisabledTime}
                onChange={(newStart) => {
                  setStartHour(newStart);
                  if (service && services && newStart) {
                    const selectedService = services.find((s: IService) => String(s.id) === String(service));
                    if (selectedService?.duration) {
                      const [hStr, mStr] = newStart.split(":");
                      const startMs = new Date(1970, 0, 1, Number(hStr), Number(mStr)).getTime();
                      const endDate = new Date(startMs + selectedService.duration * 60000);
                      const endH = String(endDate.getHours()).padStart(2, '0');
                      const endM = String(endDate.getMinutes()).padStart(2, '0');
                      setEndHour(`${endH}:${endM}`);
                    }
                  }
                }}
              />
              <span className="text-gray-400">-</span>
              <TimePickerField
                id="fimConsulta"
                value={endHour}
                minTime={endMinTime}
                maxTime={endMaxTime}
                ariaLabel="Fim"
                disabledTime={endDisabledTime}
                onChange={(next) => setEndHour(next)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Service Section */}
      <div className="flex items-start gap-4">
        <div className="mt-3">
          <Briefcase className="text-gray-400" size={20} />
        </div>
        <div className="flex-1">
          <Select
            value={effectiveServiceId}
            onValueChange={(val: string) => {
              setService(val);
              if (services && startHour) {
                const selectedService = services.find((s: IService) => String(s.id) === String(val));
                if (selectedService?.duration) {
                  const [hStr, mStr] = startHour.split(":");
                  const startMs = new Date(1970, 0, 1, Number(hStr), Number(mStr)).getTime();
                  const endDate = new Date(startMs + selectedService.duration * 60000);
                  const endH = String(endDate.getHours()).padStart(2, '0');
                  const endM = String(endDate.getMinutes()).padStart(2, '0');
                  setEndHour(`${endH}:${endM}`);
                }
              }
            }}
            disabled={availableServices.length === 0 || !!appointmentId}
          >
            {availableServices.length === 0 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <SelectTrigger className="w-full border-0 border-b border-gray-600 rounded-none px-0 bg-transparent text-white data-[placeholder]:text-gray-400 focus:ring-0 focus:border-blue-500 h-10">
                    <SelectValue placeholder="Adicionar serviço" />
                  </SelectTrigger>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>Nenhum serviço disponível para este dia/horário</TooltipContent>
              </Tooltip>
            ) : (
              <SelectTrigger className="w-full border-0 border-b border-gray-600 rounded-none px-0 bg-transparent text-white data-[placeholder]:text-gray-400 focus:ring-0 focus:border-blue-500 h-10">
                <SelectValue placeholder="Adicionar serviço" />
              </SelectTrigger>
            )}
            <SelectContent className="max-h-[200px]">
              {availableServices.map((service) => {
                const serviceCredit = credits?.find(c => c.serviceId === service.id);
                return (
                  <SelectItem key={service.id} value={String(service.id)}>
                    <div className="flex items-center gap-2">
                      <span>{service.name}</span>
                      {serviceCredit && (
                        <Badge className="h-5 px-1.5 text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">
                          {serviceCredit.remainingQuantity} crédito{serviceCredit.remainingQuantity > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {matchingCredit && (
            <p className="text-xs text-blue-400 mt-2 flex items-center gap-1">
              <Gift size={12} />
              Um Crédito será utilizado.
            </p>
          )}
        </div>
      </div>

      {/* Location Section */}
      <div className="flex items-start gap-4">
        <div className="mt-3">
          <MapPin className="text-gray-400" size={20} />
        </div>
        <div className="flex-1">
          <Select
            value={effectiveLocationId}
            onValueChange={(val: string) => setLocation(val)}
            disabled={userLoading || availableWorkplacesForService.length <= 1 || !!appointmentId}
          >
            <SelectTrigger className="w-full border-0 border-b border-gray-600 rounded-none px-0 bg-transparent text-white data-[placeholder]:text-gray-400 focus:ring-0 focus:border-blue-500 h-10 disabled:opacity-50 disabled:cursor-not-allowed">
              <SelectValue placeholder="Adicionar local" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {availableWorkplacesForService.map((workplace) => (
                <SelectItem key={workplace.id} value={String(workplace.id)}>
                  {workplace.nickname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Repeat Section — apenas ao criar, não ao editar */}
      {!appointmentId && (
        <div className="flex items-start gap-4">
          <div className="mt-0.5">
            <Repeat className={`transform transition-colors ${repeatEnabled ? "text-blue-500" : "text-gray-400"}`} size={20} />
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-white">Repetir</span>
              <Switch
                checked={repeatEnabled}
                onCheckedChange={(val) => setRepeatEnabled(Boolean(val))}
                className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-600"
              />
            </div>

            {repeatEnabled && (
              <div className="pl-0 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="border-l-2 border-gray-700 pl-4 space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Frequência</label>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-2">
                        {(["DAILY", "WEEKLY", "MONTHLY"] as const).map((opt) => (
                          <Button
                            key={opt}
                            type="button"
                            onClick={() => setFrequency(opt)}
                            className={`rounded-full px-4 h-8 text-xs font-medium transition-all ${
                              frequency === opt
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700"
                            }`}
                          >
                            {opt === "DAILY" ? "Diário" : opt === "WEEKLY" ? "Semanal" : "Mensal"}
                          </Button>
                        ))}
                      </div>

                      {frequency === "WEEKLY" && (
                        <div className="flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
                          <label className="text-xs text-gray-400">Repetir em:</label>
                          <div className="flex gap-1.5 flex-wrap">
                            {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setWeekDays((prev) => {
                                    const next = [...prev];
                                    next[i] = !next[i];
                                    return next;
                                  });
                                }}
                                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                                  weekDays[i]
                                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40 transform scale-110"
                                    : "bg-gray-800/40 border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                                }`}
                              >
                                {day}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-400">Encerramento</label>
                        <div className="flex flex-col gap-2">
                          {(["never", "onDate", "afterOccurrences"] as const).map((opt) => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="appt-endOption"
                                checked={endOption === opt}
                                onChange={() => setEndOption(opt)}
                                className="accent-blue-500"
                              />
                              <span className="text-sm text-gray-300">
                                {opt === "never" ? "Nunca" : opt === "onDate" ? "Na data" : "Após ocorrências"}
                              </span>
                            </label>
                          ))}
                        </div>
                        {endOption === "onDate" && (
                          <DatePicker
                            initialValue={recurringEndDate}
                            onChange={(val) => setRecurringEndDate(val || undefined)}
                          />
                        )}
                        {endOption === "afterOccurrences" && (
                          <input
                            type="number"
                            min={1}
                            value={occurrences ?? ""}
                            onChange={(e) => setOccurrences(e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="Nº de ocorrências"
                            className="w-40 bg-gray-800 border border-gray-600 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="sticky bottom-0 bg-[#121535] border-t border-white/10 pt-3 pb-4 flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 py-2 min-w-[100px]"
        >
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
};
