import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Users,
  Clock,
  Filter,
  Check,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useGetAllAppointments, type AppointmentAPI } from "@/hooks/api/useGetAllAppointments";
import { format } from "date-fns";
import { useUser } from "@/context/user";

// Helper to debounce value
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

export const Atendimentos = () => {
  const [pesquisa, setPesquisa] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(5);
  const navigate = useNavigate();

  const debouncedPesquisa = useDebounce(pesquisa, 500);

  const { data: responseAny, isLoading } = useGetAllAppointments({
    status: filtroStatus,
    search: debouncedPesquisa,
    page: paginaAtual,
    limit: itensPorPagina,
  });

  // Handle both legacy (array) and new (object) API responses
  let appointments: AppointmentAPI[] = [];
  let meta = { total: 0, totalPages: 1, page: 1, limit: itensPorPagina };
  let estatisticas = { total: 0, concluidos: 0, agendados: 0, cancelados: 0 };

  if (Array.isArray(responseAny)) {
    // Legacy mode: Server returned array of all items (no server-side pagination)
    const allData = responseAny as AppointmentAPI[];
    
    // Client-side Stats
    estatisticas = {
        total: allData.length,
        concluidos: allData.filter(a => ['concluido', 'finished', 'done'].includes(a.status?.toLowerCase())).length,
        agendados: allData.filter(a => ['agendado', 'pending', 'scheduled', 'confirmed'].includes(a.status?.toLowerCase())).length,
        cancelados: allData.filter(a => ['cancelado', 'cancelled'].includes(a.status?.toLowerCase())).length,
    };

    // Client-side Pagination
    meta.total = allData.length;
    meta.totalPages = Math.ceil(allData.length / itensPorPagina) || 1;
    meta.page = paginaAtual;
    
    const startIndex = (paginaAtual - 1) * itensPorPagina;
    appointments = allData.slice(startIndex, startIndex + itensPorPagina);

  } else if (responseAny) {
    // New mode: Server returning paginated data
    appointments = responseAny.data || [];
    meta = responseAny.meta || meta;
    estatisticas = responseAny.stats || estatisticas;
  }

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (['concluido', 'finished', 'done'].includes(s)) return "bg-green-500";
    if (['agendado', 'pending', 'scheduled', 'confirmed'].includes(s)) return "bg-blue-500";
    if (['cancelado', 'cancelled'].includes(s)) return "bg-red-500";
    return "bg-gray-500";
  };

  const getStatusLabel = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (['concluido', 'finished', 'done'].includes(s)) return "Concluído";
    if (['agendado', 'pending', 'scheduled', 'confirmed'].includes(s)) return "Agendado";
    if (['cancelado', 'cancelled'].includes(s)) return "Cancelado";
    return status;
  };

  const handlePesquisaChange = (novaPesquisa: string) => {
    setPesquisa(novaPesquisa);
    setPaginaAtual(1);
  };

  const handleFiltroStatusChange = (novoFiltroStatus: string) => {
    setFiltroStatus(novoFiltroStatus);
    setPaginaAtual(1);
  };

  const handleItensPorPaginaChange = (novosItens: string) => {
    setItensPorPagina(Number(novosItens));
    setPaginaAtual(1);
  };

  const irParaPagina = (pagina: number) => {
    setPaginaAtual(pagina);
  };

  const irParaProximaPagina = () => {
    if (paginaAtual < meta.totalPages) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  const irParaPaginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  const { userData } = useUser();
  console.log(userData);

  return (
    <div className="w-full flex flex-col h-full">
      <header className="border-b border-b-[#DADCE0] h-full max-h-[80px] p-4">
        <h1 className="text-2xl font-medium">Atendimentos</h1>
      </header>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="shadow-custom bg-white rounded-lg p-6 border-l-4 border-[#141736]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#141736] text-sm">Total de Atendimentos</p>
                <p className="text-3xl font-bold text-[#141736]">
                  {estatisticas.total}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="shadow-custom bg-white rounded-lg p-6 border-l-4 border-[#141736]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#141736] text-sm">Concluídos</p>
                <p className="text-3xl font-bold text-[#141736]">
                  {estatisticas.concluidos}
                </p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="shadow-custom bg-white rounded-lg p-6 border-l-4 border-[#141736]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#141736] text-sm">Agendados</p>
                <p className="text-3xl font-bold text-[#141736]">
                  {estatisticas.agendados}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="shadow-custom bg-white rounded-lg p-6 border-l-4 border-[#141736]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#141736] text-sm">Cancelados</p>
                <p className="text-3xl font-bold text-[#141736]">
                  {estatisticas.cancelados}
                </p>
              </div>
              <Clock className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        <div className="rounded-lg p-6 mb-2 border bg-white shadow-custom">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-[#141736]" />
            <h2 className="text-lg font-semibold text-[#141736]">Filtros</h2>
          </div>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Pesquisar por paciente, especialidade ou médico..."
                value={pesquisa}
                onChange={(e) => handlePesquisaChange(e.target.value)}
                className="w-full"
              />
            </div>
            <Select
              value={filtroStatus}
              onValueChange={handleFiltroStatusChange}
            >
              <SelectTrigger className="w-full lg:w-[250px] !h-[48px] border-[#A2A6BB66]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border bg-[#141736] text-white rounded-t-lg py-2">
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 items-center px-6 py-3">
              <div className="lg:col-span-1">
                <h3 className="font-semibold text-sm uppercase">Paciente</h3>
              </div>
              <div className="lg:col-span-1">
                <h3 className="font-semibold text-sm uppercase">Serviço</h3>
              </div>
              <div className="lg:col-span-1">
                <h3 className="font-semibold text-sm uppercase">Data</h3>
              </div>
              <div className="lg:col-span-1">
                <h3 className="font-semibold text-sm uppercase">Hora</h3>
              </div>
              <div className="lg:col-span-1">
                <h3 className="font-semibold text-sm uppercase">Status</h3>
              </div>
              <div className="lg:col-span-1 flex justify-center">
                <h3 className="font-semibold text-sm uppercase">Detalhes</h3>
              </div>
            </div>
          </div>
          <div className="flex-1">
            {isLoading ? (
                <div className="text-center py-12">
                   <p className="text-gray-500 text-lg">Carregando...</p>
                </div>
            ) : appointments.map((atendimento, index) => {
              const start = new Date(atendimento.startDate);
              return (
                <div
                    key={atendimento.id}
                    className={`${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                    } hover:bg-slate-100 transition-colors duration-200`}
                >
                    <div className={`grid grid-cols-2 lg:grid-cols-6 gap-4 items-center p-6 border border-slate-200 ${index === appointments.length - 1  ? 'rounded-b-lg' : ''}`}>
                    <div className="lg:col-span-1">
                        <p className="text-slate-800 text-sm font-medium">
                        {atendimento.clientName || atendimento.client?.name || 'Sem nome'}
                        </p>
                    </div>

                    <div className="lg:col-span-1">
                        <p className="text-slate-600 text-sm">
                        {atendimento.service?.name || '-'}
                        </p>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <p className="text-slate-600 text-sm">
                            {format(start, 'dd/MM/yyyy')}
                        </p>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <p className="text-slate-600 text-sm font-medium">
                           {format(start, 'HH:mm')}
                        </p>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2">
                        <div
                            className={`w-2.5 h-2.5 rounded-full ${getStatusColor(
                            atendimento.status
                            )}`}
                        ></div>
                        <span className="text-slate-700 text-sm capitalize">
                            {getStatusLabel(atendimento.status)}
                        </span>
                        </div>
                    </div>

                    <div className="lg:col-span-1 flex justify-center">
                        <Button
                        variant="ghost"
                        size="sm"
                        className="bg-[#141736] hover:bg-[#282d64] text-white hover:text-white font-medium"
                        onClick={() => navigate(`/appointment/${atendimento.id}`, { 
                          state: { 
                            atendimento,
                            paciente: atendimento.client 
                              ? { ...atendimento.client, id: atendimento.client.id || atendimento.clientId }
                              : { id: atendimento.clientId, name: atendimento.clientName }
                          } 
                        })}
                        >
                        Ver
                        <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                    </div>
                </div>
            )})}

            {!isLoading && appointments.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Nenhuma consulta encontrada com os filtros aplicados.
                </p>
              </div>
            )}
          </div>

          {!isLoading && meta.total > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">
                  Mostrando
                </span>
                 <Select value={itensPorPagina.toString()} onValueChange={handleItensPorPaginaChange}>
                   <SelectTrigger className="w-[100px] !h-[36px] cursor-pointer bg-white">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="5">5</SelectItem>
                     <SelectItem value="10">10</SelectItem>
                     <SelectItem value="20">20</SelectItem>
                     <SelectItem value="50">50</SelectItem>
                   </SelectContent>
                 </Select>
                 <span className="text-sm text-slate-600">
                  itens por página
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={irParaPaginaAnterior}
                  disabled={paginaAtual === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                    .slice(Math.max(0, paginaAtual - 3), Math.min(meta.totalPages, paginaAtual + 2))
                    .map(
                    (pagina) => (
                      <Button
                        key={pagina}
                        variant={pagina === paginaAtual ? "default" : "outline"}
                        size="sm"
                        onClick={() => irParaPagina(pagina)}
                        className={`w-8 h-8 p-0 ${
                          pagina === paginaAtual
                            ? "bg-[#141736] text-white hover:bg-[#282c5e]"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {pagina}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={irParaProximaPagina}
                  disabled={paginaAtual === meta.totalPages}
                  className="flex items-center gap-1"
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
