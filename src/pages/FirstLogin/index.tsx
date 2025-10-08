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

type UserType = "empresa" | "autonomo" | "";

export const FirstLogin = () => {
    const [step, setStep] = useState(1);
    const [userType, setUserType] = useState<UserType>("");
    const progressText = `Passo ${step} de 3`;

    const [professionalName, setProfessionalName] = useState("");
    const [area, setArea] = useState("");
    const [professionalId, setProfessionalId] = useState("");

    const [companyName, setCompanyName] = useState("");
    const [cnpj, setCnpj] = useState("");
    const [companyArea, setCompanyArea] = useState("");

    const [schedule, setSchedule] = useState({
        segunda: { working: true, start: "09:00", end: "18:00" },
        terca: { working: true, start: "09:00", end: "18:00" },
        quarta: { working: true, start: "09:00", end: "18:00" },
        quinta: { working: true, start: "09:00", end: "18:00" },
        sexta: { working: true, start: "09:00", end: "18:00" },
        sabado: { working: false, start: "09:00", end: "12:00" },
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
        const formData = {
            userType,
            details: userType === 'autonomo' ? {
                professionalName,
                area,
                professionalId,
            } : {
                companyName,
                cnpj,
                companyArea,
            },
            schedule,
        };
        console.log("DADOS FINAIS PARA A API:", formData);
    };

    const renderStep = () => {
        if (step === 1) {
            return (
                <form onSubmit={(e) => { e.preventDefault(); if (canProceedStep1) nextStep(); }} className="flex flex-col justify-between h-full w-full">
                    <div>
                        <div className="mb-20">
                            <h4 className="mb-0 font-semibold text-lg">Falta pouco!</h4>
                            <p className="text-muted-foreground">Preencha o formulário com suas informações</p>
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
                        <span className="text-[#141736] font-medium">{progressText}</span>
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
                <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="flex flex-col justify-between h-full w-full">
                    <div>
                        <div className="mb-10">
                            <h4 className="mb-1 font-semibold text-lg">{userType === 'autonomo' ? 'Conte-nos sobre você' : 'Conte-nos sobre sua empresa'}</h4>
                            <p className="text-muted-foreground">Essas informações ajudarão a configurar sua agenda.</p>
                        </div>
                        <div className="space-y-4">
                            {userType === 'autonomo' && (
                                <>
                                    <div><Label htmlFor="professionalName">Seu nome profissional</Label><Input id="professionalName" value={professionalName} onChange={e => setProfessionalName(e.target.value)} placeholder="Ex: Dr. João Silva" /></div>
                                    <div><Label htmlFor="area">Sua área de atuação</Label><Input id="area" value={area} onChange={e => setArea(e.target.value)} placeholder="Ex: Psicologia, Fisioterapia" /></div>
                                    <div><Label htmlFor="professionalId">Nº de registro profissional (Opcional)</Label><Input id="professionalId" value={professionalId} onChange={e => setProfessionalId(e.target.value)} placeholder="Ex: CRP 01/12345" /></div>
                                </>
                            )}
                            {userType === 'empresa' && (
                                <>
                                    <div><Label htmlFor="companyName">Nome da sua empresa/clínica</Label><Input id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Ex: Clínica Bem-Estar" /></div>
                                    <div><Label htmlFor="cnpj">CNPJ</Label><Input id="cnpj" value={cnpj} onChange={e => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" /></div>
                                    <div><Label htmlFor="companyArea">Principal área de atuação</Label><Input id="companyArea" value={companyArea} onChange={e => setCompanyArea(e.target.value)} placeholder="Ex: Odontologia" /></div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-6">
                        <Button type="button" variant="ghost" onClick={prevStep}><span aria-hidden>←</span> VOLTAR</Button>
                        <span className="text-[#141736] font-medium">{progressText}</span>
                        <Button type="submit" variant="outline" className="font-semibold text-[#141736] flex items-center gap-2 px-6 py-3 bg-transparent border-none shadow-none">PRÓXIMO <span aria-hidden>→</span></Button>
                    </div>
                </form>
            );
        }

        if (step === 3) {
            return (
                <form onSubmit={handleFinalSubmit} className="flex flex-col justify-between h-full w-full">
                    <div>
                        <div className="mb-10">
                            <h4 className="mb-1 font-semibold text-lg">Seus horários de trabalho</h4>
                            <p className="text-muted-foreground mb-4">Defina seus horários padrão. Você poderá alterá-los depois.</p>
                        </div>
                        <div className="space-y-3">
                            {Object.keys(schedule).map((day) => {
                                const dayKey = day as keyof typeof schedule;
                                const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
                                return (
                                    <div key={dayKey} className="grid grid-cols-4 items-center gap-x-2 md:gap-x-4">
                                        <div className="col-span-1 flex items-center gap-2">
                                            <Checkbox id={dayKey} checked={schedule[dayKey].working} onCheckedChange={(checked) => handleScheduleChange(dayKey, 'working', !!checked)} />
                                            <Label htmlFor={dayKey} className="capitalize">{dayLabel}</Label>
                                        </div>
                                        <div className="col-span-3 flex items-center gap-2">
                                            <Input type="time" value={schedule[dayKey].start} onChange={e => handleScheduleChange(dayKey, 'start', e.target.value)} disabled={!schedule[dayKey].working} className="w-full" />
                                            <span className={!schedule[dayKey].working ? "text-muted-foreground" : ""}>às</span>
                                            <Input type="time" value={schedule[dayKey].end} onChange={e => handleScheduleChange(dayKey, 'end', e.target.value)} disabled={!schedule[dayKey].working} className="w-full" />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-6">
                        <Button type="button" variant="ghost" onClick={prevStep}><span aria-hidden>←</span> VOLTAR</Button>
                        <span className="text-[#141736] font-medium">{progressText}</span>
                        <Button type="submit" variant="outline" className="font-semibold text-[#141736] flex items-center gap-2 px-6 py-3 bg-transparent border-none shadow-none">FINALIZAR <span aria-hidden>→</span></Button>
                    </div>
                </form>
            );
        }
    };
    
    return (
        <div className="min-h-screen w-full">
            <div className="hidden lg:flex w-full min-h-screen bg-white justify-between">
                <div
                    className="flex flex-col justify-between max-w-[640px] w-full p-12 bg-cover bg-center border-r border-blue-400"
                    style={{ backgroundImage: `url(${abstract})` }}
                >
                    <div className="flex flex-col gap-6">
                        <h1 className="text-3xl font-semibold italic text-white mb-8">SCHED</h1>
                        <h2 className="text-4xl font-light text-white mb-2">Vamos começar!</h2>
                        <h2 className="text-4xl font-semibold text-white max-w-[480px]">Gostaríamos de conhecer um pouco mais sobre sua atividade</h2>
                    </div>
                </div>
                <div className="flex flex-col justify-center px-8 py-12 relative">
                    <div className="flex max-w-xl w-full mx-auto min-h-[80vh]">
                        <div className="flex flex-col justify-center">
                            <div className="w-[1px] bg-blue-500 mr-20 rounded-full h-[80vh]" />
                        </div>
                        {renderStep()}
                    </div>
                </div>
			<span></span>
            </div>
        </div>
    );
};