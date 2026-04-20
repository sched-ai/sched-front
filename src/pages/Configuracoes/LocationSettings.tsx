import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Globe } from 'lucide-react';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import CustomRadioInput from '@/components/CustomRadioInput';

import { useUser } from '@/context/user';
import { useCreateWorkplace } from '@/hooks/api/useCreateWorkplace';
import { useCreateOnlineWorkplace } from '@/hooks/api/useCreateOnlineWorkplace';
import { useUpdateWorkplaceAddress } from '@/hooks/api/useUpdateWorkplaceAddress';
import { useUpdateWorkplaceSchedule, type WorkplaceSchedule } from '@/hooks/api/useUpdateWorkplaceSchedule';
import useToast from '@/hooks/useToast';
import type { Location, DayKey, DaySchedule } from '@/types';

const DAY_TO_INDEX: Record<DayKey, number> = {
  domingo: 0,
  segunda: 1,
  terça: 2,
  quarta: 3,
  quinta: 4,
  sexta: 5,
  sábado: 6,
};

const mapTimeToMinute = (timeValue: string) => {
  const [hours, minutes] = timeValue.split(':').map(Number);
  if ([hours, minutes].some((part) => Number.isNaN(part))) return null;
  return hours * 60 + minutes;
};

const isTimeRangeValid = (startTime: string, endTime: string) => {
  const start = mapTimeToMinute(startTime);
  const end = mapTimeToMinute(endTime);

  if (start === null || end === null) return false;
  return end > start;
};

const getSectionStatusLabel = (isDirty: boolean, isSaving: boolean) => {
  if (isSaving) return 'Salvando...';
  if (isDirty) return 'Alterado';
  return 'Sem alterações';
};

const getSectionStatusClass = (isDirty: boolean, isSaving: boolean) => {
  if (isSaving) return 'bg-blue-100 text-blue-800 border border-blue-200';
  if (isDirty) return 'bg-amber-100 text-amber-800 border border-amber-200';
  return 'bg-slate-100 text-slate-600 border border-slate-200';
};

type SaveSectionOutcome = 'saved' | 'invalid' | 'failed';

type WorkplaceScheduleEntry = {
  startMinute: number | null;
  endMinute: number | null;
};

type WorkplaceFromUser = {
  id: string;
  nickname?: string;
  isOnline?: boolean;
  address?: string;
  neighborhood?: string;
  number?: string;
  complement?: string;
  city?: string;
  state?: string;
  schedule?: Record<string, WorkplaceScheduleEntry | null> | null;
};

