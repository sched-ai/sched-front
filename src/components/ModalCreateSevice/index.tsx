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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export const ModalCreateService = (props: IProps) => {
  const { isModalOpen, setIsModalOpen, service } = props;
  const isEditMode = !!service;

  const [hasResponsavel, setHasResponsavel] = useState("nao");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [departamento, setDepartamento] = useState("");
  const queryClient = useQueryClient();

  const { userData } = useUser();
  const isCompany =
    userData?.membership?.company?.companyType === "EMPRESA" &&
    userData?.membership?.role?.name === "Admin";

  useEffect(() => {
    if (service) {
      setNome(service.name || "");
      setDescricao(service.description || "");
      setResponsavel(service.professional?.id || "");
      setDepartamento(service.department || "");
      setHasResponsavel(
        service.professional?.id || service.department ? "sim" : "nao"
      );
    }
  }, [service]);

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
    setResponsavel("");
    setDepartamento("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const servicePayload = {
      name: nome,
      description: descricao,
      type: "SERVICE" as ItemType,
      professionalId: responsavel || null,
      department: departamento || null,
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
              <div>
                <Label htmlFor="nome" className="font-semibold text-gray-700">
                  Nome
                </Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Ex: Cardiologia"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label
                  htmlFor="descricao"
                  className="font-semibold text-gray-700"
                >
                  Descrição
                </Label>
                <Input
                  type="textarea"
                  id="descricao"
                  placeholder="Descreva brevemente o item..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
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