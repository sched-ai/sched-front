import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface SettingsInputsProps {
  description?: string;
  email?: string;
  onDescriptionChange?: (val: string) => void;
  onEmailChange?: (val: string) => void;
  onPasswordChange?: (val: string) => void;
}

export const SettingsInputs = ({
  description = "",
  email = "bem.estar@gmail.com",
  onDescriptionChange,
  onEmailChange,
  onPasswordChange,
}: SettingsInputsProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("••••••••");
  const [localDescription, setLocalDescription] = useState(description);
  const [localEmail, setLocalEmail] = useState(email);

  const inputBase =
    "w-full rounded-md border border-[#DADCE0] bg-white px-3 py-2 text-sm text-[#121535] placeholder-gray-400 outline-none transition focus:border-[#0177FB] focus:ring-1 focus:ring-[#0177FB]/30";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
      {/* Descrição */}
      <div className="flex flex-col gap-1">
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

      {/* Senha */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[#121535]">Senha</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className={`${inputBase} pr-10`}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              onPasswordChange?.(e.target.value);
            }}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#121535] transition-colors cursor-pointer"
            onClick={() => setShowPassword((p) => !p)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};
