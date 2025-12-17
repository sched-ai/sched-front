import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Clock } from "lucide-react";

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

export const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  // try to get atendimento/patient from navigation state
  const navData: any = (location && (location.state as any)) || null;
  const atendimentoState = navData?.atendimento || navData;

  const [patient, setPatient] = useState<any>(() => ({
    id: id || "1",
    name: atendimentoState?.paciente || "Gabriela Muniz",
    cpf: atendimentoState?.cpf || atendimentoState?.document || "",
    phone: atendimentoState?.phone || atendimentoState?.telefone || "",
    email: atendimentoState?.email || "",
    address: atendimentoState?.address || "",
    birth: atendimentoState?.birth || "",
    age: atendimentoState?.age || undefined,
    especialidade: atendimentoState?.especialidade || atendimentoState?.specialty || "",
    data: atendimentoState?.data || atendimentoState?.date || "",
    hora: atendimentoState?.hora || atendimentoState?.time || "",
    medico: atendimentoState?.medico || atendimentoState?.medico || "",
    status: atendimentoState?.status || "",
    tipoConsulta: atendimentoState?.tipoConsulta || atendimentoState?.tipoConsulta || "",
  }));

  useEffect(() => {
    if (atendimentoState) {
      setPatient((p: any) => ({ ...p, ...atendimentoState }));
    }
  }, [atendimentoState]);

  const [timerSeconds, setTimerSeconds] = useState(30 * 60); // default 30 minutes
  const [running, setRunning] = useState(false);
  const [initialSeconds, setInitialSeconds] = useState(timerSeconds);
  const [showHistory, setShowHistory] = useState(false);
  
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
      },
      {
        id: "2",
        title: "Retorno",
        date: patient.data || "2025-12-10",
        time: "10:30",
        summary: "Avaliação de progresso e ajuste de tratamento.",
        notes: "",
      },
    ];

  const [cards, setCards] = useState<CardType[]>(initialCards);

  const handleNoteChange = (cardId: string, value: string) => {
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, notes: value } : c)));
  };

  const handleSave = (cardId: string) => {
    // For now persist only to local component state. Blur the textarea.
    const el = document.getElementById(`note-${cardId}`) as HTMLTextAreaElement | null;
    if (el) el.blur();
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

  const handleStart = () => {
    setInitialSeconds(timerSeconds);
    setRunning(true);
  };

  const handleReset = () => {
    setRunning(false);
    setTimerSeconds(initialSeconds);
  };

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
              <Button className="bg-[#121535] text-white" onClick={() => setShowHistory((s) => !s)}>
                {showHistory ? "Ocultar histórico" : "Ver histórico"}
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
