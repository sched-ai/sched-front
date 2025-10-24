import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useOnboarding, type IOnboardingBody } from "@/hooks/api/useOnboarding";
import { queryClient } from "@/App";
import { formatCnpj } from "@/util/helper"; 
import type { DayKey, DaySchedule, Location, UserType } from "@/types";
import Step3 from "./Step3";
import Step2 from "./Step2";
import Step1 from "./Step1";

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
    true
  );
  const [locations, setLocations] = useState<Location[]>([]);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [singleLocation, setSingleLocation] = useState<Location | null>(null);

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
    // se estiver no modo de único local, atualiza singleLocation
    if (singleLocationMode === true) {
      if (
        editingLocation &&
        singleLocation &&
        editingLocation.id === singleLocation.id
      ) {
        setSingleLocation(locationForm);
        setEditingLocation(null);
      } else {
        setSingleLocation(locationForm);
      }
      setLocationForm(emptyLocation());
      setShowLocationForm(false);
      return;
    }

    // modo múltiplos locais
    if (editingLocation) {
      setLocations((prev) =>
        prev.map((l) => (l.id === locationForm.id ? locationForm : l))
      );
      setEditingLocation(null);
    } else {
      setLocations((prev) => [...prev, locationForm]);
    }
    setLocationForm(emptyLocation());
    // fechar formulário após adicionar/atualizar
    setShowLocationForm(false);
  };

  const removeLocation = (id: string) => {
    if (singleLocationMode === true && singleLocation?.id === id) {
      setSingleLocation(null);
      return;
    }
    setLocations((prev) => prev.filter((l) => l.id !== id));
  };

  const editLocation = (loc: Location) => {
    setEditingLocation(loc);
    setLocationForm(loc);
    // abrir formulário ao editar
    setShowLocationForm(true);
  };

  const canProceedStep1 = userType !== "";

  const canProceedLocations = () => {
    if (singleLocationMode === null) return false;
    if (singleLocationMode === true) {
      return (
        !!singleLocation ||
        locations.length > 0 ||
        !!(locationForm.address || locationForm.city)
      );
    }
    return locations.length > 0;
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

  const [scheduleMode, setScheduleMode] = useState<
    "fixo" | "flexivel" | "porLocal"
  >("porLocal");
  const [fixedStart, setFixedStart] = useState("09:00");
  const [fixedEnd, setFixedEnd] = useState("18:00");
  const [fixedDays, setFixedDays] = useState<DayKey[]>([
    "segunda",
    "terça",
    "quarta",
    "quinta",
    "sexta",
  ]);

  const toggleFixedDay = (day: DayKey) => {
    setFixedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
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
          details.locationId ||
          (singleLocationMode === true
            ? singleLocation?.id
            : locations[0]
            ? locations[0].id
            : undefined),
      }));

    const apiPayload: IOnboardingBody = {
      type: userType === "autonomo" ? "AUTONOMO" : "EMPRESA",
      professionalName: userType === "autonomo" ? area : undefined,
      fieldOfWork: userType === "autonomo" ? area : companyArea,
      professionalLicense: userType === "autonomo" ? professionalId : undefined,
      companyName: userType === "empresa" ? companyName : undefined,
      companyDocument: userType === "empresa" ? cnpj : undefined,
      workSchedules,
      locations:
        singleLocationMode === true && singleLocation
          ? [singleLocation]
          : locations,
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
      if (canProceedLocations()) nextStep();
      return;
    }
    handleFinalSubmit();
  };

  const renderMainContent = () => {
    if (step === 1) {
      return (
        <Step1
          userType={userType}
          setUserType={setUserType}
          area={area}
          setArea={setArea}
          professionalId={professionalId}
          setProfessionalId={setProfessionalId}
          companyName={companyName}
          setCompanyName={setCompanyName}
          cnpj={cnpj}
          handleCnpjChange={handleCnpjChange}
          companyArea={companyArea}
          setCompanyArea={setCompanyArea}
        />
      );
    }

    if (step === 2) {
      return (
        <Step2
          singleLocationMode={singleLocationMode}
          setSingleLocationMode={setSingleLocationMode}
          locationForm={locationForm}
          setLocationForm={setLocationForm}
          addOrUpdateLocation={addOrUpdateLocation}
          emptyLocation={emptyLocation}
          onCancel={() => {
            setShowLocationForm(false);
            setEditingLocation(null);
            setLocationForm(emptyLocation());
          }}
          singleLocation={singleLocation}
          editLocation={editLocation}
          removeLocation={removeLocation}
          showLocationForm={showLocationForm}
          setShowLocationForm={setShowLocationForm}
          locations={locations}
          setEditingLocation={setEditingLocation}
        />
      );
    }

    // step === 3
    return (
      <Step3
        scheduleMode={scheduleMode}
        setScheduleMode={setScheduleMode}
        fixedStart={fixedStart}
        setFixedStart={setFixedStart}
        fixedEnd={fixedEnd}
        setFixedEnd={setFixedEnd}
        fixedDays={fixedDays}
        toggleFixedDay={toggleFixedDay}
        schedule={schedule}
        handleScheduleChange={handleScheduleChange}
        singleLocationMode={singleLocationMode}
        locations={locations}
      />
    );
  };

  const renderFooter = () => {
    return (
      <div className={"flex justify-between items-center mt-6" + (step === 1 && " justify-end")}>
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
      className="flex flex-col justify-between h-full w-full"
    >
      <div className="h-[80%]">{renderMainContent()}</div>
      {renderFooter()}
    </form>
  );
};
