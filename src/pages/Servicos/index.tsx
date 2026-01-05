import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import {
  Plus,
  EllipsisVertical,
  Edit2,
  Trash2,
  ListFilter,
  Package,
} from "lucide-react";
import { useState } from "react";
import {
  useGetAllServices,
  type IService,
} from "@/hooks/api/useGetAllServices";
import { ModalCreateService } from "@/components/ModalCreateSevice";
import { useDeleteService } from "@/hooks/api/useDeleteService";
import { ModalAlert } from "@/components/ModalAlert";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Servicos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "service" | "package">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [serviceToEdit, setServiceToEdit] = useState<IService | null>(null);

  const { data: services } = useGetAllServices();
  const queryClient = useQueryClient();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleOpenCreateModal = () => {
    setServiceToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: IService) => {
    setServiceToEdit(service);
    setIsModalOpen(true);
  };

  const { mutate: deleteService } = useDeleteService({
    onSuccessFn: () => {
      setIsDeleteModalOpen(false);
      setServiceToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const handleConfirmDelete = () => {
    if (serviceToDelete) {
      deleteService(serviceToDelete);
    }
  };

  const serviceNameToDelete =
    services?.find((s) => s.id === serviceToDelete)?.name || "";

  // Formata duration (minutos) para um rótulo legível no card
  const formatDurationLabel = (totalMinutes?: number | null) => {
    if (totalMinutes === null || totalMinutes === undefined) return "-";
    if (!Number.isFinite(totalMinutes)) return "-";
    if (totalMinutes === 0) return "0m";
    if (totalMinutes < 60) return `${totalMinutes}m`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
  };

  const EmptyState = () => (
    <main
      className="flex items-center justify-center text-center p-8"
      style={{ minHeight: "calc(100vh - 300px)" }}
    >
      <div>
        <Package className="mx-auto h-24 w-24" />
        <h2 className="mt-6 text-2xl font-semibold text-gray-800">
          Comece a cadastrar seus serviços e pacotes
        </h2>
        <p className="mt-2 text-base text-gray-500">
          Você ainda não possui nenhum serviço ou pacote. <br />
        </p>
      </div>
    </main>
  );

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      <header className="border-b border-b-[#DADCE0] h-full max-h-[80px] p-4 bg-white">
        <h1 className="text-[30px] font-medium">Serviços & Pacotes</h1>
      </header>

      {services && services.length > 0 ? (
        <main className="p-4 md:p-8">
          <div
            className="bg-white p-4 mb-4 rounded-lg"
            style={{ boxShadow: "0 6px 12px -6px #A4A4A4" }}
          >
            <div className="flex flex-col md:flex-row items-start md:items-end gap-[30px]">
              <Input
                type="text"
                label="Pesquisar"
                placeholder="Pesquise por serviço ou pacote"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full md:flex-1"
              />
              <div className="w-full md:w-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="!text-[#121535] w-full md:w-[236px] !border-[#121535] flex items-center justify-center gap-2"
                    >
                      <ListFilter size={16} />
                      {filter === "all" ? "Ver Todos" : filter === "service" ? "Serviços" : "Pacotes"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Mostrar</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => setFilter("all")}>Todos</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setFilter("service")}>Serviços</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setFilter("package")}>Pacotes</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button
                className="bg-[#121535] transition-colors gap-1 text-white text-[15px] w-full md:w-auto"
                onClick={handleOpenCreateModal}
              >
                <Plus size={15} />
                Adicionar Serviço/Pacote
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services
              ?.filter((s) => {
                if (filter === "service") return s.type === "SERVICE";
                if (filter === "package") return s.type === "PACKAGE";
                return true;
              })
              .filter((s) =>
                s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.description?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((service) => (
              <div
                key={service.id}
                className="bg-white shadow-custom border border-gray-200 rounded-lg p-6 min-h-[160px] relative overflow-hidden"
              >
                {/* Badge + Dropdown (top-right) */}
                <div className="absolute top-4 right-4 flex items-center gap-[5px]">
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full text-white ${service.type === 'SERVICE' ? 'bg-[#0177fb]' : 'bg-[#121535]'}`}>
                    {service.type === "SERVICE" ? "Serviço" : "Pacote"}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="p-1.5">
                        <EllipsisVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => handleOpenEditModal(service)}>
                          Editar
                          <DropdownMenuShortcut>
                            <Edit2 />
                          </DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setServiceToDelete(service.id);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          Excluir
                          <DropdownMenuShortcut>
                            <Trash2 />
                          </DropdownMenuShortcut>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="pr-32">
                  <h2 className="text-black text-xl font-semibold truncate">{service.name}</h2>
                  {service.type === 'SERVICE' ? (
                    <p className="text-gray-400 text-sm mt-3 line-clamp-3">{service.description}</p>
                  ) : (
                    <div className="text-gray-400 text-sm mt-3 space-y-1">
                      {service.description ? service.description.split(/\n|,/)?.map((line, idx) => (
                        <div key={idx} className="truncate">{line.trim()}</div>
                      )) : <div className="truncate">{service.description}</div>}
                    </div>
                  )}
                </div>

                {/* Right column: price / previous / discount or duration+price */}
                <div className="absolute bottom-4 right-4 text-right">
                  {service.type === 'PACKAGE' ? (
                    <>
                      {(service as any).previousPrice ? (
                        <div className="text-gray-400 text-sm line-through">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number((service as any).previousPrice))}
                        </div>
                      ) : null}
                      <div className="text-black font-semibold text-lg mt-1">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(service.price))}
                      </div>
                      {(service as any).previousPrice ? (
                        <div className="text-[#0177fb] text-sm mt-1">
                          {Math.round(((Number((service as any).previousPrice) - Number(service.price)) / Number((service as any).previousPrice)) * 100)}% off
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <div className="text-gray-400 text-sm">{formatDurationLabel(service.duration)}</div>
                      <div className="text-black font-semibold text-lg mt-1">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(service.price))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      ) : (
        <>
          <div className="p-4 md:p-8">
            <div
              className="bg-white p-4 mb-4 rounded-lg"
              style={{ boxShadow: "0 6px 12px -6px #A4A4A4" }}
            >
                <div className="flex flex-col md:flex-row items-start md:items-end gap-[30px]">
                  <Input
                    type="text"
                    label="Pesquisar"
                    placeholder="Pesquise por serviço ou pacote"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full md:flex-1"
                  />
                  <div className="w-full md:w-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="!text-[#121535] w-full md:w-[236px] !border-[#121535] flex items-center justify-center gap-2"
                        >
                          <ListFilter size={16} />
                          {filter === "all" ? "Ver Todos" : filter === "service" ? "Serviços" : "Pacotes"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuLabel>Mostrar</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => setFilter("all")}>Todos</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setFilter("service")}>Serviços</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setFilter("package")}>Pacotes</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Button
                    className="bg-[#121535] hover:brightness-110 transition-colors gap-1 text-white text-[15px] w-full md:w-auto"
                    onClick={handleOpenCreateModal}
                  >
                    <Plus size={15} />
                    Adicionar Serviço/Pacote
                  </Button>
                </div>
              </div>
          </div>
          <EmptyState />
        </>
      )}

      <ModalCreateService
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        service={serviceToEdit}
      />
      <ModalAlert
        isModalOpen={isDeleteModalOpen}
        setIsModalOpen={setIsDeleteModalOpen}
        onSubmit={handleConfirmDelete}
        serviceName={serviceNameToDelete}
      />
    </div>
  );
};
