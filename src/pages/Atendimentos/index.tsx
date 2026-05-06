import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  CheckCircle,
  CalendarDays,
  XCircle,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  User,
  BotMessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { useGetAllAppointments, type AppointmentAPI } from "@/hooks/api/useGetAllAppointments";
import { SidebarTrigger } from "@/components/ui/sidebar";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const statusOptions = ["Todos os status", "Agendado", "Concluído", "Cancelado"];
const itemsPerPageOptions = [5, 10, 20];

const statusValueMap: Record<string, string> = {
  "Todos os status": "todos",
  Agendado: "scheduled",
  Concluído: "finished",
  Cancelado: "cancelled",
};

function sortAppointmentsByProximity(appointments: AppointmentAPI[]): AppointmentAPI[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return [...appointments].sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);

    dateA.setHours(0, 0, 0, 0);
    dateB.setHours(0, 0, 0, 0);

    // Calculate days difference (negative for past, positive for future)
    const daysA = Math.floor((dateA.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const daysB = Math.floor((dateB.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Sort by absolute proximity (closest to today first)
    return Math.abs(daysA) - Math.abs(daysB);
  });
}

const statusConfig: Record<string, { color: string; dot: string }> = {
  Agendado: { color: "text-dark-blue", dot: "bg-blue-500" },
  Concluído: { color: "text-dark-blue", dot: "bg-green-500" },
  Cancelado: { color: "text-dark-blue", dot: "bg-red-500" },
};

function getStatusLabel(status: string) {
  const normalized = status?.toLowerCase() || "";

  if (["concluido", "finished", "done"].includes(normalized)) return "Concluído";
  if (["agendado", "pending", "scheduled", "confirmed"].includes(normalized)) return "Agendado";
  if (["cancelado", "cancelled"].includes(normalized)) return "Cancelado";

  return status || "Desconhecido";
}

function getStatusVisual(status: string) {
  const label = getStatusLabel(status);
  return statusConfig[label] || { color: "text-slate-600", dot: "bg-slate-400" };
}

export const Atendimentos = () => {
  const navigate = useNavigate();
  const statusDropdownRef = useRef<HTMLDivElement | null>(null);
  const itemsDropdownRef = useRef<HTMLDivElement | null>(null);

  const [pesquisa, setPesquisa] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Todos os status");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(5);
  const [statusOpen, setStatusOpen] = useState(false);
  const [itemsOpen, setItemsOpen] = useState(false);

  const debouncedPesquisa = useDebounce(pesquisa, 500);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (statusDropdownRef.current && !statusDropdownRef.current.contains(target)) {
        setStatusOpen(false);
      }

      if (itemsDropdownRef.current && !itemsDropdownRef.current.contains(target)) {
        setItemsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { data: responseAny, isLoading } = useGetAllAppointments({
    status: statusValueMap[selectedStatus] || "todos",
    search: debouncedPesquisa,
    page: paginaAtual,
    limit: itensPorPagina,
  });

  let appointments: AppointmentAPI[] = [];
  let meta = { total: 0, totalPages: 1, page: 1, limit: itensPorPagina };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  let estatisticas = { total: 0, concluidos: 0, agendados: 0, cancelados: 0 };

  if (Array.isArray(responseAny)) {
    const allData = responseAny as AppointmentAPI[];
    const sortedData = sortAppointmentsByProximity(allData);

    estatisticas = {
      total: sortedData.length,
      concluidos: sortedData.filter((item) => ["concluido", "finished", "done"].includes(item.status?.toLowerCase())).length,
      agendados: sortedData.filter((item) => ["agendado", "pending", "scheduled", "confirmed"].includes(item.status?.toLowerCase())).length,
      cancelados: sortedData.filter((item) => ["cancelado", "cancelled"].includes(item.status?.toLowerCase())).length,
    };

    meta.total = sortedData.length;
    meta.totalPages = Math.ceil(sortedData.length / itensPorPagina) || 1;
    meta.page = paginaAtual;

    const startIndex = (paginaAtual - 1) * itensPorPagina;
    appointments = sortedData.slice(startIndex, startIndex + itensPorPagina);
  } else if (responseAny) {
    appointments = responseAny.data ? sortAppointmentsByProximity(responseAny.data) : [];
    meta = responseAny.meta || meta;
    estatisticas = responseAny.stats || estatisticas;
  }

  const statsCards = useMemo(
    () => [
      { label: "Total de Atendimentos", value: estatisticas.total, icon: Users, color: "text-blue-500" },
      { label: "Concluídos", value: estatisticas.concluidos, icon: CheckCircle, color: "text-green-500" },
      { label: "Agendados", value: estatisticas.agendados, icon: CalendarDays, color: "text-orange-500" },
      { label: "Cancelados", value: estatisticas.cancelados, icon: XCircle, color: "text-red-500" },
    ],
    [estatisticas]
  );

  const pageNumbers = useMemo(() => {
    return Array.from({ length: meta.totalPages }, (_, index) => index + 1).slice(
      Math.max(0, paginaAtual - 3),
      Math.min(meta.totalPages, paginaAtual + 2)
    );
  }, [meta.totalPages, paginaAtual]);

  const handleSearchChange = (value: string) => {
    setPesquisa(value);
    setPaginaAtual(1);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setPaginaAtual(1);
    setStatusOpen(false);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItensPorPagina(value);
    setPaginaAtual(1);
    setItemsOpen(false);
  };

  const irParaPagina = (pagina: number) => {
    setPaginaAtual(pagina);
  };

  const irParaProximaPagina = () => {
    if (paginaAtual < meta.totalPages) {
      setPaginaAtual((current) => current + 1);
    }
  };

  const irParaPaginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual((current) => current - 1);
    }
  };

  return (
    <div className="min-h-screen">
        <div className="p-4 md:p-8 mx-auto space-y-6">
          <header className="flex gap-4 mb-0">
            <SidebarTrigger className="w-11 h-11 min-w-[44px] self-start rounded-lg bg-white border border-slate-200 shadow-sm p-0 hover:bg-slate-50 hover:opacity-80 transition-opacity lg:hidden">
              <span className="flex flex-col items-center justify-center gap-1">
                <span className="block h-[2px] w-[18px] rounded-[2px] bg-slate-900/90" />
                <span className="block h-[2px] w-3 rounded-[2px] bg-slate-900/90" />
                <span className="block h-[2px] w-[18px] rounded-[2px] bg-slate-900/90" />
              </span>
            </SidebarTrigger>
            <div className="flex-1">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-foreground">Atendimentos</h1>
                <p className="text-muted-foreground mt-2">
                 Gerencie e acompanhe todos os atendimentos
                </p>
              </div>
            </div>
          </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsCards.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-center justify-between border-l-4 border-l-[#141736]"
              
            >
              <div>
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="text-slate-900">{value}</p>
              </div>
              <Icon className={`w-6 h-6 ${color}`} strokeWidth={1.5} />
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="p-5 border-b border-slate-100">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Pesquisar por paciente ou serviço..."
                  value={pesquisa}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                />
              </div>

              <div className="relative" ref={statusDropdownRef}>
                <button
                  type="button"
                  onClick={() => setStatusOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:border-slate-400 transition min-w-[160px] justify-between"
                >
                  {selectedStatus}
                  <ChevronDown className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                </button>

                {statusOpen && (
                  <div className="absolute right-0 top-full mt-1 z-10 bg-white border border-slate-200 rounded-lg shadow-md min-w-[160px] overflow-hidden">
                    {statusOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleStatusChange(option)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition ${
                          selectedStatus === option ? "text-[#141736] bg-blue-50" : "text-slate-700"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Paciente", "Serviço", "Data", "Horário", "Origem", "Status", ""].map((column) => (
                    <th
                      key={column}
                      className="px-5 py-3 text-left text-xs text-slate-500 uppercase tracking-wide font-medium"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">
                      Carregando atendimentos...
                    </td>
                  </tr>
                ) : (
                  paginatedRows(appointments, navigate)
                )}

                {!isLoading && appointments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">
                      Nenhum atendimento encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-3 p-4">
            {isLoading && (
              <div className="px-4 py-10 text-center text-slate-400 text-sm">
                Carregando atendimentos...
              </div>
            )}

            {!isLoading && appointments.length > 0 && paginatedCards(appointments, navigate)}

            {!isLoading && appointments.length === 0 && (
              <div className="px-4 py-10 text-center text-slate-400 text-sm">
                Nenhum atendimento encontrado.
              </div>
            )}
          </div>

          {!isLoading && meta.total > 0 && (
            <div className="px-5 py-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Mostrando</span>
                <div className="relative" ref={itemsDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setItemsOpen((open) => !open)}
                    className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:border-slate-400 transition min-w-[84px] justify-between"
                  >
                    {itensPorPagina}
                    <ChevronDown className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                  </button>

                  {itemsOpen && (
                    <div className="absolute right-0 bottom-full mb-1 z-10 bg-white border border-slate-200 rounded-lg shadow-md min-w-[84px] overflow-hidden">
                      {itemsPerPageOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleItemsPerPageChange(option)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition ${
                            itensPorPagina === option ? "text-blue-600 bg-blue-50" : "text-slate-700"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span>itens por página</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={irParaPaginaAnterior}
                  disabled={paginaAtual === 1}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
                  Anterior
                </button>

                <div className="flex items-center gap-1">
                  {pageNumbers.map((pagina) => (
                    <button
                      key={pagina}
                      type="button"
                      onClick={() => irParaPagina(pagina)}
                      className={`w-8 h-8 rounded-md text-sm transition ${
                        pagina === paginaAtual ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {pagina}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={irParaProximaPagina}
                  disabled={paginaAtual === meta.totalPages}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function paginatedRows(appointments: AppointmentAPI[], navigate: ReturnType<typeof useNavigate>) {
  return appointments.map((atendimento, index) => {
    const start = new Date(atendimento.startDate);
    const status = getStatusLabel(atendimento.status);
    const visual = getStatusVisual(atendimento.status);
    const isLast = index === appointments.length - 1;
    const isCancelled = ["cancelado", "cancelled"].includes(atendimento.status?.toLowerCase() || "");
    const isScheduled = ["agendado", "pending", "scheduled", "confirmed"].includes(
      atendimento.status?.toLowerCase() || ""
    );
    const startTime = start.getTime();
    const canOpenScheduled =
      !Number.isNaN(startTime) && Date.now() >= startTime - 10 * 60 * 1000;
    const isViewDisabled = isCancelled || (isScheduled && !canOpenScheduled);

    return (
      <tr
        key={atendimento.id}
        className={`border-b border-slate-100 hover:bg-slate-50 transition ${isLast ? "border-b-0" : ""}`}
      >
        <td className="px-5 py-4 text-slate-900">{atendimento.clientName || atendimento.client?.name || "Sem nome"}</td>
        <td className="px-5 py-4 text-slate-600">{atendimento.service?.name || "-"}</td>
        <td className="px-5 py-4 text-slate-600">{format(start, "dd/MM/yyyy")}</td>
        <td className="px-5 py-4 text-slate-600">{format(start, "HH:mm")}</td>
        <td className="px-5 py-4">
          {atendimento.createdByAI ? (
            <span className="inline-flex items-center gap-1.5 rounded-full w-[86px] justify-between bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              <BotMessageSquare className="w-3.5 h-3.5" />
              Agente
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full w-[86px] justify-between bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              <User className="w-3.5 h-3.5" />
              Manual
            </span>
          )}
        </td>
        <td className="px-5 py-4">
          <span className={`inline-flex items-center gap-1.5 ${visual.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${visual.dot}`} />
            {status}
          </span>
        </td>
        <td className="px-5 py-4">
          <button
            type="button"
            onClick={() =>
              navigate(`/appointment/${atendimento.id}`, {
                state: {
                  atendimento,
                  paciente: atendimento.client
                    ? { ...atendimento.client, id: atendimento.client.id || atendimento.clientId }
                    : { id: atendimento.clientId, name: atendimento.clientName },
                },
              })
            }
            disabled={isViewDisabled}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Ver
            <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
          </button>
        </td>
      </tr>
    );
  });
}

function paginatedCards(appointments: AppointmentAPI[], navigate: ReturnType<typeof useNavigate>) {
  return appointments.map((atendimento) => {
    const start = new Date(atendimento.startDate);
    const status = getStatusLabel(atendimento.status);
    const visual = getStatusVisual(atendimento.status);
    const isCancelled = ["cancelado", "cancelled"].includes(atendimento.status?.toLowerCase() || "");
    const isScheduled = ["agendado", "pending", "scheduled", "confirmed"].includes(
      atendimento.status?.toLowerCase() || ""
    );
    const startTime = start.getTime();
    const canOpenScheduled =
      !Number.isNaN(startTime) && Date.now() >= startTime - 10 * 60 * 1000;
    const isViewDisabled = isCancelled || (isScheduled && !canOpenScheduled);

    return (
      <div
        key={atendimento.id}
        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">Paciente</p>
            <p className="text-slate-900 font-medium">
              {atendimento.clientName || atendimento.client?.name || "Sem nome"}
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs ${visual.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${visual.dot}`} />
            {status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
          <div>
            <p className="text-xs text-slate-500">Serviço</p>
            <p>{atendimento.service?.name || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Data</p>
            <p>{format(start, "dd/MM/yyyy")}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Horário</p>
            <p>{format(start, "HH:mm")}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Origem</p>
            {atendimento.createdByAI ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                <BotMessageSquare className="w-3.5 h-3.5" />
                Agente
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                <User className="w-3.5 h-3.5" />
                Manual
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              navigate(`/appointment/${atendimento.id}`, {
                state: {
                  atendimento,
                  paciente: atendimento.client
                    ? { ...atendimento.client, id: atendimento.client.id || atendimento.clientId }
                    : { id: atendimento.clientId, name: atendimento.clientName },
                },
              })
            }
            disabled={isViewDisabled}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Ver
            <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    );
  });
}

export default Atendimentos;
