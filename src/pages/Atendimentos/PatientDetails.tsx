import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, User, Play, Pause, RotateCcw } from "lucide-react";
import { useCreateAnnotation } from "@/hooks/api/useCreateAnnotation";
import { useGetAppointment } from "@/hooks/api/useGetAppointment";
import { useGetClient } from "@/hooks/api/useGetClient";
import { useGetService } from "@/hooks/api/useGetService";

function calculateAge(birthDate: string | undefined): number | undefined {
  if (!birthDate) return undefined;
  const dob = new Date(birthDate);
  if (isNaN(dob.getTime())) return undefined;
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs); 
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}

function formatHHMMSS(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function formatDisplayDate(dateValue?: string) {
  if (!dateValue) return "";

  const dateOnly = dateValue.split("T")[0];
  const isoMatch = dateOnly.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}/${month}/${year}`;
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return dateValue;

  return parsedDate.toLocaleDateString("pt-BR");
}

function ConsultationTimer({ serviceId, startDate, endDate }: { serviceId?: string | null; startDate?: string; endDate?: string }) {
  const { data: service, isLoading } = useGetService(serviceId ?? "", !!serviceId);

  const [initialSeconds, setInitialSeconds] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  runningRef.current = running;

  useEffect(() => {
    let minutes = 0;
    if (service?.duration) {
      minutes = service.duration;
    } else if (startDate && endDate) {
      const s = new Date(startDate).getTime();
      const e = new Date(endDate).getTime();
      if (!isNaN(s) && !isNaN(e) && e > s) {
        minutes = Math.round((e - s) / 60000);
      }
    }

    if (minutes > 0) {
      const secs = minutes * 60;
      setInitialSeconds(secs);
      if (!runningRef.current) {
        setTimerSeconds(secs);
      }
    }
  }, [service?.duration, startDate, endDate]);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopInterval();
    intervalRef.current = window.setInterval(() => {
      setTimerSeconds((s) => {
        const next = s - 1;
        if (next <= 0) {
          if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setRunning(false);
          return 0;
        }
        return next;
      });
    }, 1000);
  }, [stopInterval]);

  const handleToggleTimer = useCallback(() => {
    if (initialSeconds === 0) return;

    if (running) {
      stopInterval();
      setRunning(false);
      return;
    }

    setTimerSeconds((prev) => (prev === 0 ? initialSeconds : prev));
    setRunning(true);
    startTimer();
  }, [running, initialSeconds, startTimer, stopInterval]);

  const handleReset = useCallback(() => {
    stopInterval();
    setRunning(false);
    setTimerSeconds(initialSeconds);
  }, [initialSeconds, stopInterval]);

  return (
    <div className="relative w-full max-w-[560px] rounded-xl border border-[#d7e3ff] bg-gradient-to-r from-white to-[#f4f8ff] shadow-[0_16px_40px_-14px_rgba(11,59,140,0.45)] px-5 py-3.5">
      <div className="pointer-events-none absolute -inset-1 -z-10 rounded-2xl bg-[#0b3b8c]/10 blur-md" />
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
            DuraÃ§Ã£o da consulta
          </p>
          <div className="font-mono text-2xl leading-tight text-[#0b3b8c] mt-1 select-none">
            {isLoading ? (
              <span className="text-lg text-slate-400">...</span>
            ) : initialSeconds === 0 ? (
              <span className="text-lg text-slate-400">--:--:--</span>
            ) : (
              <span>{formatHHMMSS(timerSeconds)}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleTimer}
            disabled={initialSeconds === 0}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
              initialSeconds === 0
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-[#0b3b8c] text-white hover:bg-[#093077]"
            }`}
            title={running ? "Pausar" : "Iniciar"}
          >
            {running ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
          </button>

          <button
            onClick={handleReset}
            disabled={!running && timerSeconds === initialSeconds}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
              !running && timerSeconds === initialSeconds
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-amber-500 text-white hover:bg-amber-600"
            }`}
            title="Zerar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isLoading && initialSeconds === 0 && (
        <p className="text-xs text-slate-500 mt-2">Sem duraÃ§Ã£o configurada para este atendimento.</p>
      )}
    </div>
  );
}

export const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const navData: any = (location && (location.state as any)) || null;
  const atendimentoState = navData?.atendimento || navData;

  const [patient, setPatient] = useState<any>(() => ({
    id: id || "1",
    clientId: atendimentoState?.clientId || atendimentoState?.client?.id || "",
    name: atendimentoState?.clientName || atendimentoState?.client?.name || atendimentoState?.paciente || "",
    cpf: atendimentoState?.client?.cpf || atendimentoState?.cpf || atendimentoState?.document || "",
    phone: atendimentoState?.client?.phone || atendimentoState?.phone || atendimentoState?.telefone || "",
    email: atendimentoState?.client?.email || atendimentoState?.email || "",
    address: atendimentoState?.client?.address || atendimentoState?.address || "",
    birth: atendimentoState?.client?.birthDate || atendimentoState?.birth || "",
    age: atendimentoState?.client?.age || atendimentoState?.age || calculateAge(atendimentoState?.client?.birthDate || atendimentoState?.birth) || undefined,
    gender: atendimentoState?.client?.gender || atendimentoState?.gender || "",
    especialidade: atendimentoState?.especialidade || atendimentoState?.specialty || "",
    data: atendimentoState?.startDate?.split('T')[0] || atendimentoState?.data || atendimentoState?.date || "",
    hora: atendimentoState?.startDate?.split('T')[1]?.substring(0,5) || atendimentoState?.hora || atendimentoState?.time || "",
    medico: atendimentoState?.employee?.name || atendimentoState?.medico || "",
    status: atendimentoState?.status || "",
    tipoConsulta: atendimentoState?.service?.name || atendimentoState?.tipoConsulta || "",
  }));
  const atendimentoPrevRef = useRef<string | any>(null);

  useEffect(() => {
    if (!atendimentoState) return;
    try {
      const serialized = JSON.stringify(atendimentoState);
      if (atendimentoPrevRef.current !== serialized) {
        atendimentoPrevRef.current = serialized;
        setPatient((p: any) => ({ ...p, ...atendimentoState }));
      }
    } catch (err) {
      if (atendimentoPrevRef.current !== atendimentoState) {
        atendimentoPrevRef.current = atendimentoState as any;
        setPatient((p: any) => ({ ...p, ...atendimentoState }));
      }
    }
  }, [atendimentoState]);

  const [annotationText, setAnnotationText] = useState<string>("");
  // We use useGetAppointment to fetch fresh data
  const { data: fetchedAppointment, refetch: refetchAppointment, isLoading } = useGetAppointment(id || "", !!id);

  // Derive clientId from appointment, then fetch the FULL client record directly by ID
  const clientId = fetchedAppointment?.clientId || fetchedAppointment?.client?.id || patient.clientId || "";
  const { data: fullClientData } = useGetClient(clientId, !!clientId);

  const { mutateAsync: createAnnotation, isPending: isCreatingAnnotation } = useCreateAnnotation({
    onSuccessFn: () => {
      refetchAppointment();
    }
  });

  // Update patient when full client data arrives
  useEffect(() => {
    if (fullClientData) {
      setPatient((prev: any) => ({
        ...prev,
        clientId: fullClientData.id || prev.clientId,
        name: fullClientData.name || prev.name,
        cpf: fullClientData.cpf || prev.cpf,
        phone: fullClientData.phone || prev.phone,
        email: fullClientData.email || prev.email,
        gender: fullClientData.gender || prev.gender,
        age: (fullClientData as any).age || calculateAge((fullClientData as any).birthDate) || prev.age,
        birth: (fullClientData as any).birthDate || prev.birth,
      }));
    }
  }, [fullClientData]);

  useEffect(() => {
    if (fetchedAppointment) {
       // Update component state with appointment data
       setPatient((prev: any) => ({
         ...prev,
         clientId: fetchedAppointment.clientId || fetchedAppointment.client?.id || prev.clientId,
         name: fetchedAppointment.client?.name || fetchedAppointment.clientName || prev.name,
       }));
    }
  }, [fetchedAppointment]);

  useEffect(() => {
    const firstAnnotation = fetchedAppointment?.annotations?.[0];
    setAnnotationText(firstAnnotation?.content || "");
  }, [fetchedAppointment]);

  const isCancelledState = patient.status && ['cancelado', 'cancelled'].includes(patient.status.toLowerCase());
  const isCancelledFetched = fetchedAppointment?.status && ['cancelado', 'cancelled'].includes(fetchedAppointment.status.toLowerCase());
  const isCancelled = isCancelledState || isCancelledFetched;

  if (isLoading && !fetchedAppointment && !patient.status) {
    return (
      <div className="w-full flex flex-col h-full flex-1 items-center justify-center p-6">
         <p className="text-slate-500 text-lg">Carregando...</p>
      </div>
    );
  }

  if (isCancelled) {
    return (
      <div className="w-full flex flex-col h-full flex-1 items-center justify-center p-6">
        <div className="bg-white rounded-[20px] shadow-custom p-8 text-center max-w-md w-full border-t-4 border-red-500">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#141736] mb-2">Atendimento Cancelado</h2>
          <p className="text-slate-500 mb-8">NÃ£o Ã© possÃ­vel visualizar os detalhes de um atendimento que foi cancelado.</p>
          <Button 
            className="bg-[#141736] hover:bg-[#282d64] text-white w-full h-[48px] text-base rounded-[8px]"
            onClick={() => navigate(-1)}
          >
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full">
      <main className="flex-1 p-6">
        <div className="bg-white rounded-[20px] shadow-custom p-6 flex items-center relative overflow-hidden mb-6">
           <div className="absolute left-0 top-0 bottom-0 w-3 bg-[#141736]"></div>
           <div className="flex items-center justify-between w-full ml-4">
             <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full border-4 border-[#141736] flex items-center justify-center bg-white text-[#141736]"> 
                  <User className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#141736]">{patient.name}</h1>
                  <p className="text-slate-600 mt-1 text-sm">
                    {patient.age ? `Idade: ${patient.age} anos | ` : ''} 
                    {patient.gender ? `${patient.gender} | ` : ''} 
                    {patient.cpf ? `CPF: ${patient.cpf} | ` : ''} 
                    {patient.phone ? `Tel: ${patient.phone}` : ''}
                  </p>
                </div>
             </div>
             <div className="shrink-0">
              <Button
                size="sm"
                className="bg-[#121535] text-white px-4 py-2 w-[170px] relative overflow-hidden flex items-center justify-center cursor-pointer"
                onClick={() => {
                  const selectedClientId = patient.clientId || fetchedAppointment?.clientId || fetchedAppointment?.client?.id || (location.state as any)?.atendimento?.clientId || (location.state as any)?.paciente?.id;

                  if (selectedClientId) {
                    navigate(`/patients/${selectedClientId}/history`, { state: { paciente: patient } });
                  } else {
                    console.warn("Client ID not found for navigation. Check fetchedAppointment object.", { fetchedAppointment, patient, state: location.state });
                  }
                }}
              >
                <span className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </span>
                <span>Ver HistÃ³rico</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-6 bg-[#F6F8FB] rounded-[14px] border border-slate-200 p-4 flex items-center justify-center">
          <div className="w-full lg:w-auto flex flex-col items-center">
            <ConsultationTimer
              serviceId={fetchedAppointment?.serviceId || (location.state as any)?.atendimento?.serviceId || (location.state as any)?.atendimento?.service?.id}
              startDate={fetchedAppointment?.startDate || (location.state as any)?.atendimento?.startDate}
              endDate={fetchedAppointment?.endDate || (location.state as any)?.atendimento?.endDate}
            />
          </div>
        </div>

        {/* Consultation card with single annotation input */}
        <div className="space-y-6">
          <div className="bg-white rounded-[10px] shadow-custom p-6 border-2">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-lg font-bold text-[#0f1724]">
                  {fetchedAppointment?.service?.name || "Atendimento"}
                </div>
              </div>
              <div className="text-sm text-slate-600">
                {formatDisplayDate(fetchedAppointment?.startDate || patient.data || "")} • {(fetchedAppointment?.startDate?.split('T')[1]?.substring(0,5) || patient.hora || "")}
              </div>
            </div>

            <div className="mt-4 bg-white p-4 rounded-md border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-[#141736]">Notas do Atendimento</h4>
              </div>
              <textarea
                value={annotationText}
                onChange={(e) => setAnnotationText(e.target.value)}
                className="w-full p-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#141736] text-sm text-slate-700 leading-relaxed resize-y min-h-[120px]"
                placeholder="Adicionar nota do atendimento..."
              />
              <div className="flex justify-end gap-3 mt-3">
                <Button
                  variant="ghost"
                  onClick={() => setAnnotationText("")}
                  className="text-slate-600 hover:text-slate-800"
                >
                  Limpar
                </Button>
                <Button
                  onClick={async () => {
                    if (!annotationText.trim()) return;
                    const appointmentId = fetchedAppointment?.id || id || "";
                    const selectedClientId = patient.clientId || clientId || fetchedAppointment?.clientId || fetchedAppointment?.client?.id || "";
                    if (!appointmentId || !selectedClientId) return;
                    try {
                      await createAnnotation({
                        appointmentId,
                        clientId: selectedClientId,
                        content: annotationText.trim(),
                      });
                    } catch (err) {
                      console.error("Failed to create annotation", err);
                    }
                  }}
                  className="bg-[#141736] text-white px-4 py-2 rounded-[8px]"
                  disabled={isCreatingAnnotation}
                >
                  {isCreatingAnnotation ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDetails;
