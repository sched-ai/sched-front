import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type UserType = "empresa" | "autonomo" | "";

export const RenderStep = ({ step, setStep }: { step: number; setStep: (step: number | ((prev: number) => number)) => void }) => {
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

  const [schedule, setSchedule] = useState({
    segunda: { working: true, start: "09:00", end: "18:00" },
    terça: { working: true, start: "09:00", end: "18:00" },
    quarta: { working: true, start: "09:00", end: "18:00" },
    quinta: { working: true, start: "09:00", end: "18:00" },
    sexta: { working: true, start: "09:00", end: "18:00" },
    sábado: { working: false, start: "09:00", end: "12:00" },
    domingo: { working: false, start: "09:00", end: "12:00" },
  });

  const canProceedStep1 = userType !== "";
  const canProceedStep2 =
    (userType === "autonomo" && area.trim() !== "") ||
    (userType === "empresa" &&
      companyName.trim() !== "" &&
      cnpj.replace(/\D/g, "").length === 14 &&
      companyArea.trim() !== "");

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

  const formatCnpj = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(
      /^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})$/
    );

    if (!match) return value;

    let formatted = "";
    if (match[1]) formatted += match[1];
    if (match[2]) formatted += `.${match[2]}`;
    if (match[3]) formatted += `.${match[3]}`;
    if (match[4]) formatted += `/${match[4]}`;
    if (match[5]) formatted += `-${match[5]}`;

    return formatted;
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
      }));

    const apiPayload: IOnboardingBody = {
      type: userType === "autonomo" ? "AUTONOMO" : "EMPRESA",
      professionalName: userType === "autonomo" ? area : undefined,
      fieldOfWork: userType === "autonomo" ? area : companyArea,
      professionalLicense: userType === "autonomo" ? professionalId : undefined,
      companyName: userType === "empresa" ? companyName : undefined,
      companyDocument: userType === "empresa" ? cnpj : undefined,
      workSchedules,
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
      if (canProceedStep2) nextStep();
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
            <h4 className="mb-0 font-semibold text-lg text-[24px]">Sobre seu negócio</h4>
            <p className="text-muted-foreground text-[16px]">nos informe qual perfil você se encaixa</p>
          </div>
          <div className="space-y-6">
            <p className="text-[20px] font-semibold text-gray-800 tracking-tight">Como você gostaria de usar a SchedApp?</p>
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
                  <Input type="text" label="Sua área de atuação" id="area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Ex: Psicologia, Fisioterapia" required />
                </div>
                <div className="w-full">
                  <Input label="Nº de registro profissional" type="text" id="professionalId" value={professionalId} onChange={(e) => setProfessionalId(e.target.value)} placeholder="Ex: CRP 01/12345" required />
                </div>
              </>
            )}

            {userType === "empresa" && (
              <>
                <div className="w-full">
                  <Input type="text" label="Nome da sua empresa" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ex: Clínica Bem-Estar" required />
                </div>
                <div className="w-full">
                  <Input type="text" label="CNPJ" id="cnpj" value={cnpj} onChange={handleCnpjChange} placeholder="00.000.000/0001-00" maxLength={18} required />
                </div>
                <div className="w-full">
                  <Input type="text" label="Principal área de atuação" id="companyArea" value={companyArea} onChange={(e) => setCompanyArea(e.target.value)} placeholder="Ex: Odontologia" required />
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
              {userType === "autonomo" ? "Conte-nos sobre você" : "Conte-nos sobre sua empresa"}
            </h4>
            <p className="text-muted-foreground text-[16px]">Essas informações ajudarão a configurar sua agenda.</p>
          </div>
          
        </>
      );
    }

    // step === 3
    return (
      <>
        <div className="mb-8">
          <h4 className="mb-0 font-semibold text-lg text-[24px]">Seus horários de trabalho</h4>
          <p className="text-muted-foreground mb-4 text-[16px]">Defina seus horários padrão. Você poderá alterá-los depois.</p>
        </div>
        <div className="space-y-3">
          {Object.keys(schedule).map((day) => {
            const dayKey = day as keyof typeof schedule;
            const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
            return (
              <div key={dayKey} className="flex justify-between items-center gap-x-2 md:gap-x-4 w-full">
                <div className="flex items-center gap-2">
                  <Checkbox id={dayKey} checked={schedule[dayKey].working} onCheckedChange={(checked) => handleScheduleChange(dayKey, "working", !!checked)} className=" cursor-pointer" />
                  <Label htmlFor={dayKey} className="cursor-pointer capitalize text-[20px] font-semibold text-gray-800 tracking-tight">{dayLabel}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="time" value={schedule[dayKey].start} onChange={(e) => handleScheduleChange(dayKey, "start", e.target.value)} disabled={!schedule[dayKey].working} className="w-full max-w-[120px]" />
                  <span className={!schedule[dayKey].working ? "text-muted-foreground" : ""}>às</span>
                  <Input type="time" value={schedule[dayKey].end} onChange={(e) => handleScheduleChange(dayKey, "end", e.target.value)} disabled={!schedule[dayKey].working} className="w-full max-w-[120px]" />
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
          <Button type="button" variant="ghost" className={"font-semibold text-[#141736] flex items-center gap-2 px-6 py-3 bg-transparent border-none shadow-none" + (step === 1 ? " hidden" : "")} onClick={prevStep}>
            <span aria-hidden>←</span> VOLTAR
          </Button>


        {step < 3 ? (
          (!((step === 1 && canProceedStep1) || (step === 2 && canProceedStep2))) ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button type="button" variant="outline" disabled className="font-semibold text-[#141736] flex items-center gap-2 px-6 py-3 bg-transparent border-none shadow-none">PRÓXIMO <span aria-hidden>→</span></Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{step === 1 ? "Selecione uma opção para continuar." : "Preencha todos os campos obrigatórios."}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button type="submit" variant="outline" className="font-semibold text-[#141736] flex items-center gap-2 px-6 py-3 bg-transparent border-none shadow-none">PRÓXIMO <span aria-hidden>→</span></Button>
          )
        ) : (
          <Button type="submit" variant="outline" className="font-semibold text-[#141736] flex items-center gap-2 px-6 py-3 bg-transparent border-none shadow-none">FINALIZAR <span aria-hidden>→</span></Button>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col justify-between md:h-[calc(100vh-200px)] w-full max-w-[920px] self-center xl:border-x border-x-blue-500 xl:px-10">
      <div>
        {renderMainContent()}
      </div>
      {renderFooter()}
    </form>
  );
};
