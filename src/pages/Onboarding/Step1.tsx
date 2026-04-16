import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import CustomRadioInput from "@/components/CustomRadioInput";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { UserType } from "@/types";

interface Step1Props {
  userType: UserType;
  setUserType: (v: UserType) => void;
  area: string;
  setArea: (v: string) => void;
  employeeId: string;
  companyName: string;
  setCompanyName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  cnpj: string;
  handleCnpjChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  companyArea: string;
  setCompanyArea: (v: string) => void;
  step?: number;
  setStep?: (step: number | ((prev: number) => number)) => void;
  prevStep?: () => void;
  referrer: string;
  setReferrer: (v: string) => void;
  referrerOther: string;
  setReferrerOther: (v: string) => void;
  phoneNumber: string;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasCnpj: boolean;
  setHasCnpj: (v: boolean) => void;
  handleAutonomoDocumentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  documentError?: string;
  onDocumentBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  setDocumentError: (v: string | undefined) => void;
}

export default function Step1({
  userType,
  setUserType,
  // area,
  // setArea,
  employeeId,
  companyName,
  setCompanyName,
  description,
  setDescription,
  cnpj,
  handleCnpjChange,
  // companyArea,
  // setCompanyArea,
  step,
  setStep,
  prevStep,
  referrer,
  setReferrer,
  referrerOther,
  setReferrerOther,
  phoneNumber,
  handlePhoneChange,
  hasCnpj,
  setHasCnpj,
  handleAutonomoDocumentChange,
  documentError,
  onDocumentBlur,
  setDocumentError,
}: Step1Props) {
  const goPrev = () => {
    if (prevStep) return prevStep();
    if (setStep) return setStep((p) => p - 1);
    return;
  };
  

  useEffect(() => {
    if (referrer === "outro") {
      setTimeout(() => {
        const el = document.getElementById("referrerOther") as HTMLInputElement | null;
        if (el) {
          el.focus();
          try {
            el.select();
          } catch {
            // do nothing
          }
        }
      }, 150);
    }
  }, [referrer]);
  const handleUserTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserType(e.target.value as UserType);
  };

  return (
    <>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h4 className="mb-0 font-semibold text-lg text-[30px]">Sobre seu negócio</h4>
          <p className="text-muted-foreground text-[20px]">nos informe em qual perfil você se encaixa</p>
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
        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <CustomRadioInput
            label="Profissional Autônomo"
            htmlFor="autonomo"
            name="userType"
            iconName="person"
            value="autonomo"
            checked={userType === "autonomo"}
            subtitle="Para gerenciar sua agenda"
            onChange={handleUserTypeChange}
          />
          
          <CustomRadioInput
            label="Empresa"
            htmlFor="empresa"
            name="userType"
            iconName="enterprise"
            value="empresa"
            checked={userType === "empresa"}
            subtitle="Para gerenciar sua empresa"
            onChange={handleUserTypeChange}
            disabled
            disabledTooltip="Em breve"
          />
        </div>
        <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="hasCnpj" 
                    checked={hasCnpj} 
                    onCheckedChange={(checked) => setHasCnpj(checked === true)}
                  />
                  <Label htmlFor="hasCnpj" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Possui CNPJ?
                  </Label>
                </div>  
        <div className="grid grid-cols-1 w-full justify-between gap-4 min-[1447px]:grid-cols-2">
          {userType === "autonomo" && (
            <>
              {/* left column */}
              {/* <div className="w-full">
                <Input
                  type="text"
                  label="Sua área de atuação"
                  id="area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Ex: Psicologia, Fisioterapia"
                  required
                  isRequired
                />
              </div> */}

                
              <div className="w-full space-y-4">
                <Input
                  label={hasCnpj ? "CNPJ" : "CPF"}
                  type="text"
                  id="employeeId"
                  isRequired
                  value={employeeId}
                  onChange={(e) => {
                    setDocumentError(undefined);
                    handleAutonomoDocumentChange(e as React.ChangeEvent<HTMLInputElement>);
                  }}
                  onBlur={onDocumentBlur}
                  error={documentError ? { type: "manual", message: documentError } : undefined}
                  supportText={documentError}
                  placeholder={hasCnpj ? "00.000.000/0001-00" : "000.000.000-00"}
                  required
                  maxLength={hasCnpj ? 18 : 14}
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
                  onBlur={onDocumentBlur}
                  error={documentError ? { type: "manual", message: documentError } : undefined}
                  supportText={documentError}
                  placeholder="00.000.000/0001-00"
                  maxLength={18}
                  required
                  onChange={(e) => {
                    setDocumentError(undefined);
                    handleCnpjChange(e as React.ChangeEvent<HTMLInputElement>);
                  }}
                />
              </div>
            </>
          )}
          
              <div className="w-full">
                <Input
                  type="text"
                  label="Descrição do seu negócio (opcional)"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Fale um pouco sobre o que você realiza"
                />
              </div>
              
              <div className="w-full flex-col flex justify-end">
                <Label htmlFor="phoneNumber" className="text-sm mb-2 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Número de telefone <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center w-full bg-white border border-slate-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary rounded-[10px] px-3 transition-colors overflow-hidden h-[50px] mt-0.5">
                    <div className="flex items-center gap-2 border-r border-slate-200 text-slate-500 select-none w-fit pr-2">
                        <p className="font-medium leading-none text-slate-500">+55</p>
                    </div>
                    <input
                      id="phoneNumber"
                      type="text"
                      maxLength={15}
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="(00) 00000-0000"
                      required
                      className="w-full bg-transparent pl-3 pr-3 text-sm text-slate-900 outline-none placeholder:text-muted-foreground"
                    />
                </div>
              </div>
            <div className="w-full">
            <label className="block mb-2 font-medium text-[16px] text-[#384455]">Onde você nos conheceu?</label>
            <Select value={referrer} onValueChange={(v) => setReferrer(v)}>
              <SelectTrigger className="w-full h-10 px-4 py-6 rounded-[10px]">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="indicacao">Indicação</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            </div>
          {referrer === "outro" && (
            <div className="w-full">
              <Input
                type="text"
                label="Por favor, especifique"
                id="referrerOther"
                value={referrerOther}
                onChange={(e) => setReferrerOther(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
