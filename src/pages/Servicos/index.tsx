import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CustomRadioInput from "@/components/CustomRadioInput";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ItemType = "servico" | "pacote" | "";

const responsaveisMock = [
  { id: 1, nome: "Dr. Roberto Moreira" },
  { id: 2, nome: "Dra. Ana Beatriz Costa" },
  { id: 3, nome: "Dr. Carlos Eduardo Lima" },
  { id: 4, nome: "Dra. Fernanda Sampaio" },
];

const ITEMS_PER_PAGE = 6;

const servicosMock = [
  {
    id: 1,
    nome: "Cardiologia",
    descricao: "Consultas e exames para o coração e sistema circulatório.",
    categoria: "Serviço",
    subDescricao: "Dr. Roberto Moreira",
    tipoFerramenta: "Atendimento Clínico",
  },
  {
    id: 2,
    nome: "Raio-X de Tórax",
    descricao:
      "Exame de imagem para diagnóstico de condições pulmonares e cardíacas.",
    categoria: "pacote",
    subDescricao: "Diagnóstico por Imagem",
    tipoFerramenta: "Equipamento Radiológico",
  },
  {
    id: 3,
    nome: "Dermatologia",
    descricao:
      "Tratamento de pele, unhas e cabelos, incluindo pequenas cirurgias.",
    categoria: "Serviço",
    subDescricao: "Dra. Ana Beatriz Costa",
    tipoFerramenta: "Atendimento Clínico",
  },
  {
    id: 4,
    nome: "Hemograma Completo",
    descricao:
      "Análise detalhada das células sanguíneas para avaliação geral da saúde.",
    categoria: "pacote",
    subDescricao: "Análises Clínicas",
    tipoFerramenta: "Análise Laboratorial",
  },
  {
    id: 5,
    nome: "Ortopedia e Traumatologia",
    descricao: "Especialidade focada em lesões e doenças do sistema locomotor.",
    categoria: "Serviço",
    subDescricao: "Dr. Carlos Eduardo Lima",
    tipoFerramenta: "Atendimento Clínico",
  },
  {
    id: 6,
    nome: "Ultrassonografia Abdominal",
    descricao: "Avaliação dos órgãos internos do abdômen, como fígado e rins.",
    categoria: "pacote",
    subDescricao: "Diagnóstico por Imagem",
    tipoFerramenta: "Equipamento de Ultrassom",
  },
  {
    id: 7,
    nome: "Ginecologia e Obstetrícia",
    descricao: "Cuidado completo da saúde da mulher, incluindo pré-natal.",
    categoria: "Serviço",
    subDescricao: "Dra. Fernanda Sampaio",
    tipoFerramenta: "Atendimento Clínico",
  },
  {
    id: 8,
    nome: "Fisioterapia Motora",
    descricao: "Sessões para reabilitação de movimentos e alívio de dores.",
    categoria: "Serviço",
    subDescricao: "Reabilitação Física",
    tipoFerramenta: "Terapia Manual e Equipamentos",
  },
  {
    id: 9,
    nome: "Endocrinologia",
    descricao:
      "Diagnóstico e tratamento de distúrbios hormonais e metabólicos.",
    categoria: "Serviço",
    subDescricao: "Dr. Lucas Vasconcelos",
    tipoFerramenta: "Atendimento Clínico",
  },
  {
    id: 10,
    nome: "Exame de Glicemia",
    descricao:
      "Medição do nível de açúcar no sangue, essencial para diabéticos.",
    categoria: "pacote",
    subDescricao: "Análises Clínicas",
    tipoFerramenta: "Análise Laboratorial",
  },
  {
    id: 11,
    nome: "Nutrição Clínica",
    descricao: "Aconselhamento e plano alimentar personalizado para sua saúde.",
    categoria: "Serviço",
    subDescricao: "Acompanhamento Nutricional",
    tipoFerramenta: "Consulta Nutricional",
  },
  {
    id: 12,
    nome: "Ressonância Magnética",
    descricao: "Exame de imagem de alta definição para diagnóstico preciso.",
    categoria: "pacote",
    subDescricao: "Diagnóstico por Imagem",
    tipoFerramenta: "Equipamento de Ressonância",
  },
];
interface Servico {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  subDescricao: string;
  tipoFerramenta: string;
}

