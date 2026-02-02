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
import { BriefcaseBusiness, CalendarFold, LogOut, NotepadText, ArrowLeft, Users, Phone, Mail, MapPin, Cake, CreditCard, Clock } from "lucide-react";
import logoFull from "@/assets/logoFull.png";
import logo from "@/assets/logo.png";
import { logout } from "@/services/storage";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@/context/user";
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
  const sidebarLogo = isSidebarOpen ? logoFull : logo;
  const navigate = useNavigate();
  const { userData, userLoading } = useUser();
  const location = useLocation();
  const isPatientDetails = /^\/appointment\/[^/]+$/.test(location.pathname);

  return (
    <Sidebar
      collapsible="icon"
      className="!max-w-[260px] md:w-[260px] w-auto fixed z-50"
    >
      <div className="relative z-10 h-full max-h-[85vh]">
        <SidebarTrigger className="absolute top-16 right-0 translate-x-1/2 z-30 shadow-lg bg-[#141736] text-white border border-white" />
        <SidebarHeader
          className={
            "font-semibold text-white italic flex truncate " +
            (isSidebarOpen ? "p-4 px-8 text-4xl" : "text-start p-5")
          }
        >
          <img src={sidebarLogo} />
        </SidebarHeader>
        <SidebarContent className="flex flex-col justify-between h-full">
          {isPatientDetails ? (
            <div className="p-4">
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

              <div className="bg-[#E9EDF1] rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#121535] flex items-center justify-center">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-[#121535]">{(location.state && (location.state as any).atendimento?.paciente) || (location.state && (location.state as any).paciente) || 'Paciente'}</div>
                    <div className="mt-3 space-y-3 text-[#121535] text-sm">
                      {((location.state && (location.state as any).atendimento?.cpf) || (location.state && (location.state as any).cpf)) && (
                        <div className="flex items-center gap-3"><CreditCard className="w-5 h-5" /> <span>{(location.state as any).atendimento?.cpf || (location.state as any).cpf}</span></div>
                      )}
                      {((location.state && (location.state as any).atendimento?.phone) || (location.state && (location.state as any).phone) || (location.state && (location.state as any).atendimento?.telefone)) && (
                        <div className="flex items-center gap-3"><Phone className="w-5 h-5" /> <span>{(location.state as any).atendimento?.phone || (location.state as any).phone || (location.state as any).atendimento?.telefone}</span></div>
                      )}
                      {((location.state && (location.state as any).atendimento?.email) || (location.state && (location.state as any).email)) && (
                        <div className="flex items-center gap-3"><Mail className="w-5 h-5" /> <span>{(location.state as any).atendimento?.email || (location.state as any).email}</span></div>
                      )}
                      {((location.state && (location.state as any).atendimento?.address) || (location.state && (location.state as any).address)) && (
                        <div className="flex items-center gap-3"><MapPin className="w-5 h-5" /> <span>{(location.state as any).atendimento?.address || (location.state as any).address}</span></div>
                      )}
                      {((location.state && (location.state as any).atendimento?.birth) || (location.state && (location.state as any).birth)) && (
                        <div className="flex items-center gap-3"><Cake className="w-5 h-5" /> <span>{(location.state as any).atendimento?.birth || (location.state as any).birth}</span></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timer (below patient card) */}
              <div className="mt-4">
                <div className="text-sm text-[#6b7280] mb-2">Duração da consulta</div>
                <PatientTimer />
              </div>
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
                  title="Serviços e Pacotes"
                  icon={BriefcaseBusiness}
                  iconSize={isSidebarOpen ? 24 : 28}
                  href="/services"
                  isSidebarOpen={isSidebarOpen}
                />
              </SidebarGroup>
            </div>
          )}
            <SidebarGroup title="Logout" className="p-0 gap-2">
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
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
      </div>
    </Sidebar>
  );
}
