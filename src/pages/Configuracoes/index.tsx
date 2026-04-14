import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, ChevronDown, Globe, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useUser } from "@/context/user";
import { useUpdateCompanyPhone } from "@/hooks/api/useUpdateCompanyPhone";
import useToast from "@/hooks/useToast";
import { formatCnpj, formatCpf, formatPhone } from "@/util/helper";
import { LocationModal, type DayKey, type LocationData } from "./components/LocationModal";

const DAY_KEYS: DayKey[] = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const DOW_TO_KEY: Record<number, DayKey> = {
  0: "Dom",
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
};

const maskPhone = (value: string) => formatPhone(value.replace(/\D/g, "").slice(0, 11));

const maskDocument = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) return formatCpf(digits);
  return formatCnpj(digits);
};

const getDayRangeSummary = (days: DayKey[]) => {
  if (days.length === 0) return "Sem dias ativos";

  const ordered = DAY_KEYS.filter((day) => days.includes(day));
  if (ordered.length === 7) return "Dom - Sáb";
  if (ordered.length === 1) return ordered[0];

  return `${ordered[0]} - ${ordered[ordered.length - 1]}`;
};

const isTimeRangeValid = (startTime: string, endTime: string) => {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  if ([startH, startM, endH, endM].some((part) => Number.isNaN(part))) return false;

  const start = startH * 60 + startM;
  const end = endH * 60 + endM;
  return end > start;
};

const mockAddresses: LocationData[] = [
  {
    id: "mock-1",
    name: "Clínica Centro",
    serviceType: "PRESENCIAL",
    address: "Rua das Amendoeiras, 742",
    neighborhood: "Centro",
    complement: "Sala 302, Bloco B",
    city: "Belo Horizonte",
    state: "MG",
    rooms: 4,
    activeDays: ["Seg", "Ter", "Qua", "Qui", "Sex"],
    startTime: "08:00",
    endTime: "18:00",
  },
  {
    id: "mock-2",
    name: "Atendimento Online",
    serviceType: "ONLINE",
    address: "",
    neighborhood: "",
    complement: "",
    city: "",
    state: "",
    rooms: 1,
    activeDays: ["Seg", "Ter", "Qua", "Qui", "Sex"],
    startTime: "09:00",
    endTime: "18:00",
  },
];