export const Servicos = () => {
  const [displayedServices, setDisplayedServices] = useState<Servico[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const filtered = servicosMock.filter((servico) => {
      const matchesCategory =
        activeCategory === "Todos" || servico.categoria === activeCategory;
      const matchesSearch =
        searchTerm === "" ||
        servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        servico.id.toString().includes(searchTerm);
      return matchesCategory && matchesSearch;
    });

    const newPageData = filtered.slice(0, ITEMS_PER_PAGE);
    setDisplayedServices(newPageData);

    setHasMore(filtered.length > newPageData.length);
    setCurrentPage(1);
  }, [searchTerm, activeCategory]);

  const loadMoreServices = () => {
    const filtered = servicosMock.filter((servico) => {
      const matchesCategory =
        activeCategory === "Todos" || servico.categoria === activeCategory;
      const matchesSearch =
        searchTerm === "" ||
        servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        servico.id.toString().includes(searchTerm);
      return matchesCategory && matchesSearch;
    });

    const nextPage = currentPage + 1;
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = nextPage * ITEMS_PER_PAGE;

    const newItems = filtered.slice(startIndex, endIndex);

    setDisplayedServices((prev) => [...prev, ...newItems]);
    setCurrentPage(nextPage);
    setHasMore(filtered.length > displayedServices.length + newItems.length);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (newCategory: string) => {
    setActiveCategory(newCategory);
  };

  const [itemType, setItemType] = useState<ItemType>("servico");
  const [hasResponsavel, setHasResponsavel] = useState("nao");

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  const [responsavel, setResponsavel] = useState("");
  const [departamento, setDepartamento] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const novoItem = {
      nome,
      descricao,
      categoria: itemType,
      responsavel,
      departamento,
    };
    console.log("Dados do novo item:", novoItem);
    alert("Item criado com sucesso! (Verifique o console)");
  };

  const handleItemTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setItemType(e.target.value as ItemType);
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      <header className="border-b border-b-[#DADCE0] h-full max-h-[80px] p-4 bg-white">
        <h1 className="text-[30px] font-medium">Serviços & Pacotes</h1>
      </header>
      <main className="p-4 md:p-8">
        <div className="bg-white shadow-custom p-4 mb-4 rounded-lg">
          <div className="flex justify-start mb-6">
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
              onClick={() => handleCategoryChange("pacote")}
              className={`px-4 py-2 text-lg ${
                activeCategory === "pacote"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500"
              }`}
            >
              pacote
            </button>
          </div>
          <div className="flex mb-6 items-center gap-6">
            <Input
              type="text"
              placeholder="Pesquisar por paciente, especialidade ou médico..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full"
            />
            <Button
              className="bg-blue-600 transition-colors"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus />
              Adicionar
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedServices.map((servico) => (
            <div
              key={servico.id}
              className="bg-white shadow-custom border border-gray-200 rounded-lg p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">{servico.nome}</h2>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      servico.categoria === "Serviço"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {servico.categoria}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{servico.descricao}</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center font-bold text-gray-500">
                    {servico.nome.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{servico.subDescricao}</h3>
                    <p className="text-sm text-gray-500">
                      {servico.tipoFerramenta}
                    </p>
                  </div>
                </div>
              </div>
              <a
                href="#"
                className="mt-6 text-center text-green-600 font-semibold py-2"
              >
                Editar
              </a>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="text-center mt-8">
            <Button
              onClick={loadMoreServices}
              className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Carregar Mais
            </Button>
          </div>
        )}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="min-h-[734px] px-0">
            <DialogHeader className="px-8">
              <DialogTitle>Adicionar novo</DialogTitle>
              <DialogDescription>
                Preencha o formulário para criar um novo serviço ou pacote.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 px-8 max-h-[630px] overflow-auto custom-scrollbar"
            >
              <Label className="font-semibold text-gray-700 text-lg">
                1. Selecione o tipo de item
              </Label>
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <CustomRadioInput
                  label="Serviço"
                  htmlFor="servico"
                  name="itemType"
                  value="servico"
                  checked={itemType === "servico"}
                  onChange={handleItemTypeChange}
                />
                <CustomRadioInput
                  label="Pacote"
                  htmlFor="pacote"
                  name="itemType"
                  value="pacote"
                  checked={itemType === "pacote"}
                  onChange={handleItemTypeChange}
                />
              </div>
              {itemType && (
                <>
                  <div className="mb-2">
                    <h2 className="font-semibold text-gray-700 text-lg">
                      2. Detalhes do{" "}
                      {itemType === "servico" ? "Serviço" : "Pacote"}
                    </h2>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div>
                      <Label
                        htmlFor="nome"
                        className="font-semibold text-gray-700"
                      >
                        Nome
                      </Label>
                      <Input
                        id="nome"
                        type="text"
                        placeholder="Ex: Cardiologia"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="mt-2"
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="descricao"
                        className="font-semibold text-gray-700"
                      >
                        Descrição
                      </Label>
                      <Input
                        type="textarea"
                        id="descricao"
                        placeholder="Descreva brevemente o item..."
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div className="flex flex-col gap-4">
                      <div>
                        <Label
                          htmlFor="incluir-info"
                          className="font-semibold text-gray-700"
                        >
                          Incluir Responsável e Departamento?
                        </Label>
                        <div className="flex flex-col sm:flex-row gap-4 mt-4">
                          <CustomRadioInput
                            label="Sim"
                            htmlFor="sim"
                            name="hasResponsavel"
                            value="sim"
                            checked={hasResponsavel === "sim"}
                            onChange={(e) => {
                              setHasResponsavel(e.target.value);
                            }}
                          />
                          <CustomRadioInput
                            label="Não"
                            htmlFor="nao"
                            name="hasResponsavel"
                            value="nao"
                            checked={hasResponsavel === "nao"}
                            onChange={(e) => {
                              setHasResponsavel(e.target.value);
                            }}
                          />
                        </div>
                      </div>

                      {hasResponsavel === "sim" && (
                        <>
                          <div>
                            <Label
                              htmlFor="responsavel"
                              className="font-semibold text-gray-700 mb-2"
                            >
                              Responsável
                            </Label>

                            <Select
                              value={responsavel}
                              onValueChange={(e) =>
                                setResponsavel(e)
                              }
                            >
                              <SelectTrigger className="w-full !h-[48px] border-[#A2A6BB66]">
                                <SelectValue placeholder="Selecione um responsável" />
                              </SelectTrigger>
                              <SelectContent>
                                {responsaveisMock.map((resp) => (
                                  <SelectItem key={resp.id} value={resp.nome}>
                                    {resp.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label
                              htmlFor="departamento"
                              className="font-semibold text-gray-700"
                            >
                              Departamento
                            </Label>
                            <Input
                              id="departamento"
                              type="text"
                              placeholder="Ex: Cardiologia Clínica"
                              value={departamento}
                              onChange={(e) => setDepartamento(e.target.value)}
                              className="mt-2"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      className="px-4"
                      onClick={() => {
                        setIsModalOpen(false);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 transition-colors px-4"
                    >
                      Salvar
                    </Button>
                  </div>
                </>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};
