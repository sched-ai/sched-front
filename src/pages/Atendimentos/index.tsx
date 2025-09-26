import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, Clock, Filter, Check, ArrowRight } from "lucide-react";

interface Atendimento {
  id: string;
  cliente: string;
  servico: string;
  data: string;
  hora: string;
  status: "concluido" | "agendado" | "cancelado";
  duracao: string;
  profissional: string;
}

export const Atendimentos = () => {
  const [filtro, setFiltro] = useState("todos");
  const [pesquisa, setPesquisa] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const atendimentos: Atendimento[] = [
    {
      id: "1",
      cliente: "Maria Silva",
      servico: "Corte e Escova",
      data: "15/01/2024",
      hora: "09:00",
      status: "concluido",
      duracao: "1h 30min",
      profissional: "Ana Santos"
    },
    {
      id: "2",
      cliente: "João Santos",
      servico: "Barba",
      data: "16/01/2024",
      hora: "14:30",
      status: "concluido",
      duracao: "45min",
      profissional: "Carlos Lima"
    },
    {
      id: "3",
      cliente: "Ana Costa",
      servico: "Coloração",
      data: "17/01/2024",
      hora: "10:15",
      status: "agendado",
      duracao: "2h 30min",
      profissional: "Ana Santos"
    },
    {
      id: "4",
      cliente: "Pedro Oliveira",
      servico: "Corte",
      data: "18/01/2024",
      hora: "16:00",
      status: "cancelado",
      duracao: "1h",
      profissional: "Carlos Lima"
    },
    {
      id: "5",
      cliente: "Fernanda Alves",
      servico: "Manicure",
      data: "19/01/2024",
      hora: "11:45",
      status: "concluido",
      duracao: "1h 15min",
      profissional: "Juliana Costa"
    },
    {
      id: "6",
      cliente: "Roberto Silva",
      servico: "Corte e Barba",
      data: "20/01/2024",
      hora: "15:30",
      status: "agendado",
      duracao: "1h 45min",
      profissional: "Carlos Lima"
    }
  ];

  const calcularEstatisticas = () => {
    const total = atendimentos.length;
    const concluidos = atendimentos.filter(a => a.status === "concluido").length;
    const agendados = atendimentos.filter(a => a.status === "agendado").length;
    const cancelados = atendimentos.filter(a => a.status === "cancelado").length;

    return {
      total,
      concluidos,
      agendados,
      cancelados
    };
  };

  const estatisticas = calcularEstatisticas();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluido": return "bg-green-500";
      case "agendado": return "bg-blue-500";
      case "cancelado": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };


  const atendimentosFiltrados = atendimentos.filter(atendimento => {
    const matchFiltro = filtro === "todos" || atendimento.servico.toLowerCase().includes(filtro.toLowerCase());
    const matchPesquisa = atendimento.cliente.toLowerCase().includes(pesquisa.toLowerCase()) ||
      atendimento.servico.toLowerCase().includes(pesquisa.toLowerCase()) ||
      atendimento.profissional.toLowerCase().includes(pesquisa.toLowerCase());
    const matchStatus = filtroStatus === "todos" || atendimento.status === filtroStatus;
    return matchFiltro && matchPesquisa && matchStatus;
  });

  return (
    <div className="w-full flex flex-col h-full">
      <header className="border-b border-b-[#DADCE0] h-full max-h-[80px] p-4">
        <h1 className="text-[30px] font-medium">Atendimentos</h1>
      </header>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total de Atendimentos</p>
                <p className="text-3xl font-bold">{estatisticas.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Concluídos</p>
                <p className="text-3xl font-bold">{estatisticas.concluidos}</p>
              </div>
              <Check className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Agendados</p>
                <p className="text-3xl font-bold">{estatisticas.agendados}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Cancelados</p>
                <p className="text-3xl font-bold">{estatisticas.cancelados}</p>
              </div>
              <Clock className="w-8 h-8 text-red-200" />
            </div>
          </div>
        </div>


        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Filtros</h2>
          </div>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Pesquisar por cliente, serviço ou profissional..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filtro} onValueChange={setFiltro}>
              <SelectTrigger className="w-[250px] !h-[48px] cursor-pointer !text-[16px] font-normal text-[#141736] hover:bg-blue-50 border-[#141736] [&>svg]:text-white">
                <SelectValue placeholder="Filtrar por serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os serviços</SelectItem>
                <SelectItem value="corte">Corte</SelectItem>
                <SelectItem value="barba">Barba</SelectItem>
                <SelectItem value="coloração">Coloração</SelectItem>
                <SelectItem value="escova">Escova</SelectItem>
                <SelectItem value="manicure">Manicure</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-[250px] !h-[48px] cursor-pointer !text-[16px] font-normal text-[#141736] hover:bg-blue-50 border-[#141736] [&>svg]:text-white">
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
        </div>
        <div className="bg-[#141736] rounded-lg p-4 mb-1 shadow-sm">
          <div className="grid grid-cols-2 lg:grid-cols-7 gap-4 items-center">
            <div className="lg:col-span-1">
              <h3 className="font-semibold text-lg text-white">Cliente</h3>
            </div>
            <div className="lg:col-span-1">
              <h3 className="font-semibold text-lg text-white">Serviço</h3>
            </div>
            <div className="lg:col-span-1">
              <h3 className="font-semibold text-lg text-white">Profissional</h3>
            </div>
            <div className="lg:col-span-1">
              <h3 className="font-semibold text-lg text-white">Data</h3>
            </div>
            <div className="lg:col-span-1">
              <h3 className="font-semibold text-lg text-white">Hora</h3>
            </div>
            <div className="lg:col-span-1">
              <h3 className="font-semibold text-lg text-white">Status</h3>
            </div>
            <div className="lg:col-span-1 flex justify-center">
              <h3 className="font-semibold text-lg text-white">Ações</h3>
            </div>
          </div>
        </div>

        <div className="space-y-1 flex-1">
          {atendimentosFiltrados.map((atendimento) => (
            <div
              key={atendimento.id}
              className="bg-gradient-to-r from-blue-900 to-[#141736] text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200 w-full border border-blue-700"
            >
              <div className="grid grid-cols-2 lg:grid-cols-7 gap-4 items-center">
                <div className="lg:col-span-1">
                  <p className="text-blue-100 text-lg font-medium">{atendimento.cliente}</p>
                </div>

                <div className="lg:col-span-1">
                  <p className="text-blue-100 text-lg">{atendimento.servico}</p>
                </div>

                <div className="lg:col-span-1">
                  <p className="text-blue-100 text-lg">{atendimento.profissional}</p>
                </div>

                <div className="lg:col-span-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-200" />
                    <p className="text-blue-100 text-lg">{atendimento.data}</p>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-200" />
                    <p className="text-blue-100 text-lg font-medium">{atendimento.hora}</p>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(atendimento.status)}`}></div>
                    <span className="text-blue-100 text-lg capitalize">{atendimento.status}</span>
                  </div>
                </div>

                <div className="lg:col-span-1 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-900 hover:bg-blue-50 border-white font-medium justify-end"
                  >
                    Ver
                    <ArrowRight className="w-4 h-4 mr-2" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {atendimentosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nenhum atendimento encontrado com os filtros aplicados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
