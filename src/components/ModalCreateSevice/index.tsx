import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import bgWaves from "@/assets/abstract_waves.jpg";

import { useState, type Dispatch, type SetStateAction, useEffect } from "react";
import { useCreateService } from "@/hooks/api/useCreateService";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

import type { IService } from "@/hooks/api/useGetAllServices";
import { useUpdateService } from "@/hooks/api/useEditService";
import { Label } from "@/components/ui/label";
import Input from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

interface IProps {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  service?: IService | null;
}


type ItemType = "SERVICE" | "PACKAGE";

// eslint-disable-next-line react-refresh/only-export-components
export function minutesToHHMM(totalMinutes: number) {
  if (!Number.isFinite(totalMinutes)) return "";
  if (totalMinutes === 0) return "00:00";
  if (totalMinutes < 0) return "";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  return `${hh}:${mm}`;
}

export const ModalCreateService = (props: IProps) => {
  const { isModalOpen, setIsModalOpen, service } = props;
  const isEditMode = !!service;

  
  // Service form state
  const [serviceNome, setServiceNome] = useState("");
  const [serviceDescricao, setServiceDescricao] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDuration, setServiceDuration] = useState("00:00");
  const [responsavel, setResponsavel] = useState("");
  const [departamento, setDepartamento] = useState("");

  // Package form state (separate so switching tabs doesn't copy values)
  const [packageNome, setPackageNome] = useState("");
  const [packageDescricao, setPackageDescricao] = useState("");
  const [packagePrice, setPackagePrice] = useState("");
  const [packageDiscount, setPackageDiscount] = useState("");
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("servico");
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [, setHasResponsavel] = useState("nao");

  useEffect(() => {
    if (isModalOpen) {
      if (service) {
        setServiceNome(service.name || "");
        setServiceDescricao(service.description || "");
        setServicePrice(
          service.price !== undefined && service.price !== null
            ? new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(Number(service.price))
            : ""
        );
        setResponsavel(service.professional?.id || "");
        setDepartamento(service.department || "");
        setServiceDuration(
          service.duration !== undefined && service.duration !== null
            ? minutesToHHMM(Number(service.duration))
            : ""
        );
        setHasResponsavel(
          service.professional?.id || service.department ? "sim" : "nao"
        );
      } else {
        resetForm();
      }
    }
  }, [service, isModalOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const previous = document.body.style.overflow;
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = previous || "";
    }
    return () => {
      document.body.style.overflow = previous || "";
    };
  }, [isModalOpen]);

  function hhmmToMinutes(value: string): number | null {
    if (!value) return null;
    const parts = value.split(":");
    if (parts.length < 2) return null;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  }

  const { mutate: createService } = useCreateService({
    onSuccessFn: () => {
      handleOpenChange(false);
    },
  });

  const { mutate: updateService } = useUpdateService({
    onSuccessFn: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      handleOpenChange(false);
    },
  });

  const resetForm = () => {
    setHasResponsavel("nao");
    // reset service form
    setServiceNome("");
    setServiceDescricao("");
    setServicePrice("");
    setServiceDuration("00:00");
    setResponsavel("");
    setDepartamento("");
    // reset package form
    setPackageNome("");
    setPackageDescricao("");
    setPackagePrice("");
    setPackageDiscount("");
  };

  const formatBRL = (value: string) => {
    const onlyNums = value.replace(/[^0-9]/g, "");
    if (!onlyNums) return "";
    const int = parseInt(onlyNums, 10);
    const number = int / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(number);
  };

  const parseBRL = (formatted: string | null) => {
    if (!formatted) return null;
    const onlyNums = formatted.replace(/[^0-9]/g, "");
    if (!onlyNums) return null;
    const int = parseInt(onlyNums, 10);
    return int / 100;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const durationInMinutes = hhmmToMinutes(serviceDuration as string);

    const servicePayload = {
      name: serviceNome,
      description: serviceDescricao,
      type: "SERVICE" as ItemType,
      professionalId: responsavel || null,
      department: departamento || null,
      price: parseBRL(servicePrice),
      duration: durationInMinutes,
    };

    if (isEditMode && service && service.id) {
      updateService({ id: service.id, payload: servicePayload });
    } else {
      createService(servicePayload);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setIsModalOpen(open);
  };
  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="fixed left-1/2 top-1/2 z-50 w-[700px] max-w-[95%] overflow-hidden overflow-x-hidden -translate-x-1/2 -translate-y-1/2 px-0 rounded-2xl border border-[#1C3760] bg-[rgba(3,8,22,0.85)] shadow-2xl">
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: `url(${bgWaves})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'blur(45px) brightness(0.6)',
            transform: 'scale(1.02)'
          }}
        />
        <div className="absolute inset-0 -z-10 bg-[rgba(8,18,40,0.55)]" />

        <div className="relative z-10 p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <DialogTitle className="text-lg text-white font-semibold">
                {activeTab === "servico" ? "Adicionar Serviço" : "Adicionar Pacote"}
              </DialogTitle>
              <DialogDescription className="text-sm text-white/70">Preencha o formulário para criar um novo serviço/pacote</DialogDescription>
            </div>

            <button
              aria-label="Fechar"
              onClick={() => handleOpenChange(false)}
              className="text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white/5 border border-white h-[44px] mb-3">
              <TabsTrigger
                value="servico"
                className="data-[state=active]:text-[#141736] data-[state=inactive]:text-background cursor-pointer h-[32px] px-2 text-sm"
              >
                Serviço
              </TabsTrigger>
              <TabsTrigger
                value="pacote"
                className="data-[state=active]:text-[#141736] data-[state=inactive]:text-background cursor-pointer h-[32px] px-2 text-sm"
              >
                Pacote
              </TabsTrigger>
            </TabsList>

            <TabsContent value="servico" className="text-white">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Label className="text-white text-sm">Nome do Serviço</Label>
                <Input id="nome" type="text" placeholder="Nome do Serviço" value={serviceNome} onChange={(e) => setServiceNome(e.target.value)} placeholderWhite noFocusColor className="!h-[36px] text-sm text-white bg-transparent border-white/80 rounded-[10px]" />

                <div className="flex gap-3 mt-4">
                  <div className="flex-1">
                    <Label className="text-sm text-white mb-2">Categoria</Label>
                    <Select onValueChange={() => {}}>
                      <SelectTrigger className="w-full !h-[40px] border-white text-white bg-transparent rounded-[10px] data-[placeholder]:text-white/50 text-sm">
                        <SelectValue placeholder="Estética Facial, Corporal..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">Nenhuma categoria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-40">
                    <Label className="text-sm text-white mb-2">Responsável</Label>
                    <Select value={responsavel} onValueChange={(e) => setResponsavel(e === "__none" ? "" : e)}>
                      <SelectTrigger className="w-full !h-[40px] border-white/80 text-white bg-transparent rounded-[10px] data-[placeholder]:text-white/50 text-sm">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">Nenhum responsável</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="flex-1">
                    <Label className="text-sm text-white mb-2">Valor (R$)</Label>
                    <Input id="price" type="text" placeholder="R$ 0,00" value={servicePrice} onChange={(e) => setServicePrice(formatBRL(e.target.value))} placeholderWhite noFocusColor className="!h-[40px] text-sm text-white bg-transparent border-white/80 rounded-[10px]" />
                  </div>
                  <div className="w-40">
                    <Label className="text-sm text-white mb-2">Duração</Label>
                    <Input id="duration" type="time" value={serviceDuration} onChange={(e) => setServiceDuration(e.target.value)} placeholderWhite noFocusColor className="!h-[40px] text-sm text-white bg-transparent border-white/80 rounded-[10px]" />
                  </div>
                </div>

                <div className="mt-5">
                  <Label className="text-sm text-white">Descrição do serviço</Label>
                  <textarea value={serviceDescricao} onChange={(e) => setServiceDescricao(e.target.value)} className="w-full mt-2 p-4 rounded-lg bg-transparent text-white min-h-[80px] placeholder-white/50 border-white/80 focus:text-white text-sm" placeholder="Descrição do serviço" />
                </div>

                <div className="flex justify-end gap-3 mt-2">
                  <Button type="submit" className="bg-white text-[#141736] px-4 py-2 rounded-[10px] text-sm">Salvar</Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="pacote" className="text-white">
              <form onSubmit={(e) => { e.preventDefault();}} className="flex flex-col gap-4">
                <Label className="text-white text-sm">Nome do Pacote</Label>
                <Input id="nomePacote" type="text" placeholder="Nome do Pacote" value={packageNome} onChange={(e) => setPackageNome(e.target.value)} placeholderWhite noFocusColor className="!h-[36px] text-sm text-white bg-transparent border-white/80 rounded-[10px]" />

                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Label className="text-sm text-white">Selecionar serviço</Label>
                    <Select>
                      <SelectTrigger className="w-full !h-[40px] border-white/80 text-white bg-transparent rounded-[10px] data-[placeholder]:text-white/50 text-sm">
                        <SelectValue placeholder="Selecionar serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">Nenhum serviço</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-36">
                    <Label className="text-sm text-white">Quantidade</Label>
                    <input type="number" min={1} defaultValue={1} className="w-full p-2 rounded-lg bg-transparent text-white placeholder-white/50 border-white/80 text-sm" />
                  </div>
                </div>

                <div>
                  <button type="button" className="px-3 py-1 bg-white text-[#18181B] text-xs rounded-[10px]">+ Adicionar</button>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label className="text-sm text-white">Valor Cheio (R$)</Label>
                    <Input type="text" placeholder="R$ 0,00" value={packagePrice} onChange={(e) => setPackagePrice(formatBRL(e.target.value))} placeholderWhite noFocusColor className="!h-[40px] text-sm text-white bg-transparent border-white/80 placeholder-white rounded-[10px]" />
                  </div>
                  <div className="w-40">
                    <Label className="text-sm text-white">Desconto</Label>
                    <Input type="text" placeholder="%" value={packageDiscount} onChange={(e) => setPackageDiscount(e.target.value)} placeholderWhite noFocusColor className="!h-[40px] text-sm text-white bg-transparent border-white/80 rounded-[10px]" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch checked={repeatEnabled} onCheckedChange={(v) => setRepeatEnabled(Boolean(v))} />
                  <span className="text-white text-sm">Repetir</span>
                </div>

                <div>
                  <Label className="text-sm text-white">Descrição do pacote</Label>
                  <textarea value={packageDescricao} onChange={(e) => setPackageDescricao(e.target.value)} className="w-full mt-2 p-4 rounded-lg bg-transparent text-white min-h-[80px] placeholder-white border border-white text-sm" placeholder="Descrição do pacote" />
                </div>

                <div className="flex justify-end gap-3 mt-2">
                  <Button type="submit" className="bg-white text-[#141736] px-4 py-2 rounded-[10px] text-sm">Salvar</Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
