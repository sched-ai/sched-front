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
import abstract from "../../assets/abstract_waves.jpg";
import CustomRadioInput from "@/components/CustomRadioInput";
import { Building2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOnboarding, type IOnboardingBody } from "@/hooks/api/useOnboarding";

type UserType = "empresa" | "autonomo" | "";

export const FirstLogin = () => {
    const [step, setStep] = useState(1);
     const navigate = useNavigate();
    const { mutate: submitOnboarding } = useOnboarding({
        onSuccessFn: () => {
            navigate('/');
        }
    });
    const [userType, setUserType] = useState<UserType>("");
    const progressText = `Passo ${step} de 3`;

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

    const handleUserTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserType(e.target.value as UserType);
    };
    
    const handleScheduleChange = (day: keyof typeof schedule, field: 'working' | 'start' | 'end', value: string | boolean) => {
        setSchedule(prev => ({
            ...prev,
            [day]: { ...prev[day], [field]: value }
        }));
    };

    

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleFinalSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const dayMap: { [key: string]: number } = {
            segunda: 1, terça: 2, quarta: 3, quinta: 4, sexta: 5, sábado: 6, domingo: 0
        };
        
        const workSchedules = Object.entries(schedule)
            .filter(([, details]) => details.working)
            .map(([day, details]) => ({
                dayOfWeek: dayMap[day],
                startTime: details.start,
                endTime: details.end,
            }));

        

        const apiPayload: IOnboardingBody = {
            type: userType === 'autonomo' ? 'AUTONOMO' : 'EMPRESA',
            professionalName: userType === 'autonomo' ? area : undefined,
            fieldOfWork: userType === 'autonomo' ? area : companyArea,
            professionalLicense: userType === 'autonomo' ? professionalId : undefined,
            companyName: userType === 'empresa' ? companyName : undefined,
            companyDocument: userType === 'empresa' ? cnpj : undefined,
            workSchedules,
        };

        submitOnboarding(apiPayload);
    };

    const renderStep = () => {
        if (step === 1) {
            return (
                <form onSubmit={(e) => { e.preventDefault(); if (canProceedStep1) nextStep(); }} className="flex flex-col justify-between h-full lg:w-[490px] w-full">
                    <div>
                        <div className="mb-20">
                            <h4 className="mb-0 font-semibold text-lg text-[24px]">Falta pouco!</h4>
                            <p className="text-muted-foreground text-[16px]">Preencha o formulário com suas informações</p>
                        </div>
                        <div className="space-y-6">
                            <p className="text-[24px] font-semibold text-gray-800 tracking-tight">Como você gostaria de usar a SchedApp?</p>
                            <div className="flex flex-col gap-8 mt-10">
                                <CustomRadioInput label="Empresa" htmlFor="empresa" name="userType" Icon={Building2} value="empresa" checked={userType === "empresa"} onChange={handleUserTypeChange} />
                                <CustomRadioInput label="Profissional Autônomo" htmlFor="autonomo" name="userType" Icon={User} value="autonomo" checked={userType === "autonomo"} onChange={handleUserTypeChange} />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-6">
                        <span className="text-[#141736] text-[14px] font-medium">{progressText}</span>
                        {!canProceedStep1 ? (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span tabIndex={0}><Button type="button" variant="outline" disabled className="font-semibold text-[#141736] flex items-center gap-2 px-6 py-3 bg-transparent border-none shadow-none">PRÓXIMO <span aria-hidden>→</span></Button></span>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Selecione uma opção para continuar.</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <Button type="submit" variant="outline" className="font-semibold text-[#141736] flex items-center gap-2 px-6 py-3 bg-transparent border-none shadow-none">PRÓXIMO <span aria-hidden>→</span></Button>
                        )}
                    </div>
                </form>
            );
        }

        if (step === 2) {
            return (
                <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="flex flex-col justify-between h-full lg:w-[490px] w-full">
                    <div>
                        <div className="mb-20">
                            <h4 className="mb-0 font-semibold text-lg text-[24px]">{userType === 'autonomo' ? 'Conte-nos sobre você' : 'Conte-nos sobre sua empresa'}</h4>
                            <p className="text-muted-foreground text-[16px]">Essas informações ajudarão a configurar sua agenda.</p>
                        </div>
                        <div className="space-y-10">
                            {userType === 'autonomo' && (
                                <>
                                    <div><Label className="text-[24px] font-semibold text-gray-800 tracking-tight mb-2" htmlFor="area">Sua área de atuação</Label><Input id="area" value={area} onChange={e => setArea(e.target.value)} placeholder="Ex: Psicologia, Fisioterapia" /></div>
                                    <div><Label className="text-[24px] font-semibold text-gray-800 tracking-tight mb-2" htmlFor="professionalId">Nº de registro profissional (Opcional)</Label><Input id="professionalId" value={professionalId} onChange={e => setProfessionalId(e.target.value)} placeholder="Ex: CRP 01/12345" /></div>
                                </>
                            )}
                            {userType === 'empresa' && (
                                <>
                                    <div><Label className="text-[24px] font-semibold text-gray-800 tracking-tight mb-2" htmlFor="companyName">Nome da sua empresa/clínica</Label><Input id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Ex: Clínica Bem-Estar" /></div>
                                    <div><Label className="text-[24px] font-semibold text-gray-800 tracking-tight mb-2" htmlFor="cnpj">CNPJ</Label><Input id="cnpj" value={cnpj} onChange={e => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" /></div>
                                    <div><Label className="text-[24px] font-semibold text-gray-800 tracking-tight mb-2" htmlFor="companyArea">Principal área de atuação</Label><Input id="companyArea" value={companyArea} onChange={e => setCompanyArea(e.target.value)} placeholder="Ex: Odontologia" /></div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-6">
                        <Button type="button" variant="ghost" className="font-semibold text-[#141736] flex items-center gap-2 px-6 py-3 bg-transparent border-none shadow-none" onClick={prevStep}><span aria-hidden>←</span> VOLTAR</Button>
                        <span className="text-[#141736] font-medium text-[14px]">{progressText}</span>
                        <Button type="submit" variant="outline" className="font-semibold text-[#141736] flex items-center gap-2 px-6 py-3 bg-transparent border-none shadow-none">PRÓXIMO <span aria-hidden>→</span></Button>
                    </div>
                </form>
            );
        }

        if (step === 3) {
            return (
                <form onSubmit={handleFinalSubmit} className="flex flex-col justify-between h-full lg:w-[490px] w-full">
                    <div>
                        <div className="mb-20">
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
                                            <Checkbox id={dayKey} checked={schedule[dayKey].working} onCheckedChange={(checked) => handleScheduleChange(dayKey, 'working', !!checked)} className=" cursor-pointer" />
                                            <Label htmlFor={dayKey} className="cursor-pointer capitalize text-[20px] font-semibold text-gray-800 tracking-tight">{dayLabel}</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Input type="time" value={schedule[dayKey].start} onChange={e => handleScheduleChange(dayKey, 'start', e.target.value)} disabled={!schedule[dayKey].working} className="w-full max-w-[80px]" />
                                            <span className={!schedule[dayKey].working ? "text-muted-foreground" : ""}>às</span>
                                            <Input type="time" value={schedule[dayKey].end} onChange={e => handleScheduleChange(dayKey, 'end', e.target.value)} disabled={!schedule[dayKey].working} className="w-full max-w-[80px]" />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-6">
                        <Button type="button" variant="ghost" onClick={prevStep} className="font-semibold text-[#141736] flex items-center gap-2 px-6 py-3 bg-transparent border-none shadow-none"><span aria-hidden>←</span> VOLTAR</Button>
                        <span className="text-[#141736] font-medium text-[14px]">{progressText}</span>
                        <Button type="submit" variant="outline" className="font-semibold text-[#141736] flex items-center gap-2 px-6 py-3 bg-transparent border-none shadow-none">FINALIZAR <span aria-hidden>→</span></Button>
                    </div>
                </form>
            );
        }
    };
    
    return (
        <div className="min-h-screen w-full">
            <div className="flex w-full min-h-screen bg-white justify-between">
                <div
                    className="hidden lg:flex flex-col justify-between max-w-[640px] w-full p-12 bg-cover bg-center border-r border-blue-400"
                    style={{ backgroundImage: `url(${abstract})` }}
                >
                    <div className="flex flex-col gap-6">
                        <h1 className="text-3xl font-semibold italic text-white mb-8">SCHED</h1>
                        <h2 className="text-4xl font-light text-white mb-2">Vamos começar!</h2>
                        <h2 className="text-4xl font-semibold text-white max-w-[480px]">Gostaríamos de conhecer um pouco mais sobre sua atividade</h2>
                    </div>
                </div>
                <div className="flex flex-col justify-center lg:px-8 px-4 py-12 relative w-full">
                    <div className="flex w-full lg:w-fit mx-auto">
                        <div className="hidden lg:flex flex-col justify-center">
                            <div className="w-[1px] bg-blue-500 mr-20 rounded-full h-[60vh]" />
                        </div>
                        {renderStep()}
                    </div>
                </div>
			<span></span>
            </div>
        </div>
    );
};