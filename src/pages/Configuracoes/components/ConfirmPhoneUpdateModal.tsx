import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmPhoneUpdateModalProps {
  isOpen: boolean;
  currentPhone: string;
  nextPhone: string;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export const ConfirmPhoneUpdateModal = ({
  isOpen,
  currentPhone,
  nextPhone,
  isPending = false,
  onClose,
  onConfirm,
}: ConfirmPhoneUpdateModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-[#DADCE0] text-[#121535] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atualizar telefone</DialogTitle>
          <DialogDescription>
            Confirme a alteração do telefone da clínica. O novo número será salvo
            e refletido na tela de configurações.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-[#DADCE0] bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-slate-500">Atual</span>
            <span className="font-medium text-[#121535]">{currentPhone || "-"}</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 text-sm">
            <span className="text-slate-500">Novo</span>
            <span className="font-medium text-[#121535]">{nextPhone || "-"}</span>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void onConfirm()}
            disabled={isPending}
            className="cursor-pointer bg-[#121535] text-white hover:bg-[#1a1f4d]"
          >
            {isPending ? "Salvando..." : "Confirmar atualização"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
