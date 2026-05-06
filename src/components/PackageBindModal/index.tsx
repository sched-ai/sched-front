import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PackagePlus } from "lucide-react";
import { useGetAllServices } from "@/hooks/api/useGetAllServices";
import { useSearchClients } from "@/hooks/api/useSearchClients";
import { usePurchasePackage } from "@/hooks/api/usePurchasePackage";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface PackageBindModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const baseInputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

export function PackageBindModal({ isOpen, onClose }: PackageBindModalProps) {
  const navigate = useNavigate();
  const [clientId, setClientId] = useState<string | null>(null);
  const [packageId, setPackageId] = useState<string>("");
  const [clientSearch, setClientSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: services } = useGetAllServices();
  const packages = services?.filter(s => s.type === 'PACKAGE') || [];
  
  const { data: clients, isLoading: isLoadingClients } = useSearchClients({
    search: clientSearch || undefined
  });

  const handleClose = () => {
    setClientId(null);
    setPackageId("");
    setClientSearch("");
    onClose();
  };

  const { mutate: purchasePackage, isPending } = usePurchasePackage({
    onSuccessFn: () => {
      toast.success("Pacote vinculado com sucesso!");
      handleClose();
    }
  });

  if (!isOpen) return null;

  const handleBind = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      toast.error("Selecione um paciente");
      return;
    }
    if (!packageId) {
      toast.error("Selecione um pacote");
      return;
    }
    purchasePackage({ clientId, packageId });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md bg-white border border-slate-200 rounded-2xl p-0 overflow-visible">
        {packages.length === 0 ? (
          <div>
            <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-3 rounded-t-2xl">
              <div className="bg-blue-100 p-2 rounded-lg">
                <PackagePlus className="text-blue-600" size={20} />
              </div>
              <DialogTitle className="text-xl text-slate-900">
                Vincular Pacote
              </DialogTitle>
            </div>
            <div className="px-6 py-6 text-sm text-slate-600">
              Voce ainda nao tem pacotes adicionados. Crie um pacote para continuar.
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2 rounded-b-2xl bg-white">
              <Button
                type="button"
                variant="outline"
                className="px-4 text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                onClick={handleClose}
              >
                Fechar
              </Button>
              <Button
                type="button"
                className="bg-blue-600 px-2 hover:bg-blue-700 text-white"
                onClick={() => {
                  handleClose();
                  navigate("/services/packages/new");
                }}
              >
                Criar Pacote
              </Button>
            </div>
          </div>
        ) : (
        <form onSubmit={handleBind}>
          <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-3 rounded-t-2xl">
            <div className="bg-blue-100 p-2 rounded-lg">
              <PackagePlus className="text-blue-600" size={20} />
            </div>
            <DialogTitle className="text-xl text-slate-900">
              Vincular Pacote
            </DialogTitle>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="space-y-2 relative">
              <label className="text-sm font-medium text-slate-700">
                Paciente
                <span className="text-red-500 text-[16px] ml-1">*</span>
              </label>
              <input
                type="text"
                placeholder="Buscar paciente..."
                className={baseInputClass}
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setShowSuggestions(true);
                  setClientId(null);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              {showSuggestions && clientSearch && (
                 <div className="absolute top-full left-0 right-0 z-50 bg-white border border-slate-200 rounded-b-md shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
                   {isLoadingClients && <div className="p-3 text-sm text-slate-500">Carregando...</div>}
                   {!isLoadingClients && clients && clients.length > 0 && (
                     <ul>
                       {clients.map(c => (
                         <li
                           key={c.id}
                           className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-slate-700 text-sm"
                           onMouseDown={(e) => {
                             e.preventDefault();
                             setClientSearch(c.name);
                             setClientId(c.id);
                             setShowSuggestions(false);
                           }}
                         >
                           {c.name}
                         </li>
                       ))}
                     </ul>
                   )}
                   {!isLoadingClients && clients?.length === 0 && (
                     <div className="p-3 text-sm text-slate-500">Nenhum paciente encontrado.</div>
                   )}
                 </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Pacote
                <span className="text-red-500 text-[16px] ml-1">*</span>
              </label>
              <Select value={packageId} onValueChange={setPackageId}>
                <SelectTrigger className={cn(baseInputClass, "!h-[42px] px-3 w-full border-slate-300 text-slate-900")}>
                  <SelectValue placeholder="Selecione o pacote" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  {packages.map(p => (
                    <SelectItem key={p.id} value={p.id} className="focus:bg-slate-50">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2 rounded-b-2xl bg-white">
            <Button
              type="button"
              variant="outline"
              className="px-4 text-slate-700 hover:text-slate-900 hover:bg-slate-50"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !clientId || !packageId} className="bg-blue-600 px-2 hover:bg-blue-700 text-white">
              {isPending ? "Vinculando..." : "Vincular"}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
