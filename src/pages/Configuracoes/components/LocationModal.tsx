import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type DayKey = "Dom" | "Seg" | "Ter" | "Qua" | "Qui" | "Sex" | "Sáb";

export interface LocationData {
  id?: string;
  name: string;
  serviceType: "ONLINE" | "PRESENCIAL";
  address: string;
  neighborhood: string;
  complement: string;
  city: string;
  state: string;
  rooms: number;
  activeDays: DayKey[];
  startTime: string;
  endTime: string;
}

const ALL_DAYS: DayKey[] = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface LocationModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  location?: LocationData | null;
  onSave?: (data: LocationData) => void | Promise<void>;
  allowOnlineSelection?: boolean;
  lockServiceType?: boolean;
}

interface LocationErrors {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  rooms?: string;
  activeDays?: string;
  endTime?: string;
}

const baseInputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

const parseTimeMinutes = (value: string) => {
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const getDefaultLocation = (): LocationData => ({
  name: "",
  serviceType: "PRESENCIAL",
  address: "",
  neighborhood: "",
  complement: "",
  city: "",
  state: "",
  rooms: 1,
  activeDays: ["Seg", "Ter", "Qua", "Qui", "Sex"],
  startTime: "09:00",
  endTime: "18:00",
});

export const LocationModal = ({
  isOpen,
  setIsOpen,
  location,
  onSave,
  allowOnlineSelection = true,
  lockServiceType = false,
}: LocationModalProps) => {
  const isEdit = Boolean(location?.id);
  const [form, setForm] = useState<LocationData>(getDefaultLocation());
  const [errors, setErrors] = useState<LocationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (location) {
      setForm({
        ...location,
        rooms: Number.isFinite(location.rooms) && location.rooms > 0 ? location.rooms : 1,
      });
    } else {
      setForm(getDefaultLocation());
    }

    setErrors({});
    setIsSubmitting(false);
  }, [isOpen, location]);

  const isPresencial = form.serviceType === "PRESENCIAL";

  const modalTitle = useMemo(() => {
    if (isEdit) return "Editar local";
    return "Adicionar novo local";
  }, [isEdit]);

  const validate = (): LocationErrors => {
    const nextErrors: LocationErrors = {};

    if (isPresencial && !form.name.trim()) {
      nextErrors.name = "Informe o nome do local.";
    }

    if (isPresencial && !form.address.trim()) {
      nextErrors.address = "Informe o endereço.";
    }

    if (isPresencial && !form.city.trim()) {
      nextErrors.city = "Informe a cidade.";
    }

    if (isPresencial && !form.state.trim()) {
      nextErrors.state = "Informe o estado.";
    }

    if (isPresencial && (!Number.isFinite(form.rooms) || form.rooms < 1)) {
      nextErrors.rooms = "Número de salas deve ser maior que zero.";
    }

    if (form.activeDays.length === 0) {
      nextErrors.activeDays = "Selecione ao menos um dia de atendimento.";
    }

    const startMinutes = parseTimeMinutes(form.startTime);
    const endMinutes = parseTimeMinutes(form.endTime);

    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
      nextErrors.endTime = "O horário final deve ser maior que o inicial.";
    }

    return nextErrors;
  };

  const toggleDay = (day: DayKey) => {
    setForm((prev) => {
      const isActive = prev.activeDays.includes(day);
      return {
        ...prev,
        activeDays: isActive
          ? prev.activeDays.filter((d) => d !== day)
          : [...prev.activeDays, day],
      };
    });
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    const validation = validate();
    setErrors(validation);

    if (Object.keys(validation).length > 0) return;

    const payload: LocationData = {
      ...form,
      name: form.serviceType === "ONLINE" ? (form.name.trim() || "Atendimento Online") : form.name.trim(),
      city: form.city.trim(),
      state: form.state.trim().toUpperCase(),
      address: form.address.trim(),
      neighborhood: form.neighborhood.trim(),
      complement: form.complement.trim(),
      rooms: Number(form.rooms) || 1,
    };

    setIsSubmitting(true);
    try {
      await onSave?.(payload);
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl bg-white border border-slate-200 rounded-2xl p-0 overflow-hidden">
        <form onSubmit={handleSave}>
          <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl text-slate-900">{modalTitle}</DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-1">
                {isEdit
                  ? "Atualize os dados do local. O horário é alterado no card expandido da lista."
                  : "Configure o tipo de atendimento, dias e horários deste local."}
              </DialogDescription>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tipo de atendimento</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, serviceType: "ONLINE" }))}
                  disabled={!allowOnlineSelection || lockServiceType}
                  className={`h-9 rounded-md text-sm font-medium transition ${
                    form.serviceType === "ONLINE"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  } ${
                      (!allowOnlineSelection || lockServiceType) && form.serviceType !== "ONLINE"
                        ? "opacity-50 cursor-not-allowed hover:text-slate-600"
                        : ""
                  }`}
                >
                  Online
                </button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, serviceType: "PRESENCIAL" }))}
                  disabled={lockServiceType}
                  className={`h-9 rounded-md text-sm font-medium transition ${
                    form.serviceType === "PRESENCIAL"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  } ${lockServiceType ? "cursor-not-allowed" : ""}`}
                >
                  Presencial
                </button>
              </div>
              {!allowOnlineSelection && (
                <p className="text-xs text-slate-500">Já existe um local online cadastrado.</p>
              )}
              {lockServiceType && (
                <p className="text-xs text-slate-500">O tipo de atendimento não pode ser alterado na edição.</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Nome do local {form.serviceType === "ONLINE" ? "(opcional)" : ""}
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className={baseInputClass}
                placeholder={form.serviceType === "ONLINE" ? "Ex: Atendimento remoto" : "Ex: Clínica Centro"}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            {isPresencial ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Endereço</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                    className={baseInputClass}
                    placeholder="Rua, número"
                  />
                  {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Complemento</label>
                    <input
                      type="text"
                      value={form.complement}
                      onChange={(e) => setForm((prev) => ({ ...prev, complement: e.target.value }))}
                      className={baseInputClass}
                      placeholder="Sala, bloco, referência"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Bairro</label>
                    <input
                      type="text"
                      value={form.neighborhood}
                      onChange={(e) => setForm((prev) => ({ ...prev, neighborhood: e.target.value }))}
                      className={baseInputClass}
                      placeholder="Bairro"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Cidade</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                      className={baseInputClass}
                      placeholder="Cidade"
                    />
                    {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Estado</label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          state: e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase(),
                        }))
                      }
                      className={baseInputClass}
                      placeholder="UF"
                      maxLength={2}
                    />
                    {errors.state && <p className="text-xs text-red-500">{errors.state}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Número de salas</label>
                  <input
                    type="number"
                    min={1}
                    value={form.rooms}
                    onChange={(e) => setForm((prev) => ({ ...prev, rooms: Number(e.target.value) }))}
                    className={baseInputClass}
                  />
                  {errors.rooms && <p className="text-xs text-red-500">{errors.rooms}</p>}
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
                Atendimentos realizados remotamente por vídeo ou chamada.
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Dias de atendimento</label>
              <div className="flex flex-wrap gap-2">
                {ALL_DAYS.map((day) => {
                  const active = form.activeDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`h-9 min-w-10 rounded-md border px-3 text-sm font-medium transition ${
                        active
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              {errors.activeDays && <p className="text-xs text-red-500">{errors.activeDays}</p>}
            </div>

            {isEdit ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                Horários não são editados neste modal. Para alterar início e término, use o card do local na lista.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Horário de início</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                    className={baseInputClass}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Horário de término</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                    className={baseInputClass}
                  />
                  {errors.endTime && <p className="text-xs text-red-500">{errors.endTime}</p>}
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="cursor-pointer px-2"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer px-2">
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
