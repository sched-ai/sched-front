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
import { useGetAllServices } from "@/hooks/api/useGetAllServices";
import { useCreateAppointment } from "@/hooks/api/useCreateAppointment";
import { useUpdateAppointment } from "@/hooks/api/useUpdateAppointment";

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
  onClose?: () => void;
  appointmentId?: string;
}

export const AppoimentContent = ({
  title,
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
  onClose,
  appointmentId
}: IProps) => {
  const { userData, userLoading } = useUser();
  const { data: services } = useGetAllServices();
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

    const [startH, startM] = startHour.split(":").map((s) => Number(s));
    const startDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), startH ?? 0, startM ?? 0));

    let duration: number | undefined = undefined;
    if (endHour) {
      const [endH, endM] = endHour.split(":").map((s) => Number(s));
      const endDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), endH ?? 0, endM ?? 0));
      const diffMs = endDate.getTime() - startDate.getTime();
      if (diffMs > 0) {
        duration = Math.floor(diffMs / 60000); // minutes
      }
    }

    const payload = {
      clientId: null,
      clientName: title || null,
      serviceId: service || null,
      workplaceId: location || null,
      startDate: startDate.toISOString(),
      duration,
    };

    console.log("handleCreateConsultation", { appointmentId, payload });

    if (appointmentId) {
      console.log("Updating appointment...");
      updateAppointment({ id: appointmentId, payload });
    } else {
      console.log("Creating appointment...");
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
            />
            <div className="flex items-center gap-2">
              <input
                id="inicioConsulta"
                type="time"
                style={{ colorScheme: "dark" }}
                className="bg-transparent border-b border-gray-600 focus:border-blue-500 text-white p-1 w-24 text-center focus:outline-none"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
              />
              <span className="text-gray-400">-</span>
              <input
                id="fimConsulta"
                type="time"
                style={{ colorScheme: "dark" }}
                className="bg-transparent border-b border-gray-600 focus:border-blue-500 text-white p-1 w-24 text-center focus:outline-none"
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
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
            onValueChange={(val: string) => setService(val)}
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

      <div className="flex justify-end mt-4">
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
