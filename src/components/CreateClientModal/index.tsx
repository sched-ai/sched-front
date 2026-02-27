import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useCreateClient } from "@/hooks/api/useCreateClient";
import { useUpdateClient } from "@/hooks/api/useUpdateClient";
import type { ClientAPI } from "@/hooks/api/useGetAllClients";

// --- Helpers ---

const maskCPF = (v: string) => {
  return v
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

const maskPhone = (v: string) => {
  return v
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1"); // 11 digits
};

const formatCPFForDisplay = (cpf: string) => {
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11) return cpf;
  return maskCPF(clean);
};

const formatPhoneForDisplay = (phone: string) => {
  const clean = phone.replace(/\D/g, "");
  if (!clean) return "";
  return maskPhone(clean);
};

// --- Modal Component ---

const ModalOverlay = ({
  children,
  onClose
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#121535] border border-white/5 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 overflow-hidden"
      >
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 rounded-full p-0"
            onClick={onClose}
          >
            <X size={20} />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {children}
        </div>
      </div>
    </div>
  );
};

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: ClientAPI | null;
}

type Gender = 'masculino' | 'feminino' | 'outro';

export const CreateClientModal = ({ isOpen, onClose, clientToEdit }: CreateClientModalProps) => {
  const { mutate: createClient, isPending: isCreating } = useCreateClient();
  const { mutate: updateClient, isPending: isUpdating } = useUpdateClient();

  const isEditMode = !!clientToEdit;
  const isPending = isCreating || isUpdating;

  const [formData, setFormData] = useState({ name: "", cpf: "", phone: "", email: "" });
  const [gender, setGender] = useState<Gender>('outro');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Reset/populate form when modal opens/closes or clientToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (clientToEdit) {
        setFormData({
          name: clientToEdit.name || "",
          cpf: formatCPFForDisplay(clientToEdit.cpf || ""),
          phone: formatPhoneForDisplay(clientToEdit.phone || ""),
          email: clientToEdit.email || "",
        });
        setGender((clientToEdit.gender as Gender) || 'outro');
      } else {
        setFormData({ name: "", cpf: "", phone: "", email: "" });
        setGender('outro');
      }
      setErrors({});
    }
  }, [isOpen, clientToEdit]);

  const handleInputChange = (field: string, value: string) => {
      let val = value;
      if (field === 'cpf') val = maskCPF(value);
      if (field === 'phone') val = maskPhone(value);
      setFormData(prev => ({ ...prev, [field]: val }));
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
      const newErrors: { [key: string]: string } = {};
      if (!formData.name.trim()) newErrors.name = "O nome é obrigatório";
      else if (formData.name.trim().length < 3) newErrors.name = "O nome deve ter pelo menos 3 letras";

      if (!formData.cpf.trim()) newErrors.cpf = "O CPF é obrigatório";
      else if (formData.cpf.replace(/\D/g, '').length !== 11) newErrors.cpf = "CPF inválido";

      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "E-mail inválido";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      const payload = {
        name: formData.name,
        cpf: formData.cpf,
        phone: formData.phone,
        email: formData.email,
        gender: gender,
        photoUrl: "",
      };

      if (isEditMode && clientToEdit) {
        updateClient(
          { id: clientToEdit.id, payload },
          { onSuccess: () => onClose() }
        );
      } else {
        createClient(payload, { onSuccess: () => onClose() });
      }
  }

  if (!isOpen) return null;

  return (
    <ModalOverlay onClose={onClose}>
        {/* Header Section */}
        <div className="flex flex-col items-center text-center pt-8 pb-4">
            <h1 className="text-2xl font-bold text-white mb-2">
              {isEditMode ? "Editar Paciente" : "Novo Paciente"}
            </h1>
            <p className="text-gray-400 text-sm max-w-[80%]">
                {isEditMode
                  ? "Atualize os dados do paciente abaixo."
                  : "Preencha os dados abaixo para cadastrar um novo paciente no sistema."}
            </p>
        </div>
        
        {/* Form Body */}
        <div className="px-6 pb-6 pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Inputs with Outline Style */}
                <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-medium ml-1">Nome completo</label>
                    <input 
                        value={formData.name} 
                        onChange={e => handleInputChange('name', e.target.value)} 
                        className={`w-full bg-transparent border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${errors.name ? 'border-red-500' : ''}`}
                        placeholder="Nome do usuário"
                        type="text"
                        autoFocus
                    />
                    {errors.name && <p className="text-red-400 text-xs ml-1 mt-1">{errors.name}</p>}
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-medium ml-1">Email</label>
                    <input 
                        value={formData.email} 
                        onChange={e => handleInputChange('email', e.target.value)} 
                        className={`w-full bg-transparent border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${errors.email ? 'border-red-500' : ''}`}
                        placeholder="email@exemplo.com"
                        type="text"
                    />
                    {errors.email && <p className="text-red-400 text-xs ml-1 mt-1">{errors.email}</p>}
                </div>

                 <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-medium ml-1">Telefone (whatsapp)</label>
                    <input 
                        value={formData.phone} 
                        onChange={e => handleInputChange('phone', e.target.value)} 
                        className="w-full bg-transparent border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        type="text"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-medium ml-1">CPF</label>
                    <input 
                        value={formData.cpf} 
                        onChange={e => handleInputChange('cpf', e.target.value)} 
                        className={`w-full bg-transparent border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${errors.cpf ? 'border-red-500' : ''}`}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        type="text"
                    />
                    {errors.cpf && <p className="text-red-400 text-xs ml-1 mt-1">{errors.cpf}</p>}
                </div>

                {/* Gender Selection */}
                <div className="pt-2">
                    <label className="text-base font-bold text-white mb-3 block">Gênero</label>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                             <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${gender === 'masculino' ? 'border-blue-500' : 'border-gray-500 group-hover:border-gray-400'}`}>
                                {gender === 'masculino' && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                             </div>
                             <input type="radio" className="hidden" name="gender" value="masculino" checked={gender === 'masculino'} onChange={() => setGender('masculino')} />
                             <span className={`text-sm ${gender === 'masculino' ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>Masculino</span>
                        </label>

                         <label className="flex items-center gap-2 cursor-pointer group">
                             <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${gender === 'feminino' ? 'border-blue-500' : 'border-gray-500 group-hover:border-gray-400'}`}>
                                {gender === 'feminino' && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                             </div>
                             <input type="radio" className="hidden" name="gender" value="feminino" checked={gender === 'feminino'} onChange={() => setGender('feminino')} />
                             <span className={`text-sm ${gender === 'feminino' ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>Feminino</span>
                        </label>

                         <label className="flex items-center gap-2 cursor-pointer group">
                             <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${gender === 'outro' ? 'border-blue-500' : 'border-gray-500 group-hover:border-gray-400'}`}>
                                {gender === 'outro' && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                             </div>
                             <input type="radio" className="hidden" name="gender" value="outro" checked={gender === 'outro'} onChange={() => setGender('outro')} />
                             <span className={`text-sm ${gender === 'outro' ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>Outro</span>
                        </label>
                    </div>
                </div>

                <div className="pt-8 flex justify-end gap-3 items-center">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        className="text-gray-400 hover:text-white hover:bg-white/5 py-6 px-6 rounded-lg transition-all duration-200"
                        onClick={onClose}
                    >
                    Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 rounded-lg font-medium shadow-lg shadow-blue-900/40 hover:shadow-blue-900/60 transition-all duration-300 transform hover:-translate-y-0.5"
                        disabled={isPending}
                    >
                        {isPending
                          ? (isEditMode ? 'Atualizando...' : 'Salvando...')
                          : (isEditMode ? 'Atualizar' : 'Salvar')}
                    </Button>
                </div>
            </form>
        </div>

    </ModalOverlay>
  );
};
