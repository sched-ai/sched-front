import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, User } from "lucide-react";
import bgWaves from "@/assets/abstract_waves.jpg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ProfessionalData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface ProfessionalModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  professional?: ProfessionalData | null;
  onSave?: (data: ProfessionalData) => void;
}

const inputCls =
  "w-full bg-transparent border border-white/70 rounded-[10px] px-3 py-2 text-sm text-white placeholder-white/50 outline-none focus:border-white transition";

export const ProfessionalModal = ({
  isOpen,
  setIsOpen,
  professional,
  onSave,
}: ProfessionalModalProps) => {
  const isEdit = !!professional;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (professional) {
        setName(professional.name);
        setEmail(professional.email);
        setPhone(professional.phone);
        setRole(professional.role);
      } else {
        setName("");
        setEmail("");
        setPhone("");
        setRole("");
      }
    }
  }, [isOpen, professional]);

  const handleClose = () => setIsOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.({ id: professional?.id, name, email, phone, role });
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="fixed left-1/2 top-1/2 z-50 w-[480px] max-w-[95%] overflow-hidden -translate-x-1/2 -translate-y-1/2 px-0 rounded-2xl border border-[#1C3760] bg-[rgba(3,8,22,0.85)] shadow-2xl">
        {/* Background wave */}
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
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <DialogTitle className="text-lg text-white font-semibold">
                {isEdit ? "Editar Profissional" : "Adicionar Profissional"}
              </DialogTitle>
              <DialogDescription className="text-sm text-white/70 mt-0.5">
                Preencha o formulário para {isEdit ? "editar o" : "adicionar um novo"} profissional
              </DialogDescription>
            </div>
            <button
              aria-label="Fechar"
              onClick={handleClose}
              className="text-white/80 hover:text-white text-lg leading-none cursor-pointer"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name input — large with pencil icon */}
            <div className="relative">
              <input
                type="text"
                placeholder="Nome do Profissional"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${inputCls} pr-9 h-[44px]`}
                required
              />
              <Pencil size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60" />
            </div>

            {/* Personal info section */}
            <div className="flex items-center gap-2 mt-1">
              <User size={14} className="text-white/70" />
              <span className="text-white/70 text-xs font-medium uppercase tracking-wider">
                Informações pessoais
              </span>
            </div>

            {/* Email */}
            <input
              type="email"
              placeholder="Email do profissional"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputCls} h-[40px]`}
            />

            {/* Phone + Role row */}
            <div className="flex gap-3">
              <input
                type="tel"
                placeholder="Número de WhatsApp"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`${inputCls} h-[40px] flex-1`}
              />
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="flex-1 h-[40px] border-white/70 text-white bg-transparent rounded-[10px] data-[placeholder]:text-white/50 text-sm">
                  <SelectValue placeholder="Nível de Acesso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Profissional">Profissional</SelectItem>
                  <SelectItem value="Assistente">Assistente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Save */}
            <div className="flex justify-end mt-2">
              <Button type="submit" className="bg-white text-[#141736] px-5 py-2 rounded-[10px] text-sm font-medium hover:bg-white/90">
                Salvar
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
