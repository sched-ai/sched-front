import { useState } from "react";
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

interface Atendimento {
  id: string;
  paciente: string;
  especialidade: string;
  data: string;
  hora: string;
  status: "concluido" | "agendado" | "cancelado";
  duracao: string;
  medico: string;
  tipoConsulta: string;
}

export const Atendimentos = () => {
  const [filtro, setFiltro] = useState("todos");
  const [pesquisa, setPesquisa] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(5);

  const atendimentos: Atendimento[] = [
    {
      id: "1",
      paciente: "Maria Silva Santos",
      especialidade: "Cardiologia",
      data: "15/01/2024",
      hora: "09:00",
      status: "concluido",
      duracao: "30min",
      medico: "Dr. Carlos Mendes",
      tipoConsulta: "Consulta de Retorno",
    },
    {
      id: "2",
      paciente: "João Pedro Oliveira",
      especialidade: "Ortopedia",
      data: "16/01/2024",
      hora: "14:30",
      status: "concluido",
      duracao: "45min",
      medico: "Dra. Ana Costa",
      tipoConsulta: "Primeira Consulta",
    },
    {
      id: "3",
      paciente: "Ana Beatriz Costa",
      especialidade: "Dermatologia",
      data: "17/01/2024",
      hora: "10:15",
      status: "agendado",
      duracao: "40min",
      medico: "Dr. Roberto Silva",
      tipoConsulta: "Consulta de Rotina",
    },
    {
      id: "4",
      paciente: "Pedro Henrique Lima",
      especialidade: "Neurologia",
      data: "18/01/2024",
      hora: "16:00",
      status: "cancelado",
      duracao: "50min",
      medico: "Dra. Fernanda Alves",
      tipoConsulta: "Consulta Urgente",
    },
    {
      id: "5",
      paciente: "Fernanda Rodrigues",
      especialidade: "Ginecologia",
      data: "19/01/2024",
      hora: "11:45",
      status: "concluido",
      duracao: "35min",
      medico: "Dra. Juliana Santos",
      tipoConsulta: "Consulta Preventiva",
    },
    {
      id: "6",
      paciente: "Roberto Carlos Silva",
      especialidade: "Urologia",
      data: "20/01/2024",
      hora: "15:30",
      status: "agendado",
      duracao: "40min",
      medico: "Dr. Marcos Pereira",
      tipoConsulta: "Consulta de Retorno",
    },
    {
      id: "7",
      paciente: "Lucia Maria Ferreira",
      especialidade: "Endocrinologia",
      data: "21/01/2024",
      hora: "08:30",
      status: "agendado",
      duracao: "45min",
      medico: "Dra. Patricia Lima",
      tipoConsulta: "Primeira Consulta",
    },
    {
      id: "8",
      paciente: "Antonio José Santos",
      especialidade: "Cardiologia",
      data: "22/01/2024",
      hora: "13:15",
      status: "concluido",
      duracao: "30min",
      medico: "Dr. Carlos Mendes",
      tipoConsulta: "Consulta de Rotina",
    },
  ];

  const calcularEstatisticas = () => {
    const total = atendimentos.length;
    const concluidos = atendimentos.filter(
      (a) => a.status === "concluido"
    ).length;
    const agendados = atendimentos.filter(
      (a) => a.status === "agendado"
    ).length;
    const cancelados = atendimentos.filter(
      (a) => a.status === "cancelado"
    ).length;

    return {
      total,
      concluidos,
      agendados,
      cancelados,
    };
  };

  const estatisticas = calcularEstatisticas();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluido":
        return "bg-green-500";
      case "agendado":
        return "bg-blue-500";
      case "cancelado":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const atendimentosFiltrados = atendimentos.filter((atendimento) => {
    const matchFiltro =
      filtro === "todos" ||
      atendimento.especialidade.toLowerCase().includes(filtro.toLowerCase());
    const matchPesquisa =
      atendimento.paciente.toLowerCase().includes(pesquisa.toLowerCase()) ||
      atendimento.especialidade.toLowerCase().includes(pesquisa.toLowerCase()) ||
      atendimento.medico.toLowerCase().includes(pesquisa.toLowerCase()) ||
      atendimento.tipoConsulta.toLowerCase().includes(pesquisa.toLowerCase());
    const matchStatus =
      filtroStatus === "todos" || atendimento.status === filtroStatus;
    return matchFiltro && matchPesquisa && matchStatus;
  });

  const totalPaginas = Math.ceil(atendimentosFiltrados.length / itensPorPagina);
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;
  const atendimentosPaginados = atendimentosFiltrados.slice(indiceInicial, indiceFinal);

  const handleFiltroChange = (novoFiltro: string) => {
    setFiltro(novoFiltro);
    setPaginaAtual(1);
  };

  const handleFiltroStatusChange = (novoFiltroStatus: string) => {
    setFiltroStatus(novoFiltroStatus);
    setPaginaAtual(1);
  };

  const handlePesquisaChange = (novaPesquisa: string) => {
    setPesquisa(novaPesquisa);
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
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  const irParaPaginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  return (
    <div className="w-full flex flex-col h-full">
      <header className="border-b border-b-[#DADCE0] h-full max-h-[80px] p-4">
        <h1 className="text-[30px] font-medium">Consultas Médicas</h1>
      </header>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="shadow-md bg-[#141736] rounded-lg p-6 border border-[#141736]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm">Total de Agendamentos</p>
                <p className="text-3xl font-bold text-white">
                  {estatisticas.total}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="shadow-md bg-[#141736] rounded-lg p-6 border border-[#141736]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm">Concluídos</p>
                <p className="text-3xl font-bold text-white">
                  {estatisticas.concluidos}
                </p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="shadow-md bg-[#141736] rounded-lg p-6 border border-[#141736]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm">Agendados</p>
                <p className="text-3xl font-bold text-white">
                  {estatisticas.agendados}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="shadow-md bg-[#141736] rounded-lg p-6 border border-[#141736]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm">Cancelados</p>
                <p className="text-3xl font-bold text-white">
                  {estatisticas.cancelados}
                </p>
              </div>
              <Clock className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* === TABELA E FILTROS === */}
        {/* */}
        <div className="rounded-lg p-6 mb-2 border bg-white shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-[#141736]" />
            <h2 className="text-lg font-semibold text-[#141736]">Filtros</h2>
          </div>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Pesquisar por paciente, especialidade ou médico..."
                value={pesquisa}
                onChange={(e) => handlePesquisaChange(e.target.value)}
                className="w-full" // ShadCN Input já tem um bom estilo padrão
              />
            </div>
            {/* */}
            <Select value={filtro} onValueChange={handleFiltroChange}>
              <SelectTrigger className="w-full lg:w-[250px] !h-[48px] border-[#141736]">
                <SelectValue placeholder="Filtrar por especialidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as especialidades</SelectItem>
                {/* ...outras especialidades */}
              </SelectContent>
            </Select>
            <Select
              value={filtroStatus}
              onValueChange={handleFiltroStatusChange}
            >
              <SelectTrigger className="w-full lg:w-[250px] !h-[48px] border-[#141736]">
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

          {/* */}
          <div className="border bg-[#141736] text-white rounded-t-lg py-2">
            <div className="grid grid-cols-2 lg:grid-cols-7 gap-4 items-center px-6 py-3">
              <div className="lg:col-span-1">
                <h3 className="font-semibold text-sm uppercase">Paciente</h3>
              </div>
              <div className="lg:col-span-1">
                <h3 className="font-semibold text-sm uppercase">Especialidade</h3>
              </div>
              <div className="lg:col-span-1">
                <h3 className="font-semibold text-sm uppercase">Médico</h3>
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
                <h3 className="font-semibold text-sm uppercase">Ações</h3>
              </div>
            </div>
          </div>
          <div className="flex-1">
            {atendimentosPaginados.map((atendimento, index) => (
              <div
                key={atendimento.id}
                className={`${
                  index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                } hover:bg-slate-100 transition-colors duration-200`}
              >
                <div className={`grid grid-cols-2 lg:grid-cols-7 gap-4 items-center p-6 border border-slate-200 ${index === atendimentosPaginados.length - 1  ? 'rounded-b-lg' : ''}`}>
                  <div className="lg:col-span-1">
                    <p className="text-slate-800 text-sm font-medium">
                      {atendimento.paciente}
                    </p>
                  </div>

                  <div className="lg:col-span-1">
                    <p className="text-slate-600 text-sm">
                      {atendimento.especialidade}
                    </p>
                  </div>

                  <div className="lg:col-span-1">
                    <p className="text-slate-600 text-sm">
                      {atendimento.medico}
                    </p>
                  </div>

                  <div className="lg:col-span-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <p className="text-slate-600 text-sm">
                        {atendimento.data}
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <p className="text-slate-600 text-sm font-medium">
                        {atendimento.hora}
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
                        {atendimento.status}
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-1 flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-[#141736] hover:bg-[#282d64] text-white hover:text-white font-medium"
                    >
                      Ver
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {atendimentosFiltrados.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Nenhuma consulta encontrada com os filtros aplicados.
                </p>
              </div>
            )}
          </div>

          {atendimentosFiltrados.length > 0 && (
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
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
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
                  disabled={paginaAtual === totalPaginas}
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
