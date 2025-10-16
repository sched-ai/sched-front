import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useState, type Dispatch, type SetStateAction, useEffect } from "react";
import { useCreateService } from "@/hooks/api/useCreateService";

import { useUser } from "@/context/user";
import type { IService } from "@/hooks/api/useGetAllServices";
import { useUpdateService } from "@/hooks/api/useEditService";
import { Label } from "@/components/ui/label";
import Input from "@/components/ui/input";
import CustomRadioInput from "@/components/CustomRadioInput";
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

const responsaveisMock = [
  { id: 1, nome: "Dr. Roberto Moreira" },
  { id: 2, nome: "Dra. Ana Beatriz Costa" },
  { id: 3, nome: "Dr. Carlos Eduardo Lima" },
  { id: 4, nome: "Dra. Fernanda Sampaio" },
];

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

  const [hasResponsavel, setHasResponsavel] = useState("nao");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("00:00");
  const [responsavel, setResponsavel] = useState("");
  const [departamento, setDepartamento] = useState("");
  const queryClient = useQueryClient();

  const { userData } = useUser();
  const isCompany =
    userData?.membership?.company?.companyType === "EMPRESA" &&
    userData?.membership?.role?.name === "Admin";

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
        setDepartamento(service.department || "");
        setDuration(
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
    setNome("");
    setDescricao("");
    setPrice("");
    setDuration("00:00");
    setResponsavel("");
    setDepartamento("");
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

  const parseBRL = (formatted: string) => {
    if (!formatted) return null;
    const onlyNums = formatted.replace(/[^0-9]/g, "");
    if (!onlyNums) return null;
    const int = parseInt(onlyNums, 10);
    return int / 100;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const durationInMinutes = hhmmToMinutes(duration);

    const servicePayload = {
      name: nome,
      description: descricao,
      type: "SERVICE" as ItemType,
      professionalId: responsavel || null,
      department: departamento || null,
      price: parseBRL(price),
      // send duration as minutes number or null
      duration: durationInMinutes,
    };

    if (isEditMode) {
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
      <DialogContent className="px-0">
        <DialogHeader className="px-8 gap-0">
          <DialogTitle className="text-lg bg-blue-600 w-fit px-2 rounded-2xl text-white">
            {isEditMode ? "Editar Serviço" : "Novo Serviço"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 px-8 overflow-auto custom-scrollbar"
        >
          <>
            <div className="flex flex-col gap-3">
              <Input
                id="nome"
                type="text"
                label="Nome"
                placeholder="Ex: Exame de Sangue"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="mt-2"
                required
              />
              <Input
                type="textarea"
                id="descricao"
                label="Descrição"
                placeholder="Descreva brevemente o item..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="mt-2"
              />
              <div className="flex items-center gap-4">
                <Input
                  id="price"
                  type="text"
                  label="Preço"
                  placeholder="R$ 0,00"
                  value={price}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const formatted = formatBRL(raw);
                    setPrice(formatted);
                  }}
                  className="mt-2"
                />
                <Input
                  id="duration"
                  type="time"
                  label="Duração"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="flex flex-col gap-4">
                {isCompany && (
                  <div>
                    <Label
                      htmlFor="incluir-info"
                      className="font-semibold text-gray-700"
                    >
                      Incluir Responsável e Departamento?
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-4 mt-2">
                      <CustomRadioInput
                        label="Sim"
                        htmlFor="sim"
                        name="hasResponsavel"
                        value="sim"
                        checked={hasResponsavel === "sim"}
                        onChange={(e) => {
                          setHasResponsavel(e.target.value);
                        }}
                      />
                      <CustomRadioInput
                        label="Não"
                        htmlFor="nao"
                        name="hasResponsavel"
                        value="nao"
                        checked={hasResponsavel === "nao"}
                        onChange={(e) => {
                          setHasResponsavel(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                )}

                {hasResponsavel === "sim" && (
                  <>
                    <div>
                      <Label
                        htmlFor="responsavel"
                        className="font-semibold text-gray-700 mb-2"
                      >
                        Responsável
                      </Label>

                      <Select
                        value={responsavel}
                        onValueChange={(e) => setResponsavel(e)}
                      >
                        <SelectTrigger className="w-full !h-[48px] border-[#A2A6BB66] cursor-pointer hover:border-[#141736] focus:border-[#141736]">
                          <SelectValue placeholder="Selecione um responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          {responsaveisMock.map((resp) => (
                            <SelectItem
                              key={resp.id}
                              value={resp.id.toString()}
                            >
                              {resp.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label
                        htmlFor="departamento"
                        className="font-semibold text-gray-700"
                      >
                        Departamento
                      </Label>
                      <Input
                        id="departamento"
                        type="text"
                        placeholder="Ex: Cardiologia Clínica"
                        value={departamento}
                        onChange={(e) => setDepartamento(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                className="px-4"
                onClick={() => {
                  handleOpenChange(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 transition-colors px-4"
              >
                Salvar
              </Button>
            </div>
          </>
        </form>
      </DialogContent>
    </Dialog>
  );
};
