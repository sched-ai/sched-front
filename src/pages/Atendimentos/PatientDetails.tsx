import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Eye, EyeClosed } from "lucide-react";
import { useUpdateAppointment } from "@/hooks/api/useUpdateAppointment";
import { useGetAppointment } from "@/hooks/api/useGetAppointment";

function formatTime(totalSeconds: number) {
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

// function formatTime(totalSeconds: number) {
//   const h = Math.floor(totalSeconds / 3600)
//     .toString()
//     .padStart(2, "0");
//   const m = Math.floor((totalSeconds % 3600) / 60)
//     .toString()
//     .padStart(2, "0");
//   const s = Math.floor(totalSeconds % 60)
//     .toString()
//     .padStart(2, "0");
//   return `${h}:${m}:${s}`;
// }

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
    age: atendimentoState?.age || undefined,
    especialidade: atendimentoState?.especialidade || atendimentoState?.specialty || "",
    data: atendimentoState?.startDate?.split('T')[0] || atendimentoState?.data || atendimentoState?.date || "",
    hora: atendimentoState?.startDate?.split('T')[1]?.substring(0,5) || atendimentoState?.hora || atendimentoState?.time || "",
    medico: atendimentoState?.professional?.user?.name || atendimentoState?.medico || "",
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

  const [timerSeconds, setTimerSeconds] = useState(30 * 60); // default 30 minutes
  const [running, setRunning] = useState(false);
  // timer editing / initial value
  const [initialSeconds, setInitialSeconds] = useState(timerSeconds);
  const [showHistory, setShowHistory] = useState(false);
  const [editingTime, setEditingTime] = useState(false);
  const [timeInput, setTimeInput] = useState(() => formatTime(timerSeconds));
  
  
  type CardType = {
    id: string;
    title: string;
    date: string;
    time: string;
    summary: string;
    notes: string;
  };

  const initialCards: CardType[] =
    atendimentoState?.consultas ||
    atendimentoState?.cards || [
      {
        id: "1",
        title: "Consulta inicial",
        date: patient.data || "2025-12-01",
        time: patient.hora || "09:00",
        summary: "Exame e anamnese. Recomendações iniciais.",
        notes: "",
        }
      
    ];

  const [cards, setCards] = useState<CardType[]>([]);
  // We use useGetAppointment to fetch fresh data
  const { data: fetchedAppointment, refetch: refetchAppointment } = useGetAppointment(id || "", !!id);
  
  const { mutateAsync: updateAppointment, isPending: isUpdating } = useUpdateAppointment({
    onSuccessFn: () => {
      refetchAppointment();
    }
  });

  useEffect(() => {
    if (fetchedAppointment) {
       // Update component state with fetched data
       setPatient((prev: any) => ({
         ...prev,
         clientId: fetchedAppointment.clientId || fetchedAppointment.client?.id || prev.clientId,
         name: fetchedAppointment.client?.name || fetchedAppointment.clientName || prev.name,
         cpf: fetchedAppointment.client?.cpf || prev.cpf,
         phone: fetchedAppointment.client?.phone || prev.phone,
         email: fetchedAppointment.client?.email || prev.email,
         address: fetchedAppointment.client?.address || prev.address,
         birth: fetchedAppointment.client?.birthDate || prev.birth,
       }));

       // Update cards
       const newCard: CardType = {
        id: fetchedAppointment.id,
        title: fetchedAppointment.service?.name || "Atendimento",
        date: fetchedAppointment.startDate ? fetchedAppointment.startDate.split('T')[0] : "",
        time: fetchedAppointment.startDate ? fetchedAppointment.startDate.split('T')[1]?.substring(0,5) : "",
        summary: fetchedAppointment.description || "Sem observações.",
        notes: fetchedAppointment.description || ""
       };
       setCards([newCard]);
    }
  }, [fetchedAppointment]);

  const handleNoteChange = (cardId: string, value: string) => {
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, notes: value } : c)));
  };

  const handleSave = async (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    try {
      await updateAppointment({
        id: cardId,
        payload: {
          description: card.notes
        }
      });
      const el = document.getElementById(`note-${cardId}`) as HTMLTextAreaElement | null;
      if (el) el.blur();
    } catch (error) {
       console.error("Failed to save note", error);
    }
  };

  useEffect(() => {
    let timer: number | undefined;
    if (running && timerSeconds > 0) {
      timer = window.setInterval(() => {
        setTimerSeconds((s) => Math.max(0, s - 1));
      }, 1000);
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [running, timerSeconds]);

  // stop running when reaches zero
  useEffect(() => {
    if (timerSeconds === 0 && running) setRunning(false);
    setTimeInput(formatTime(timerSeconds));
  }, [timerSeconds]);

  const parseTimeInput = (val: string) => {
    const clean = val.trim();
    // hh:mm:ss
    const parts = clean.split(":").map((p) => p.trim());
    let seconds = 0;
    if (parts.length === 3) {
      const [hh, mm, ss] = parts.map((p) => parseInt(p || "0", 10));
      if (!isNaN(hh) && !isNaN(mm) && !isNaN(ss)) seconds = hh * 3600 + mm * 60 + ss;
    } else if (parts.length === 2) {
      const [mm, ss] = parts.map((p) => parseInt(p || "0", 10));
      if (!isNaN(mm) && !isNaN(ss)) seconds = mm * 60 + ss;
    } else {
      const minutes = parseInt(clean, 10);
      if (!isNaN(minutes)) seconds = minutes * 60;
    }
    return Math.max(0, seconds);
  };

  const applyTimeInput = () => {
    const seconds = parseTimeInput(timeInput);
    setTimerSeconds(seconds);
    setInitialSeconds(seconds);
    setEditingTime(false);
  };

    console.log("VARIAVEIS NAO UTILIZADAS:", initialSeconds, editingTime, applyTimeInput);
  // const handleStart = () => {
  //   setInitialSeconds(timerSeconds);
  //   setRunning(true);
  // };

  // const handleReset = () => {
  //   setRunning(false);
  //   setTimerSeconds(initialSeconds);
  // };

  return (
    <div className="w-full flex flex-col h-full">
      <main className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow-custom p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center">
                <Users className="w-8 h-8 text-[#121535]" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-[#121535]">{patient.name}</h2>
                <div className="text-sm text-[#121535]">Idade: {patient.age} anos | CPF: {patient.cpf} | Tel: {patient.phone}</div>
              </div>
            </div>
            <div>
              <Button
                size="sm"
                className="bg-[#121535] text-white px-3 py-2 w-[170px] relative overflow-hidden flex items-center justify-center cursor-pointer"
                onClick={() => {
                   const clientId = patient.clientId || fetchedAppointment?.clientId || fetchedAppointment?.client?.id || (location.state as any)?.atendimento?.clientId || (location.state as any)?.paciente?.id;
                   
                   if (clientId) {
                     navigate(`/patients/${clientId}/history`);
                   } else {
                     console.warn("Client ID not found for navigation. Check fetchedAppointment object.", { fetchedAppointment, patient, state: location.state });
                   }
                }}
              >
                <span className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center">
                   <Eye className="w-4 h-4" />
                </span>
                <span>Ver Histórico</span>
              </Button>
            </div>
          </div>
        </div>

        
        

        {showHistory && (
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-custom p-4">Histórico do paciente (exemplo)</div>
          </div>
        )}

        {/* Consultations list - dynamic cards with local save */}
        <div className="space-y-6">
          {cards.map((card) => (
            <div key={card.id} className="bg-white rounded-[10px] shadow-custom p-6 border-2">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-base text-[#0f1724] italic">{card.title}</div>
                </div>
                <div className="text-sm text-slate-600">{card.date} • {card.time}</div>
              </div>

              <div className="bg-[#D9D9D9] p-3 rounded mb-3 border border-[#cfcfcf]">
                <div className="text-sm text-slate-700">{card.summary}</div>
              </div>

              <div className="flex items-center gap-2 mb-2 text-[#121535]">
                <button className="px-2 py-1 text-sm font-semibold">B</button>
                <button className="px-2 py-1 text-sm font-semibold">I</button>
                <button className="px-2 py-1 text-sm font-semibold">U</button>
                <div className="ml-2 border-l border-slate-300 pl-3 text-sm text-slate-600">• • •</div>
              </div>

              <textarea
                id={`note-${card.id}`}
                value={card.notes}
                onChange={(e) => handleNoteChange(card.id, e.target.value)}
                className="w-full min-h-[240px] p-4 rounded bg-white border border-slate-200 text-slate-800"
                placeholder="Adicionar descrição da consulta"
              />

              <div className="flex justify-end mt-4">
                <Button onClick={() => handleSave(card.id)} className="bg-[#121535] text-white px-4 py-2 rounded-[8px]">Salvar</Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PatientDetails;
