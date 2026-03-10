import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "../../components/ui/sidebar";
import { NavItem } from "../NavItem";
import { BriefcaseBusiness, CalendarFold, LogOut, NotepadText, ArrowLeft, Users, Clock, Settings } from "lucide-react";
import logo from "@/assets/logo.png";
import { logout } from "@/services/storage";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@/context/user";
import { useGetAppointment } from "@/hooks/api/useGetAppointment";
import { useGetClient } from "@/hooks/api/useGetClient";
// icons imported above

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

function PatientTimer() {
  const [timerSeconds, setTimerSeconds] = useState(30 * 60);
  const [running, setRunning] = useState(false);
  const [editingTime, setEditingTime] = useState(false);
  const [timeInput, setTimeInput] = useState(() => formatTime(30 * 60));

  useEffect(() => {
    let timer: number | undefined;
    if (running && timerSeconds > 0) {
      timer = window.setInterval(() => setTimerSeconds((s) => Math.max(0, s - 1)), 1000);
    }
    return () => { if (timer) window.clearInterval(timer); };
  }, [running, timerSeconds]);

  useEffect(() => {
    if (timerSeconds === 0 && running) setRunning(false);
    setTimeInput(formatTime(timerSeconds));
  }, [timerSeconds]);

  const parseTimeInput = (val: string) => {
    const clean = val.trim();
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
    setEditingTime(false);
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="bg-white text-[#0b3b8c] rounded-lg shadow-custom px-4 py-3 flex items-center justify-between w-full max-w-[220px]">
        <div className="text-2xl font-mono cursor-pointer" onClick={() => setEditingTime(true)}>
          {editingTime ? (
            <input
              autoFocus
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              onBlur={applyTimeInput}
              onKeyDown={(e) => { if (e.key === "Enter") applyTimeInput(); }}
              className="w-32 bg-white text-[#0b3b8c] text-2xl font-mono outline-none"
            />
          ) : (
            <span>{formatTime(timerSeconds)}</span>
          )}
        </div>
        <div className="ml-3 text-slate-500"><Clock className="w-5 h-5" /></div>
      </div>

      <button
        onClick={() => setRunning(true)}
        className="bg-white text-[#0b3b8c] border border-[#e2e8f0] px-3 py-2 rounded-md shadow-sm flex items-center gap-2 w-full max-w-[220px] cursor-pointer"
      >
        <span className="w-3 h-3 bg-[#0b3b8c] rounded-full inline-block mr-1" />
        Iniciar Atendimento
      </button>
    </div>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const isSidebarOpen = state === "expanded";
  const navigate = useNavigate();
  const { userData, userLoading } = useUser();
  const location = useLocation();
  const isPatientDetails = /^\/appointment\/[^/]+$/.test(location.pathname) || /^\/patients\/[^/]+\/history$/.test(location.pathname);

  // Extract ID from path if possible
  const appointmentIdMatch = location.pathname.match(/^\/appointment\/([^/]+)$/);
  const appointmentId = appointmentIdMatch ? appointmentIdMatch[1] : null;

  const { data: fetchedAppointment } = useGetAppointment(appointmentId || "", !!appointmentId);

  // Use statePaciente.id immediately (from navigation state) so client loads right away
  // without waiting for fetchedAppointment to resolve first
  const statePacienteId = (location.state as any)?.paciente?.id;
  const clientIdFromAppointment = statePacienteId || fetchedAppointment?.clientId || fetchedAppointment?.client?.id || '';
  const { data: fullClient } = useGetClient(clientIdFromAppointment, !!clientIdFromAppointment);

  // Merge: fullClient has priority for fields the appointment API lacks
  const stateClient = (location.state as any)?.atendimento?.client;
  const statePaciente = (location.state as any)?.paciente;
  const displayData = {
    name: fullClient?.name || fetchedAppointment?.client?.name || fetchedAppointment?.clientName || stateClient?.name || (location.state as any)?.atendimento?.clientName || statePaciente?.name || 'Paciente',
    cpf: fullClient?.cpf || fetchedAppointment?.client?.cpf || stateClient?.cpf || statePaciente?.cpf || '',
    phone: fullClient?.phone || fetchedAppointment?.client?.phone || stateClient?.phone || statePaciente?.phone || '',
    email: fullClient?.email || fetchedAppointment?.client?.email || stateClient?.email || statePaciente?.email || '',
    address: (fullClient as any)?.address || fetchedAppointment?.client?.address || stateClient?.address || statePaciente?.address || '',
    birth: (fullClient as any)?.birthDate || fetchedAppointment?.client?.birthDate || stateClient?.birthDate || statePaciente?.birthDate || ''
  };

  return (
    <Sidebar
      collapsible="icon"
      className="!max-w-[260px] md:w-[260px] w-auto fixed z-50"
    >
      <div className="relative z-10 h-full flex flex-col">
        <SidebarTrigger className="absolute top-16 right-0 translate-x-1/2 z-30 shadow-lg bg-[#141736] text-white border border-white" />
        <SidebarHeader
          className={
            "flex items-center transition-all duration-300 " +
            (isSidebarOpen ? "justify-center py-6" : "justify-center py-4")
          }
        > 
          <img 
            src={logo} 
            className={`transition-all duration-300 ${isSidebarOpen ? "w-14" : "w-12"}`}
          />
        </SidebarHeader>
        <SidebarContent className="flex flex-col justify-between scrollbar-none">
          {isPatientDetails ? (
            <div className={`p-4 ${!isSidebarOpen ? "hidden" : ""}`}>
              <div className="mb-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-white p-2 rounded shadow-sm hover:cursor-pointer"
                  aria-label="Voltar"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Voltar</span>
                </button>
              </div>

              <div className="bg-[#E9EDF1] rounded-[20px] p-5 shadow-sm max-w-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#141736] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xl font-medium italic text-[#141736] break-words">
                      {displayData.name}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-[#141736] text-sm">
                  {displayData.cpf && (
                    <div className="flex flex-col gap-1 w-full">
                      <span className="font-semibold text-xs uppercase opacity-70">CPF</span>
                      <span className="font-medium break-all">{displayData.cpf}</span>
                    </div>
                  )}
                  {displayData.phone && (
                    <div className="flex flex-col gap-1 w-full">
                      <span className="font-semibold text-xs uppercase opacity-70">Telefone</span>
                      <span className="font-medium break-words">{displayData.phone}</span>
                    </div>
                  )}
                  {displayData.email && (
                    <div className="flex flex-col gap-1 w-full">
                      <span className="font-semibold text-xs uppercase opacity-70">E-mail</span>
                      <span className="font-medium break-all">{displayData.email}</span>
                    </div>
                  )}
                  {displayData.address && (
                    <div className="flex flex-col gap-1 w-full">
                      <span className="font-semibold text-xs uppercase opacity-70">Endereço</span>
                      <span className="font-medium break-words">{displayData.address}</span>
                    </div>
                  )}
                  {displayData.birth && (
                    <div className="flex flex-col gap-1 w-full">
                      <span className="font-semibold text-xs uppercase opacity-70">Data de Nascimento</span>
                      <span className="font-medium break-words">{displayData.birth}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Timer (below patient card) */}
              {/^\/appointment\/[^/]+$/.test(location.pathname) && (
                <div className="mt-4">
                  <div className="text-sm text-[#6b7280] mb-2">Duração da consulta</div>
                  <PatientTimer />
                </div>
              )}
            </div>
          ) : (
            <div>
              <SidebarGroup>
              {userLoading ? (
                <div className="px-4 pt-6 space-y-2">
                  <div className="h-4 bg-gray-600 rounded w-3/4 animate-pulse"></div>
                  <div className="h-5 bg-gray-500 rounded w-1/2 animate-pulse"></div>
                </div>
              ) : (isSidebarOpen) && (
                <div className="mx-4 mt-6 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-inner group transition-all duration-300 hover:bg-white/10">
                  <p className='text-blue-100/70 text-xs font-medium mb-1 uppercase tracking-wider'>Bem vindo(a)</p>
                  <p className="text-white text-xl font-bold truncate tracking-wide text-shadow-sm">{userData?.name?.trim().split(/\s+/)[0]}</p>
                </div>
              )}
            </SidebarGroup>
              <SidebarGroup title="Agenda" className="p-0 pt-10 gap-2">
                <NavItem
                  title="Agenda"
                  icon={CalendarFold}
                  iconSize={isSidebarOpen ? 24 : 28}
                  href="/"
                  isSidebarOpen={isSidebarOpen}
                />
              </SidebarGroup>
              <SidebarGroup title="Atendimentos" className="p-0">
                <NavItem
                  title="Atendimentos"
                  icon={NotepadText}
                  iconSize={isSidebarOpen ? 24 : 28}
                  href="/appointment"
                  isSidebarOpen={isSidebarOpen}
                />
              </SidebarGroup>
              <SidebarGroup title="Pacientes">
                <NavItem
                  title="Pacientes"
                  icon={Users}
                  iconSize={isSidebarOpen ? 24 : 28}
                  href="/patients"
                  isSidebarOpen={isSidebarOpen}
                  />
              </SidebarGroup>
              <SidebarGroup title="Serviços" className="p-0 gap-2">
                <NavItem
                  title="Serviços"
                  icon={BriefcaseBusiness}
                  iconSize={isSidebarOpen ? 24 : 28}
                  href="/services"
                  isSidebarOpen={isSidebarOpen}
                />
              </SidebarGroup>
              <SidebarGroup title="Configurações" className="p-0 gap-2">
                <NavItem
                  title="Configurações"
                  icon={Settings}
                  iconSize={isSidebarOpen ? 24 : 28}
                  href="/settings"
                  isSidebarOpen={isSidebarOpen}
                />
              </SidebarGroup>
            </div>
          )}
        </SidebarContent>
        <SidebarFooter className="p-2">
          <button
            className="flex items-center font-medium gap-3 text-red-500 p-3 border-l-4 rounded-none justify-start hover:text-white border-transparent cursor-pointer hover:bg-[#0177FB]/10 pl-6"
            onClick={() => {
              logout();
              navigate("/signin");
            }}
          >
            <LogOut />
            <span className={`${isSidebarOpen ? "" : "hidden"}`}>Sair</span>
          </button>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
