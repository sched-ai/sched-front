import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import {
  Plus,
  ClipboardList,
  EllipsisVertical,
  Edit2,
  Trash2,
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

  const EmptyState = () => (
    <main
      className="flex items-center justify-center text-center p-8"
      style={{ minHeight: "calc(100vh - 80px)" }}
    >
      <div>
        <ClipboardList className="mx-auto h-24 w-24 text-gray-300" />
        <h2 className="mt-6 text-2xl font-semibold text-gray-800">
          Comece a cadastrar seus serviços e pacotes
        </h2>
        <p className="mt-2 text-base text-gray-500">
          Você ainda não possui nenhum serviço ou pacote. <br />
          Clique no botão abaixo para adicionar o primeiro.
        </p>
        <Button
          className="mt-6 bg-blue-600 transition-colors gap-2"
          onClick={handleOpenCreateModal}
        >
          <Plus size={18} />
          Adicionar Serviço
        </Button>
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
          <div className="bg-white shadow-custom p-4 mb-4 rounded-lg">
            <div className="flex items-end gap-6">
              <Input
                type="text"
                label="Pesquisar"
                placeholder="Pesquisar por paciente, especialidade ou médico..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full"
              />
              <Button
                className="bg-blue-600 transition-colors gap-1"
                onClick={handleOpenCreateModal}
              >
                <Plus size={18} />
                Adicionar Serviço
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services?.map((service) => (
              <div
                key={service.id}
                className="bg-white shadow-custom border border-gray-200 rounded-lg p-4 flex flex-col justify-between min-h-[160px]"
              >
                <div className="flex flex-col">
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm font-semibold px-2.5 py-0.5 rounded-sm ${
                        service.type === "SERVICE"
                          ? "bg-blue-600 text-blue-100"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {service.type === "SERVICE" ? "Serviço" : "Pacote"}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild className="w-fit border-none">
                        <Button variant="outline">
                          <EllipsisVertical />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() => handleOpenEditModal(service)}
                          >
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
                  <div className="flex justify-between items-start mb-1">
                    <h2 className="text-md font-semibold truncate max-w-full">
                      {service.name}
                    </h2>
                  </div>
                  <p className="text-gray-600 mb-2 text-[12px] line-clamp-3">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </main>
      ) : (
        <EmptyState />
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
