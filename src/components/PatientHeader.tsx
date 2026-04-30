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
    formattedPhone ? `Telefone: ${formattedPhone}` : "",
  ].filter(Boolean);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center shrink-0">
            <User className="w-7 h-7 text-gray-900" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-gray-900 truncate">{name || "Paciente"}</p>
            {metaItems.length > 0 && (
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                {metaItems.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}

export default PatientHeader;
