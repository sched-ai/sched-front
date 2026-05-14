import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useCreateClient } from "@/hooks/api/useCreateClient";
import { useUpdateClient } from "@/hooks/api/useUpdateClient";
import { useGetClient } from "@/hooks/api/useGetClient";
import { ChevronLeft } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  AsYouType,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import { CountryCodeSelect } from "@/components/CountryCodeSelect";
import { DEFAULT_COUNTRY } from "@/util/countries";

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
  let clean = phone.replace(/\D/g, "");
  if (!clean) return "";
  if (clean.startsWith("55") && clean.length > 11) {
    clean = clean.substring(2);
  }
  return maskPhone(clean);
};

const maskPhoneByCountry = (value: string, countryCode: CountryCode): string => {
  if (countryCode === "BR") return maskPhone(value);
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return new AsYouType(countryCode).input(digits);
};

const detectCountryAndFormat = (
  storedPhone: string | null | undefined,
): { countryCode: CountryCode; display: string } => {
  if (!storedPhone) return { countryCode: DEFAULT_COUNTRY, display: "" };
  const parsed = parsePhoneNumberFromString("+" + storedPhone.replace(/\D/g, ""));
  if (parsed?.country) {
    if (parsed.country === "BR") {
      return { countryCode: "BR", display: maskPhone(parsed.nationalNumber) };
    }
    return { countryCode: parsed.country, display: parsed.formatNational() };
  }
  return { countryCode: DEFAULT_COUNTRY, display: formatPhoneForDisplay(storedPhone) };
};

type Gender = 'masculino' | 'feminino' | 'outro';

const isGender = (value: string): value is Gender =>
  value === 'masculino' || value === 'feminino' || value === 'outro';

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

  const [formData, setFormData] = useState({
    name: initialName,
    cpf: "",
    phone: "",
    email: "",
    birthDate: "",
    socialNetwork: "",
  });
  const [gender, setGender] = useState<Gender | ''>('');
  const [countryCode, setCountryCode] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isEditMode && clientToEdit) {
      const detected = detectCountryAndFormat(clientToEdit.phone);
      setCountryCode(detected.countryCode);
      setFormData({
        name: clientToEdit.name || "",
        cpf: formatCPFForDisplay(clientToEdit.cpf || ""),
        phone: detected.display,
        email: clientToEdit.email || "",
        birthDate: clientToEdit.birthDate ? String(clientToEdit.birthDate).slice(0, 10) : "",
        socialNetwork: clientToEdit.socialNetwork || "",
      });
      setGender(isGender(String(clientToEdit.gender || '')) ? (clientToEdit.gender as Gender) : '');
    }
  }, [clientToEdit, isEditMode]);

  const handleInputChange = (field: string, value: string) => {
      let val = value;
      if (field === 'cpf') val = maskCPF(value);
      if (field === 'phone') val = maskPhoneByCountry(value, countryCode);
      setFormData(prev => ({ ...prev, [field]: val }));
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleCountryChange = (iso: CountryCode) => {
      setCountryCode(iso);
      setFormData(prev => ({ ...prev, phone: maskPhoneByCountry(prev.phone, iso) }));
      if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
  };

  const validate = () => {
      const newErrors: { [key: string]: string } = {};
      if (!formData.name.trim()) newErrors.name = "O nome é obrigatório";
      else if (formData.name.trim().length < 3) newErrors.name = "O nome deve ter pelo menos 3 letras";

      if (formData.cpf.trim() && formData.cpf.replace(/\D/g, '').length !== 11) {
        newErrors.cpf = "CPF inválido";
      }

      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = "E-mail inválido";
      }

      if (formData.phone.trim()) {
        const phoneDigits = formData.phone.replace(/\D/g, '');
        const parsedPhone = parsePhoneNumberFromString(phoneDigits, countryCode);
        if (!parsedPhone || !parsedPhone.isValid()) {
          newErrors.phone = countryCode === 'BR'
            ? 'Telefone inválido. Informe DDD + número.'
            : 'Telefone inválido para o país selecionado.';
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      const phoneDigits = formData.phone.replace(/\D/g, "");
      const parsedForSubmit = phoneDigits
        ? parsePhoneNumberFromString(phoneDigits, countryCode)
        : null;
      const phoneToSend = parsedForSubmit
        ? parsedForSubmit.number.replace("+", "")
        : "";

      const payload = {
        name: formData.name,
        cpf: formData.cpf.trim() || null,
        phone: phoneToSend,
        countryCode,
        email: formData.email.trim() || null,
        birthDate: formData.birthDate || null,
        socialNetwork: formData.socialNetwork.trim() || null,
        gender: gender || null,
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
      <header className="border-b border-b-[#DADCE0] max-h-[80px] bg-white flex items-center gap-4 px-4 sm:px-6 md:px-8 z-20 shrink-0 h-16">
        <SidebarTrigger className="w-11 h-11 min-w-[44px] self-center rounded-lg bg-white border border-slate-200 shadow-sm p-0 hover:bg-slate-50 hover:opacity-80 transition-opacity lg:hidden">
          <span className="flex flex-col items-center justify-center gap-1">
            <span className="block h-[2px] w-[18px] rounded-[2px] bg-slate-900/90" />
            <span className="block h-[2px] w-3 rounded-[2px] bg-slate-900/90" />
            <span className="block h-[2px] w-[18px] rounded-[2px] bg-slate-900/90" />
          </span>
        </SidebarTrigger>
        <div className="flex-1 p-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleCancel} className="hover:bg-slate-100">
              <ChevronLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <h1 className="text-2xl font-medium text-slate-800">
              {isEditMode ? "Editar Paciente" : "Novo Paciente"}
          </h1>
        </div>
      </header>

      <div className="patient-form-scroll p-6 flex-1 overflow-y-auto">
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
                    <label className="text-sm font-medium text-slate-700">Telefone (whatsapp) <span className="text-red-500">*</span></label>
                    <div className={`flex items-center w-full bg-white border border-slate-300 rounded-lg pl-1 pr-3 py-0.5 text-sm transition-all focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 overflow-hidden ${errors.phone ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500' : ''}`}>
                        <CountryCodeSelect value={countryCode} onChange={handleCountryChange} />
                        <input
                            value={formData.phone}
                            onChange={e => handleInputChange('phone', e.target.value)}
                            className="w-full bg-transparent pl-2 pr-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none"
                            placeholder={countryCode === 'BR' ? "(00) 00000-0000" : "Número de telefone"}
                            maxLength={25}
                            type="text"
                        />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">CPF</label>
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Data de nascimento</label>
                    <input
                      value={formData.birthDate}
                      onChange={e => handleInputChange('birthDate', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                      type="date"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Rede social</label>
                    <input
                      value={formData.socialNetwork}
                      onChange={e => handleInputChange('socialNetwork', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                      placeholder="@instagram ou link"
                      type="text"
                    />
                  </div>

                {/* Gender Selection */}
                <div className="pt-2">
                    <label className="text-sm font-medium text-slate-700 mb-3 block">Gênero</label>
                    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-6">
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
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${gender === '' ? 'border-blue-600' : 'border-slate-300 group-hover:border-slate-400'}`}>
                              {gender === '' && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                            </div>
                            <input type="radio" className="hidden" name="gender" value="" checked={gender === ''} onChange={() => setGender('')} />
                            <span className={`text-sm ${gender === '' ? 'text-slate-900 font-medium' : 'text-slate-600 group-hover:text-slate-700'}`}>Não informar</span>
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
