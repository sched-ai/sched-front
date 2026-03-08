import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useCreateService } from "@/hooks/api/useCreateService";
import type { IService } from "@/hooks/api/useGetAllServices";
import { useUpdateService } from "@/hooks/api/useEditService";
import { useQueryClient } from "@tanstack/react-query";
// import { useListCompanyMemberships } from "@/hooks/api/useListCompanyMemberships";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

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


const ModalOverlay = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#121535] border border-white/5 shadow-2xl flex flex-col animate-in zoom-in-95 duration-300"
      >
        <div className="absolute top-3 right-3 z-20">
          <Button
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 rounded-full p-0"
            onClick={onClose}
          >
            <X size={20} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
};

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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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
        setResponsavel(service.professional?.id || "");
        setDuration(
          service.duration !== undefined && service.duration !== null
            ? minutesToHHMM(Number(service.duration))
            : "00:00"
        );
      } else {
        resetForm();
      }
      setErrors({});
    }
  }, [service, isModalOpen]);

  const resetForm = () => {
    setNome("");
    setDescricao("");
    setPrice("");
    setDuration("00:00");
    setResponsavel("");
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
      professionalId: responsavel || null,
      department: null,
      price: parseBRL(price),
      duration: durationInMinutes,
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
    <ModalOverlay onClose={handleClose}>
      <div className="flex flex-col items-center text-center pt-6 pb-2">
        <h1 className="text-xl font-bold text-white mb-1">
          {isEditMode ? "Editar Serviço" : "Novo Serviço"}
        </h1>
        <p className="text-gray-400 text-sm max-w-[80%]">
          {isEditMode
            ? "Atualize os dados do serviço abaixo."
            : "Preencha os dados abaixo para cadastrar um novo serviço no sistema."}
        </p>
      </div>

      <div className="px-6 pb-5 pt-2">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">
              Nome do serviço
            </label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={`w-full bg-transparent border border-zinc-600 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${errors.nome ? "border-red-500" : ""}`}
              placeholder="Ex: Limpeza de pele"
              type="text"
              autoFocus
            />
            {errors.nome && (
              <p className="text-red-400 text-xs ml-1 mt-1">{errors.nome}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium ml-1">
                Valor (R$)
              </label>
              <input
                value={price}
                onChange={(e) => setPrice(formatBRL(e.target.value))}
                className="w-full bg-transparent border border-zinc-600 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="R$ 0,00"
                type="text"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium ml-1">
                Duração
              </label>
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-transparent border border-zinc-600 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                style={{ colorScheme: 'auto' }}
                type="time"
              />
            </div>
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

          <div className="space-y-1">
            <label className="text-xs text-gray-400 font-medium ml-1">
              Descrição do serviço
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full bg-transparent border border-zinc-600 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all min-h-[70px] resize-none"
              placeholder="Descreva o serviço..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 items-center">
            <Button
              type="button"
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-white/5 py-5 px-5 rounded-lg transition-all duration-200"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-5 rounded-lg font-medium shadow-lg shadow-blue-900/40 hover:shadow-blue-900/60 transition-all duration-300 transform hover:-translate-y-0.5"
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
      </div>
    </ModalOverlay>
  );
};
