import { ClockPlus, Notebook } from "lucide-react";
import { Label } from "../ui/label";
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
interface IProps {
  title: string | undefined;
  setTitle: Dispatch<SetStateAction<string | undefined>>;
  selectedDateTime: {
    day: number;
    month?: number;
    year?: number;
    hour: string;
  } | null;
  startHour: string;
  setStartHour: Dispatch<SetStateAction<string>>;
  endHour: string;
  setEndHour: Dispatch<SetStateAction<string>>;
  location: string;
  setLocation: Dispatch<SetStateAction<string>>;
  service: string;
  setService: Dispatch<SetStateAction<string>>;
  onClose?: () => void;
}

export const AppoimentContent = ({
  title,
  setTitle,
  selectedDateTime,
  startHour,
  setStartHour,
  endHour,
  setEndHour,
  location,
  setLocation,
  service,
  setService,
  onClose,
}: IProps) => {
  const { userData, userLoading } = useUser();
  const { data: services } = useGetAllServices();
  const { mutate: createAppointment } = useCreateAppointment({
      onSuccessFn: () => {
        if (onClose) {
          onClose();
        }
      },
    });  

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
    if (!selectedDateTime) return;

    const { day, month, year } = selectedDateTime;
    if (!day || !month || !year) return;

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
      clientName: title ?? null,
      serviceId: service ?? null,
      workplaceId: location ?? null,
      startDate: startDate.toISOString(),
      duration,
    };

    createAppointment(payload);
  };

  return (
    <form onSubmit={handleCreateConsultation}>
      <div className="relative mt-7">
        <input
          id="tituloConsulta"
          name="tituloConsulta"
          type="text"
          placeholder=" "
          className="peer h-12 w-full border-2 px-2 bg-white/5 rounded-lg border-gray-300 placeholder-transparent focus:outline-none focus:border-blue-600 focus:border-2 text-white border-x-0 border-t-0 outline-0 border-b-[2px] !border-b-[#0177FB]"
          value={title ?? ""}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label
          htmlFor="tituloConsulta"
          className="absolute left-0 -top-6 text-sm text-white transition-all 
                    peer-placeholder-shown:left-3 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                    peer-focus:-top-6 peer-focus:text-sm peer-focus:left-0"
        >
          Adicionar Paciente
        </label>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 items-center text-[16px] mt-4">
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
          <div className="flex items-center gap-3">
            De
            <input
              id="inicioConsulta"
              type="time"
              className="border-white border p-2 py-3 h-full rounded-lg max-w-[100px] lightInput"
              value={startHour}
              onChange={(e) => setStartHour(e.target.value)}
            />
            Até
            <input
              id="fimConsulta"
              type="time"
              className="border-white border p-2 py-3 h-full rounded-lg max-w-[100px] lightInput"
              value={endHour}
              onChange={(e) => setEndHour(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex gap-2 items-center text-[16px] mt-5">
            <Notebook />
            <span>Informações do serviço:</span>
          </div>
          <div className="flex gap-4 items-center">
            <div className="w-full flex flex-col gap-2">
              <Label className="text-white">Local de atendimento</Label>

              <Select
                value={location}
                onValueChange={(val: string) => setLocation(val)}
                disabled={userLoading || workplaces.length === 0}
              >
                <SelectTrigger className="w-full !h-[48px] border-blue-600/70 text-white bg-transparent rounded-[10px] data-[placeholder]:text-white/50 cursor-pointer hover:bg-white/5">
                  <SelectValue placeholder="Selecionar local" />
                </SelectTrigger>
                <SelectContent className="max-h-[180px]">
                  {workplaces.map((workplace) => (
                    <>
                      <SelectItem
                        key={workplace.id}
                        value={String(workplace.id)}
                      >
                        {workplace.nickname}
                      </SelectItem>
                    </>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full flex flex-col gap-2">
              <Label className="text-white">Serviço</Label>
              <Select
                value={service}
                onValueChange={(val: string) => setService(val)}
                disabled={services?.length === 0 || !services}
              >
                {(!services || services.length === 0) ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SelectTrigger className="w-full !h-[48px] border-blue-600/70 text-white bg-transparent rounded-[10px] data-[placeholder]:text-white/50 cursor-pointer hover:bg-white/5">
                        <SelectValue placeholder="Selecionar serviço" />
                      </SelectTrigger>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={6}>Nenhum serviço encontrado</TooltipContent>
                  </Tooltip>
                ) : (
                  <SelectTrigger className="w-full !h-[48px] border-blue-600/70 text-white bg-transparent rounded-[10px] data-[placeholder]:text-white/50 cursor-pointer hover:bg-white/5">
                    <SelectValue placeholder="Selecionar serviço" />
                  </SelectTrigger>
                )}
                <SelectContent className="max-h-[180px]">
                  {services?.map((service) => (
                    <>
                      <SelectItem
                        key={service.id}
                        value={String(service.id)}
                      >
                        {service.name}
                      </SelectItem>
                    </>
                  ))}
                </SelectContent>
              </Select>
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
  );
};
