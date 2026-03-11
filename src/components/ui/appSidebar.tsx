import { useState, useEffect, useRef, useCallback } from "react";
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
import { BriefcaseBusiness, CalendarFold, LogOut, NotepadText, ArrowLeft, Users, Settings, Play, RotateCcw } from "lucide-react";
import logo from "@/assets/logo.png";
import { logout } from "@/services/storage";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@/context/user";
import { useGetAppointment } from "@/hooks/api/useGetAppointment";
import { useGetClient } from "@/hooks/api/useGetClient";
import { useGetService } from "@/hooks/api/useGetService";

function formatHHMMSS(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function PatientTimer({ serviceId, startDate, endDate }: { serviceId?: string | null; startDate?: string; endDate?: string }) {
  const { data: service, isLoading } = useGetService(serviceId ?? "", !!serviceId);

  // Derive duration once and store in state so it's stable across renders
  const [initialSeconds, setInitialSeconds] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  // Keep runningRef in sync
  runningRef.current = running;

  // Compute duration from service or dates
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
      // Only update display if timer is NOT running
      if (!runningRef.current) {
        setTimerSeconds(secs);
      }
    }
  }, [service?.duration, startDate, endDate]);

  // Cleanup interval on unmount
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

  const handleIniciar = useCallback(() => {
    if (running) return;
    if (initialSeconds === 0) return; // prevent starting when no duration available
    // If timer was at 0, reset to full duration before starting
    setTimerSeconds((prev) => {
      if (prev === 0) return initialSeconds;
      return prev;
    });
    setRunning(true);

    stopInterval();
    intervalRef.current = window.setInterval(() => {
      setTimerSeconds((s) => {
        const next = s - 1;
        if (next <= 0) {
          // Stop when reaching 0
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
  }, [running, initialSeconds, stopInterval]);

  const handleReset = useCallback(() => {
    stopInterval();
    setRunning(false);
    setTimerSeconds(initialSeconds);
  }, [initialSeconds, stopInterval]);

  return (
    <div className="flex flex-col items-start gap-3 w-full">
      <div className="bg-white text-[#0b3b8c] rounded-lg shadow-custom px-4 py-3 flex items-center gap-3 w-full max-w-[220px]">
        <button
          onClick={handleIniciar}
          disabled={running || initialSeconds === 0}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
            (running || initialSeconds === 0) ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-[#0b3b8c] text-white hover:bg-[#093077]"
          }`}
          title="Iniciar"
        >
          <Play className="w-4 h-4 fill-current" />
        </button>
        <div className="text-2xl font-mono flex-1 text-center select-none">
          {isLoading ? (
            <span className="text-base text-slate-400">...</span>
          ) : initialSeconds === 0 ? (
            <span className="text-base text-slate-400">--:--:--</span>
          ) : (
            <span>{formatHHMMSS(timerSeconds)}</span>
          )}
        </div>
        <button
          onClick={handleReset}
          disabled={!running && timerSeconds === initialSeconds}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
            !running && timerSeconds === initialSeconds ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-amber-500 text-white hover:bg-amber-600"
          }`}
          title="Zerar"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
      {/* service name removed as requested */}
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

              {/* Timer (below patient card) — read-only, derived from service */}
              {/^\/appointment\/[^/]+$/.test(location.pathname) && (
                <div className="mt-4">
                  <div className="text-sm font-semibold text-white mb-2">Duração da consulta</div>
                  <PatientTimer
                    serviceId={fetchedAppointment?.serviceId || (location.state as any)?.atendimento?.serviceId || (location.state as any)?.atendimento?.service?.id}
                    startDate={fetchedAppointment?.startDate || (location.state as any)?.atendimento?.startDate}
                    endDate={fetchedAppointment?.endDate || (location.state as any)?.atendimento?.endDate}
                  />
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
              <SidebarGroup title="Pacientes" className="p-0">
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
