import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useCreateClient } from "@/hooks/api/useCreateClient";
import { useUpdateClient } from "@/hooks/api/useUpdateClient";
import { useGetClient } from "@/hooks/api/useGetClient";
import { ChevronLeft } from "lucide-react";

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
    .replace(/(-\d{4})\d+?$/, "$1");
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

type Gender = 'masculino' | 'feminino' | 'outro';

const CreateClient = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const initialName = searchParams.get("name") || "";

  const isEditMode = !!id;

  const { data: clientToEdit, isLoading: isFetching } = useGetClient(id || "", isEditMode);

  const { mutate: createClient, isPending: isCreating } = useCreateClient();
  const { mutate: updateClient, isPending: isUpdating } = useUpdateClient();

  const isPending = isCreating || isUpdating;

  const [formData, setFormData] = useState({ name: initialName, cpf: "", phone: "", email: "" });
  const [gender, setGender] = useState<Gender>('outro');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isEditMode && clientToEdit) {
      setFormData({
        name: clientToEdit.name || "",
        cpf: formatCPFForDisplay(clientToEdit.cpf || ""),
        phone: formatPhoneForDisplay(clientToEdit.phone || ""),
        email: clientToEdit.email || "",
      });
      setGender((clientToEdit.gender as Gender) || 'outro');
    }
  }, [clientToEdit, isEditMode]);

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

      if (isEditMode && id) {
        updateClient(
          { id, payload },
          { onSuccess: () => {
               if (initialName) {
                   navigate(-1); // Go back to calendar if we came from there
               } else {
                   navigate("/patients");
               }
            }
          }
        );
      } else {
        createClient(payload, { onSuccess: () => {
            if (initialName) {
                navigate(-1); // Go back to calendar where they clicked Add
            } else {
                navigate("/patients");
            }
        } });
      }
  };

  const handleCancel = () => {
      if (initialName) {
          navigate(-1);
      } else {
          navigate("/patients");
      }
  };

  if (isEditMode && isFetching) {
      return (
          <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-500">Carregando dados do paciente...</p>
          </div>
      );
  }

  return (
    <div className="w-full flex flex-col h-full bg-[#fafafa]">
      <header className="border-b border-b-[#DADCE0] h-full max-h-[80px] p-4 flex items-center gap-4 bg-white">
        <Button variant="ghost" size="icon" onClick={handleCancel} className="hover:bg-slate-100">
            <ChevronLeft className="h-5 w-5 text-slate-600" />
        </Button>
        <h1 className="text-2xl font-medium text-slate-800">
            {isEditMode ? "Editar Paciente" : "Novo Paciente"}
        </h1>
      </header>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 shadow-sm rounded-lg p-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-slate-800">
                {isEditMode ? "Editar Paciente" : "Novo Paciente"}
            </h2>
          </div>
            <p className="text-slate-500 text-sm mb-8">
                {isEditMode
                  ? "Atualize os dados do paciente abaixo."
                  : "Preencha os dados abaixo para cadastrar um novo paciente no sistema."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Inputs with Outline Style */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Nome completo <span className="text-red-500">*</span></label>
                    <input 
                        value={formData.name} 
                        onChange={e => handleInputChange('name', e.target.value)} 
                        className={`w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Nome do usuário"
                        type="text"
                        autoFocus
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <input 
                        value={formData.email} 
                        onChange={e => handleInputChange('email', e.target.value)} 
                        className={`w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="email@exemplo.com"
                        type="text"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Telefone (whatsapp)</label>
                    <input 
                        value={formData.phone} 
                        onChange={e => handleInputChange('phone', e.target.value)} 
                        className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        type="text"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">CPF <span className="text-red-500">*</span></label>
                    <input 
                        value={formData.cpf} 
                        onChange={e => handleInputChange('cpf', e.target.value)} 
                        className={`w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all ${errors.cpf ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        type="text"
                    />
                    {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>}
                </div>

                {/* Gender Selection */}
                <div className="pt-2">
                    <label className="text-sm font-medium text-slate-700 mb-3 block">Gênero</label>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                             <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${gender === 'masculino' ? 'border-blue-600' : 'border-slate-300 group-hover:border-slate-400'}`}>
                                {gender === 'masculino' && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                             </div>
                             <input type="radio" className="hidden" name="gender" value="masculino" checked={gender === 'masculino'} onChange={() => setGender('masculino')} />
                             <span className={`text-sm ${gender === 'masculino' ? 'text-slate-900 font-medium' : 'text-slate-600 group-hover:text-slate-700'}`}>Masculino</span>
                        </label>

                         <label className="flex items-center gap-2 cursor-pointer group">
                             <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${gender === 'feminino' ? 'border-blue-600' : 'border-slate-300 group-hover:border-slate-400'}`}>
                                {gender === 'feminino' && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                             </div>
                             <input type="radio" className="hidden" name="gender" value="feminino" checked={gender === 'feminino'} onChange={() => setGender('feminino')} />
                             <span className={`text-sm ${gender === 'feminino' ? 'text-slate-900 font-medium' : 'text-slate-600 group-hover:text-slate-700'}`}>Feminino</span>
                        </label>

                         <label className="flex items-center gap-2 cursor-pointer group">
                             <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${gender === 'outro' ? 'border-blue-600' : 'border-slate-300 group-hover:border-slate-400'}`}>
                                {gender === 'outro' && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                             </div>
                             <input type="radio" className="hidden" name="gender" value="outro" checked={gender === 'outro'} onChange={() => setGender('outro')} />
                             <span className={`text-sm ${gender === 'outro' ? 'text-slate-900 font-medium' : 'text-slate-600 group-hover:text-slate-700'}`}>Outro</span>
                        </label>
                    </div>
                </div>

                <div className="pt-8 flex justify-end gap-3 items-center border-t border-slate-100">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 py-2.5 px-5 rounded-lg transition-all"
                        onClick={handleCancel}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium shadow-sm transition-all"
                        disabled={isPending}
                    >
                        {isPending
                          ? (isEditMode ? 'Atualizando...' : 'Salvando...')
                          : (isEditMode ? 'Atualizar' : 'Salvar')}
                    </Button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default CreateClient;
