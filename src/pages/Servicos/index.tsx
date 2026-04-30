import { Button } from "@/components/ui/button";
import {
  Plus,
  EllipsisVertical,
  Edit2,
  Trash2,
  Package,
  Search,
  Clock3,
  BriefcaseBusiness
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Servicos = () => {
  const navigate = useNavigate();
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
    if (service.type === "PACKAGE") {
      navigate(`/services/packages/${service.id}/edit`);
    } else {
      setServiceToEdit(service);
      setIsModalOpen(true);
    }
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
      const service = services?.find(s => s.id === serviceToDelete);
      const isPackage = service?.type === "PACKAGE";
      deleteService({ 
        id: serviceToDelete, 
        label: isPackage ? "Pacote" : "Serviço",
        successMessage: isPackage ? "Pacote excluído com sucesso!" : "Serviço excluído com sucesso!"
      });
    }
  };

  const serviceNameToDelete =
    services?.find((s) => s.id === serviceToDelete)?.name || "";

  const formatCurrency = (value?: number | null) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return "R$ 0,00";
    }

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(value));
  };

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

  const filteredServices = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return (services ?? [])
      .filter((service) => {
        if (filter === "service") return service.type === "SERVICE";
        if (filter === "package") return service.type === "PACKAGE";
        return true;
      })
      .filter((service) => {
        if (!normalizedSearch) return true;

        return (
          service.name?.toLowerCase().includes(normalizedSearch) ||
          service.description?.toLowerCase().includes(normalizedSearch)
        );
      });
  }, [filter, searchTerm, services]);

  const totalServices = services?.length ?? 0;
  const hasAnyService = totalServices > 0;
  const hasSearchOrFilter = searchTerm.trim().length > 0 || filter !== "all";

  const EmptyState = ({
    title,
    description,
    showAction = true,
  }: {
    title: string;
    description: string;
    showAction?: boolean;
  }) => (
    <main className="rounded-xl border border-dashed border-border bg-card/30 p-10 text-center">
      <div className="mx-auto">
        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>

        {showAction && (
          <Button
            onClick={handleOpenCreateModal}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        )}
      </div>
    </main>
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto p-6 md:p-8 space-y-6">
        <section className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Serviços</h1>
            <p className="mt-2 text-[16px] text-muted-foreground">
              Gerencie seus serviços e pacotes em um único lugar.
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-2 self-start h-11 px-5 rounded-lg whitespace-nowrap"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                Novo item
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleOpenCreateModal}>
                <BriefcaseBusiness className="w-4 h-4 mr-2" />
                Novo Serviço
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/services/packages/new")}>
                <Package className="w-4 h-4 mr-2" />
                Novo Pacote
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </section>

        <section className="border border-border rounded-lg p-4 bg-card shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pesquisar por serviço ou pacote"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 outline-none transition-colors hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

        </section>

        {hasAnyService ? (
          filteredServices.length > 0 ? (
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => {
                const previousPrice = Number((service as IService & { previousPrice?: number }).previousPrice);
                const hasPreviousPrice = Number.isFinite(previousPrice) && previousPrice > Number(service.price);
                const discountPercentage = hasPreviousPrice
                  ? Math.round(((previousPrice - Number(service.price)) / previousPrice) * 100)
                  : null;

                return (
              <div
                key={service.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm min-h-[186px] flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-md ${
                      service.type === "SERVICE"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {service.type === "SERVICE" ? "Serviço" : "Pacote"}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-100">
                        <EllipsisVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48" align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => handleOpenEditModal(service)}>
                          Editar
                          <DropdownMenuShortcut>
                            <Edit2 className="h-4 w-4" />
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
                            <Trash2 className="h-4 w-4" />
                          </DropdownMenuShortcut>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-3">
                  <h2 className="text-base font-semibold text-slate-900 line-clamp-1">{service.name}</h2>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2 min-h-10">
                    {service.description || "Sem descrição informada."}
                  </p>
                </div>

                <div className="mt-4 flex items-end justify-between gap-4">
                  {service.type === "PACKAGE" ? (
                    <div className="text-xs text-muted-foreground">
                      {(service as any).packageItems?.length || 0} serviços incluídos
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatDurationLabel(service.duration)}
                    </div>
                  )}

                  <div className="text-right">
                    {hasPreviousPrice && (
                      <div className="text-xs text-slate-400 line-through">
                        {formatCurrency(previousPrice)}
                      </div>
                    )}

                    <div className="text-lg font-semibold text-slate-900 leading-none mt-1">
                      {formatCurrency(Number(service.price))}
                    </div>

                    {discountPercentage !== null && (
                      <div className="text-xs text-blue-600 mt-1">{discountPercentage}% off</div>
                    )}
                  </div>
                </div>
              </div>
                );
              })}
            </section>
          ) : (
            <EmptyState
              title="Nenhum resultado encontrado"
              description={`Não encontramos itens para "${searchTerm}" com o filtro selecionado.`}
              showAction={false}
            />
          )
        ) : (
          <EmptyState
            title="Comece cadastrando seus serviços"
            description="Você ainda não possui serviços ou pacotes cadastrados."
          />
        )}

        {hasSearchOrFilter && hasAnyService && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="px-4"
              onClick={() => {
                setSearchTerm("");
                setFilter("all");
              }}
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </main>

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
