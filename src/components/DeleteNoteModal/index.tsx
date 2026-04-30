import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useDeleteAnnotation } from "@/hooks/api/useDeleteAnnotation";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  noteId: string | null;
}

export const DeleteNoteModal = ({
  isOpen,
  onClose,
  onSuccess,
  noteId,
}: IProps) => {
  const { mutate: deleteAnnotation, isPending } = useDeleteAnnotation({
    onSuccessFn: () => {
      onSuccess();
      onClose();
    }
  });

  const confirmDelete = () => {
    if (!noteId) return;
    deleteAnnotation(String(noteId));
  };

  if (!isOpen || !noteId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl">
        <div className="flex items-center gap-2 mb-1">
          <TriangleAlert className="w-5 h-5 text-red-500" />
          <DialogTitle className="text-lg text-slate-900">Confirmar exclusão</DialogTitle>
        </div>

        <DialogDescription className="text-sm text-slate-600 mt-1">
          Tem certeza que deseja excluir esta nota? Essa ação não pode ser desfeita.
        </DialogDescription>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="px-2" disabled={isPending}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={confirmDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-2"
            disabled={isPending}
          >
            {isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
