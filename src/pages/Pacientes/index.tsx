import { useNavigate } from "react-router-dom";
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
  Users,
  Calendar,
  Clock,
  Filter,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  cadastro: string;
  status: "Ok" | "Taxado";
}

export const Pacientes = () => {
  const [pesquisa, setPesquisa] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(5);
  const navigate = useNavigate();

  const pacientes: Paciente[] = [
    {
      id: "1",
      nome: "Maria Silva Santos",
      cpf: "024.156.746-07",
      telefone: "(21) 99909-8978",
      email: "msilva@gmail.com",
      cadastro: "15/01/2024",
      status: "Ok",
    },
    {
      id: "2",
      nome: "João Pedro Oliveira",
      cpf: "134.167.644-01",
      telefone: "(21) 99459-7648",
      email: "jp.oliveira@yahoo.com.br",
      cadastro: "16/01/2024",
      status: "Ok",
    },
    {
      id: "3",
      nome: "Ana Beatriz Costa",
      cpf: "146.776.927-10",
      telefone: "(22) 99876-6543",
      email: "bibicosta@gmail.com",
      cadastro: "17/01/2024",
      status: "Taxado",
    },
    {
      id: "4",
      nome: "Pedro Henrique Lima",
      cpf: "037.765.356-05",
      telefone: "(24) 99516-6548",
      email: "",
      cadastro: "18/01/2024",
      status: "Taxado",
    },
  ];

  const pacientesFiltrados = pacientes.filter((p) => {
    const matchPesquisa =
      p.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
      p.cpf.toLowerCase().includes(pesquisa.toLowerCase()) ||
      p.telefone.toLowerCase().includes(pesquisa.toLowerCase()) ||
      p.email.toLowerCase().includes(pesquisa.toLowerCase());

    const matchTipo = filtroTipo === "todos" || p.status === filtroTipo;
    return matchPesquisa && matchTipo;
  });

  const totalPaginas = Math.ceil(pacientesFiltrados.length / itensPorPagina);
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;
  const pacientesPaginados = pacientesFiltrados.slice(indiceInicial, indiceFinal);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ok":
        return "bg-green-500";
      case "Taxado":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handlePesquisaChange = (val: string) => {
    setPesquisa(val);
    setPaginaAtual(1);
  };

  const handleFiltroTipoChange = (val: string) => {
    setFiltroTipo(val);
    setPaginaAtual(1);
  };

  const handleItensPorPaginaChange = (val: string) => {
    setItensPorPagina(Number(val));
    setPaginaAtual(1);
  };

  const irParaPagina = (p: number) => setPaginaAtual(p);

  const irParaProximaPagina = () => {
    if (paginaAtual < totalPaginas) setPaginaAtual(paginaAtual + 1);
  };

  const irParaPaginaAnterior = () => {
    if (paginaAtual > 1) setPaginaAtual(paginaAtual - 1);
  };

  return (
    <div className="w-full flex flex-col h-full">
      <header className="border-b border-b-[#DADCE0] h-full max-h-[80px] p-4">
        <h1 className="text-[30px] font-medium">Pacientes</h1>
      </header>
      <div className="p-6">
        <div className="rounded-lg p-6 mb-2 border bg-white shadow-custom">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-[#141736]" />
            <h2 className="text-lg font-semibold text-[#141736]">Filtros</h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 mb-6 items-center">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Pesquise por paciente..."
                value={pesquisa}
                onChange={(e) => handlePesquisaChange(e.target.value)}
                className="w-full"
              />
            </div>

            <Select value={filtroTipo} onValueChange={handleFiltroTipoChange}>
              <SelectTrigger className="w-full lg:w-[250px] !h-[48px] border-[#A2A6BB66]">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="Ok">Ok</SelectItem>
                <SelectItem value="Taxado">Taxado</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-[#121535] text-white px-8 py-2" onClick={() => {}}>
              + Adiconar paciente
            </Button>
          </div>

          <div className="border bg-[#141736] text-white rounded-t-lg py-2">
            <div className="grid grid-cols-2 lg:grid-cols-7 gap-4 items-center px-6 py-3">
              <div className="lg:col-span-1">
                <h3 className="font-semibold text-sm uppercase">Nome</h3>
              </div>
              <div className="lg:col-span-1">
                <h3 className="font-semibold text-sm uppercase">CPF</h3>
              </div>
              <div className="lg:col-span-1">
                <h3 className="font-semibold text-sm uppercase">Telefone</h3>
              </div>
              <div className="lg:col-span-1">
                <h3 className="font-semibold text-sm uppercase">E-mail</h3>
              </div>
              <div className="lg:col-span-1">
                <h3 className="font-semibold text-sm uppercase">Cadastro</h3>
              </div>
              <div className="lg:col-span-1">
                <h3 className="font-semibold text-sm uppercase">Status</h3>
              </div>
              <div className="lg:col-span-1 flex justify-center">
                <h3 className="font-semibold text-sm uppercase">Histórico</h3>
              </div>
            </div>
          </div>

          <div className="flex-1">
            {pacientesPaginados.map((p, index) => (
              <div
                key={p.id}
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-slate-100 transition-colors duration-200`}
              >
                <div className={`grid grid-cols-2 lg:grid-cols-7 gap-4 items-center p-6 border border-slate-200 ${index === pacientesPaginados.length - 1  ? 'rounded-b-lg' : ''}`}>
                  <div className="lg:col-span-1">
                    <p className="text-slate-800 text-sm font-medium">{p.nome}</p>
                  </div>

                  <div className="lg:col-span-1">
                    <p className="text-slate-600 text-sm">{p.cpf}</p>
                  </div>

                  <div className="lg:col-span-1">
                    <p className="text-slate-600 text-sm">{p.telefone}</p>
                  </div>

                  <div className="lg:col-span-1">
                    <p className="text-slate-600 text-sm">{p.email || '-'}</p>
                  </div>

                  <div className="lg:col-span-1">
                    <p className="text-slate-600 text-sm">{p.cadastro}</p>
                  </div>

                  <div className="lg:col-span-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(p.status)}`} />
                      <span className="text-slate-700 text-sm">{p.status}</span>
                    </div>
                  </div>

                  <div className="lg:col-span-1 flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-[#141736] hover:bg-[#282d64] text-white hover:text-white font-medium"
                      onClick={() => navigate(`/appointment/${p.id}`, { state: { paciente: p } })}
                    >
                      Ver
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {pacientesFiltrados.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Nenhum paciente encontrado com os filtros aplicados.</p>
              </div>
            )}
          </div>

          {pacientesFiltrados.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">Mostrando</span>
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
                 <span className="text-sm text-slate-600">itens por página</span>
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
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                    <Button
                      key={pagina}
                      variant={pagina === paginaAtual ? "default" : "outline"}
                      size="sm"
                      onClick={() => irParaPagina(pagina)}
                      className={`w-8 h-8 p-0 ${pagina === paginaAtual ? "bg-[#141736] text-white hover:bg-[#282c5e]" : "hover:bg-gray-100"}`}
                    >
                      {pagina}
                    </Button>
                  ))}
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

export default Pacientes;
