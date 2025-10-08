import { useState } from "react";
import { Button } from "../../components/ui/button";
import abstract from "../../assets/abstract_waves.jpg";
import CustomRadioInput from "@/components/CustomRadioInput";
import { Building2, User } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type UserType = "empresa" | "autonomo" | "";

export const FirstLogin = () => {
    const [step, setStep] = useState(1);
    const [userType, setUserType] = useState<UserType>("");
    const progressText = `Passo ${step} de 2`;

    const canProceedStep1 = userType !== "";

    const handleUserTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserType(e.target.value as UserType);
    };

    const handleSubmitStep1 = (e: React.FormEvent) => {
        e.preventDefault();
        if (canProceedStep1) setStep(2);
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
                        {step === 1 && (
                            <form onSubmit={handleSubmitStep1} className="flex flex-col justify-between h-full w-full">
                                <div>
                                    <div className="mb-20">
                                        <h4 className="mb-0 font-semibold text-lg">Falta pouco!</h4>
                                        <p className="text-muted-foreground">Preencha o formulário com suas informações</p>
                                    </div>
                                    <div className="space-y-6">
                                        <p className="text-[24px] font-semibold text-gray-800 tracking-tight">Como você gostaria de usar a SchedApp?</p>
                                        <div className="flex flex-col gap-8 mt-10">
                                            <CustomRadioInput
                                                label="Empresa"
                                                htmlFor="empresa"
                                                name="userType"
                                                Icon={Building2}
                                                value="empresa"
                                                checked={userType === "empresa"}
                                                onChange={handleUserTypeChange}
                                            />
                                            <CustomRadioInput
                                                label="Profissional Autônomo"
                                                htmlFor="autonomo"
                                                name="userType"
                                                Icon={User}
                                                value="autonomo"
                                                checked={userType === "autonomo"}
                                                onChange={handleUserTypeChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-6">
                                    <span className="text-[#141736] font-medium">{progressText}</span>
                                    {!canProceedStep1 ? (
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
                                                    <p>Selecione uma opção para continuar.</p>
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
                                    )}
                                </div>
                            </form>
                        )}
                    </div>
                </div>
				<div></div>
            </div>
        </div>
    );
};