import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
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
  Filter,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useGetAllClients } from "@/hooks/api/useGetAllClients";
import { format } from "date-fns";
import { CreateClientModal } from "@/components/CreateClientModal";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}


export const Pacientes = () => {
  // ... existing list state ...
  const [pesquisa, setPesquisa] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedPesquisa = useDebounce(pesquisa, 500);

  const { data: response, isLoading } = useGetAllClients({
    search: debouncedPesquisa,
    page: paginaAtual,
    limit: itensPorPagina,
  });

  const pacientes = response?.data || [];
  const meta = response?.meta || { total: 0, totalPages: 1, page: 1, limit: 10 };

  // ... paging handlers ...
  const handlePesquisaChange = (val: string) => { setPesquisa(val); setPaginaAtual(1); };
  const handleItensPorPaginaChange = (val: string) => { setItensPorPagina(Number(val)); setPaginaAtual(1); };
  const irParaPagina = (p: number) => setPaginaAtual(p);
  const irParaProximaPagina = () => { if (paginaAtual < meta.totalPages) setPaginaAtual(paginaAtual + 1); };
  const irParaPaginaAnterior = () => { if (paginaAtual > 1) setPaginaAtual(paginaAtual - 1); };

  // Tooltip
  const [tooltip, setTooltip] = useState({ visible: false, text: "", x: 0, y: 0 });
  const handleMouseEnter = (e: React.MouseEvent, text: string) => { setTooltip({ visible: true, text, x: e.clientX + 12, y: e.clientY + 12 }); };
  const handleMouseMove = (e: React.MouseEvent) => { setTooltip((t) => (t.visible ? { ...t, x: e.clientX + 12, y: e.clientY + 12 } : t)); };
  const handleMouseLeave = () => setTooltip({ visible: false, text: "", x: 0, y: 0 });
  
  return (
    <div className="w-full flex flex-col h-full">
      {/* ... keeping header and table code unchanged ... */}
      <header className="border-b border-b-[#DADCE0] h-full max-h-[80px] p-4">
        <h1 className="text-[30px] font-medium">Pacientes</h1>
      </header>
      <div className="p-6">
        <div className="rounded-lg p-6 mb-2 border bg-white shadow-custom">
            {/* ... Filters ... */}
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-[#141736]" />
            <h2 className="text-lg font-semibold text-[#141736]">Filtros</h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 mb-6 items-center">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Pesquise por nome, CPF ou e-mail..."
                value={pesquisa}
                onChange={(e) => handlePesquisaChange(e.target.value)}
                className="w-full"
              />
            </div>

            <Button 
                className="bg-[#121535] text-white px-8 py-2 hover:bg-[#1f2347] transition-colors" 
                onClick={() => setIsModalOpen(true)}
            >
              + Adicionar paciente
            </Button>
          </div>
            
            {/* ... Table Header ... */}
          <div className="border bg-[#141736] text-white rounded-t-lg py-2">
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 items-center px-6 py-3 min-w-0">
               {['Nome', 'CPF', 'Telefone', 'E-mail', 'Cadastro', 'Histórico'].map((h, i) => (
                   <div key={h} className={`${i === 5 ? 'flex justify-center' : ''} lg:col-span-1`}>
                        <h3 className="font-semibold text-sm uppercase">{h}</h3>
                   </div>
               ))}
            </div>
          </div>

          <div className="flex-1">
            {isLoading ? (
                <div className="text-center py-12">
                   <p className="text-gray-500 text-lg">Carregando...</p>
                </div>
            ) : pacientes.map((p, index) => {
                const createdAt = p.createdAt ? format(new Date(p.createdAt), 'dd/MM/yyyy') : '-';
                return (
              <div
                key={p.id}
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-slate-100 transition-colors duration-200`}
              >
                <div className={`grid grid-cols-2 lg:grid-cols-6 gap-4 items-center p-6 border border-slate-200 min-w-0 ${index === pacientes.length - 1  ? 'rounded-b-lg' : ''}`}>
                  <div className="lg:col-span-1">
                    <p className="text-slate-800 text-sm font-medium truncate" onMouseEnter={(e) => handleMouseEnter(e, p.name)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>{p.name}</p>
                  </div>
                  <div className="lg:col-span-1"><p className="text-slate-600 text-sm truncate">{p.cpf}</p></div>
                  <div className="lg:col-span-1"><p className="text-slate-600 text-sm truncate">{p.phone || '-'}</p></div>
                  <div className="lg:col-span-1">
                    <p className="text-slate-600 text-sm truncate" onMouseEnter={(e) => handleMouseEnter(e, p.email || '-')} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>{p.email || '-'}</p>
                  </div>
                  <div className="lg:col-span-1"><p className="text-slate-600 text-sm truncate">{createdAt}</p></div>
                  <div className="lg:col-span-1 flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-[#141736] hover:bg-[#282d64] text-white hover:text-white font-medium"
                      onClick={() => navigate(`/patients/${p.id}/history`, { state: { paciente: p } })}
                    >
                      Ver <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            )})}
             {!isLoading && pacientes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Nenhum paciente encontrado.</p>
              </div>
            )}
          </div>
            
            {/* ... Pagination (unchanged logic) ... */}
          {!isLoading && meta.total > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 rounded-lg">
               {/* ... (Pagination controls same as before) ... */}
               <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">Mostrando</span>
                 <Select value={itensPorPagina.toString()} onValueChange={handleItensPorPaginaChange}>
                   <SelectTrigger className="w-[100px] !h-[36px] cursor-pointer bg-white">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     {[5, 10, 20, 50].map(v => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}
                   </SelectContent>
                 </Select>
                 <span className="text-sm text-slate-600">itens por página</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={irParaPaginaAnterior} disabled={paginaAtual === 1} className="flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Anterior</Button>
                <div className="flex items-center gap-1">
                   {/* Simplified pagination map */}
                   {Array.from({ length: meta.totalPages }, (_, i) => i + 1).slice(Math.max(0, paginaAtual - 3), Math.min(meta.totalPages, paginaAtual + 2)).map((pagina) => (
                    <Button key={pagina} variant={pagina === paginaAtual ? "default" : "outline"} size="sm" onClick={() => irParaPagina(pagina)} className={`w-8 h-8 p-0 ${pagina === paginaAtual ? "bg-[#141736] text-white hover:bg-[#282c5e]" : "hover:bg-gray-100"}`}>{pagina}</Button>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={irParaProximaPagina} disabled={paginaAtual === meta.totalPages} className="flex items-center gap-1">Próxima <ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
          {tooltip.visible && <div className="fixed z-50 max-w-xs bg-black text-white text-sm px-2 py-1 rounded shadow-lg pointer-events-none" style={{ left: tooltip.x, top: tooltip.y }}>{tooltip.text}</div>}
        </div>
      </div>

       <CreateClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </div>
  );
};

export default Pacientes;
