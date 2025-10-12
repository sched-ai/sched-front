import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "../ui/label";
import CustomRadioInput from "../CustomRadioInput";
import Input from "../ui/input";
import { useState, type Dispatch, type SetStateAction } from "react";
import { useCreateService } from "@/hooks/api/useCreateService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";

interface IProps {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

const responsaveisMock = [
  { id: 1, nome: "Dr. Roberto Moreira" },
  { id: 2, nome: "Dra. Ana Beatriz Costa" },
  { id: 3, nome: "Dr. Carlos Eduardo Lima" },
  { id: 4, nome: "Dra. Fernanda Sampaio" },
];

type ItemType = "SERVICE" | "PACKAGE";

export const ModalCreateService = (props: IProps) => {
  const { isModalOpen, setIsModalOpen } = props;
  const [itemType, setItemType] = useState<ItemType>("SERVICE");
  const [hasResponsavel, setHasResponsavel] = useState("nao");

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  const [responsavel, setResponsavel] = useState("");
  const [departamento, setDepartamento] = useState("");

  const { mutate: createService } = useCreateService({
    onSuccessFn: () => {
      handleOpenChange(false)
    },
  });

  const resetForm = () => {
    setItemType("SERVICE");
    setHasResponsavel("nao");
    setNome("");
    setDescricao("");
    setResponsavel("");
    setDepartamento("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const novoItem = {
      name: nome,
      description: descricao,
      type: itemType,
      responsavel,
      department: departamento,
    };

    createService(novoItem);
  };

  const handleOpenChange = (open: boolean) => {
       if (!open) {
        resetForm();
      }
      setIsModalOpen(open);
};

  const handleItemTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setItemType(e.target.value as ItemType);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="min-h-[734px] px-0">
        <DialogHeader className="px-8">
          <DialogTitle>Adicionar novo</DialogTitle>
          <DialogDescription>
            Preencha o formulário para criar um novo serviço ou pacote.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 px-8 max-h-[630px] overflow-auto custom-scrollbar"
        >
          <Label className="font-semibold text-gray-700 text-lg">
            1. Selecione o tipo de item
          </Label>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <CustomRadioInput
              label="Serviço"
              htmlFor="SERVICE"
              name="itemType"
              value="SERVICE"
              checked={itemType === "SERVICE"}
              onChange={handleItemTypeChange}
            />
            <CustomRadioInput
              label="Pacote"
              htmlFor="PACKAGE"
              name="itemType"
              value="PACKAGE"
              checked={itemType === "PACKAGE"}
              onChange={handleItemTypeChange}
            />
          </div>
          {itemType && (
            <>
              <div className="mb-2">
                <h2 className="font-semibold text-gray-700 text-lg">
                  2. Detalhes do {itemType === "SERVICE" ? "Serviço" : "Pacote"}
                </h2>
              </div>
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
                  <div>
                    <Label
                      htmlFor="incluir-info"
                      className="font-semibold text-gray-700"
                    >
                      Incluir Responsável e Departamento?
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
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
                          <SelectTrigger className="w-full !h-[48px] border-[#A2A6BB66]">
                            <SelectValue placeholder="Selecione um responsável" />
                          </SelectTrigger>
                          <SelectContent>
                            {responsaveisMock.map((resp) => (
                              <SelectItem key={resp.id} value={resp.nome}>
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
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="px-4"
                  onClick={() => {
                    handleOpenChange(false)
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
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
