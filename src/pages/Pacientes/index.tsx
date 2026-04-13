import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetAllClients } from "@/hooks/api/useGetAllClients";
import type { ClientAPI } from "@/hooks/api/useGetAllClients";
import { useDeleteClient } from "@/hooks/api/useDeleteClient";
import { formatCpf, formatPhone } from "@/util/helper";

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

const itemsPerPageOptions = [5, 10, 20, 50];

export const Pacientes = () => {
  const navigate = useNavigate();
  const itemsDropdownRef = useRef<HTMLDivElement | null>(null);

  const [pesquisa, setPesquisa] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [itemsOpen, setItemsOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientAPI | null>(null);

  const debouncedPesquisa = useDebounce(pesquisa, 500);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (itemsDropdownRef.current && !itemsDropdownRef.current.contains(target)) {
        setItemsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { data: response, isLoading } = useGetAllClients({
    search: debouncedPesquisa,
    page: paginaAtual,
    limit: itensPorPagina,
  });

  const { mutate: deleteClient, isPending: isDeleting } = useDeleteClient();

  const pacientes = response?.data || [];
  const meta = response?.meta || { total: 0, totalPages: 1, page: 1, limit: 10 };

  const pageNumbers = useMemo(() => {
    return Array.from({ length: meta.totalPages }, (_, index) => index + 1).slice(
      Math.max(0, paginaAtual - 3),
      Math.min(meta.totalPages, paginaAtual + 2)
    );
  }, [meta.totalPages, paginaAtual]);

  const handlePesquisaChange = (value: string) => {
    setPesquisa(value);
    setPaginaAtual(1);
  };

  const handleItensPorPaginaChange = (value: number) => {
    setItensPorPagina(value);
    setPaginaAtual(1);
    setItemsOpen(false);
  };

  const handleDeleteClick = (client: ClientAPI) => {
    setClientToDelete(client);
  };

  const handleConfirmDelete = () => {
    if (!clientToDelete) return;

    deleteClient(clientToDelete.id, {
      onSuccess: () => {
        setClientToDelete(null);
      },
    });
  };

  const irParaPagina = (pagina: number) => {
    setPaginaAtual(pagina);
  };

  const irParaProximaPagina = () => {
    if (paginaAtual < meta.totalPages) {
      setPaginaAtual((pagina) => pagina + 1);
    }
  };

  const irParaPaginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual((pagina) => pagina - 1);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="p-6 md:p-8 mx-auto space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground">Pacientes</h1>
            <p className="text-muted-foreground mt-2">
             Gerencie os pacientes cadastrados e acompanhe os históricos com rapidez.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => navigate("/patients/new")}
            className="bg-[#141736] hover:bg-[#141736]/80 text-white inline-flex items-center gap-2 self-start h-11 px-5 rounded-lg whitespace-nowrap"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Adicionar paciente
          </Button>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="p-5 border-b border-slate-100">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Pesquisar por nome, CPF ou e-mail..."
                  value={pesquisa}
                  onChange={(event) => handlePesquisaChange(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                />
              </div>
            </div>
          </div>

          <div className="overflow-hidden">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[17%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[22%]" />
                <col className="w-[11%]" />
                <col className="w-[11%]" />
                <col className="w-[9%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Nome", "CPF", "Telefone", "E-mail", "Cadastro", "Histórico", "Ações"].map((column) => (
                    <th
                      key={column}
                      className="px-5 py-4 text-left text-xs text-slate-500 uppercase tracking-wide font-medium"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm">
                      Carregando pacientes...
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  pacientes.map((paciente, index) => {
                    const isLast = index === pacientes.length - 1;
                    const createdAt = paciente.createdAt ? format(new Date(paciente.createdAt), "dd/MM/yyyy") : "-";
                    const displayEmail = paciente.email || "-";

                    return (
                      <tr
                        key={paciente.id}
                        className={`border-b border-slate-100 hover:bg-slate-50 transition ${isLast ? "border-b-0" : ""}`}
                      >
                        <td className="px-5 py-5 text-slate-900 align-middle">
                          <span className="block truncate" title={paciente.name}>
                            {paciente.name}
                          </span>
                        </td>
                        <td className="px-5 py-5 text-slate-600 align-middle">
                          <span className="block truncate" title={paciente.cpf ? formatCpf(paciente.cpf) : "-"}>
                            {paciente.cpf ? formatCpf(paciente.cpf) : "-"}
                          </span>
                        </td>
                        <td className="px-5 py-5 text-slate-600 align-middle">
                          <span className="block truncate" title={paciente.phone ? formatPhone(paciente.phone) : "-"}>
                            {paciente.phone ? formatPhone(paciente.phone) : "-"}
                          </span>
                        </td>
                        <td className="px-5 py-5 text-slate-600 align-middle">
                          <span className="block truncate" title={displayEmail}>
                            {displayEmail}
                          </span>
                        </td>
                        <td className="px-5 py-5 text-slate-600 align-middle">
                          <span className="block truncate" title={createdAt}>
                            {createdAt}
                          </span>
                        </td>
                        <td className="px-5 py-5 align-middle">
                          <button
                            type="button"
                            title="Ver histórico do paciente"
                            onClick={() => navigate(`/patients/${paciente.id}/history`, { state: { paciente } })}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#141736] hover:bg-[#141736]/80 text-white text-xs transition whitespace-nowrap"
                          >
                            Ver
                            <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
                          </button>
                        </td>
                        <td className="px-5 py-5 align-middle">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              title="Editar paciente"
                              onClick={() => navigate(`/patients/${paciente.id}/edit`)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#141736] hover:bg-blue-50 hover:text-[#141736]/80 transition"
                            >
                              <Pencil className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                            <button
                              type="button"
                              title="Excluir paciente"
                              onClick={() => handleDeleteClick(paciente)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-500 hover:bg-red-50 hover:text-red-600 transition"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                {!isLoading && pacientes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm">
                      Nenhum paciente encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
                          onClick={() => handleItensPorPaginaChange(option)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition ${
                            itensPorPagina === option ? "text-[#141736] bg-blue-50" : "text-slate-700"
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
                        pagina === paginaAtual ? "bg-[#141736] text-white" : "text-slate-600 hover:bg-slate-100"
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

      <Dialog
        open={!!clientToDelete}
        onOpenChange={(open) => {
          if (!open) setClientToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md border border-slate-200 rounded-xl p-0 overflow-hidden">
          <div className="bg-white">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
              <DialogTitle className="text-slate-900">Excluir paciente</DialogTitle>
              <DialogDescription className="text-slate-500 pt-2">
                Tem certeza que deseja excluir o paciente <strong className="text-slate-900">{clientToDelete?.name}</strong>?
                Esta ação não pode ser desfeita. Agendamentos futuros deste paciente também serão removidos.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="px-6 py-4 border-t border-slate-100 flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setClientToDelete(null)}
                disabled={isDeleting}
                className="h-10 px-5 border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="h-10 px-5"
              >
                {isDeleting ? "Excluindo..." : "Excluir"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pacientes;
