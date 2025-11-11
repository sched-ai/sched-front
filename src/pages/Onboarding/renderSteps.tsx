import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useOnboarding, type IOnboardingBody } from "@/hooks/api/useOnboarding";
import { formatCnpj } from "@/util/helper";
import { ArrowLeft } from "lucide-react";
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
      navigate("/");
    },
  });
  // padrão autônomo selecionado ao entrar no onboarding
  const [userType, setUserType] = useState<UserType>("autonomo");

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
  const [attendOnline, setAttendOnline] = useState(false);
  const [attendHome, setAttendHome] = useState(false);
  const [attendWorkspace, setAttendWorkspace] = useState(true);
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

  const [locationSchedules, setLocationSchedules] = useState<
    Record<string, Record<DayKey, DaySchedule>>
  >({});

  const cloneSchedule = (s: Record<DayKey, DaySchedule>) => {
    return Object.fromEntries(
      Object.entries(s).map(([k, v]) => [k, { ...(v as DaySchedule) }])
    ) as Record<DayKey, DaySchedule>;
  };

  const addOrUpdateLocation = () => {
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

    if (editingLocation) {
      setLocations((prev) =>
        prev.map((l) => (l.id === locationForm.id ? locationForm : l))
      );
      setEditingLocation(null);
    } else {
      setLocations((prev) => [...prev, locationForm]);
      setLocationSchedules((prev) => ({
        ...prev,
        [locationForm.id]: cloneSchedule(schedule),
      }));
    }
    setLocationForm(emptyLocation());
    setShowLocationForm(false);
  };

  const removeLocation = (id: string) => {
    if (singleLocationMode === true && singleLocation?.id === id) {
      setSingleLocation(null);
      return;
    }
    setLocations((prev) => prev.filter((l) => l.id !== id));
    setLocationSchedules((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const editLocation = (loc: Location) => {
    setEditingLocation(loc);
    setLocationForm(loc);
    setShowLocationForm(true);
  };

  const handleLocationScheduleChange = (
    locationId: string,
    day: keyof typeof schedule,
    field: "working" | "start" | "end",
    value: string | boolean
  ) => {
    setLocationSchedules((prev) => ({
      ...prev,
      [locationId]: {
        ...prev[locationId],
        [day]: { ...prev[locationId][day], [field]: value },
      },
    }));
  };

  const canProceedStep1 = userType !== "";

  const canProceedLocations = () => {
    const anyAttendanceSelected = attendOnline || attendHome || attendWorkspace;
    if (!anyAttendanceSelected) return false;

    if ((attendOnline || attendHome) && !attendWorkspace) return true;

    if (singleLocationMode === null) return false;
    if (singleLocationMode === true) {
      return !!singleLocation || locations.length > 0;
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
  >("fixo");
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

    const buildEntriesFromScheduleMap = (
      schedMap: Record<
        DayKey,
        { working: boolean; start: string; end: string }
      >,
      locationId?: string
    ) => {
      return Object.entries(schedMap)
        .filter(([, details]) => details.working)
        .map(([day, details]) => ({
          dayOfWeek: dayMap[day as keyof typeof dayMap],
          startTime: details.start,
          endTime: details.end,
          locationId,
        }));
    };

    let workSchedules: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      locationId?: string;
    }> = [];

    if (scheduleMode === "porLocal") {
      if (singleLocationMode === true) {
        if (singleLocation) {
          const sched = locationSchedules[singleLocation.id] ?? schedule;
          workSchedules = buildEntriesFromScheduleMap(sched, singleLocation.id);
        }
      } else {
        for (const loc of locations) {
          const sched = locationSchedules[loc.id] ?? schedule;
          const entries = buildEntriesFromScheduleMap(sched, loc.id);
          workSchedules.push(...entries);
        }
      }
    } else if (scheduleMode === "fixo") {
      const base = fixedDays.map((d) => ({
        dayOfWeek: dayMap[d],
        startTime: fixedStart,
        endTime: fixedEnd,
      }));

      if (singleLocationMode === true) {
        if (singleLocation) {
          workSchedules = base.map((b) => ({
            ...b,
            locationId: singleLocation.id,
          }));
        } else {
          workSchedules = base.map((b) => ({ ...b }));
        }
      } else {
        if (locations && locations.length > 0) {
          for (const loc of locations) {
            workSchedules.push(
              ...base.map((b) => ({ ...b, locationId: loc.id }))
            );
          }
        } else {
          workSchedules = base.map((b) => ({ ...b }));
        }
      }
    } else {
      const base = Object.entries(schedule)
        .filter(([, details]) => details.working)
        .map(([day, details]) => ({
          dayOfWeek: dayMap[day as keyof typeof dayMap],
          startTime: details.start,
          endTime: details.end,
        }));

      if (singleLocationMode === true) {
        if (singleLocation) {
          workSchedules = base.map((b) => ({
            ...b,
            locationId: singleLocation.id,
          }));
        } else {
          workSchedules = base.map((b) => ({ ...b }));
        }
      } else {
        if (locations && locations.length > 0) {
          for (const loc of locations) {
            workSchedules.push(
              ...base.map((b) => ({ ...b, locationId: loc.id }))
            );
          }
        } else {
          workSchedules = base.map((b) => ({ ...b }));
        }
      }
    }

    if (workSchedules.length === 0) {
      workSchedules = Object.entries(schedule)
        .filter(([, details]) => details.working)
        .map(([day, details]) => ({
          dayOfWeek: dayMap[day as keyof typeof dayMap],
          startTime: details.start,
          endTime: details.end,
          locationId:
            singleLocationMode === true
              ? singleLocation?.id
              : locations[0]
              ? locations[0].id
              : undefined,
        }));
    }

    const apiPayload: IOnboardingBody = {
      type: userType === "autonomo" ? "AUTONOMO" : "EMPRESA",
      professionalName: userType === "autonomo" ? area : undefined,
      fieldOfWork: userType === "autonomo" ? area : companyArea,
      professionalLicense: userType === "autonomo" ? professionalId : undefined,
      companyName: userType === "empresa" ? companyName : undefined,
      companyDocument:
        userType === "empresa" ? cnpj.replace(/\D/g, "") : undefined,
      offersHomeVisit: attendHome,
      offersOnline: attendOnline,
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
          step={step}
          setStep={setStep}
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
          prevStep={prevStep}
        />
      );
    }

    if (step === 2) {
      return (
        <Step2
          step={step}
          setStep={setStep}
          prevStep={prevStep}
          initialAttendWorkspace={true}
          headerLeft={
            <ArrowLeft
              className="w-6 h-6 text-[#141736] cursor-pointer"
              onClick={prevStep}
            />
          }
          attendOnline={attendOnline}
          setAttendOnline={setAttendOnline}
          attendHome={attendHome}
          setAttendHome={setAttendHome}
          attendWorkspace={attendWorkspace}
          setAttendWorkspace={setAttendWorkspace}
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
        step={step}
        setStep={setStep}
        prevStep={prevStep}
        headerLeft={
          <ArrowLeft
            className="w-6 h-6 text-[#141736] cursor-pointer"
            onClick={prevStep}
          />
        }
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
        singleLocation={singleLocation}
        locationSchedules={locationSchedules}
        handleLocationScheduleChange={handleLocationScheduleChange}
      />
    );
  };

  useEffect(() => {
    if (scheduleMode !== "porLocal") return;
    if (singleLocationMode === true) {
      if (!singleLocation) return;
      setLocationSchedules((prev) => {
        if (prev[singleLocation.id]) return prev;
        return { ...prev, [singleLocation.id]: cloneSchedule(schedule) };
      });
      return;
    }

    if (locations && locations.length > 0) {
      setLocationSchedules((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const loc of locations) {
          if (!next[loc.id]) {
            next[loc.id] = cloneSchedule(schedule);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }
  }, [scheduleMode, locations, singleLocation, singleLocationMode, schedule]);

  const renderFooter = () => {
    const containerClass = `flex items-center my-2 h-fit ${
      step === 3 ? "justify-between" : "justify-end"
    }`;

    return (
      <div className={containerClass}>
        {step === 3 && (
          <Button
            type="button"
            variant="ghost"
            className={
              "font-semibold text-[#141736] flex items-center gap-2 px-6 py-3 bg-transparent border-none shadow-none"
            }
            onClick={prevStep}
          >
            <span aria-hidden>←</span> VOLTAR
          </Button>
        )}

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
      <div>{renderMainContent()}</div>
      {renderFooter()}
    </form>
  );
};
