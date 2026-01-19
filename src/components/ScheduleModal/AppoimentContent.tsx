import { ClockPlus, Notebook } from "lucide-react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { DatePicker } from "../DatePicker";
import type { Dispatch, SetStateAction } from "react";

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
  onClose
}: IProps) => {
  const handleCreateConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement the logic to create a consultation here
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
              <input
                id="localAtendimento"
                type="text"
                className="h-12 w-full px-3 rounded-lg bg-white/5 text-white placeholder:text-white/80 border border-transparent focus:border-blue-600"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="w-full flex flex-col gap-2">
              <Label className="text-white">Serviço</Label>
              <input
                id="servico"
                type="text"
                className="h-12 w-full px-3 rounded-lg bg-white/5 text-white placeholder:text-white/80 border border-transparent focus:border-blue-600"
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
  );
};
