import React from "react";
import { Button } from "@/components/ui/button";
import CustomRadioInput from "@/components/CustomRadioInput";
import { Input } from "@/components/ui/input";
import { Building2, User } from "lucide-react";
import type { UserType } from "@/types";

interface Step1Props {
  userType: UserType;
  setUserType: (v: UserType) => void;
  area: string;
  setArea: (v: string) => void;
  professionalId: string;
  setProfessionalId: (v: string) => void;
  companyName: string;
  setCompanyName: (v: string) => void;
  cnpj: string;
  handleCnpjChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  companyArea: string;
  setCompanyArea: (v: string) => void;
  step?: number;
  setStep?: (step: number | ((prev: number) => number)) => void;
  prevStep?: () => void;
}

export default function Step1({
  userType,
  setUserType,
  area,
  setArea,
  professionalId,
  setProfessionalId,
  companyName,
  setCompanyName,
  cnpj,
  handleCnpjChange,
  companyArea,
  setCompanyArea,
  step,
  setStep,
  prevStep,
}: Step1Props) {
  const goPrev = () => {
    if (prevStep) return prevStep();
    if (setStep) return setStep((p) => p - 1);
    return;
  };
  const handleUserTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserType(e.target.value as UserType);
  };

  return (
    <>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h4 className="mb-0 font-semibold text-lg text-[24px]">Sobre seu negócio</h4>
          <p className="text-muted-foreground text-[16px]">nos informe qual perfil você se encaixa</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          className={
            "font-semibold text-[#141736] flex items-center gap-2 px-6 py-3 bg-transparent border-none shadow-none" +
            (step === 1 ? " hidden" : "")
          }
          onClick={goPrev}
        >
          <span aria-hidden>←</span> VOLTAR
        </Button>
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
