import { TriangleAlert } from "lucide-react";
import { type Dispatch, type SetStateAction, useEffect, useRef } from "react";
import { Button } from "../ui/button";

interface IProps {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  onSubmit: () => void;
  serviceName: string;
}

export const ModalAlert = (props: IProps) => {
  const { isModalOpen, setIsModalOpen, onSubmit, serviceName } = props;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      setTimeout(() => document.addEventListener("mousedown", handleClickOutside), 0);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen, setIsModalOpen]);

  if (!isModalOpen) return null;

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

          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            Tem certeza que gostaria de excluir permanentemente o serviço{" "}
            <span className="font-bold">"{serviceName}"</span>?
          </p>

          <div className="flex gap-3 mt-auto justify-end">
            <Button 
              type="button"
              variant="ghost" 
              onClick={() => setIsModalOpen(false)}
              className="border-slate-600 !text-slate-300 hover:bg-slate-800 hover:text-white px-4 cursor-pointer"
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
              className="bg-red-600 hover:bg-red-700 text-white px-4 cursor-pointer"
            >
              Excluir
            </Button>
          </div>
      </div>
    </div>
  );
};
