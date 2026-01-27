import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { capitalizeFirst } from "@/util/helper";
import { CalendarDays, Clock, Layers, Pencil, Trash2, MapPin } from "lucide-react";

interface Details {
  title: string;
  localDateTime?: Date | null;
  start?: string;
  end?: string;
  services?: string[];
  workplaceName?: string;
  type?: 'consulta' | 'bloqueio';
}

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  details: Details | null;
}

export const ScheduleViewModal = ({ 
  isOpen, 
  onClose, 
  details, 
  onEdit, 
  onDelete 
}: IProps) => {
  if (!details) return null;

  const formattedDate = details.localDateTime
    ? details.localDateTime.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "Data não informada";

  const formattedYear = details.localDateTime?.getFullYear();
  const isBlock = details.type === 'bloqueio';


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#121535] border-slate-700 text-slate-100 p-0 overflow-hidden gap-0">
        
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight text-white">
                {capitalizeFirst(details.title)}
              </DialogTitle>
              <p className="text-slate-400 text-sm mt-1">
                {isBlock ? "Detalhes do bloqueio" : "Detalhes do agendamento"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 pt-2 space-y-6">
          
          <div className="bg-[#1a1e45] rounded-xl p-4 flex flex-col gap-3 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 p-2 rounded-full">
                <CalendarDays className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200 capitalize">
                  {formattedDate}
                </p>
                <p className="text-xs text-slate-400">{formattedYear}</p>
              </div>
            </div>

            <Separator className="bg-slate-700/50" />

            {details.start && details.end && (
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/10 p-2 rounded-full">
                  <Clock className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {details.start} - {details.end}
                  </p>
                  <p className="text-xs text-slate-400">Horário previsto</p>
                </div>
              </div>
            )}

            {details.workplaceName && (
              <>
                <Separator className="bg-slate-700/50" />
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/10 p-2 rounded-full">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {details.workplaceName  }
                    </p>
                    <p className="text-xs text-slate-400">Local de atendimento</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {details.type === 'consulta' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-300">
                <Layers className="w-4 h-4" />
                <h4 className="text-sm font-semibold uppercase tracking-wider">
                  Serviços
                </h4>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {details.services && details.services.length > 0 ? (
                  details.services.map((service, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary" 
                      className="bg-slate-700/50 hover:bg-slate-700 text-slate-200 px-3 py-1 text-sm font-normal border-transparent"
                    >
                      {service}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic">
                    Nenhum serviço especificado.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="bg-[#0f112a] p-4 flex flex-row items-center justify-between border-t border-slate-800">
          <Button 
            variant="ghost" 
            onClick={onDelete}
            className="text-red-400 hover:text-red-300 hover:bg-red-950/30 gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </Button>

          <Button 
            variant="secondary"
            onClick={onEdit}
            className="gap-2 bg-slate-700 hover:bg-slate-600 text-white border-none"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};