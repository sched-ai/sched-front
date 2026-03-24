import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import bgWaves from "@/assets/abstract_waves.jpg";
import { Pencil } from "lucide-react";

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
      <DialogContent
        showCloseButton={false}
        className="fixed top-1/2 left-1/2 z-50 w-[680px] max-w-[98%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-[#1C3760] bg-[rgba(3,8,22,0.85)] px-0 shadow-2xl"
      >
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: `url(${bgWaves})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "blur(45px) brightness(0.6)",
            transform: "scale(1.02)",
          }}
        />
        <div className="absolute inset-0 -z-10 bg-[rgba(8,18,40,0.55)]" />

        <div className="relative z-10 p-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold text-white">
                Confirmar atualização
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-sm text-white/70">
                Revise os números abaixo antes de salvar o novo telefone da clínica.
              </DialogDescription>
            </div>
            <button
              aria-label="Fechar"
              onClick={onClose}
              className="cursor-pointer text-lg leading-none text-white/80 hover:text-white"
              disabled={isPending}
            >
              ×
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="relative">
              <input
                type="text"
                value={currentPhone || "-"}
                readOnly
                className="h-[44px] w-full rounded-[10px] border border-white/70 bg-transparent px-3 py-2 pr-9 text-sm text-white outline-none"
              />
              <Pencil size={14} className="absolute top-1/2 right-3 -translate-y-1/2 text-white/60" />
              <span className="mt-1 block text-xs text-white/50">Telefone atual</span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={nextPhone || "-"}
                readOnly
                className="h-[44px] w-full rounded-[10px] border border-white/70 bg-transparent px-3 py-2 pr-9 text-sm text-white outline-none"
              />
              <Pencil size={14} className="absolute top-1/2 right-3 -translate-y-1/2 text-white/80" />
              <span className="mt-1 block text-xs text-white/50">Novo telefone</span>
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end">
            <Button
              type="button"
              onClick={() => void onConfirm()}
              disabled={isPending}
              className="rounded-[10px] bg-white px-5 py-2 text-sm font-medium text-[#141736] hover:bg-white/90"
            >
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
