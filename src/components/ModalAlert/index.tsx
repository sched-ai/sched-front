import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { type Dispatch, type SetStateAction } from "react";

import { Button } from "../ui/button";
import { TriangleAlert } from "lucide-react";

interface IProps {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  onSubmit: () => void;
  serviceName: string;
}

export const ModalAlert = (props: IProps) => {
  const { isModalOpen, setIsModalOpen, onSubmit, serviceName } = props;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  const handleOpenChange = (open: boolean) => {
    setIsModalOpen(open);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="px-4">
        <DialogHeader className="">
          <DialogTitle className="text-lg flex w-fit px-2 rounded-2xl gap-2 text-red-500">
            <TriangleAlert className=""/> Atenção
          </DialogTitle>
        </DialogHeader>
        <p>
          Tem certeza que gostaria de excluir permanentemente o serviço{" "}
          <span className="font-bold">"{serviceName}"</span>?
        </p>
        <DialogFooter>
          <Button variant="outline" className="px-4 border-accent-foreground" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="destructive"
            className="px-4 hover:bg-red-800"
          >
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