export const Configuracoes = () => {
  const { userData, refreshUser } = useUser();
  const { showToast } = useToast();
  const { mutateAsync: updateCompanyPhone, isPending: isUpdatingCompanyPhone } = useUpdateCompanyPhone();

  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationData | null>(null);
  const [expandedLocationId, setExpandedLocationId] = useState<string | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<LocationData | null>(null);

  const companyType = userData?.membership?.company?.companyType === "AUTONOMO" ? "Autônomo" : "Empresa";

  const [profileForm, setProfileForm] = useState({
    name: userData?.name ?? "",
    accountType: companyType,
    document: userData?.membership?.company?.document ? maskDocument(userData.membership.company.document) : "",
    email: userData?.email ?? "",
    phone: maskPhone(userData?.membership?.company?.phone ?? ""),
    description: "",
  });

  const syncProfileFromUser = useCallback(() => {
    setProfileForm((prev) => ({
      ...prev,
      name: userData?.name ?? "",
      accountType: userData?.membership?.company?.companyType === "AUTONOMO" ? "Autônomo" : "Empresa",
      document: userData?.membership?.company?.document ? maskDocument(userData.membership.company.document) : "",
      email: userData?.email ?? "",
      phone: maskPhone(userData?.membership?.company?.phone ?? ""),
    }));
  }, [userData]);

  useEffect(() => {
    syncProfileFromUser();
  }, [syncProfileFromUser]);

  const apiAddresses = useMemo<LocationData[]>(() => {
    const workplaces = userData?.membership?.company?.workplaces;
    if (!workplaces) return [];

    const list = Array.isArray(workplaces) ? workplaces : [workplaces];

    const minutesToTime = (minutes: number) => {
      const h = String(Math.floor(minutes / 60)).padStart(2, "0");
      const m = String(minutes % 60).padStart(2, "0");
      return `${h}:${m}`;
    };

    return list.map((wp, index) => {
      const entries = Object.entries(wp.schedule ?? {});
      const activeEntries = entries
        .map(([day, value]) => ({ day: Number(day), value }))
        .filter((entry) => entry.value.startMinute !== null && entry.value.endMinute !== null)
        .sort((a, b) => a.day - b.day);

      const activeDays = activeEntries
        .map((entry) => DOW_TO_KEY[entry.day])
        .filter((day): day is DayKey => Boolean(day));

      const firstActive = activeEntries[0];
      const fallbackStart = 9 * 60;
      const fallbackEnd = 18 * 60;

      const isOnline = (wp.nickname ?? "").toLowerCase().includes("online");

      return {
        id: wp.id,
        name: wp.nickname || (isOnline ? "Atendimento Online" : `Local ${index + 1}`),
        serviceType: isOnline ? "ONLINE" : "PRESENCIAL",
        address: `${wp.address || ""}${wp.number ? `, ${wp.number}` : ""}`.trim(),
        neighborhood: "",
        complement: wp.complement ?? "",
        city: wp.city ?? "",
        state: wp.state ?? "",
        rooms: 1,
        activeDays: activeDays.length > 0 ? activeDays : ["Seg", "Ter", "Qua", "Qui", "Sex"],
        startTime: minutesToTime(firstActive?.value.startMinute ?? fallbackStart),
        endTime: minutesToTime(firstActive?.value.endMinute ?? fallbackEnd),
      };
    });
  }, [userData]);

  const [locations, setLocations] = useState<LocationData[]>(() =>
    apiAddresses.length > 0 ? apiAddresses : mockAddresses,
  );

  useEffect(() => {
    if (apiAddresses.length > 0) {
      setLocations(apiAddresses);
    }
  }, [apiAddresses]);

  const hasOnlineLocation = useMemo(
    () => locations.some((location) => location.serviceType === "ONLINE"),
    [locations],
  );

  const handleProfileSave = async () => {
    const cleanPhone = profileForm.phone.replace(/\D/g, "");
    const originalPhone = (userData?.membership?.company?.phone ?? "").replace(/\D/g, "");

    if (cleanPhone && cleanPhone.length !== 11) {
      showToast({
        label: "Telefone inválido",
        message: "Informe um telefone com DDD e 11 dígitos.",
        type: "error",
        toastId: "config-invalid-phone",
      });
      return;
    }

    setIsProfileSaving(true);
    try {
      if (cleanPhone !== originalPhone && cleanPhone.length === 11) {
        await updateCompanyPhone(cleanPhone);
      }

      showToast({
        label: "Perfil atualizado",
        message: "As alterações foram salvas com sucesso.",
        type: "success",
        toastId: "config-profile-saved",
      });

      setIsProfileEditing(false);

      refreshUser();
    } catch {
      showToast({
        label: "Não foi possível salvar",
        message: "Tente novamente em instantes.",
        type: "error",
        toastId: "config-profile-error",
      });
    } finally {
      setIsProfileSaving(false);
    }
  };

  const openAddLocation = () => {
    setEditingLocation(null);
    setIsLocModalOpen(true);
  };

  const openEditLocation = (location: LocationData) => {
    if (location.serviceType === "ONLINE") {
      showToast({
        label: "Local online sem edição",
        message: "O local Online não pode ser editado pelo modal.",
        type: "info",
        toastId: "online-location-edit-disabled",
      });
      return;
    }

    setEditingLocation(location);
    setIsLocModalOpen(true);
  };

  const handleSaveLocation = async (data: LocationData) => {
    const hasAnotherOnline = locations.some(
      (location) => location.serviceType === "ONLINE" && location.id !== data.id,
    );

    if (data.serviceType === "ONLINE" && hasAnotherOnline) {
      showToast({
        label: "Já existe local online",
        message: "Não é possível criar ou converter outro local para Online.",
        type: "error",
        toastId: "online-location-duplicate",
      });
      return;
    }

    setLocations((prev) => {
      if (data.id) {
        return prev.map((location) => (location.id === data.id ? data : location));
      }

      return [...prev, { ...data, id: `loc-${Date.now()}` }];
    });

    showToast({
      label: data.id ? "Local atualizado" : "Local adicionado",
      message: "As informações do local foram salvas.",
      type: "success",
      toastId: data.id ? "location-updated" : "location-created",
    });
  };

  const handleDeleteLocation = useCallback(() => {
    if (!locationToDelete?.id) return;

    setLocations((prev) => prev.filter((location) => location.id !== locationToDelete.id));
    setExpandedLocationId((prev) => (prev === locationToDelete.id ? null : prev));

    showToast({
      label: "Local removido",
      message: "O local de atendimento foi excluído com sucesso.",
      type: "success",
      toastId: "location-removed",
    });

    setLocationToDelete(null);
  }, [locationToDelete, showToast]);

  const toggleExpand = (locationId: string) => {
    setExpandedLocationId((prev) => (prev === locationId ? null : locationId));
  };

  const toggleDayForLocation = (locationId: string, day: DayKey) => {
    setLocations((prev) =>
      prev.map((location) => {
        if (location.id !== locationId) return location;

        const isActive = location.activeDays.includes(day);
        return {
          ...location,
          activeDays: isActive
            ? location.activeDays.filter((d) => d !== day)
            : [...location.activeDays, day],
        };
      }),
    );
  };

  const setLocationTime = (locationId: string, field: "startTime" | "endTime", value: string) => {
    setLocations((prev) =>
      prev.map((location) => (location.id === locationId ? { ...location, [field]: value } : location)),
    );
  };

  const saveInlineLocation = (location: LocationData) => {
    if (!isTimeRangeValid(location.startTime, location.endTime)) {
      showToast({
        label: "Horário inválido",
        message: "O horário final deve ser maior que o inicial.",
        type: "error",
        toastId: `location-inline-time-${location.id}`,
      });
      return;
    }

    if (location.activeDays.length === 0) {
      showToast({
        label: "Selecione os dias",
        message: "Ative pelo menos um dia para o local.",
        type: "error",
        toastId: `location-inline-days-${location.id}`,
      });
      return;
    }

    showToast({
      label: "Horários atualizados",
      message: `${location.name} foi atualizado com sucesso.`,
      type: "success",
      toastId: `location-inline-saved-${location.id}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="overflow-auto">
        <div className="mx-auto p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground">Configurações</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie suas informações pessoais e locais de atendimento
            </p>
          </div>

          <div className="space-y-8">
            <section>

              <div className="border border-border rounded-lg p-6 space-y-4 bg-card shadow-sm flex flex-col">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">Perfil</h2>
                <p className="text-sm text-muted-foreground mt-1">Informações básicas do profissional</p>
              </div>
              {!isProfileEditing && (
                <Button
                  onClick={() => setIsProfileEditing(true)}
                  className="min-w-28 bg-blue-600 hover:bg-blue-700"
                >
                  Editar
                </Button>
              )}
            </div>

            {!isProfileEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Nome</p>
                  <p className="text-sm text-foreground">{profileForm.name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Tipo de conta</p>
                  <p className="text-sm text-foreground">{profileForm.accountType || "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Documento</p>
                  <p className="text-sm text-foreground">{profileForm.document || "—"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Telefone</p>
                  <p className="text-sm text-foreground">{profileForm.phone || "—"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Email</p>
                  <p className="text-sm text-foreground">{profileForm.email || "—"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Descrição</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{profileForm.description || "Sem descrição."}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Nome</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Tipo de conta</label>
                <input
                  type="text"
                  disabled
                  value={profileForm.accountType}
                  className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Documento</label>
                <input
                  type="text"
                  value={profileForm.document}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      document: maskDocument(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Telefone</label>
                <input
                  type="text"
                  maxLength={15}
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      phone: maskPhone(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Descrição</label>
                <textarea
                  rows={5}
                  value={profileForm.description}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Fale um pouco sobre seu atendimento..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>
              
            </div>
            
            )} 
            {isProfileEditing &&
              <div className="flex items-center gap-2 self-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      syncProfileFromUser();
                      setIsProfileEditing(false);
                    }}
                    className="px-2"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleProfileSave}
                    disabled={isProfileSaving || isUpdatingCompanyPhone}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                    >
                    {isProfileSaving || isUpdatingCompanyPhone ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              }
              </div>
              
            </section>

            <section>

            <div className="border border-border rounded-lg p-6 bg-card shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Locais de Atendimento</h2>
                <p className="text-sm text-muted-foreground mt-1">Configure os horários e locais onde você atende</p>
              </div>
              {/* <div className="flex gap-3">
                <Button onClick={openAddLocation}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar local
                </Button>
              </div> */}
            </div>
            {locations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
                <p className="text-foreground font-medium">Nenhum local cadastrado ainda.</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">Adicione seu primeiro local para organizar seus atendimentos.</p>
                <Button onClick={openAddLocation} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar local
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {locations.map((location) => {
                  const isExpanded = expandedLocationId === location.id;
                  const hasInvalidTime = !isTimeRangeValid(location.startTime, location.endTime);
                  const locationTypeLabel = location.serviceType === "ONLINE" ? "Online" : "Presencial";

                  return (
                    <article key={location.id} className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-4 md:px-5 py-4 bg-white flex items-center justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => toggleExpand(location.id ?? "")}
                          className="flex-1 text-left"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {location.serviceType === "ONLINE" ? (
                              <Globe className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Building2 className="w-4 h-4 text-slate-700" />
                            )}
                            <p className="font-semibold text-slate-900">{location.name}</p>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                            <span>{locationTypeLabel}</span>
                            <span>{getDayRangeSummary(location.activeDays)}</span>
                            <span>{location.startTime} - {location.endTime}</span>
                          </div>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            className={`h-8 w-8 inline-flex items-center justify-center rounded-md border ${
                              location.serviceType === "ONLINE"
                                ? "border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50"
                                : "border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                            onClick={() => openEditLocation(location)}
                            disabled={location.serviceType === "ONLINE"}
                            title={location.serviceType === "ONLINE" ? "Local online não pode ser editado no modal" : undefined}
                            aria-label={`Editar ${location.name}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => setLocationToDelete(location)}
                            aria-label={`Excluir ${location.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
                            onClick={() => toggleExpand(location.id ?? "")}
                            aria-label={isExpanded ? "Recolher" : "Expandir"}
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-slate-200 bg-slate-50 p-4 md:p-5 space-y-5">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-2">Informações do local</h3>
                            {location.serviceType === "ONLINE" ? (
                              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
                                Atendimentos realizados remotamente por vídeo ou chamada.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
                                <div>
                                  <span className="font-medium">Endereço: </span>
                                  <span>{location.address || "Não informado"}</span>
                                </div>
                                <div>
                                  <span className="font-medium">Complemento: </span>
                                  <span>{location.complement || "Não informado"}</span>
                                </div>
                                <div>
                                  <span className="font-medium">Cidade/UF: </span>
                                  <span>{location.city || "-"}/{location.state || "-"}</span>
                                </div>
                                <div>
                                  <span className="font-medium">Salas: </span>
                                  <span>{location.rooms}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-2">Dias de atendimento</h3>
                            <div className="flex flex-wrap gap-2">
                              {DAY_KEYS.map((day) => {
                                const isActive = location.activeDays.includes(day);
                                return (
                                  <button
                                    key={day}
                                    type="button"
                                    onClick={() => toggleDayForLocation(location.id ?? "", day)}
                                    className={`h-9 min-w-10 rounded-md border px-3 text-sm font-medium transition ${
                                      isActive
                                        ? "border-blue-600 bg-blue-600 text-white"
                                        : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                                    }`}
                                  >
                                    {day}
                                  </button>
                                );
                              })}
                            </div>
                            {location.activeDays.length === 0 && (
                              <p className="text-xs text-red-500 mt-2">Selecione ao menos um dia ativo.</p>
                            )}
                          </div>

                          <div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-2">Horário</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                              <div className="space-y-1">
                                <label className="text-xs text-slate-600">Início</label>
                                <input
                                  type="time"
                                  value={location.startTime}
                                  onChange={(e) => setLocationTime(location.id ?? "", "startTime", e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs text-slate-600">Término</label>
                                <input
                                  type="time"
                                  value={location.endTime}
                                  onChange={(e) => setLocationTime(location.id ?? "", "endTime", e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                              </div>
                            </div>
                            {hasInvalidTime && (
                              <p className="text-xs text-red-500 mt-2">Horário final deve ser maior que o horário inicial.</p>
                            )}
                          </div>

                          <div className="flex justify-end">
                            <Button
                              onClick={() => saveInlineLocation(location)}
                              disabled={hasInvalidTime || location.activeDays.length === 0}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                            >
                              Salvar horário
                            </Button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
            </div>
            </section>
          </div>
        </div>
      </main>

      <LocationModal
        isOpen={isLocModalOpen}
        setIsOpen={setIsLocModalOpen}
        location={editingLocation}
        onSave={handleSaveLocation}
        allowOnlineSelection={!hasOnlineLocation && !editingLocation}
        lockServiceType={Boolean(editingLocation)}
      />

      <Dialog open={Boolean(locationToDelete)} onOpenChange={(open) => !open && setLocationToDelete(null)}>
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl">
          <DialogTitle className="text-lg text-slate-900">Excluir local</DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            Tem certeza que deseja excluir este local? Essa ação não pode ser desfeita.
          </DialogDescription>

          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setLocationToDelete(null)} className="px-2">
              Cancelar
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white px-2" onClick={handleDeleteLocation}>
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
