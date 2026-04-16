import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useOnboarding, useCheckDocument, type IOnboardingBody } from "@/hooks/api/useOnboarding";
import { formatCnpj, formatPhone, formatCpf } from "@/util/helper";
import { ArrowLeft } from "lucide-react";
import type { DayKey, DaySchedule, Location, UserType } from "@/types";
import Step3 from "./Step3";
import Step2 from "./Step2";
import Step1 from "./Step1";
import { Step5 } from "./Step5";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/user";

export const RenderStep = ({
  step,
  setStep,
}: {
  step: number;
  setStep: (step: number | ((prev: number) => number)) => void;
}) => {
  const { userData } = useUser();

  const { mutate: submitOnboarding } = useOnboarding({
    onSuccessFn: () => {
      setStep(4);
    },
    onErrorFn: () => {
    },
  });

  const { mutateAsync: checkDocument } = useCheckDocument();
  const [documentError, setDocumentError] = useState<string | undefined>(undefined);
  const [isVerifyingDocument, setIsVerifyingDocument] = useState(false);
  const [isDocumentNew, setIsDocumentNew] = useState(false);

  const [userType, setUserType] = useState<UserType>("autonomo");
  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
    setDocumentError(undefined);
    setProfessionalId("");
    setCnpj("");
  };

  const [area, setArea] = useState("");
  const [employeeId, setProfessionalId] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [hasCnpj, setHasCnpj] = useState(true);
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

  useEffect(() => {
    const addOrRemoveSpecial = (
      flag: boolean,
      id: string,
      name: string
    ) => {
      setLocations((prev) => {
        const exists = prev.some((l) => l.id === id);
        if (flag && !exists) {
          return [
            { id, name, address: "", neighborhood: "", number: "", city: "", state: "", complement: "" },
            ...prev,
          ];
        }
        if (!flag && exists) {
          return prev.filter((l) => l.id !== id);
        }
        return prev;
      });

      setLocationSchedules((prev) => {
        const copy = { ...prev };
        if (flag) {
          if (!copy[id]) copy[id] = cloneSchedule(schedule);
        } else {
          if (copy[id]) delete copy[id];
        }
        return copy;
      });

      if (!flag && singleLocation?.id === id) {
        setSingleLocation(null);
      }
    };

    addOrRemoveSpecial(attendOnline, "online", "Online");
    addOrRemoveSpecial(attendHome, "home", "Domicílio");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendOnline, attendHome]);

  const emptyLocation = (): Location => ({
    id: Date.now().toString(),
    name: "",
    address: "",
    neighborhood: "",
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


  const canProceedLocations = () => {
    const anyAttendanceSelected = attendOnline || attendHome || attendWorkspace;
    if (!anyAttendanceSelected) return false;

    if ((attendOnline || attendHome) && !attendWorkspace) return true;

    const isSpecial = (id: string) => id === "online" || id === "home";

    let hasNonSpecial = false;
    if (singleLocationMode === true) {
      // In single location mode, either they saved a singleLocation or the form is fully valid
      const hasValidForm = 
          !!locationForm.address && 
          !!locationForm.neighborhood && 
          !!locationForm.number && 
          !!locationForm.city && 
          !!locationForm.state;
          
      if (singleLocation && !isSpecial(singleLocation.id)) hasNonSpecial = true;
      if (!singleLocation && hasValidForm) hasNonSpecial = true;
      if (!hasNonSpecial && locations.some((l) => !isSpecial(l.id))) hasNonSpecial = true;
    } else {
      if (locations.some((l) => !isSpecial(l.id))) hasNonSpecial = true;
    }

    if (attendWorkspace && !hasNonSpecial) return false;

    if (singleLocationMode === null) return false;
    if (singleLocationMode === true) {
      const hasValidForm = 
          !!locationForm.address && 
          !!locationForm.neighborhood && 
          !!locationForm.number && 
          !!locationForm.city && 
          !!locationForm.state;
          
      return !!singleLocation || hasValidForm || locations.length > 0;
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
  const [referrer, setReferrer] = useState("");  
  const [referrerOther, setReferrerOther] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
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

  const canProceedStep1 = 
    userType !== "" && 
    !documentError && 
    !isVerifyingDocument && 
    isDocumentNew &&
    phoneNumber.length >= 10 &&
    referrer !== "";

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCnpj(e.target.value);
    setCnpj(formatted);
    setIsDocumentNew(false);
    verifyDocumentUniqueness(formatted);
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhone(e.target.value));
  };

  const handleAutonomoDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = hasCnpj ? formatCnpj(value) : formatCpf(value);
    setProfessionalId(formatted);
    setIsDocumentNew(false);
    verifyDocumentUniqueness(formatted);
  };

  const verifyDocumentUniqueness = async (document: string) => {
    const cleaned = document.replace(/\D/g, "");
    const expectedLen = userType === "empresa" ? 14 : (hasCnpj ? 14 : 11);

    if (cleaned.length === expectedLen) {
      setIsVerifyingDocument(true);
      try {
        const resp = await checkDocument(cleaned);
        if (resp && !resp.isNew) {
          setDocumentError("Documento já cadastrado");
          setIsDocumentNew(false);
        } else {
          setDocumentError(undefined);
          setIsDocumentNew(true);
        }
      } catch (error) {
        console.error("Erro ao verificar documento:", error);
      } finally {
        setIsVerifyingDocument(false);
      }
    } else {
      setDocumentError(undefined);
    }
  };

  const handleDocumentBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Option to re-verify on blur if needed, but it's handled on change now.
    verifyDocumentUniqueness(e.target.value);
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
      professionalName: userType === "autonomo" ? userData?.name : undefined,
      fieldOfWork: userType === "autonomo" ? area : companyArea,
      description: description,
      professionalLicense: userType === "autonomo" && !hasCnpj ? employeeId.replace(/\D/g, "") : undefined,
      companyName: userType === "empresa" ? companyName : undefined,
      howFound: referrer === "outro" ? referrerOther : referrer,
      phone: phoneNumber.replace(/\D/g, ""),
      companyDocument:
        userType === "empresa" ? cnpj.replace(/\D/g, "") : (userType === "autonomo" && hasCnpj ? employeeId.replace(/\D/g, "") : undefined),
      offersHomeVisit: attendHome,
      offersOnline: attendOnline,
      workSchedules,
      locations: (() => {
        const specialIds = new Set(["online", "home"]);

        const buildLocationSchedulesFromMap = (
          schedMap: Record<string, { working: boolean; start: string; end: string }>
        ) => {
          return Object.entries(schedMap)
            .filter(([, details]) => details.working)
            .map(([day, details]) => ({
              day: dayMap[day as keyof typeof dayMap],
              startTime: details.start,
              endTime: details.end,
            }));
        };

        const buildSchedulesForLocation = (locId: string) => {
          if (scheduleMode === "porLocal") {
            const map = locationSchedules[locId] ?? schedule;
            return buildLocationSchedulesFromMap(map);
          }

          if (scheduleMode === "fixo") {
            return fixedDays.map((d) => ({
              day: dayMap[d],
              startTime: fixedStart,
              endTime: fixedEnd,
            }));
          }

          return Object.entries(schedule)
            .filter(([, details]) => details.working)
            .map(([day, details]) => ({
              day: dayMap[day as keyof typeof dayMap],
              startTime: details.start,
              endTime: details.end,
            }));
        };

        const mapLocation = (l: Location) => {
          const trimmedName = l.name?.trim();
          const addressPart = l.address?.trim() ? `${l.address}${l.number ? ` ${l.number}` : ""}` : "";
          const fallback = l.id === "online" ? "Online" : l.id === "home" ? "Domicílio" : addressPart || "Local";
          return {
            nickname: trimmedName || fallback,
            address: l.address,
            neighborhood: l.neighborhood,
            state: l.state,
            city: l.city,
            number: l.number,
            complement: l.complement,
            schedules: buildSchedulesForLocation(l.id),
          };
        };

        if (singleLocationMode === true) {
          if (singleLocation) {
            const specials = locations.filter(
              (l) => specialIds.has(l.id) && l.id !== singleLocation.id
            );
            return [mapLocation(singleLocation), ...specials.map(mapLocation)];
          }
          return locations.length > 0 ? locations.map(mapLocation) : undefined;
        }

        return locations.length > 0 ? locations.map(mapLocation) : undefined;
      })(),
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
      if (canProceedLocations()) {
        if (singleLocationMode === true && !singleLocation) {
             addOrUpdateLocation();
        }
        nextStep();
      }
      return;
    }
    handleFinalSubmit();
  };

  const navigate = useNavigate();

  const renderMainContent = () => {
    if (step > 4) {
      navigate("/");
    }

    if (step === 1) {
      return (
        <Step1
          step={step}
          setStep={setStep}
          userType={userType}
          setUserType={handleUserTypeChange}
          area={area}
          setArea={setArea}
          employeeId={employeeId}
          companyName={companyName}
          setCompanyName={setCompanyName}
          description={description}
          setDescription={setDescription}
          cnpj={cnpj}
          handleCnpjChange={handleCnpjChange}
          companyArea={companyArea}
          setCompanyArea={setCompanyArea}
          prevStep={prevStep}
          referrer={referrer}
          setReferrer={setReferrer}
          referrerOther={referrerOther}
          setReferrerOther={setReferrerOther}
          phoneNumber={phoneNumber}
          handlePhoneChange={handlePhoneChange}
          hasCnpj={hasCnpj}
          setHasCnpj={(v) => {
            setHasCnpj(v);
            setProfessionalId("");
            setDocumentError(undefined);
            setIsDocumentNew(false);
          }}
          handleAutonomoDocumentChange={handleAutonomoDocumentChange}
          documentError={documentError}
          onDocumentBlur={handleDocumentBlur}
          setDocumentError={setDocumentError}
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

      if (step === 4) {
        return <Step5 />
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
      setScheduleMode("fixo");
    }, [step]);

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
      step > 1 ? "justify-between" : "justify-end"
    }`;

    if (step === 4) {
      return <div className={containerClass} />;
    }

    return (
      <div className={containerClass}>
        {step > 1 && (
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
                    Preencha todos os campos para continuar.
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
            SALVAR <span aria-hidden>→</span>
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
