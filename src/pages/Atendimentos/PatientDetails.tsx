import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, User } from "lucide-react";
import { useUpdateAppointment } from "@/hooks/api/useUpdateAppointment";
import { useGetAppointment } from "@/hooks/api/useGetAppointment";
import { useGetClient } from "@/hooks/api/useGetClient";

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

function calculateAge(birthDate: string | undefined): number | undefined {
  if (!birthDate) return undefined;
  const dob = new Date(birthDate);
  if (isNaN(dob.getTime())) return undefined;
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs); 
  return Math.abs(ageDt.getUTCFullYear() - 1970);
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
    age: atendimentoState?.client?.age || atendimentoState?.age || calculateAge(atendimentoState?.client?.birthDate || atendimentoState?.birth) || undefined,
    gender: atendimentoState?.client?.gender || atendimentoState?.gender || "",
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

  const [cards, setCards] = useState<CardType[]>([]);
  // We use useGetAppointment to fetch fresh data
  const { data: fetchedAppointment, refetch: refetchAppointment } = useGetAppointment(id || "", !!id);

  // Derive clientId from appointment, then fetch the FULL client record directly by ID
  const clientId = fetchedAppointment?.clientId || fetchedAppointment?.client?.id || patient.clientId || "";
  const { data: fullClientData } = useGetClient(clientId, !!clientId);

  const { mutateAsync: updateAppointment } = useUpdateAppointment({
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

       // Update cards
       const newCard: CardType = {
        id: fetchedAppointment.id,
        title: fetchedAppointment.service?.name || "Atendimento",
        date: fetchedAppointment.startDate ? fetchedAppointment.startDate.split('T')[0] : "",
        time: fetchedAppointment.startDate ? fetchedAppointment.startDate.split('T')[1]?.substring(0,5) : "",
        summary: fetchedAppointment.description || "Sem obs.",
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
