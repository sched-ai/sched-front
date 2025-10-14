import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Plus, ClipboardList } from "lucide-react";
import { useState } from "react";
import { useGetAllServices } from "@/hooks/api/useGetAllServices";
import { ModalCreateService } from "@/components/ModalCreateSevice";

export const Servicos = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: services } = useGetAllServices();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

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
          onClick={() => setIsModalOpen(true)}
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
            {/* <div className="flex justify-start mb-6">
              <button
                onClick={() => handleCategoryChange("Todos")}
                className={`px-4 py-2 text-lg ${
                  activeCategory === "Todos"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => handleCategoryChange("Serviço")}
                className={`px-4 py-2 text-lg ${
                  activeCategory === "Serviço"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                }`}
              >
                Serviço
              </button>
              <button
                onClick={() => handleCategoryChange("PACKAGE")}
                className={`px-4 py-2 text-lg ${
                  activeCategory === "PACKAGE"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                }`}
              >
                Pacote
              </button>
            </div> */}
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
                onClick={() => setIsModalOpen(true)}
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
                className="bg-white shadow-custom border border-gray-200 rounded-lg p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold">{service.name}</h2>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        service.type === "SERVICE"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {service.type === "SERVICE" ? "Serviço" : "Pacote"}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">{service.description}</p>
            
                <div className="flex justify-around gap-2">
                  <Button
                    className="mt-6 text-center text-green-600 bg-green-100 hover:bg-green-200 font-semibold py-2 max-w-1/2 w-full"
                  >
                    Editar
                  </Button>
                  <Button
                    className="mt-6 text-center text-red-600 bg-red-100 hover:bg-red-200 font-semibold py-2 max-w-1/2 w-full"
                  >
                    Deletar
                  </Button>
                </div>
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
      />
    </div>
  );
};
