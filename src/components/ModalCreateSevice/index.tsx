import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCreateService } from "@/hooks/api/useCreateService";
import type { IService } from "@/hooks/api/useGetAllServices";
import { useUpdateService } from "@/hooks/api/useEditService";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TimePickerField } from "@/components/ScheduleFormModal/TimePickerField";
import { useGetAllWorkplaces } from "@/hooks/api/useGetAllWorkplaces";
import { WorkplaceMultiSelect } from "@/components/WorkplaceMultiSelect";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Helpers ---

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

function hhmmToMinutes(value: string): number | null {
  if (!value) return null;
  const parts = value.split(":");
  if (parts.length < 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

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


const baseInputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

interface IProps {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  service?: IService | null;
}

export const ModalCreateService = (props: IProps) => {
  const { isModalOpen, setIsModalOpen, service } = props;
  const isEditMode = !!service;
  const queryClient = useQueryClient();
  // const { data: professionals } = useListCompanyMemberships();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("00:00");
  const [responsavel, setResponsavel] = useState("");
  const [selectedWorkplaces, setSelectedWorkplaces] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { data: workplaces } = useGetAllWorkplaces();

  useEffect(() => {
    if (isModalOpen) {
      if (service) {
        setNome(service.name || "");
        setDescricao(service.description || "");
        setPrice(
          service.price !== undefined && service.price !== null
            ? new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(Number(service.price))
            : ""
        );
        setResponsavel(service.employee?.id || "");
        setDuration(
          service.duration !== undefined && service.duration !== null
            ? minutesToHHMM(Number(service.duration))
            : "00:00"
        );
        
        const serviceWorkplaces = service.workplaces?.map(w => w.id) || [];
        if (serviceWorkplaces.length === 0 && workplaces && workplaces.length === 1) {
          setSelectedWorkplaces([workplaces[0].id]);
        } else {
          setSelectedWorkplaces(serviceWorkplaces);
        }
      } else {
        resetForm();
        if (workplaces && workplaces.length === 1) {
          setSelectedWorkplaces([workplaces[0].id]);
        }
      }
      setErrors({});
    }
  }, [service, isModalOpen, workplaces]);

  const resetForm = () => {
    setNome("");
    setDescricao("");
    setPrice("");
    setDuration("00:00");
    setResponsavel("");
    setSelectedWorkplaces([]);
    setErrors({});
  };

  const { mutate: createService, isPending: isCreating } = useCreateService({
    onSuccessFn: () => {
      handleClose();
    },
  });

  const { mutate: updateService, isPending: isUpdating } = useUpdateService({
    onSuccessFn: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      handleClose();
    },
  });

  const isPending = isCreating || isUpdating;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!nome.trim()) newErrors.nome = "O nome é obrigatório";
    else if (nome.trim().length < 3)
      newErrors.nome = "O nome deve ter pelo menos 3 letras";

    if (!descricao.trim()) newErrors.descricao = "A descrição é obrigatória";

    if (!price || (parseBRL(price) || 0) === 0) newErrors.price = "O valor é obrigatório";

    const durationInMinutes = hhmmToMinutes(duration);
    if (!duration || duration === "00:00" || durationInMinutes === 0) {
      newErrors.duration = "A duração é obrigatória";
    }

    if (selectedWorkplaces.length === 0) {
      newErrors.workplaces = "Selecione pelo menos um local";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const durationInMinutes = hhmmToMinutes(duration);

    const servicePayload = {
      name: nome,
      description: descricao,
      type: "SERVICE" as const,
      employeeId: responsavel || null,
      department: null,
      price: parseBRL(price),
      duration: durationInMinutes,
      workplaceIds: selectedWorkplaces,
    };

    if (isEditMode && service && service.id) {
      updateService({ id: service.id, payload: servicePayload });
    } else {
      createService(servicePayload);
    }
  };

  const handleClose = () => {
    resetForm();
    setIsModalOpen(false);
  };

  if (!isModalOpen) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-[85%] sm:w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-0 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 border-b border-slate-200">
            <DialogTitle className="text-xl text-slate-900">
              {isEditMode ? "Editar serviço" : "Novo serviço"}
            </DialogTitle>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Nome do serviço
                <span className="text-red-500 text-[16px] ml-1">*</span>
              </label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={cn(baseInputClass, errors.nome && "border-red-500")}
                placeholder="Ex: Limpeza de Pele"
                type="text"
              />
              {errors.nome && <p className="text-[10px] text-red-500 font-medium px-1">{errors.nome}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Valor (R$)
                  <span className="text-red-500 text-[16px] ml-1">*</span>
                </label>
                <input
                  value={price}
                  onChange={(e) => setPrice(formatBRL(e.target.value))}
                  className={cn(baseInputClass, errors.price && "border-red-500")}
                  placeholder="R$ 0,00"
                  type="text"
                />
                {errors.price && <p className="text-[10px] text-red-500 font-medium px-1">{errors.price}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Duração (h)
                  <span className="text-red-500 text-[16px] ml-1">*</span>
                </label>
                <div className="h-[42px] flex items-center">
                  <TimePickerField 
                    value={duration} 
                    onChange={setDuration} 
                    ariaLabel="Duração do serviço"
                    className={cn("schedule-time-picker--light", errors.duration && "border-red-500")}
                  />
                </div>
                {errors.duration && <p className="text-[10px] text-red-500 font-medium px-1">{errors.duration}</p>}
              </div>
            </div>


            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" />
                Locais de realização
                <span className="text-red-500 text-[16px] ml-1">*</span>
              </label>
              
              <WorkplaceMultiSelect 
                options={workplaces || []}
                selected={selectedWorkplaces}
                onChange={(ids) => {
                  setSelectedWorkplaces(ids);
                  if (ids.length > 0) setErrors(prev => ({ ...prev, workplaces: "" }));
                }}
                disabled={workplaces?.length === 1}
              />
              {errors.workplaces && <p className="text-[10px] text-red-500 font-medium px-1">{errors.workplaces}</p>}
              {workplaces?.length === 1 && (
                <p className="text-[10px] text-slate-400 italic px-1">
                  Selecionado automaticamente por ser o único local disponível.
                </p>
              )}
            </div>

          {/* <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">
              Responsável
            </label>
            <Select
              value={responsavel}
              onValueChange={(val) => setResponsavel(val === "__none" ? "" : val)}
            >
              <SelectTrigger className="w-full bg-transparent border border-zinc-600 rounded-lg px-4 py-2.5 text-sm text-white data-[placeholder]:text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all h-auto">
                <SelectValue placeholder="Selecione o profissional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">Nenhum responsável</SelectItem>
                {professionals?.map((prof) => (
                  <SelectItem key={prof.id} value={String(prof.id)}>
                    {prof.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}

            <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Descrição do serviço
              <span className="text-red-500 text-[16px] ml-1">*</span>
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className={cn(baseInputClass, "min-h-[96px] resize-none", errors.descricao && "border-red-500 focus:border-red-500 focus:ring-red-500/20")}
              placeholder="Descreva o serviço..."
            />
            {errors.descricao && <p className="text-[10px] text-red-500 font-medium px-1">{errors.descricao}</p>}
          </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="px-2"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-2"
              disabled={isPending}
            >
              {isPending
                ? isEditMode
                  ? "Atualizando..."
                  : "Salvando..."
                : isEditMode
                  ? "Atualizar"
                  : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
