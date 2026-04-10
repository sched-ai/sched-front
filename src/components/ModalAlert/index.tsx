import { TriangleAlert } from "lucide-react";
import { type Dispatch, type SetStateAction } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";

interface IProps {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  onSubmit: () => void;
  serviceName: string;
}

export const ModalAlert = (props: IProps) => {
  const { isModalOpen, setIsModalOpen, onSubmit, serviceName } = props;

  if (!isModalOpen) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <TriangleAlert className="w-5 h-5 text-red-500" />
            <DialogTitle className="text-lg text-slate-900">Confirmar exclusão</DialogTitle>
          </div>

          <DialogDescription className="text-sm text-slate-600 mt-1">
            Tem certeza que deseja excluir o serviço{" "}
            <span className="font-semibold text-slate-900">"{serviceName}"</span>? Essa ação não pode ser desfeita.
          </DialogDescription>

          <div className="mt-5 flex justify-end gap-2">
            <Button 
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="px-2"
            >
              Cancelar
            </Button>
            <Button 
              type="button"
              variant="destructive" 
              onClick={(e) => {
                e.preventDefault();
                onSubmit();
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-2"
            >
              Excluir
            </Button>
          </div>
      </DialogContent>
    </Dialog>
  );
};
