import type { ReactNode } from "react";
import { User } from "lucide-react";
import { formatPhone } from "@/util/helper";

interface PatientHeaderProps {
  name?: string | null;
  age?: string | number | null;
  birthDate?: string | null;
  gender?: string | null;
  cpf?: string | null;
  phone?: string | null;
  action?: ReactNode;
}

function calculateAge(birthDate?: string | null): number | undefined {
  if (!birthDate) return undefined;

  const dob = new Date(birthDate);
  if (Number.isNaN(dob.getTime())) return undefined;

  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}

function formatCpf(cpf?: string | null) {
  if (!cpf) return "";

  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;

  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatGender(gender?: string | null) {
  if (!gender) return "";

  const normalized = gender.trim().toLowerCase();

  if (["female", "feminino", "feminina"].includes(normalized)) return "Feminino";
  if (["male", "masculino", "masculina"].includes(normalized)) return "Masculino";
  if (["other", "outro", "outra"].includes(normalized)) return "Outro";

  return gender.charAt(0).toUpperCase() + gender.slice(1);
}

export function PatientHeader({
  name,
  age,
  birthDate,
  gender,
  cpf,
  phone,
  action,
}: PatientHeaderProps) {
  const resolvedAge =
    age !== undefined && age !== null && String(age).trim() !== ""
      ? String(age).trim()
      : calculateAge(birthDate)?.toString() || "";
  const formattedPhone = phone ? formatPhone(phone) : "";

  const metaItems = [
    resolvedAge ? `Idade: ${resolvedAge} anos` : "",
    formatGender(gender) ? `Gênero: ${formatGender(gender)}` : "",
    formatCpf(cpf) ? `CPF: ${formatCpf(cpf)}` : "",
    formattedPhone ? `Tel: ${formattedPhone}` : "",
  ].filter(Boolean);

  return (
    <div className="bg-white rounded-[20px] shadow-custom p-6 flex items-center relative overflow-hidden">
      <div className="flex items-center justify-between gap-6 w-full ml-4">
        <div className="flex items-center gap-6 min-w-0">
          <div className="w-20 h-20 rounded-full border-4 border-[#141736] flex items-center justify-center bg-white text-[#141736] shrink-0">
            <User className="w-10 h-10" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-[#141736] truncate">{name || "Paciente"}</h1>
            {metaItems.length > 0 && (
              <p className="text-slate-600 mt-1 text-sm md:text-base break-words">
                {metaItems.join(" | ")}
              </p>
            )}
          </div>
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}

export default PatientHeader;
