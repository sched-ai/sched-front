import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CustomRadioInput from "@/components/CustomRadioInput";
import { Building2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOnboarding, type IOnboardingBody } from "@/hooks/api/useOnboarding";
import { queryClient } from "@/App";
import { formatCnpj } from "@/util/helper";
import type { DayKey, DaySchedule, Location, UserType } from "@/types";

export const RenderStep = ({
  step,
  setStep,
}: {
  step: number;
  setStep: (step: number | ((prev: number) => number)) => void;
}) => {
  const navigate = useNavigate();
  const { mutate: submitOnboarding } = useOnboarding({
    onSuccessFn: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      navigate("/");
    },
  });
  const [userType, setUserType] = useState<UserType>("");

  const [area, setArea] = useState("");
  const [professionalId, setProfessionalId] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [companyArea, setCompanyArea] = useState("");
  const [schedule, setSchedule] = useState<Record<DayKey, DaySchedule>>({
    segunda: { working: true, start: "09:00", end: "18:00" },
    terça: { working: true, start: "09:00", end: "18:00" },
    quarta: { working: true, start: "09:00", end: "18:00" },
    quinta: { working: true, start: "09:00", end: "18:00" },
    sexta: { working: true, start: "09:00", end: "18:00" },
    sábado: { working: false, start: "09:00", end: "12:00" },
    domingo: { working: false, start: "09:00", end: "12:00" },
  });

  const [singleLocationMode, setSingleLocationMode] = useState<boolean | null>(
    null
  );
  const [locations, setLocations] = useState<Location[]>([]);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const emptyLocation = (): Location => ({
    id: Date.now().toString(),
    name: "",
    address: "",
    number: "",
    city: "",
    state: "",
    complement: "",
  });

  const [locationForm, setLocationForm] = useState<Location>(emptyLocation());

  const addOrUpdateLocation = () => {
    if (editingLocation) {
      setLocations((prev) =>
        prev.map((l) => (l.id === locationForm.id ? locationForm : l))
      );
      setEditingLocation(null);
    } else {
      setLocations((prev) => [...prev, locationForm]);
    }
    setLocationForm(emptyLocation());
  };

  const removeLocation = (id: string) => {
    setLocations((prev) => prev.filter((l) => l.id !== id));
  };

  const editLocation = (loc: Location) => {
    setEditingLocation(loc);
    setLocationForm(loc);
  };

  const canProceedStep1 = userType !== "";

  const canProceedLocations = () => {
    if (singleLocationMode === null) return false;
    if (singleLocationMode === true) {
      return (
        locations.length > 0 ||
        !!(locationForm.address || locationForm.city)
      );
    }
    return locations.length > 0;
  };

  const handleUserTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserType(e.target.value as UserType);
  };

  const handleScheduleChange = (
    day: keyof typeof schedule,
    field: "working" | "start" | "end",
    value: string | boolean
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleScheduleLocationChange = (
    day: keyof typeof schedule,
    locationId?: string
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], locationId: locationId || undefined },
    }));
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(formatCnpj(e.target.value));
  };

  const nextStep = () => setStep((prev: number) => prev + 1);
  const prevStep = () => setStep((prev: number) => prev - 1);
  const handleFinalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const dayMap: { [key: string]: number } = {
      segunda: 1,
      terça: 2,
      quarta: 3,
      quinta: 4,
      sexta: 5,
      sábado: 6,
      domingo: 0,
    };

    const workSchedules = Object.entries(schedule)
      .filter(([, details]) => details.working)
      .map(([day, details]) => ({
        dayOfWeek: dayMap[day],
        startTime: details.start,
        endTime: details.end,
        locationId:
          details.locationId || (locations[0] ? locations[0].id : undefined),
      }));

    const apiPayload: IOnboardingBody = {
      type: userType === "autonomo" ? "AUTONOMO" : "EMPRESA",
      professionalName: userType === "autonomo" ? area : undefined,
      fieldOfWork: userType === "autonomo" ? area : companyArea,
      professionalLicense: userType === "autonomo" ? professionalId : undefined,
      companyName: userType === "empresa" ? companyName : undefined,
      companyDocument: userType === "empresa" ? cnpj : undefined,
      workSchedules,
      locations,
    };

    submitOnboarding(apiPayload);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (canProceedStep1) nextStep();
      return;
    }

    if (step === 2) {
      // ensure locations chosen
      if (canProceedLocations()) nextStep();
      return;
    }

    // step === 3
    handleFinalSubmit();
  };

  const renderMainContent = () => {
    if (step === 1) {
      return (
        <>
          <div className="mb-8">
            <h4 className="mb-0 font-semibold text-lg text-[24px]">
              Sobre seu negócio
            </h4>
            <p className="text-muted-foreground text-[16px]">
              nos informe qual perfil você se encaixa
            </p>
          </div>
          <div className="space-y-6">
            <p className="text-[20px] font-semibold text-gray-800 tracking-tight">
              Como você gostaria de usar a SchedApp?
            </p>
            <div className="flex flex-col gap-4 mt-8">
              <CustomRadioInput
                label="Empresa"
                htmlFor="empresa"
                name="userType"
                Icon={Building2}
                value="empresa"
                checked={userType === "empresa"}
                subtitle="Para gerenciar sua empresa"
                onChange={handleUserTypeChange}
              />
              <CustomRadioInput
                label="Profissional Autônomo"
                htmlFor="autonomo"
                name="userType"
                Icon={User}
                value="autonomo"
                checked={userType === "autonomo"}
                subtitle="Para gerenciar sua agenda"
                onChange={handleUserTypeChange}
              />
            </div>
            <div className="grid grid-cols-1 w-full justify-between gap-4 min-[1447px]:grid-cols-2">
              {userType === "autonomo" && (
                <>
                  <div className="w-full">
                    <Input
                      type="text"
                      label="Sua área de atuação"
                      id="area"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="Ex: Psicologia, Fisioterapia"
                      required
                    />
                  </div>
                  <div className="w-full">
                    <Input
                      label="Nº de registro profissional"
                      type="text"
                      id="professionalId"
                      value={professionalId}
                      onChange={(e) => setProfessionalId(e.target.value)}
                      placeholder="Ex: CRP 01/12345"
                      required
                    />
                  </div>
                </>
              )}

              {userType === "empresa" && (
                <>
                  <div className="w-full">
                    <Input
                      type="text"
                      label="Nome da sua empresa"
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Ex: Clínica Bem-Estar"
                      required
                    />
                  </div>
                  <div className="w-full">
                    <Input
                      type="text"
                      label="CNPJ"
                      id="cnpj"
                      value={cnpj}
                      onChange={handleCnpjChange}
                      placeholder="00.000.000/0001-00"
                      maxLength={18}
                      required
                    />
                  </div>
                  <div className="w-full">
                    <Input
                      type="text"
                      label="Principal área de atuação"
                      id="companyArea"
                      value={companyArea}
                      onChange={(e) => setCompanyArea(e.target.value)}
                      placeholder="Ex: Odontologia"
                      required
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <div className="mb-8">
            <h4 className="mb-0 font-semibold text-lg text-[24px]">
              Onde você atende?
            </h4>
            <p className="text-muted-foreground text-[16px]">
              Cadastre os locais físicos onde você realiza atendimentos.
            </p>
          </div>
          <div className="space-y-4">
            <p className="font-semibold">
              Em quantos locais você realiza atendimentos?
            </p>
            <div className="flex gap-4">
              <CustomRadioInput
                label="Em um único local"
                htmlFor="single-local"
                name="locationsMode"
                Icon={Building2}
                value="single"
                checked={singleLocationMode === true}
                subtitle="Uso apenas um endereço principal"
                onChange={() => {
                  setSingleLocationMode(true);
                  setLocations([]);
                  setLocationForm(emptyLocation());
                }}
              />
              <CustomRadioInput
                label="Em múltiplos locais"
                htmlFor="multiple-locals"
                name="locationsMode"
                Icon={Building2}
                value="multiple"
                checked={singleLocationMode === false}
                subtitle="Tenho mais de um local de atendimento"
                onChange={() => {
                  setSingleLocationMode(false);
                  setLocations([]);
                  setLocationForm(emptyLocation());
                }}
              />
            </div>

            {singleLocationMode === true && (
              <div className="mt-10 space-y-2 p-4 border rounded-lg relative">
                <p className="font-semibold bg-white absolute -top-4 left-2 py-1 px-2">
                  Endereço:
                </p>
                <div className="grid md:grid-cols-3 grid-cols-1 gap-4 mt-4">
                  <Input
                    type="text"
                    label="Endereço (Rua)"
                    value={locationForm.address}
                    onChange={(e) =>
                      setLocationForm((p: Location) => ({
                        ...p,
                        address: e.target.value,
                      }))
                    }
                  />
                  <Input
                    type="text"
                    label="Número"
                    value={locationForm.number}
                    onChange={(e) =>
                      setLocationForm((p: Location) => ({
                        ...p,
                        number: e.target.value,
                      }))
                    }
                  />
                  <Input
                    type="text"
                    label="Estado"
                    value={locationForm.state}
                    onChange={(e) =>
                      setLocationForm((p: Location) => ({
                        ...p,
                        state: e.target.value,
                      }))
                    }
                  />
                    <Input
                      type="text"
                      label="Cidade"
                      value={locationForm.city}
                      onChange={(e) =>
                        setLocationForm((p: Location) => ({
                          ...p,
                          city: e.target.value,
                        }))
                      }
                    />
                  <Input
                    type="text"
                    label="Complemento (opcional)"
                    value={locationForm.complement}
                    onChange={(e) =>
                      setLocationForm((p: Location) => ({
                        ...p,
                        complement: e.target.value,
                      }))
                    }
                    className="md:col-span-2"
                  />
                </div>
              </div>
            )}

            {singleLocationMode === false && (
              <div className="mt-10">
                <div className="space-y-2">
                  {locations.length === 0 ? null : (
                    <div className="space-y-2">
                      {locations.map((loc) => (
                        <div
                          key={loc.id}
                          className="flex justify-between items-center border p-2 rounded-lg mb-4"
                        >
                          <div>
                            <p className="font-semibold">
                              {loc.name || `${loc.address} ${loc.number}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {loc.city} / {loc.state}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => editLocation(loc)}
                            >
                              Editar
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLocation(loc.id)}
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border rounded-lg p-4 mt-4 relative">
                    <p className="font-semibold bg-white absolute -top-4 left-2 py-1 px-2">
                      Adicionar Local:
                    </p>
                    <p className="font-medium"></p>
                    <div className="grid md:grid-cols-3 grid-cols-1 gap-4 mt-4">
                     
                      <Input
                        type="text"
                        label="Endereço (Rua)"
                        value={locationForm.address}
                        onChange={(e) =>
                          setLocationForm((p: Location) => ({
                            ...p,
                            address: e.target.value,
                          }))
                        }
                      />
                      <Input
                        type="text"
                        label="Número"
                        value={locationForm.number}
                        onChange={(e) =>
                          setLocationForm((p: Location) => ({
                            ...p,
                            number: e.target.value,
                          }))
                        }
                      />
                        <Input
                          type="text"
                          label="Estado"
                          value={locationForm.state}
                          onChange={(e) =>
                            setLocationForm((p: Location) => ({
                              ...p,
                              state: e.target.value,
                            }))
                          }
                        />
                      <Input
                        type="text"
                        label="Cidade"
                        value={locationForm.city}
                        onChange={(e) =>
                          setLocationForm((p: Location) => ({
                            ...p,
                            city: e.target.value,
                          }))
                        }
                      />
                      <Input
                        type="text"
                        label="Complemento (opcional)"
                        value={locationForm.complement}
                        onChange={(e) =>
                          setLocationForm((p: Location) => ({
                            ...p,
                            complement: e.target.value,
                          }))
                        }
                        className="md:col-span-2"
                      />
                       <Input
                        type="text"
                        label="Apelido do Local"
                        value={locationForm.name}
                        onChange={(e) =>
                          setLocationForm((p: Location) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                        tooltipMessage="Este campo se refere a como este endereço será chamado no sistema para facilitar suas interações."
                      />
                    </div>
                    <div className="flex gap-2 mt-3 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="px-4 font-medium"
                        onClick={() => setLocationForm(emptyLocation())}
                      >
                        Limpar
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          addOrUpdateLocation();
                        }}
                        className="px-4 font-medium !text-[14px]"
                      >
                        Salvar local
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      );
    }

    // step === 3
    return (
      <>
        <div className="mb-8">
          <h4 className="mb-0 font-semibold text-lg text-[24px]">
            Seus horários de trabalho
          </h4>
          <p className="text-muted-foreground mb-4 text-[16px]">
            Defina seus horários padrão. Você poderá alterá-los depois.
          </p>
        </div>
        <div className="space-y-3">
          {Object.keys(schedule).map((day) => {
            const dayKey = day as keyof typeof schedule;
            const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
            return (
              <div
                key={dayKey}
                className="flex flex-col md:flex-row justify-between items-center gap-x-2 md:gap-x-4 w-full"
              >
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Checkbox
                    id={dayKey}
                    checked={schedule[dayKey].working}
                    onCheckedChange={(checked) =>
                      handleScheduleChange(dayKey, "working", !!checked)
                    }
                    className=" cursor-pointer"
                  />
                  <Label
                    htmlFor={dayKey}
                    className="cursor-pointer capitalize text-[20px] font-semibold text-gray-800 tracking-tight"
                  >
                    {dayLabel}
                  </Label>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Input
                    type="time"
                    value={schedule[dayKey].start}
                    onChange={(e) =>
                      handleScheduleChange(dayKey, "start", e.target.value)
                    }
                    disabled={!schedule[dayKey].working}
                    className="w-full max-w-[120px]"
                  />
                  <span
                    className={
                      !schedule[dayKey].working ? "text-muted-foreground" : ""
                    }
                  >
                    às
                  </span>
                  <Input
                    type="time"
                    value={schedule[dayKey].end}
                    onChange={(e) =>
                      handleScheduleChange(dayKey, "end", e.target.value)
                    }
                    disabled={!schedule[dayKey].working}
                    className="w-full max-w-[120px]"
                  />
                </div>
                <div className="w-full md:w-1/3 mt-2 md:mt-0">
                  {singleLocationMode === true ? (
                    <div className="text-sm font-medium">
                      Local:{" "}
                      {locations[0]
                        ? locations[0].name ||
                          `${locations[0].address} ${locations[0].number}`
                        : "Local Principal"}
                    </div>
                  ) : (
                    <Select
                      value={schedule[dayKey].locationId ?? ""}
                      onValueChange={(val) =>
                        handleScheduleLocationChange(dayKey, val || undefined)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue>
                          {schedule[dayKey].locationId
                            ? locations.find(
                                (l) => l.id === schedule[dayKey].locationId
                              )?.name
                            : "Selecione o local"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name || `${loc.address} ${loc.number}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderFooter = () => {
    return (
      <div className="flex justify-between items-center mt-6">
        <Button
          type="button"
          variant="ghost"
          className={
            "font-semibold text-[#141736] flex items-center gap-2 px-6 py-3 bg-transparent border-none shadow-none" +
            (step === 1 ? " hidden" : "")
          }
          onClick={prevStep}
        >
          <span aria-hidden>←</span> VOLTAR
        </Button>

        {step < 3 ? (
          !(
            (step === 1 && canProceedStep1) ||
            (step === 2 && canProceedLocations())
          ) ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button
                      type="button"
                      variant="outline"
                      disabled
                      className="font-semibold text-[#141736] flex items-center gap-2 px-6 py-3 bg-transparent border-none shadow-none"
                    >
                      PRÓXIMO <span aria-hidden>→</span>
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {step === 1
                      ? "Selecione uma opção para continuar."
                      : "Adicione ao menos um local para continuar."}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button
              type="submit"
              variant="outline"
              className="font-semibold text-[#141736] flex items-center gap-2 px-6 py-3 bg-transparent border-none shadow-none"
            >
              PRÓXIMO <span aria-hidden>→</span>
            </Button>
          )
        ) : (
          <Button
            type="submit"
            variant="outline"
            className="font-semibold text-[#141736] flex items-center gap-2 px-6 py-3 bg-transparent border-none shadow-none"
          >
            FINALIZAR <span aria-hidden>→</span>
          </Button>
        )}
      </div>
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-between h-full w-full max-w-[920px] self-center xl:border-x border-x-blue-500 xl:px-10"
    >
      <div>{renderMainContent()}</div>
      {renderFooter()}
    </form>
  );
};
