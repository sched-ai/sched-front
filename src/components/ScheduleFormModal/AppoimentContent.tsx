import { Clock, MapPin, Briefcase } from "lucide-react";
// plain import removed
import { Button } from "../ui/button";
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
import type { Matcher } from "react-day-picker";
import type { TimePickerProps } from "antd";
import { TimePickerField } from "./TimePickerField";

const pad2 = (value: number) => String(value).padStart(2, "0");

const buildUtcLikeIso = (date: { day: number; month: number; year: number }, hour: string) => {
  const [hStr = "0", mStr = "0"] = hour.split(":");
  const h = Number(hStr);
  const m = Number(mStr);

  return `${date.year}-${pad2(date.month)}-${pad2(date.day)}T${pad2(h)}:${pad2(m)}:00.000Z`;
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
}: IProps) => {
  const { userData, userLoading } = useUser();
  const { data: services } = useGetAllServices();
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
  const workplaces = Array.isArray(rawWorkplaces)
    ? rawWorkplaces
    : rawWorkplaces
      ? [rawWorkplaces]
      : [];

  useEffect(() => {
    if (!location && workplaces.length > 0) {
      setLocation(String(workplaces[0].id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, workplaces]);

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

    const payload = {
      clientId: clientId || undefined,
      serviceId: service || undefined,
      workplaceId: location || undefined,
      employeeId: professional || undefined,
      startDate: buildUtcLikeIso({ day, month, year }, startHour),
      duration,
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
      <div className="flex items-start gap-4">
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
                ariaLabel="Fim da consulta"
                disabledTime={endDisabledTime}
                onChange={(next) => setEndHour(next)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="flex items-start gap-4">
        <div className="mt-3">
          <MapPin className="text-gray-400" size={20} />
        </div>
        <div className="flex-1">
          <Select
            value={location}
            onValueChange={(val: string) => setLocation(val)}
            disabled={userLoading || workplaces.length === 0}
          >
            <SelectTrigger className="w-full border-0 border-b border-gray-600 rounded-none px-0 bg-transparent text-white data-[placeholder]:text-gray-400 focus:ring-0 focus:border-blue-500 h-10">
              <SelectValue placeholder="Adicionar local" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {workplaces.map((workplace) => (
                <SelectItem key={workplace.id} value={String(workplace.id)}>
                  {workplace.nickname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Service Section */}
      <div className="flex items-start gap-4">
        <div className="mt-3">
          <Briefcase className="text-gray-400" size={20} />
        </div>
        <div className="flex-1">
          <Select
            value={service}
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
            disabled={services?.length === 0 || !services}
          >
            {(!services || services.length === 0) ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <SelectTrigger className="w-full border-0 border-b border-gray-600 rounded-none px-0 bg-transparent text-white data-[placeholder]:text-gray-400 focus:ring-0 focus:border-blue-500 h-10">
                    <SelectValue placeholder="Adicionar serviço" />
                  </SelectTrigger>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>Nenhum serviço encontrado</TooltipContent>
              </Tooltip>
            ) : (
              <SelectTrigger className="w-full border-0 border-b border-gray-600 rounded-none px-0 bg-transparent text-white data-[placeholder]:text-gray-400 focus:ring-0 focus:border-blue-500 h-10">
                <SelectValue placeholder="Adicionar serviço" />
              </SelectTrigger>
            )}
            <SelectContent className="max-h-[200px]">
              {services?.map((service) => (
                <SelectItem key={service.id} value={String(service.id)}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 py-2 min-w-[100px]"
          >
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </form>
  );
};
