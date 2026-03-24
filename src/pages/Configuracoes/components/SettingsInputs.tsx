import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPhone } from "@/util/helper";
import { ConfirmPhoneUpdateModal } from "./ConfirmPhoneUpdateModal";

const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
};

interface SettingsInputsProps {
  description?: string;
  email?: string;
  phone?: string;
  isPhonePending?: boolean;
  onDescriptionChange?: (val: string) => void;
  onEmailChange?: (val: string) => void;
  onPhoneChange?: (val: string) => void;
  onPhoneConfirm?: (val: string) => void | Promise<void>;
}

export const SettingsInputs = ({
  description = "",
  email = "bem.estar@gmail.com",
  phone = "",
  isPhonePending = false,
  onDescriptionChange,
  onEmailChange,
  onPhoneChange,
  onPhoneConfirm,
}: SettingsInputsProps) => {
  const [localDescription, setLocalDescription] = useState(description);
  const [localPhone, setLocalPhone] = useState(() => formatPhone(phone || ""));
  const [localEmail, setLocalEmail] = useState(email);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    setLocalPhone(formatPhone(phone || ""));
  }, [phone]);

  useEffect(() => {
    setLocalEmail(email);
  }, [email]);

  const cleanOriginalPhone = (phone || "").replace(/\D/g, "");
  const cleanLocalPhone = localPhone.replace(/\D/g, "");
  const isPhoneDirty = cleanLocalPhone !== cleanOriginalPhone;
  const isPhoneValid = cleanLocalPhone.length === 11;
  const canSubmitPhone = isPhoneDirty && isPhoneValid && !isPhonePending;

  const inputBase =
    "w-full rounded-md border border-[#DADCE0] bg-white px-3 py-2 text-sm text-[#121535] placeholder-gray-400 outline-none transition focus:border-[#0177FB] focus:ring-1 focus:ring-[#0177FB]/30";

  const handlePhoneConfirm = async () => {
    if (!canSubmitPhone) return;

    try {
      await onPhoneConfirm?.(cleanLocalPhone);
      setIsConfirmModalOpen(false);
    } catch {
      // Mantém o modal aberto para nova tentativa caso a mutation falhe.
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 py-4 md:grid-cols-2">
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

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[#121535]">Telefone</label>
          <div className="relative">
            <input
              type="text"
              className={`${inputBase} pr-12`}
              placeholder="(00) 00000-0000"
              maxLength={15}
              value={localPhone}
              onChange={(e) => {
                const masked = maskPhone(e.target.value);
                setLocalPhone(masked);
                onPhoneChange?.(masked);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Confirmar edição do telefone"
              disabled={!canSubmitPhone}
              onClick={() => setIsConfirmModalOpen(true)}
              className={`absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 rounded-full transition-all ${
                canSubmitPhone
                  ? "cursor-pointer text-[#0177FB] hover:bg-[#0177FB]/10 hover:text-[#0177FB]"
                  : "cursor-not-allowed text-slate-300 hover:bg-transparent"
              }`}
            >
              <Pencil className={`h-4 w-4 ${canSubmitPhone ? "opacity-100" : "opacity-50"}`} />
            </Button>
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-1">
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

      <ConfirmPhoneUpdateModal
        isOpen={isConfirmModalOpen}
        currentPhone={formatPhone(cleanOriginalPhone)}
        nextPhone={formatPhone(cleanLocalPhone)}
        isPending={isPhonePending}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handlePhoneConfirm}
      />
    </>
  );
};
