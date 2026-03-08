import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";
import { useEffect, useRef } from "react";
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
  const ref = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      setTimeout(() => document.addEventListener("mousedown", handleClickOutside), 0);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !noteId) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
          ref={ref}
          className="w-[400px] bg-[#121535] border border-slate-700 text-slate-100 rounded-lg shadow-2xl overflow-hidden flex flex-col p-6 animate-in zoom-in-95 duration-200"
      >
          <div className="flex items-center gap-2 mb-4">
            <TriangleAlert className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-white">Confirmar Exclusão</h2>
          </div>

          <p className="text-slate-300 text-sm mb-4 leading-relaxed whitespace-pre-line">
            Tem certeza que deseja excluir esta nota? Essa ação não pode ser desfeita.
          </p>

          <div className="flex gap-3 mt-auto justify-end">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="border-slate-600 !text-slate-300 hover:bg-slate-800 hover:text-white px-4"
              disabled={isPending}
            >
              Não, Fechar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4"
              disabled={isPending}
            >
              {isPending ? "Excluindo..." : "Sim, Excluir"}
            </Button>
          </div>
      </div>
    </div>
  );
};
