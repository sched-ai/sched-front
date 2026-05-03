import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Info, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateEmployee } from "@/hooks/api/useCreateEmployee";
import { useUser } from "@/context/user";
import { useNextStep } from "@/hooks/api/useNextStep";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Collaborator = {
  id: string;
  name: string;
  email: string;
  role: string;
  workplaceIds: string[];
};

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("");
}

function isEmailValid(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

export default function Step4({ onSkip }: { onSkip?: () => void } = {}) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const { userData, refreshUser } = useUser();

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const workplaces = (userData?.membership?.company?.workplaces as any[]) || [];

  const { mutate: createEmployee } = useCreateEmployee({
    onSuccessFn: () => {},
  });

  const addCollaborator = () => {
    const id = Date.now().toString();
    setCollaborators((prev) => [
      ...prev,
      { id, name: "", email: "", role: "", workplaceIds: [] },
    ]);

    setTimeout(() => {
      const el = document.getElementById(
        `collab-name-${id}`
      ) as HTMLInputElement | null;
      el?.focus();
      el?.select();
    }, 60);
  };

  const updateCollaborator = (
    id: string,
    key: keyof Collaborator,
    value: any
  ) => {
    setCollaborators((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [key]: value } : c))
    );
  };

  const toggleWorkplace = (collaboratorId: string, workplaceId: string) => {
    setCollaborators((prev) =>
      prev.map((c) => {
        if (c.id !== collaboratorId) return c;
        const exists = c.workplaceIds.includes(workplaceId);
        const newIds = exists
          ? c.workplaceIds.filter((id) => id !== workplaceId)
          : [...c.workplaceIds, workplaceId];
        return { ...c, workplaceIds: newIds };
      })
    );
  };

  const removeCollaborator = (id: string) => {
    setCollaborators((prev) => prev.filter((c) => c.id !== id));
  };

  const roles = [
    { value: "professional", label: "Profissional" },
    { value: "assistant", label: "Assistente" },
  ];

  const allFilled =
    collaborators.length > 0 &&
    collaborators.every(
      (c) => c.name.trim() && isEmailValid(c.email) && c.role.trim()
    );

  const { mutate: nextStep } = useNextStep({});

  const sendInvites = async () => {
    if (!allFilled || isSending || sent) return;
    if (!userData?.membership?.company?.id) {
      toast.error(
        "Ocorreu um erro ao obter os dados da empresa. Tente novamente."
      );
      return;
    }

    setIsSending(true);
    try {
      let successCount = 0;

      for (const collaborator of collaborators) {
        await new Promise<void>((resolve, reject) => {
          createEmployee(
            {
              companyId: userData?.membership.company.id,
              name: collaborator.name,
              email: collaborator.email,
              cargo: collaborator.role,
              workplaceIds: collaborator.workplaceIds,
            },
            {
              onSuccess: () => {
                successCount++;
                resolve();
              },
              onError: (error) => {
                reject(error);
              },
            }
          );
        });
      }

      setSent(true);
      toast.success(`${successCount} funcionário(s) adicionado(s) com sucesso.`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSending(false);
      handleSkip();
    }
  };

  const handleSkip = () => {
    if (onSkip) return onSkip();
    nextStep();
    // toast("Você pulou esta etapa do onboarding.");
  };

  return (
    <div>
      <h3 className="text-xl sm:text-2xl font-semibold">Adicione colaboradores</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Adicione os membros da equipe que irão atender no Sched. Você pode
        adicionar vários e ajustar cargos depois.
      </p>
      <div className="px-4 py-4 bg-gradient-to-r from-slate-50 to-white border border-neutral-200 rounded-xl max-w-[700px] my-4 flex items-start gap-4">
        <Info className="text-blue-500" size={36} />
        <div>
          <p className="font-medium">Cargos e permissões</p>
          <p className="text-sm text-muted-foreground max-w-xl">
            Profissionais podem gerenciar suas próprias agendas, horários e
            atendimentos. <br></br>
            Assistentes têm acesso limitado à agenda e ao cadastro de clientes.
          </p>
        </div>
      </div>
      <div className="relative w-full max-h-[calc(100vh-310px)] overflow-y-auto pr-2 custom-scrollbar">
        <div className="flex flex-col gap-4 w-full">
          {collaborators.length === 0 && (
            <div className="rounded-md border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-600">
              Nenhum colaborador adicionado ainda. Clique em "Adicionar
              colaborador" para começar.
            </div>
          )}

          {collaborators.map((c) => {
            const emailValid = isEmailValid(c.email);
            return (
              <div
                key={c.id}
                className="flex flex-col w-full items-start gap-4 bg-white border border-neutral-100 rounded-lg p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 w-full sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                      {getInitials(c.name) || "?"}
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-sm font-medium">
                      {c.name || "Nome não preenchido"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {c.email || "email@exemplo.com"}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3 w-full md:flex-row">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                    <Input
                      id={`collab-name-${c.id}`}
                      type="text"
                      className="input"
                      label="Nome"
                      placeholder="Nome completo"
                      value={c.name}
                      onChange={(e) =>
                        updateCollaborator(c.id, "name", e.target.value)
                      }
                    />

                    <Input
                      type="text"
                      className={`input ${
                        c.email && !emailValid ? "border-destructive" : ""
                      }`}
                      label="Email"
                      placeholder="exemplo@dominio.com"
                      value={c.email}
                      onChange={(e) =>
                        updateCollaborator(c.id, "email", e.target.value)
                      }
                    />

                    <div>
                      <label className="block mb-3 text-sm font-medium text-paragraph-high">
                        Cargo
                      </label>
                      <Select
                        value={c.role}
                        onValueChange={(val: string) =>
                          updateCollaborator(c.id, "role", val)
                        }
                      >
                        <SelectTrigger className="w-full !h-[52px] border-[#d1d5db] border-2 hover:border-slate-400 focus:border-blue-500">
                          <SelectValue placeholder="Selecione o cargo" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((r) => (
                            <SelectItem key={r.value || "none"} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {c.role === "professional" && workplaces.length > 0 && (
                      <div className="md:col-span-3 border-t pt-4">
                        <p className="text-sm font-medium mb-3">
                          Onde este profissional irá atender?
                        </p>
                        <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
                          {workplaces.map((w: any) => (
                            <div
                              key={w.id}
                              className="flex items-center gap-2"
                            >
                              <Checkbox
                                id={`workplace-${c.id}-${w.id}`}
                                checked={c.workplaceIds.includes(w.id)}
                                onCheckedChange={() => {
                                  toggleWorkplace(c.id, w.id);
                                }}
                              />
                              <Label
                                htmlFor={`workplace-${c.id}-${w.id}`}
                                className="cursor-pointer"
                              >
                                {w.nickname}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex self-end md:self-auto">
                    <Button
                      type="button"
                      variant="destructive"
                      className="h-[52px] w-10 p-0 flex items-center justify-center"
                      onClick={() => removeCollaborator(c.id)}
                      aria-label="Remover colaborador"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 mt-4 items-center border-t py-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={addCollaborator}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-white border border-neutral-200 text-neutral-800 shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 text-sky-600 group-hover:text-sky-300" />
            <span className="font-medium group-hover:text-sky-300">
              Adicionar
            </span>
          </Button>

          <Button
            type="button"
            onClick={sendInvites}
            disabled={!allFilled || isSending || sent}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white shadow-md transition-all duration-150 ${
              sent
                ? "bg-green-500 cursor-default"
                : "bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700"
            }`}
          >
            {isSending ? "Enviando..." : sent ? "Enviados" : "Enviar convites"}
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            className="px-6"
            onClick={handleSkip}
          >
            Pular
          </Button>
        </div>
      </div>
    </div>
  );
}
