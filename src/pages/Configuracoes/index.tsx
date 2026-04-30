import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, ChevronDown, Globe, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/user";
import { useDeleteWorkplace } from "@/hooks/api/useDeleteWorkplace";
import { useUpdateProfile } from "@/hooks/api/useUpdateProfile";
import useToast from "@/hooks/useToast";
import { formatCnpj, formatCpf, formatPhone } from "@/util/helper";
import { useNavigate } from "react-router-dom";
import type { DayKey, LocationData as OriginalLocationData } from "./components/LocationModal";

type LocationData = OriginalLocationData & {
  rawSchedule: { day: DayKey; start: string; end: string }[];
  isFlexible: boolean;
};

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
  if (ordered.length === 7) return "Todos os dias";
  if (ordered.length === 1) return ordered[0];

  const indices = ordered.map(d => DAY_KEYS.indexOf(d));
  let isConsecutive = true;
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] !== indices[i - 1] + 1) {
      isConsecutive = false;
      break;
    }
  }

  if (isConsecutive) {
    return `${ordered[0]} a ${ordered[ordered.length - 1]}`;
  }
  return ordered.join(", ");
};

export const Configuracoes = () => {
  const { userData, refreshUser } = useUser();
  const { showToast } = useToast();
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();
  const { mutateAsync: deleteWorkplace, isPending: isDeletingWorkplace } = useDeleteWorkplace();

  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [expandedLocationId, setExpandedLocationId] = useState<string | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<LocationData | null>(null);
  const navigate = useNavigate();

  const companyType = userData?.membership?.company?.companyType === "AUTONOMO" ? "Autônomo" : "Empresa";
  const isAutonomo = companyType === "Autônomo";

  const initialDoc = userData?.membership?.company?.document ?? "";
  const [hasCnpj, setHasCnpj] = useState(() => initialDoc.replace(/\D/g, "").length > 11);

  const [profileForm, setProfileForm] = useState({
    name: userData?.name ?? "",
    accountType: companyType,
    document: initialDoc ? maskDocument(initialDoc) : "",
    email: userData?.email ?? "",
    phone: maskPhone((userData?.membership?.company?.phone ?? "").replace(/^55/, "")),
    description: userData?.membership?.company?.description ?? "",
  });

  const syncProfileFromUser = useCallback(() => {
    setProfileForm((prev) => ({
      ...prev,
      name: userData?.name ?? "",
      accountType: userData?.membership?.company?.companyType === "AUTONOMO" ? "Autônomo" : "Empresa",
      document: userData?.membership?.company?.document ? maskDocument(userData.membership.company.document) : "",
      email: userData?.email ?? "",
      phone: maskPhone((userData?.membership?.company?.phone ?? "").replace(/^55/, "")),
      description: userData?.membership?.company?.description ?? "",
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

      const rawSchedule = activeEntries.map((entry) => {
        const d = DOW_TO_KEY[entry.day];
        return {
          day: d,
          start: minutesToTime(entry.value.startMinute!),
          end: minutesToTime(entry.value.endMinute!),
        };
      });

      const activeDays = rawSchedule.map(s => s.day).filter(Boolean);
      const isFlexible = new Set(rawSchedule.map(s => `${s.start}-${s.end}`)).size > 1;

      const firstActive = activeEntries[0];
      const fallbackStart = 9 * 60;
      const fallbackEnd = 18 * 60;

      const isOnline = Boolean(wp.isOnline);

      return {
        id: wp.id,
        name: wp.nickname || (isOnline ? "Atendimento Online" : `Local ${index + 1}`),
        serviceType: isOnline ? "ONLINE" : "PRESENCIAL",
        address: `${wp.address || ""}${wp.number ? `, ${wp.number}` : ""}`.trim(),
        neighborhood: wp.neighborhood ?? "",
        complement: wp.complement ?? "",
        city: wp.city ?? "",
        state: wp.state ?? "",
        rooms: 1,
        activeDays: activeDays.length > 0 ? activeDays : ["Seg", "Ter", "Qua", "Qui", "Sex"],
        startTime: minutesToTime(firstActive?.value.startMinute ?? fallbackStart),
        endTime: minutesToTime(firstActive?.value.endMinute ?? fallbackEnd),
        rawSchedule,
        isFlexible,
      };
    });
  }, [userData]);

  const locations = apiAddresses;


  const handleProfileSave = async () => {
    const cleanPhone = profileForm.phone.replace(/\D/g, "");
    const finalPhone = cleanPhone ? `55${cleanPhone}` : "";
    
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
      await updateProfile({
        name: profileForm.name,
        phone: finalPhone,
        document: profileForm.document.replace(/\D/g, ""),
        description: profileForm.description,
      });

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
    navigate("/settings/locations/new");
  };

  const openEditLocation = (location: LocationData) => {
    navigate(`/settings/locations/${location.id}/edit`);
  };

  const handleDeleteLocation = useCallback(async () => {
    if (!locationToDelete?.id) return;

    try {
      await deleteWorkplace(locationToDelete.id);
      setExpandedLocationId((prev) => (prev === locationToDelete.id ? null : prev));
      setLocationToDelete(null);
      refreshUser();

      showToast({
        label: "Local removido",
        message: "O local de atendimento foi excluído com sucesso.",
        type: "success",
        toastId: "location-removed",
      });
    } catch (error: unknown) {
      const apiMessage = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
      showToast({
        label: "Não foi possível excluir",
        message: apiMessage || "Tente novamente em instantes.",
        type: "error",
        toastId: "location-remove-error",
      });
    }
  }, [deleteWorkplace, locationToDelete, refreshUser, showToast]);

  const toggleExpand = (locationId: string) => {
    setExpandedLocationId((prev) => (prev === locationId ? null : locationId));
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
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-sm font-medium text-slate-700">
                    {hasCnpj && isAutonomo ? "CNPJ" : (!hasCnpj && isAutonomo ? "CPF" : "CNPJ/CPF")}
                  </label>
                  {isAutonomo && (
                    <div className="flex items-center gap-1.5 ml-auto text-sm text-slate-600 cursor-pointer">
                      <Checkbox id="hasCnpj" checked={hasCnpj} onCheckedChange={(checked) => setHasCnpj(checked === true)} />
                      <Label htmlFor="hasCnpj" className="text-sm text-slate-600">Possui CNPJ?</Label>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  maxLength={(!isAutonomo || hasCnpj) ? 18 : 14}
                  value={profileForm.document}
                  placeholder={(!isAutonomo || hasCnpj) ? "00.000.000/0001-00" : "000.000.000-00"}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    const isNowCnpj = !isAutonomo || hasCnpj;
                    let formatted = raw;
                    if (isNowCnpj) {
                      formatted = formatCnpj(raw.slice(0, 14));
                    } else {
                      formatted = formatCpf(raw.slice(0, 11));
                    }
                    setProfileForm((prev) => ({
                      ...prev,
                      document: formatted,
                    }));
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Telefone</label>
                <div className="flex items-center w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-0.5 text-sm transition-all overflow-hidden cursor-not-allowed opacity-80">
                    <div className="flex items-center gap-2 border-r border-slate-200 text-slate-500 select-none w-fit pr-1">
                        <p className="font-medium leading-none text-[14px]">+55</p>
                    </div>
                    <input
                      type="text"
                      disabled
                      maxLength={15}
                      value={profileForm.phone}
                      className="w-full bg-transparent pl-1 pr-3 py-2 text-slate-900 outline-none cursor-not-allowed"
                    />
                </div>
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
                    disabled={isProfileSaving || isUpdatingProfile}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                    >
                    {isProfileSaving || isUpdatingProfile ? "Salvando..." : "Salvar"}
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
              {locations.length > 0 && (
                <div className="flex gap-3">
                  <Button onClick={openAddLocation} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              )}
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
                  const locationTypeLabel = location.serviceType === "ONLINE" ? "Online" : "Presencial";
                  const panelId = `location-panel-${location.id}`;

                  return (
                    <article key={location.id} className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-4 md:px-5 py-4 bg-white flex items-center justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => toggleExpand(location.id ?? "")}
                          className="flex-1 text-left"
                          aria-expanded={isExpanded}
                          aria-controls={panelId}
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
                            <span>{location.isFlexible ? "Horários variados" : `${location.startTime} - ${location.endTime}`}</span>
                          </div>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
                            onClick={() => openEditLocation(location)}
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
                        <div id={panelId} className="border-t border-slate-200 bg-slate-50 p-4 md:p-5 space-y-5">
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
                                  <span className="font-medium">Bairro: </span>
                                  <span>{location.neighborhood || "Não informado"}</span>
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
                            <h3 className="text-sm font-semibold text-slate-900 mb-3">Horários de atendimento</h3>
                            {location.isFlexible ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm text-slate-700">
                                {location.rawSchedule.map((s) => (
                                  <div key={s.day} className="flex justify-between items-center rounded-md border border-slate-200 bg-white px-3 py-2">
                                    <span className="font-medium text-slate-900">{s.day}</span>
                                    <span>{s.start} - {s.end}</span>
                                  </div>
                                ))}
                                {location.rawSchedule.length === 0 && (
                                  <span className="col-span-full">Sem dias ativos</span>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2 text-sm text-slate-700">
                                {location.activeDays.length > 0 ? (
                                  <>
                                    {location.activeDays.map((day) => (
                                      <span key={`${location.id}-${day}`} className="rounded-md border border-slate-300 bg-white px-3 py-1.5">
                                        {day}
                                      </span>
                                    ))}
                                    <span className="rounded-md border border-slate-200 bg-slate-100 flex items-center justify-center px-4 py-1.5 font-medium ml-1">
                                      {location.startTime} - {location.endTime}
                                    </span>
                                  </>
                                ) : (
                                  <span>Sem dias ativos</span>
                                )}
                              </div>
                            )}
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



      <Dialog open={Boolean(locationToDelete)} onOpenChange={(open) => !open && setLocationToDelete(null)}>
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl">
          <DialogTitle className="text-lg text-slate-900">Excluir local</DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            {locationToDelete?.name
              ? `Tem certeza que deseja excluir o local "${locationToDelete.name}"? Essa ação não pode ser desfeita.`
              : "Tem certeza que deseja excluir este local? Essa ação não pode ser desfeita."}
          </DialogDescription>

          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setLocationToDelete(null)} className="px-2" disabled={isDeletingWorkplace}>
              Cancelar
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white px-2" onClick={handleDeleteLocation} disabled={isDeletingWorkplace}>
              {isDeletingWorkplace ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
