import { useState } from "react";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Info, Plus, BriefcaseBusiness } from "lucide-react";
import { useNextStep } from "@/hooks/api/useNextStep";
import { useCreateService } from "@/hooks/api/useCreateService";
import { toast } from "sonner";
import { useUser } from "@/context/user";
import { useListCompanyMemberships } from "@/hooks/api/useListCompanyMemberships";

function formatBRL(value: string) {
  const onlyNums = value.replace(/[^0-9]/g, "");
  if (!onlyNums) return "";
  const int = parseInt(onlyNums, 10);
  const number = int / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(number);
}

type Service = {
  description: string | number | readonly string[] | undefined;
  id: string;
  name: string;
  professional: string;
  price?: string;
  duration?: string;
};

export const Step5 = () => {
  const { userData } = useUser();
  const { data: employeeData } = useListCompanyMemberships();

  const [services, setServices] = useState<Service[]>([
    {
      id: String(Date.now()),
      name: "",
      professional: "",
      description: "",
    },
  ]);

  const addService = () => {
    const id = String(Date.now() + Math.random());
    setServices((s) => [
      ...s,
      {
        id,
        name: "",
        professional: "",
        description: "",
        price: "",
        duration: "00:00",
      },
    ]);

    // focus the new service name input
    setTimeout(() => {
      const el = document.getElementById(
        `service-name-${id}`
      ) as HTMLInputElement | null;
      el?.focus();
      el?.select();
    }, 60);
  };

  const updateService = (id: string, patch: Partial<Service>) => {
    setServices((prev) =>
      prev.map((svc) => (svc.id === id ? { ...svc, ...patch } : svc))
    );
  };

  const removeService = (id: string) => {
    setServices((prev) => prev.filter((svc) => svc.id !== id));
  };

  return (
    <div>
      <h3 className="text-2xl font-semibold">Sobre os serviços</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Adicione os serviços que você oferece para que seus clientes possam
        agendá-los.
      </p>

      <div className="px-4 py-4 bg-gradient-to-r from-slate-50 to-white border border-neutral-200 rounded-xl max-w-[900px] my-4 flex items-start gap-4">
        <Info className="text-blue-500" size={36} />
        <div>
          <p className="font-medium">Organize seus serviços</p>
          <p className="text-sm text-muted-foreground max-w-xl">
            Crie serviços com nome, descrição, duração, preço e vincule o
            profissional responsável. Isso ajuda clientes na hora de agendar e
            melhora a experiência no agendamento.
          </p>
        </div>
      </div>

      <div className="relative w-full max-h-[calc(100vh-320px)] overflow-y-auto pr-2 custom-scrollbar">
        <div className="flex flex-col gap-4 w-full">
          {services.length === 0 && (
            <div className="rounded-md border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-600">
              Nenhum serviço adicionado ainda. Clique em "Adicionar serviço"
              para começar.
            </div>
          )}

          {services.map((c) => (
            <div
              key={c.id}
              className="flex flex-col w-full items-start gap-4 bg-white border border-neutral-100 rounded-lg p-4 shadow-sm"
            >
              <div className="flex flex-col justify-between w-full gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium bg-blue-600 p-2 rounded-full text-white">
                      <BriefcaseBusiness />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-lg font-medium">
                        {c.name || "Nome do serviço"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {c.price || "R$ 0,00"} - {c.duration || "00:00"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Button
                      type="button"
                      variant="destructive"
                      className="h-[52px] w-10 p-0 flex items-center justify-center"
                      onClick={() => removeService(c.id)}
                      aria-label="Remover serviço"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    id={`service-name-${c.id}`}
                    type="text"
                    className="input"
                    label="Nome"
                    placeholder="Nome do serviço"
                    value={c.name}
                    isRequired
                    onChange={(e) =>
                      updateService(c.id, {
                        name: (e.target as HTMLInputElement).value,
                      })
                    }
                  />
                  <Input
                    id={`service-description-${c.id}`}
                    type="text"
                    className="input"
                    label="Descrição"
                    placeholder="Descrição do serviço"
                    value={c.description as string}
                    onChange={(e) =>
                      updateService(c.id, {
                        description: (e.target as HTMLInputElement).value,
                      })
                    }
                  />

                  {userData?.membership.company.companyType != "AUTONOMO" && (
                    <div>
                      <label className="block mb-2 font-medium text-[16px] text-[#384455]">
                        Profissional Responsável
                      </label>
                      <Select
                        value={c.professional}
                        onValueChange={(val: string) =>
                          updateService(c.id, { professional: val })
                        }
                      >
                        <SelectTrigger className="w-full !h-[52px] border-[#7079839e] border-2 hover:border-[#141736] focus:border-blue-500">
                          <SelectValue placeholder="Selecione o profissional" />
                        </SelectTrigger>
                        <SelectContent>
                          {employeeData?.map((r) => (
                            <SelectItem key={r.id || "none"} value={r.id}>
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Input
                    id={`service-price-${c.id}`}
                    type="text"
                    label="Preço"
                    placeholder="R$ 0,00"
                    value={c.price || ""}
                    onChange={(e) => {
                      const raw = (e.target as HTMLInputElement).value;
                      const formatted = formatBRL(raw);
                      updateService(c.id, { price: formatted });
                    }}
                    isRequired
                  />

                  <Input
                    id={`service-duration-${c.id}`}
                    type="time"
                    label="Duração"
                    value={c.duration || "00:00"}
                    onChange={(e) =>
                      updateService(c.id, {
                        duration: (e.target as HTMLInputElement).value,
                      })
                    }
                    isRequired
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mt-4 items-center border-t py-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={addService}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-white border border-neutral-200 text-neutral-800 shadow-sm hover:shadow group"
          >
            <Plus className="h-4 w-4 text-sky-600 group-hover:text-sky-300" />
            <span className="font-medium group-hover:text-sky-300">
              Adicionar
            </span>
          </Button>

          <ActionButtons services={services} />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <SkipButton />
        </div>
      </div>
    </div>
  );
};

function ActionButtons({ services }: { services: Service[] }) {
  const { mutate: nextStep } = useNextStep({});
  const createService = useCreateService({});
  const [isSaving, setIsSaving] = useState(false);

  const canProceed =
    services.length > 0 &&
    services.every((s) => {
      const hasName = !!s.name?.toString().trim();
      const hasPrice = !!s.price?.toString().trim();
      const hasDuration = !!s.duration?.toString().trim();
      return hasName && hasPrice && hasDuration;
    });

  function parseBRLToCents(formatted?: string | null) {
    if (!formatted) return null;
    const onlyNums = formatted.toString().replace(/[^0-9]/g, "");
    if (!onlyNums) return null;
    return parseInt(onlyNums, 10);
  }

  function durationToMinutes(duration?: string | null) {
    if (!duration) return null;
    const parts = duration.split(":");
    if (parts.length !== 2) return null;
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
  }

  const handleSaveAndContinue = async () => {
    if (!canProceed) return;
    setIsSaving(true);

    const results = await Promise.allSettled(
      services.map((s) => {
        const payload = {
          name: s.name?.toString() || "",
          description: s.description ? s.description.toString() : null,
          duration: durationToMinutes(s.duration) ?? null,
          price: parseBRLToCents(s.price ?? null),
          type: "SERVICE" as const,
          professionalId: s.professional ?? null,
        };

        return createService.mutateAsync(payload);
      })
    );

    setIsSaving(false);

    const hasError = results.some((r) => r.status === "rejected");

    if (hasError) {
      toast("Erro ao criar serviço. Tente novamente.");
      return;
    }

    toast("Serviços salvos com sucesso.");
    nextStep();
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleSaveAndContinue}
        disabled={!canProceed || isSaving}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white shadow-md transition-all duration-150 ${
          canProceed
            ? "bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700"
            : "bg-neutral-300 cursor-not-allowed"
        }`}
      >
        {isSaving ? "Salvando..." : "Salvar"}
      </Button>
    </>
  );
}

function SkipButton() {
  const { mutate: nextStep } = useNextStep({});

  const handleSkip = () => {
    nextStep();
    toast("Você pulou esta etapa do onboarding.");
  };

  return (
    <Button type="button" variant="ghost" className="px-6" onClick={handleSkip}>
      Pular
    </Button>
  );
}
