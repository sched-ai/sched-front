import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, Play, Pause, RotateCcw, Clock3, CalendarDays, FileText, ArrowLeft, XCircle } from "lucide-react";
import { useCreateAnnotation } from "@/hooks/api/useCreateAnnotation";
import { useGetAppointment } from "@/hooks/api/useGetAppointment";
import { useGetClient } from "@/hooks/api/useGetClient";
import { useGetService } from "@/hooks/api/useGetService";
import { PatientHeader } from "@/components/PatientHeader";

function calculateAge(birthDate: string | undefined): number | undefined {
  if (!birthDate) return undefined;
  const dob = new Date(birthDate);
  if (Number.isNaN(dob.getTime())) return undefined;
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}

function formatHHMMSS(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
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

function getStatusLabel(status?: string) {
  const normalized = status?.toLowerCase() || "";

  if (["concluido", "finished", "done"].includes(normalized)) return "Concluído";
  if (["agendado", "pending", "scheduled", "confirmed"].includes(normalized)) return "Agendado";
  if (["cancelado", "cancelled"].includes(normalized)) return "Cancelado";

  return status || "Desconhecido";
}

function getStatusVisual(status?: string) {
  const label = getStatusLabel(status);

  if (label === "Concluído") return { color: "text-green-600", dot: "bg-green-500" };
  if (label === "Agendado") return { color: "text-blue-600", dot: "bg-blue-500" };
  if (label === "Cancelado") return { color: "text-red-500", dot: "bg-red-500" };

  return { color: "text-slate-600", dot: "bg-slate-400" };
}

function ConsultationTimer({
  serviceId,
  startDate,
  endDate,
}: {
  serviceId?: string | null;
  startDate?: string;
  endDate?: string;
}) {
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
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();

      if (!Number.isNaN(start) && !Number.isNaN(end) && end > start) {
        minutes = Math.round((end - start) / 60000);
      }
    }

    if (minutes > 0) {
      const seconds = minutes * 60;
      setInitialSeconds(seconds);

      if (!runningRef.current) {
        setTimerSeconds(seconds);
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
      setTimerSeconds((seconds) => {
        const next = seconds - 1;

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
  }, [initialSeconds, running, startTimer, stopInterval]);

  const handleReset = useCallback(() => {
    stopInterval();
    setRunning(false);
    setTimerSeconds(initialSeconds);
  }, [initialSeconds, stopInterval]);

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Duração da consulta</p>
          <div className="text-slate-900 font-mono text-3xl">
            {isLoading ? "..." : initialSeconds === 0 ? "--:--:--" : formatHHMMSS(timerSeconds)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleTimer}
            disabled={initialSeconds === 0}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition ${
              initialSeconds === 0
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            title={running ? "Pausar" : "Iniciar"}
          >
            {running ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            onClick={handleReset}
            disabled={!running && timerSeconds === initialSeconds}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition ${
              !running && timerSeconds === initialSeconds
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            title="Zerar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isLoading && initialSeconds === 0 && (
        <p className="text-sm text-slate-500">Sem duração configurada para este atendimento.</p>
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
    age:
      atendimentoState?.client?.age ||
      atendimentoState?.age ||
      calculateAge(atendimentoState?.client?.birthDate || atendimentoState?.birth) ||
      undefined,
    gender: atendimentoState?.client?.gender || atendimentoState?.gender || "",
    especialidade: atendimentoState?.especialidade || atendimentoState?.specialty || "",
    data: atendimentoState?.startDate?.split("T")[0] || atendimentoState?.data || atendimentoState?.date || "",
    hora:
      atendimentoState?.startDate?.split("T")[1]?.substring(0, 5) ||
      atendimentoState?.hora ||
      atendimentoState?.time ||
      "",
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
        setPatient((current: any) => ({ ...current, ...atendimentoState }));
      }
    } catch {
      if (atendimentoPrevRef.current !== atendimentoState) {
        atendimentoPrevRef.current = atendimentoState as any;
        setPatient((current: any) => ({ ...current, ...atendimentoState }));
      }
    }
  }, [atendimentoState]);

  const [annotationText, setAnnotationText] = useState<string>("");
  const { data: fetchedAppointment, refetch: refetchAppointment, isLoading } = useGetAppointment(id || "", !!id);

  const clientId = fetchedAppointment?.clientId || fetchedAppointment?.client?.id || patient.clientId || "";
  const { data: fullClientData } = useGetClient(clientId, !!clientId);

  const { mutateAsync: createAnnotation, isPending: isCreatingAnnotation } = useCreateAnnotation({
    onSuccessFn: () => {
      refetchAppointment();
    },
  });

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

  const isCancelledState = patient.status && ["cancelado", "cancelled"].includes(patient.status.toLowerCase());
  const isCancelledFetched =
    fetchedAppointment?.status && ["cancelado", "cancelled"].includes(fetchedAppointment.status.toLowerCase());
  const isCancelled = isCancelledState || isCancelledFetched;
  const statusVisual = getStatusVisual(fetchedAppointment?.status || patient.status);
  const statusLabel = getStatusLabel(fetchedAppointment?.status || patient.status);

  if (isLoading && !fetchedAppointment && !patient.status) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm px-6 py-10 text-center text-slate-500">
            Carregando atendimento...
          </div>
        </div>
      </div>
    );
  }

  if (isCancelled) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-[2rem] text-slate-900">Detalhes do Atendimento</h1>
            <p className="text-muted-foreground mt-1">Acompanhe as informações do atendimento e o histórico do paciente.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm px-6 py-10 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="w-7 h-7 text-red-500" strokeWidth={1.5} />
            </div>
            <h2 className="text-slate-900 mb-2">Atendimento cancelado</h2>
            <p className="text-slate-500 mb-6">Não é possível visualizar os detalhes de um atendimento que foi cancelado.</p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate(-1)}>
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-[2rem] text-slate-900">Detalhes do Atendimento</h1>
            <p className="text-muted-foreground mt-1">Acompanhe as informações do atendimento e registre observações de forma organizada.</p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 self-start border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 h-10 px-4 whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>

        <PatientHeader
          name={patient.name}
          age={patient.age}
          birthDate={patient.birth}
          gender={patient.gender}
          cpf={patient.cpf}
          phone={patient.phone}
          action={
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 h-11 min-w-[160px] flex items-center justify-center whitespace-nowrap rounded-xl"
              onClick={() => {
                const selectedClientId =
                  patient.clientId ||
                  fetchedAppointment?.clientId ||
                  fetchedAppointment?.client?.id ||
                  (location.state as any)?.atendimento?.clientId ||
                  (location.state as any)?.paciente?.id;

                if (selectedClientId) {
                  navigate(`/patients/${selectedClientId}/history`, { state: { paciente: patient } });
                } else {
                  console.warn("Client ID not found for navigation. Check fetchedAppointment object.", {
                    fetchedAppointment,
                    patient,
                    state: location.state,
                  });
                }
              }}
            >
              <span className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </span>
              <span>Ver histórico</span>
            </Button>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-6">
            <ConsultationTimer
              serviceId={
                fetchedAppointment?.serviceId ||
                (location.state as any)?.atendimento?.serviceId ||
                (location.state as any)?.atendimento?.service?.id
              }
              startDate={fetchedAppointment?.startDate || (location.state as any)?.atendimento?.startDate}
              endDate={fetchedAppointment?.endDate || (location.state as any)?.atendimento?.endDate}
            />

            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Resumo</p>
                <p className="text-slate-900">{fetchedAppointment?.service?.name || "Atendimento"}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <CalendarDays className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                  <span>{formatDisplayDate(fetchedAppointment?.startDate || patient.data || "")}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock3 className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                  <span>{fetchedAppointment?.startDate?.split("T")[1]?.substring(0, 5) || patient.hora || ""}</span>
                </div>
                <div className={`inline-flex items-center gap-1.5 ${statusVisual.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusVisual.dot}`} />
                  {statusLabel}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Observação inicial</p>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {fetchedAppointment?.description || "Sem observações registradas para este atendimento."}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-slate-900">Notas do atendimento</h2>
                <p className="text-muted-foreground text-sm mt-1">Registre ou atualize as observações deste atendimento.</p>
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                <Clock3 className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                <span>
                  {formatDisplayDate(fetchedAppointment?.startDate || patient.data || "")} •{" "}
                  {(fetchedAppointment?.startDate?.split("T")[1]?.substring(0, 5) || patient.hora || "")}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2 text-slate-700 mb-2">
                  <FileText className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                  <span className="text-sm">Anotação</span>
                </div>
                <textarea
                  value={annotationText}
                  onChange={(e) => setAnnotationText(e.target.value)}
                  className="w-full min-h-[220px] rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition resize-y"
                  placeholder="Adicione uma observação relevante sobre o atendimento..."
                />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAnnotationText("")}
                className="h-10 min-w-[88px] px-5 whitespace-nowrap border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              >
                Limpar
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  if (!annotationText.trim()) return;
                  const appointmentId = fetchedAppointment?.id || id || "";
                  const selectedClientId =
                    patient.clientId || clientId || fetchedAppointment?.clientId || fetchedAppointment?.client?.id || "";

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
                className="h-10 min-w-[88px] px-5 whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                disabled={isCreatingAnnotation}
              >
                {isCreatingAnnotation ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
