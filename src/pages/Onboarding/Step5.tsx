import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { Trash2, Plus, BriefcaseBusiness, MapPin } from "lucide-react";
import { useNextStep } from "@/hooks/api/useNextStep";
import { useCreateService } from "@/hooks/api/useCreateService";
import { toast } from "sonner";
import { TimePickerField } from "@/components/ScheduleFormModal/TimePickerField";
import { useGetAllWorkplaces } from "@/hooks/api/useGetAllWorkplaces";
import { WorkplaceMultiSelect } from "@/components/WorkplaceMultiSelect";

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
  workplaceIds?: string[];
};

export const Step5 = () => {
  // const { userData } = useUser();
  // const { data: employeeData } = useListCompanyMemberships();

  const [services, setServices] = useState<Service[]>([
    {
      id: String(Date.now()),
      name: "",
      professional: "",
      description: "",
      duration: "00:00",
      workplaceIds: [],
    },
  ]);

  const { data: workplaces } = useGetAllWorkplaces();

  useEffect(() => {
    // Se só tiver 1 local, garante que está selecionado em todos os serviços novos
    if (workplaces && workplaces.length === 1) {
      setServices(prev => prev.map(s => ({
        ...s,
        workplaceIds: s.workplaceIds?.length === 0 ? [workplaces[0].id] : s.workplaceIds
      })));
    }
  }, [workplaces]);

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
        workplaceIds: workplaces && workplaces.length === 1 ? [workplaces[0].id] : [],
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
    if (services.length <= 1) {
      toast("Cadastre pelo menos um serviço para concluir o onboarding.");
      return;
    }

    setServices((prev) => prev.filter((svc) => svc.id !== id));
  };

  return (
    <div>
      <h3 className="text-2xl font-semibold">Sobre os serviços</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Adicione os serviços que você oferece para que seus clientes possam
        agendá-los.
      </p>

      <div className="relative w-full md:h-[calc(100vh-200px)] h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
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
                      variant="ghost"
                      className="h-[52px] w-10 p-0 flex items-center justify-center text-red-500 hover:text-red-600"
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

                  {/* {userData?.membership?.company?.companyType !== "AUTONOMO" && (
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
                  )} */}

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

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-[#384455]">Duração</label>
                    <div className="h-[52px] flex items-center">
                      <TimePickerField 
                        value={c.duration || "00:00"} 
                        onChange={(val) => updateService(c.id, { duration: val })} 
                        ariaLabel="Duração do serviço"
                        className="schedule-time-picker--light"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-2 mt-2">
                  <label className="text-sm font-medium text-[#384455] flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Locais de atendimento
                  </label>
                  <WorkplaceMultiSelect 
                    options={workplaces || []}
                    selected={c.workplaceIds || []}
                    onChange={(ids) => updateService(c.id, { workplaceIds: ids })}
                    disabled={workplaces?.length === 1}
                  />
                  {workplaces?.length === 1 && (
                    <p className="text-[10px] text-neutral-400 italic px-1">
                      Selecionado automaticamente por ser o único local disponível.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mt-4 items-center border-t py-4">
        <div className="w-full flex items-center gap-2 justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={addService}
            className="px-4 font-medium flex items-center gap-2"
          >
            <Plus size={16} />
            Adicionar
          </Button>

          <ActionButtons services={services} />
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
      const hasPrice = !!s.price?.toString().trim() && (parseBRL(s.price) || 0) > 0;
      const hasDuration = !!s.duration?.toString().trim() && s.duration !== "00:00" && (durationToMinutes(s.duration) || 0) > 0;
      const hasWorkplaces = (s.workplaceIds || []).length > 0;
      const hasDescription = !!s.description?.toString().trim();
      return hasName && hasPrice && hasDuration && hasWorkplaces && hasDescription;
    });

  function parseBRL(formatted?: string | null) {
    if (!formatted) return null;
    const onlyNums = formatted.toString().replace(/[^0-9]/g, "");
    if (!onlyNums) return null;
    return parseInt(onlyNums, 10) / 100;
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
          price: parseBRL(s.price ?? null),
          type: "SERVICE" as const,
          employeeId: s.professional ?? null,
          workplaceIds: s.workplaceIds || [],
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

    toast("Onboarding concluído com sucesso!");
    nextStep();
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleSaveAndContinue}
        disabled={!canProceed || isSaving}
        className="px-4 font-medium self-end"
      >
        {isSaving ? "Salvando..." : "Salvar e concluir"}
      </Button>
    </>
  );
}
