import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, MapPin } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { TimePickerField } from "@/components/ScheduleFormModal/TimePickerField";
import { WorkplaceMultiSelect } from "@/components/WorkplaceMultiSelect";
import { useCreateService } from "@/hooks/api/useCreateService";
import { useUpdateService } from "@/hooks/api/useEditService";
import { useGetService } from "@/hooks/api/useGetService";
import { useGetAllWorkplaces } from "@/hooks/api/useGetAllWorkplaces";
import { cn } from "@/lib/utils";

const minutesToHHMM = (totalMinutes: number) => {
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) return "";
  if (totalMinutes === 0) return "00:00";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const hhmmToMinutes = (value: string): number | null => {
  if (!value) return null;
  const parts = value.split(":");
  if (parts.length < 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

const formatBRL = (value: string) => {
  const onlyNums = value.replace(/[^0-9]/g, "");
  if (!onlyNums) return "";
  const number = parseInt(onlyNums, 10) / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(number);
};

const parseBRL = (formatted: string | null) => {
  if (!formatted) return null;
  const onlyNums = formatted.replace(/[^0-9]/g, "");
  if (!onlyNums) return null;
  return parseInt(onlyNums, 10) / 100;
};

const baseInputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const CreateService = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const isEditMode = !!id;

  const { data: serviceToEdit, isLoading: isFetching } = useGetService(id || "", isEditMode);
  const { data: workplaces } = useGetAllWorkplaces();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("00:00");
  const [selectedWorkplaces, setSelectedWorkplaces] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { mutate: createService, isPending: isCreating } = useCreateService({
    onSuccessFn: () => navigate("/services"),
  });

  const { mutate: updateService, isPending: isUpdating } = useUpdateService({
    onSuccessFn: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      navigate("/services");
    },
  });

  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (isEditMode && serviceToEdit) {
      setNome(serviceToEdit.name || "");
      setDescricao(serviceToEdit.description || "");
      setPrice(
        serviceToEdit.price !== undefined && serviceToEdit.price !== null
          ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(serviceToEdit.price))
          : ""
      );
      setDuration(
        serviceToEdit.duration !== undefined && serviceToEdit.duration !== null
          ? minutesToHHMM(Number(serviceToEdit.duration))
          : "00:00"
      );

      const serviceWorkplaces = serviceToEdit.workplaces?.map((w) => w.id) || [];
      setSelectedWorkplaces(serviceWorkplaces);
    }
  }, [isEditMode, serviceToEdit]);

  useEffect(() => {
    if (!isEditMode && workplaces && workplaces.length === 1 && selectedWorkplaces.length === 0) {
      setSelectedWorkplaces([workplaces[0].id]);
    }
  }, [workplaces, isEditMode, selectedWorkplaces]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!nome.trim()) newErrors.nome = "O nome é obrigatório";
    else if (nome.trim().length < 3) newErrors.nome = "O nome deve ter pelo menos 3 letras";

    if (!descricao.trim()) newErrors.descricao = "A descrição é obrigatória";

    if (!price || (parseBRL(price) || 0) === 0) newErrors.price = "O valor é obrigatório";

    const durationInMinutes = hhmmToMinutes(duration);
    if (!duration || duration === "00:00" || durationInMinutes === 0) {
      newErrors.duration = "A duração é obrigatória";
    }

    if (selectedWorkplaces.length === 0) {
      newErrors.workplaces = "Selecione pelo menos um local";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const payload = {
      name: nome,
      description: descricao,
      type: "SERVICE" as const,
      employeeId: null,
      department: null,
      price: parseBRL(price),
      duration: hhmmToMinutes(duration),
      workplaceIds: selectedWorkplaces,
    };

    if (isEditMode && id) {
      updateService({ id, payload });
    } else {
      createService(payload);
    }
  };

  const handleCancel = () => {
    navigate("/services");
  };

  if (isEditMode && isFetching) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">Carregando dados do serviço...</p>
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
            {isEditMode ? "Editar Serviço" : "Novo Serviço"}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
        <div className="flex-1 p-4 sm:p-6 md:p-8">
          <section className="bg-white border border-slate-200 shadow-sm rounded-lg p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Nome do serviço <span className="text-red-500">*</span>
              </label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={cn(baseInputClass, errors.nome && "border-red-500 focus:border-red-500 focus:ring-red-500/20")}
                placeholder="Ex: Limpeza de Pele"
                type="text"
                autoFocus
              />
              {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Valor (R$) <span className="text-red-500">*</span>
                </label>
                <input
                  value={price}
                  onChange={(e) => setPrice(formatBRL(e.target.value))}
                  className={cn(baseInputClass, errors.price && "border-red-500 focus:border-red-500 focus:ring-red-500/20")}
                  placeholder="R$ 0,00"
                  type="text"
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Duração (h) <span className="text-red-500">*</span>
                </label>
                <div className="h-[42px] flex items-center">
                  <TimePickerField
                    value={duration}
                    onChange={setDuration}
                    ariaLabel="Duração do serviço"
                    className={cn("schedule-time-picker--light", errors.duration && "border-red-500")}
                  />
                </div>
                {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  Locais de realização <span className="text-red-500">*</span>
                </label>
                <WorkplaceMultiSelect
                  options={workplaces || []}
                  selected={selectedWorkplaces}
                  onChange={(ids) => {
                    setSelectedWorkplaces(ids);
                    if (ids.length > 0) setErrors((prev) => ({ ...prev, workplaces: "" }));
                  }}
                  disabled={workplaces?.length === 1}
                />
                {errors.workplaces && <p className="text-red-500 text-xs mt-1">{errors.workplaces}</p>}
                {workplaces?.length === 1 && (
                  <p className="text-[10px] text-slate-400 italic px-1">
                    Selecionado automaticamente por ser o único local disponível.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Descrição do serviço <span className="text-red-500">*</span>
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className={cn(
                  baseInputClass,
                  "min-h-[180px] resize-y",
                  errors.descricao && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                )}
                placeholder="Descreva o serviço..."
              />
              {errors.descricao && <p className="text-red-500 text-xs mt-1">{errors.descricao}</p>}
            </div>
          </section>
        </div>

        <div className="bg-white border-t border-slate-200 px-4 sm:px-6 md:px-8 py-4 flex justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="ghost"
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 py-2.5 px-5 rounded-lg transition-all"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium shadow-sm transition-all"
            disabled={isPending}
          >
            {isPending
              ? isEditMode
                ? "Atualizando..."
                : "Salvando..."
              : isEditMode
                ? "Atualizar"
                : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateService;
