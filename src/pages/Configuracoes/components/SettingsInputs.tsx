import { useState } from "react";

const maskPhone = (v: string) => {
  return v
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
};

interface SettingsInputsProps {
  description?: string;
  email?: string;
  phone?: string;
  onDescriptionChange?: (val: string) => void;
  onEmailChange?: (val: string) => void;
  onPhoneChange?: (val: string) => void;
}

export const SettingsInputs = ({
  description = "",
  email = "bem.estar@gmail.com",
  phone = "",
  onDescriptionChange,
  onEmailChange,
  onPhoneChange,
}: SettingsInputsProps) => {
  const [localDescription, setLocalDescription] = useState(description);
  const [localPhone, setLocalPhone] = useState(phone);
  const [localEmail, setLocalEmail] = useState(email);

  const inputBase =
    "w-full rounded-md border border-[#DADCE0] bg-white px-3 py-2 text-sm text-[#121535] placeholder-gray-400 outline-none transition focus:border-[#0177FB] focus:ring-1 focus:ring-[#0177FB]/30";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
      {/* Email */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[#121535]">Email</label>
        <input
          type="email"
          className={inputBase}
          value={localEmail}
          onChange={(e) => {
            setLocalEmail(e.target.value);
            onEmailChange?.(e.target.value);
          }}
        />
      </div>

      {/* Telefone */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[#121535]">Telefone</label>
        <input
          type="text"
          className={inputBase}
          placeholder="(00) 00000-0000"
          maxLength={15}
          value={localPhone}
          onChange={(e) => {
            const masked = maskPhone(e.target.value);
            setLocalPhone(masked);
            onPhoneChange?.(masked);
          }}
        />
      </div>
      <div className="flex flex-col gap-1 col-span-2">
        <label className="text-sm font-medium text-[#121535]">Descrição</label>
        <textarea
          rows={3}
          placeholder="Bio do seu negócio"
          className={`${inputBase} resize-none`}
          value={localDescription}
          onChange={(e) => {
            setLocalDescription(e.target.value);
            onDescriptionChange?.(e.target.value);
          }}
        />
      </div>
    </div>
  );
};