export default function LocationSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData, refreshUser } = useUser();
  const { showToast } = useToast();
  const { mutateAsync: createWorkplace, isPending: isCreatingWorkplace } = useCreateWorkplace();
  const { mutateAsync: createOnlineWorkplace, isPending: isCreatingOnlineWorkplace } = useCreateOnlineWorkplace();
  const { mutateAsync: updateWorkplaceAddress, isPending: isSavingAddress } = useUpdateWorkplaceAddress();
  const { mutateAsync: updateWorkplaceSchedule, isPending: isSavingSchedule } = useUpdateWorkplaceSchedule();

  const isEditing = Boolean(id);

  const emptyLocation = (): Location => ({
    id: Date.now().toString(),
    name: '',
    address: '',
    neighborhood: '',
    number: '',
    city: '',
    state: '',
    complement: '',
  });

  const [locationForm, setLocationForm] = useState<Location>(emptyLocation());
  const [attendOnline, setAttendOnline] = useState(false);

  // Schedule States
  const [scheduleMode, setScheduleMode] = useState<"fixo" | "flexivel" | "porLocal">("fixo");
  const [fixedStart, setFixedStart] = useState("09:00");
  const [fixedEnd, setFixedEnd] = useState("18:00");
  const [fixedDays, setFixedDays] = useState<DayKey[]>([
    "segunda", "terça", "quarta", "quinta", "sexta",
  ]);
  const [schedule, setSchedule] = useState<Record<DayKey, DaySchedule>>({
    segunda: { working: true, start: "09:00", end: "18:00" },
    terça: { working: true, start: "09:00", end: "18:00" },
    quarta: { working: true, start: "09:00", end: "18:00" },
    quinta: { working: true, start: "09:00", end: "18:00" },
    sexta: { working: true, start: "09:00", end: "18:00" },
    sábado: { working: false, start: "09:00", end: "12:00" },
    domingo: { working: false, start: "09:00", end: "12:00" },
  });

  // IBGE API States
  const [states, setStates] = useState<{ sigla: string; nome: string }[]>([]);
  const [cities, setCities] = useState<{ nome: string }[]>([]);
  
  const [stateSearchText, setStateSearchText] = useState("");
  const [showStateSuggestions, setShowStateSuggestions] = useState(false);

  const [citySearchText, setCitySearchText] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [isAddressDirty, setIsAddressDirty] = useState(false);
  const [isScheduleDirty, setIsScheduleDirty] = useState(false);

  useEffect(() => {
    // Fetch states
    axios
      .get("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then((res) => setStates(res.data))
      .catch((err) => console.error("Error fetching states:", err));
  }, []);

  useEffect(() => {
    if (locationForm.state) {
      // Fetch cities by state acronym
      axios
        .get(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${locationForm.state}/municipios?orderBy=nome`
        )
        .then((res) => setCities(res.data))
        .catch((err) => console.error("Error fetching cities:", err));
    } else {
      setCities([]);
    }
  }, [locationForm.state]);

  useEffect(() => {
    if (locationForm.state && states.length > 0) {
      const found = states.find((s) => s.sigla === locationForm.state);
      if (found) setStateSearchText(found.nome);
    } else if (!locationForm.state) {
      setStateSearchText("");
    }
  }, [locationForm.state, states]);

  useEffect(() => {
    setCitySearchText(locationForm.city || "");
  }, [locationForm.city]);



  useEffect(() => {
    window.scrollTo(0, 0);
    // If editing, preload data from userData.membership.company.workplaces
    if (isEditing && userData?.membership?.company?.workplaces) {
      const workplaces = Array.isArray(userData.membership.company.workplaces)
        ? userData.membership.company.workplaces
        : [userData.membership.company.workplaces];

      const wp = (workplaces as WorkplaceFromUser[]).find((w) => w.id === id);
      if (wp) {
        const isOnline = Boolean(wp.isOnline);
        setAttendOnline(isOnline);

        setLocationForm({
          id: wp.id,
          name: wp.nickname || (isOnline ? "Atendimento Online" : "Local"),
          address: wp.address || "",
          neighborhood: wp.neighborhood || "",
          number: wp.number || "",
          complement: wp.complement || "",
          city: wp.city || "",
          state: wp.state || "",
        });
        setIsAddressDirty(false);

        // Map schedule from minutes to time strings if available
        if (wp.schedule) {
          const newSchedule: Record<DayKey, DaySchedule> = {
            segunda: { working: true, start: '09:00', end: '18:00' },
            terça: { working: true, start: '09:00', end: '18:00' },
            quarta: { working: true, start: '09:00', end: '18:00' },
            quinta: { working: true, start: '09:00', end: '18:00' },
            sexta: { working: true, start: '09:00', end: '18:00' },
            sábado: { working: false, start: '09:00', end: '12:00' },
            domingo: { working: false, start: '09:00', end: '12:00' },
          };
          let isFixo = true;
          let firstStart: string | null = null;
          let firstEnd: string | null = null;
          const mapDOW: Record<number, DayKey> = { 0: "domingo", 1: "segunda", 2: "terça", 3: "quarta", 4: "quinta", 5: "sexta", 6: "sábado" };

          const loadedDays: DayKey[] = [];
          Object.entries(wp.schedule as Record<string, WorkplaceScheduleEntry | null>).forEach(([dayIdx, val]) => {
            const numDay = Number(dayIdx);
            const dayKey = mapDOW[numDay];
            if (dayKey && val && val.startMinute !== null && val.endMinute !== null) {
              const startH = String(Math.floor(val.startMinute / 60)).padStart(2, "0");
              const startM = String(val.startMinute % 60).padStart(2, "0");
              const endH = String(Math.floor(val.endMinute / 60)).padStart(2, "0");
              const endM = String(val.endMinute % 60).padStart(2, "0");

              const startT = `${startH}:${startM}`;
              const endT = `${endH}:${endM}`;

              newSchedule[dayKey] = { working: true, start: startT, end: endT };
              loadedDays.push(dayKey);

              if (firstStart === null) {
                firstStart = startT;
                firstEnd = endT;
              } else if (firstStart !== startT || firstEnd !== endT) {
                isFixo = false;
              }
            } else if (dayKey) {
              newSchedule[dayKey] = { working: false, start: "09:00", end: "18:00" };
            }
          });

          setSchedule(newSchedule);

          if (isFixo && loadedDays.length > 0) {
            setScheduleMode("fixo");
            setFixedDays(loadedDays);
            setFixedStart(firstStart!);
            setFixedEnd(firstEnd!);
          } else if (loadedDays.length > 0) {
            setScheduleMode("flexivel");
          }

          setIsScheduleDirty(false);
        }
      }
    }
  }, [id, userData, isEditing]);

  const toggleFixedDay = (day: DayKey) => {
    setIsScheduleDirty(true);
    setFixedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleScheduleChange = (day: DayKey, field: "working" | "start" | "end", value: string | boolean) => {
    setIsScheduleDirty(true);
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSaveAddress = async (): Promise<SaveSectionOutcome> => {
    if (!id) {
      showToast({
        label: 'Atenção',
        message: 'Esta ação só está disponível na edição de um local existente.',
        type: 'error',
      });
      return 'invalid';
    }

    if (!locationForm.address || !locationForm.city || !locationForm.state || !locationForm.neighborhood || !locationForm.number || !locationForm.name) {
      showToast({
        label: "Atenção",
        message: "Preencha todos os campos obrigatórios do endereço (incluindo apelido).",
        type: "error",
      });
      return 'invalid';
    }

    try {
      await updateWorkplaceAddress({
        id,
        payload: {
          nickname: locationForm.name.trim(),
          address: locationForm.address.trim(),
          number: locationForm.number.trim(),
          neighborhood: locationForm.neighborhood.trim(),
          city: locationForm.city.trim(),
          state: locationForm.state.trim(),
          complement: locationForm.complement?.trim() || '',
        },
      });

      setIsAddressDirty(false);
      return 'saved';
    } catch {
      return 'failed';
    }
  };

  const handleSaveSchedule = async (): Promise<SaveSectionOutcome> => {
    if (!id) {
      showToast({
        label: 'Atenção',
        message: 'Esta ação só está disponível na edição de um local existente.',
        type: 'error',
      });
      return 'invalid';
    }

    if (scheduleMode === "fixo" && fixedDays.length === 0) {
      showToast({
        label: "Atenção",
        message: "Selecione ao menos um dia da semana.",
        type: "error",
      });
      return 'invalid';
    }

    if (scheduleMode === "flexivel") {
      const isAnyWorking = Object.values(schedule).some((d) => d.working);
      if (!isAnyWorking) {
        showToast({
          label: "Atenção",
          message: "Ative ao menos um dia da semana.",
          type: "error",
        });
        return 'invalid';
      }

      const hasInvalidRange = Object.values(schedule)
        .filter((day) => day.working)
        .some((day) => !isTimeRangeValid(day.start, day.end));

      if (hasInvalidRange) {
        showToast({
          label: 'Atenção',
          message: 'Revise os horários: o término precisa ser maior que o início.',
          type: 'error',
        });
        return 'invalid';
      }
    }

    if (scheduleMode === 'fixo' && !isTimeRangeValid(fixedStart, fixedEnd)) {
      showToast({
        label: 'Atenção',
        message: 'Revise os horários: o término precisa ser maior que o início.',
        type: 'error',
      });
      return 'invalid';
    }

    const payloadSchedule: WorkplaceSchedule = {
      '0': { startMinute: null, endMinute: null },
      '1': { startMinute: null, endMinute: null },
      '2': { startMinute: null, endMinute: null },
      '3': { startMinute: null, endMinute: null },
      '4': { startMinute: null, endMinute: null },
      '5': { startMinute: null, endMinute: null },
      '6': { startMinute: null, endMinute: null },
    };

    if (scheduleMode === 'fixo') {
      const startMinute = mapTimeToMinute(fixedStart);
      const endMinute = mapTimeToMinute(fixedEnd);

      if (startMinute === null || endMinute === null) {
        showToast({
          label: 'Atenção',
          message: 'Não foi possível interpretar os horários informados.',
          type: 'error',
        });
        return 'invalid';
      }

      fixedDays.forEach((day) => {
        payloadSchedule[String(DAY_TO_INDEX[day])] = {
          startMinute,
          endMinute,
        };
      });
    }

    if (scheduleMode === 'flexivel') {
      (Object.keys(schedule) as DayKey[]).forEach((day) => {
        const dayData = schedule[day];
        if (!dayData.working) return;

        const startMinute = mapTimeToMinute(dayData.start);
        const endMinute = mapTimeToMinute(dayData.end);

        if (startMinute === null || endMinute === null) return;

        payloadSchedule[String(DAY_TO_INDEX[day])] = {
          startMinute,
          endMinute,
        };
      });
    }

    try {
      await updateWorkplaceSchedule({
        id,
        payload: {
          schedule: payloadSchedule,
        },
      });

      setIsScheduleDirty(false);
      return 'saved';
    } catch {
      return 'failed';
    }
  };

  const hasUnsavedChanges = isAddressDirty || isScheduleDirty;
  const isSavingAny = isSavingAddress || isSavingSchedule || isCreatingWorkplace || isCreatingOnlineWorkplace;

  const buildSchedulePayload = (): WorkplaceSchedule | null => {
    if (scheduleMode === 'fixo' && fixedDays.length === 0) {
      showToast({
        label: 'Atenção',
        message: 'Selecione ao menos um dia da semana.',
        type: 'error',
      });
      return null;
    }

    if (scheduleMode === 'flexivel') {
      const isAnyWorking = Object.values(schedule).some((d) => d.working);
      if (!isAnyWorking) {
        showToast({
          label: 'Atenção',
          message: 'Ative ao menos um dia da semana.',
          type: 'error',
        });
        return null;
      }

      const hasInvalidRange = Object.values(schedule)
        .filter((day) => day.working)
        .some((day) => !isTimeRangeValid(day.start, day.end));

      if (hasInvalidRange) {
        showToast({
          label: 'Atenção',
          message: 'Revise os horários: o término precisa ser maior que o início.',
          type: 'error',
        });
        return null;
      }
    }

    if (scheduleMode === 'fixo' && !isTimeRangeValid(fixedStart, fixedEnd)) {
      showToast({
        label: 'Atenção',
        message: 'Revise os horários: o término precisa ser maior que o início.',
        type: 'error',
      });
      return null;
    }

    const payloadSchedule: WorkplaceSchedule = {
      '0': { startMinute: null, endMinute: null },
      '1': { startMinute: null, endMinute: null },
      '2': { startMinute: null, endMinute: null },
      '3': { startMinute: null, endMinute: null },
      '4': { startMinute: null, endMinute: null },
      '5': { startMinute: null, endMinute: null },
      '6': { startMinute: null, endMinute: null },
    };

    if (scheduleMode === 'fixo') {
      const startMinute = mapTimeToMinute(fixedStart);
      const endMinute = mapTimeToMinute(fixedEnd);

      if (startMinute === null || endMinute === null) {
        showToast({
          label: 'Atenção',
          message: 'Não foi possível interpretar os horários informados.',
          type: 'error',
        });
        return null;
      }

      fixedDays.forEach((day) => {
        payloadSchedule[String(DAY_TO_INDEX[day])] = {
          startMinute,
          endMinute,
        };
      });
    }

    if (scheduleMode === 'flexivel') {
      (Object.keys(schedule) as DayKey[]).forEach((day) => {
        const dayData = schedule[day];
        if (!dayData.working) return;

        const startMinute = mapTimeToMinute(dayData.start);
        const endMinute = mapTimeToMinute(dayData.end);

        if (startMinute === null || endMinute === null) return;

        payloadSchedule[String(DAY_TO_INDEX[day])] = {
          startMinute,
          endMinute,
        };
      });
    }

    return payloadSchedule;
  };

  const handleSaveAll = async () => {
    if (!hasUnsavedChanges) {
      showToast({
        label: 'Nada para salvar',
        message: 'Você ainda não fez alterações nesta tela.',
        type: 'warning',
      });
      return;
    }

    if (!isEditing) {
      if (!attendOnline && (!locationForm.address || !locationForm.city || !locationForm.state || !locationForm.neighborhood || !locationForm.number || !locationForm.name)) {
        showToast({
          label: 'Atenção',
          message: 'Preencha todos os campos obrigatórios do endereço (incluindo apelido).',
          type: 'error',
        });
        return;
      }

      const payloadSchedule = buildSchedulePayload();
      if (!payloadSchedule) return;

      try {
        if (attendOnline) {
          await createOnlineWorkplace({
            nickname: locationForm.name?.trim() || 'Atendimento Online',
            schedule: payloadSchedule,
          });
        } else {
          await createWorkplace({
            nickname: locationForm.name?.trim() || "",
            address: locationForm.address?.trim() || "",
            number: locationForm.number?.trim() || "",
            neighborhood: locationForm.neighborhood?.trim() || "",
            city: locationForm.city?.trim() || "",
            state: locationForm.state?.trim() || "",
            complement: locationForm.complement?.trim() || "",
            schedule: payloadSchedule,
          });
        }

        setIsAddressDirty(false);
        setIsScheduleDirty(false);
        refreshUser();

        showToast({
          label: 'Sucesso',
          message: 'Local criado com sucesso.',
          type: 'success',
        });

        navigate('/settings');
      } catch (error: unknown) {
        const apiMessage = (error as { response?: { data?: { error?: string } } })?.response?.data?.error;
        showToast({
          label: 'Erro ao criar local',
          message: apiMessage || 'Não foi possível criar o local.',
          type: 'error',
        });
      }

      return;
    }

    const savedSections: string[] = [];
    const invalidSections: string[] = [];
    const failedSections: string[] = [];

    if (isAddressDirty) {
      const result = await handleSaveAddress();
      if (result === 'saved') savedSections.push('endereço');
      if (result === 'invalid') invalidSections.push('endereço');
      if (result === 'failed') failedSections.push('endereço');
    }

    if (isScheduleDirty) {
      const result = await handleSaveSchedule();
      if (result === 'saved') savedSections.push('horários');
      if (result === 'invalid') invalidSections.push('horários');
      if (result === 'failed') failedSections.push('horários');
    }

    if (savedSections.length > 0) {
      refreshUser();
    }

    if (savedSections.length > 0 && failedSections.length === 0) {
      showToast({
        label: 'Sucesso',
        message: `Alterações salvas: ${savedSections.join(' e ')}.`,
        type: 'success',
      });
      return;
    }

    if (savedSections.length > 0 && failedSections.length > 0) {
      showToast({
        label: 'Salvo parcialmente',
        message: `Salvo: ${savedSections.join(' e ')}. Falhou: ${failedSections.join(' e ')}.`,
        type: 'warning',
      });
      return;
    }

    if (failedSections.length > 0) {
      showToast({
        label: 'Erro ao salvar',
        message: `Não foi possível salvar: ${failedSections.join(' e ')}.`,
        type: 'error',
      });
      return;
    }

    if (invalidSections.length > 0) {
      showToast({
        label: 'Revisar dados',
        message: `Existem campos inválidos em: ${invalidSections.join(' e ')}.`,
        type: 'warning',
      });
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto p-6 md:p-8 space-y-8 pt-2!">
        
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" onClick={() => navigate('/settings')} className="px-2">
            <ArrowLeft className="w-5 h-5 text-slate-800" /> Voltar
          </Button>
        </div>

        {!isEditing && (
          <div className="border border-border rounded-lg bg-card shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Qual é o tipo deste local?</h2>
              <p className="text-sm text-muted-foreground mt-1">Selecione se os atendimentos neste local serão presenciais ou remotos.</p>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <CustomRadioInput
                  label="Endereço Físico"
                  htmlFor="tipoFisico"
                  name="tipoLocal"
                  Icon={Building2}
                  value="fisico"
                  checked={!attendOnline}
                  subtitle="Consultório ou escritório físico"
                  onChange={() => {
                    setAttendOnline(false);
                    setIsAddressDirty(true);
                  }}
                />
              </div>
              <div className="flex-1">
                <CustomRadioInput
                  label="Atendimento Online"
                  htmlFor="tipoOnline"
                  name="tipoLocal"
                  Icon={Globe}
                  value="online"
                  checked={attendOnline}
                  subtitle="Atendimentos remotos por vídeo"
                  onChange={() => {
                    setAttendOnline(true);
                    setIsAddressDirty(true);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Formulário do Local */}
        {!attendOnline ? (
          <div className="border border-border rounded-lg bg-card shadow-sm p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h2 className="text-lg font-semibold">Endereço do Local</h2>
                <p className="text-sm text-muted-foreground mt-1">Preencha os dados de localização física do consultório/escritório.</p>
              </div>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getSectionStatusClass(isAddressDirty, isSavingAddress)}`}>
                {getSectionStatusLabel(isAddressDirty, isSavingAddress)}
              </span>
            </div>

            <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3">
                <div className="md:col-span-1">
                  <Input
                    type="text"
                    label="Apelido do Local"
                    value={locationForm.name}
                    onChange={(e) => setLocationForm((p) => ({ ...p, name: e.target.value }))}
                    onInput={() => setIsAddressDirty(true)}
                    tooltipMessage="Este campo se refere a como este endereço será chamado no sistema para facilitar suas interações."
                    required
                    isRequired
                  />
                </div>
              </div>
              <Input
                type="text"
                label="Endereço (Rua)"
                value={locationForm.address}
                onChange={(e) => setLocationForm((p) => ({ ...p, address: e.target.value }))}
                onInput={() => setIsAddressDirty(true)}
                required
                isRequired
              />
              <Input
                type="text"
                label="Número"
                value={locationForm.number}
                onChange={(e) => setLocationForm((p) => ({ ...p, number: e.target.value }))}
                onInput={() => setIsAddressDirty(true)}
                required
                isRequired
              />
              <Input
                type="text"
                label="Complemento (opcional)"
                value={locationForm.complement}
                onChange={(e) => setLocationForm((p) => ({ ...p, complement: e.target.value }))}
                onInput={() => setIsAddressDirty(true)}
              />
              
              <div className="space-y-2 relative">
                <Input
                  type="text"
                  label="Estado"
                  placeholder="Buscar estado"
                  value={stateSearchText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStateSearchText(val);
                    setIsAddressDirty(true);
                    if (!val) {
                      setLocationForm((p) => ({ ...p, state: "", city: "" }));
                      setCitySearchText("");
                    }
                  }}
                  onFocus={() => setShowStateSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowStateSuggestions(false), 200)}
                  required
                  isRequired
                />
                {showStateSuggestions && states.length > 0 && (
                  <div className="absolute top-[82px] left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <ul>
                      {states
                        .filter(st => st.nome.toLowerCase().includes(stateSearchText.toLowerCase()) || st.sigla.toLowerCase().includes(stateSearchText.toLowerCase()))
                        .map((st) => (
                          <li 
                            key={st.sigla}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-[#141736]"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setStateSearchText(st.nome);
                              setIsAddressDirty(true);
                              setLocationForm((p) => ({ ...p, state: st.sigla, city: "" }));
                              setShowStateSuggestions(false);
                            }}
                          >
                            {st.nome} - {st.sigla}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-2 relative">
                <Input
                  type="text"
                  label="Cidade"
                  placeholder={locationForm.state ? "Buscar cidade" : "Escolha o estado primeiro"}
                  disabled={!locationForm.state}
                  value={citySearchText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCitySearchText(val);
                    setIsAddressDirty(true);
                    if (!val) setLocationForm((p) => ({ ...p, city: "" }));
                  }}
                  onFocus={() => setShowCitySuggestions(true)}
                  onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                  required
                  isRequired
                />
                {showCitySuggestions && cities.length > 0 && (
                  <div className="absolute top-[82px] left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <ul>
                      {cities
                        .filter(c => c.nome.toLowerCase().includes(citySearchText.toLowerCase()))
                        .map((city, idx) => (
                          <li 
                            key={`${city.nome}-${idx}`}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-[#141736]"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setCitySearchText(city.nome);
                              setIsAddressDirty(true);
                              setLocationForm((p) => ({ ...p, city: city.nome }));
                              setShowCitySuggestions(false);
                            }}
                          >
                            {city.nome}
                          </li>
                        ))}
                    </ul>         
                  </div>
                )}
              </div>

              <Input
                type="text"
                label="Bairro"
                value={locationForm.neighborhood || ""}
                onChange={(e) => setLocationForm((p) => ({ ...p, neighborhood: e.target.value }))}
                onInput={() => setIsAddressDirty(true)}
                required
                isRequired
              />

            </div>
          </div>
        ) : (
          <div className="border border-blue-100 rounded-lg bg-blue-50/50 shadow-sm p-6 space-y-2">
            <h2 className="text-lg font-semibold text-blue-900 border-b border-blue-200 pb-2">Atendimento Online</h2>
            <p className="text-sm text-blue-700">Este local é destinado exclusivamente a atendimentos online. Edite os horários de sua disponibilidade abaixo.</p>
          </div>
        )}

        {/* Step 3 - Horários */}
        <div className="border border-border rounded-lg bg-card shadow-sm p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 mb-4">
            <div>
               <h2 className="text-lg font-semibold">Horários de Atendimento</h2>
               <p className="text-sm text-muted-foreground mt-1">Configure o horário específico de atendimento no local.</p>
            </div>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getSectionStatusClass(isScheduleDirty, isSavingSchedule)}`}>
              {getSectionStatusLabel(isScheduleDirty, isSavingSchedule)}
            </span>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <CustomRadioInput
                label="Horário Fixo"
                htmlFor="horarioFixo"
                name="tipoHorario"
                Icon={undefined}
                value="fixo"
                checked={scheduleMode === "fixo"}
                subtitle="Sempre o mesmo horário"
                onChange={() => {
                  setIsScheduleDirty(true);
                  setScheduleMode("fixo");
                }}
              />
            </div>
            <div className="flex-1">
              <CustomRadioInput
                label="Horário Flexível"
                htmlFor="flexivel"
                name="tipoHorario"
                Icon={undefined}
                value="flexivel"
                checked={scheduleMode === "flexivel"}
                subtitle="Horários diferentes por dia"
                onChange={() => {
                  setIsScheduleDirty(true);
                  setScheduleMode("flexivel");
                }}
              />
            </div>
          </div>

          {scheduleMode === "fixo" && (
            <div className="mt-6 grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-4">
                <p className="font-semibold text-slate-800">Selecione o horário:</p>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Início</Label>
                    <Input
                      type="time"
                      value={fixedStart}
                      onChange={(e) => {
                        setIsScheduleDirty(true);
                        setFixedStart(e.target.value);
                      }}
                    />
                  </div>
                  <span className="mt-6">-</span>
                  <div className="flex flex-col gap-2">
                    <Label>Término</Label>
                    <Input
                      type="time"
                      value={fixedEnd}
                      onChange={(e) => {
                        setIsScheduleDirty(true);
                        setFixedEnd(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
              <p className="font-semibold text-slate-800 mt-2">Dias da semana:</p>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {(
                  [
                    "segunda",
                    "terça",
                    "quarta",
                    "quinta",
                    "sexta",
                    "sábado",
                    "domingo",
                  ] as DayKey[]
                ).map((d) => {
                  const isSelected = fixedDays.includes(d);
                  return (
                    <div
                      key={d}
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleFixedDay(d)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleFixedDay(d);
                        }
                      }}
                      className={`flex items-center gap-4 border p-4 rounded-lg transition-discrete cursor-pointer ${
                        !isSelected
                          ? "bg-gray-50 border-gray-200"
                          : "bg-white border-blue-200 shadow-sm ring-1 ring-blue-500/20"
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleFixedDay(d)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="capitalize font-medium text-slate-700">{d}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {scheduleMode === "flexivel" && (
            <div className="mt-6 flex flex-col gap-3">
              <p className="font-semibold text-slate-800 mb-2">Configure cada dia:</p>
              {(Object.keys(schedule) as DayKey[]).map((day) => {
                const isWorking = Boolean(schedule[day].working);
                return (
                  <div
                    key={day}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      handleScheduleChange(day, "working", !isWorking)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleScheduleChange(day, "working", !isWorking);
                      }
                    }}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border px-4 py-3 rounded-lg transition-discrete cursor-pointer ${
                      !isWorking
                        ? "bg-gray-50 border-gray-200"
                        : "bg-white border-blue-200 shadow-sm ring-1 ring-blue-500/20"
                    }`}
                  >
                    <div
                      className="flex items-center gap-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={schedule[day].working}
                        onCheckedChange={(v) =>
                          handleScheduleChange(day, "working", Boolean(v))
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="w-32 capitalize font-medium text-slate-700">{day}</div>
                    </div>

                    <div
                      className={`flex items-center gap-2 ${
                        !isWorking ? "opacity-50 pointer-events-none" : ""
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        type="time"
                        value={schedule[day].start}
                        onChange={(e) =>
                          handleScheduleChange(day, "start", e.target.value)
                        }
                        disabled={!isWorking}
                        className="w-32"
                      />
                      <span className="text-slate-400 font-medium">-</span>
                      <Input
                        type="time"
                        value={schedule[day].end}
                        onChange={(e) =>
                          handleScheduleChange(day, "end", e.target.value)
                        }
                        disabled={!isWorking}
                        className="w-32"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        <div className="sticky bottom-4 z-30 rounded-xl border border-slate-200 bg-white/95 backdrop-blur px-4 py-3 shadow-md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              {hasUnsavedChanges
                ? 'Existem alterações pendentes nesta tela.'
                : 'Nenhuma alteração pendente.'}
            </p>
            <Button
              onClick={handleSaveAll}
              disabled={!hasUnsavedChanges || isSavingAny}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-44"
            >
              {isSavingAny ? (isEditing ? 'Salvando alterações...' : 'Salvando...') : (isEditing ? 'Salvar alterações' : 'Salvar')}
            </Button>
          </div>
        </div>



      </main>
    </div>
  );
}
