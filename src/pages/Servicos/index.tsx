import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 6;

const servicosMock = [
  { id: 1, nome: 'Cardiologia', descricao: 'Consultas e exames para o coração e sistema circulatório.', categoria: 'Serviço', subDescricao: 'Dr. Roberto Moreira', tipoFerramenta: 'Atendimento Clínico' },
  { id: 2, nome: 'Raio-X de Tórax', descricao: 'Exame de imagem para diagnóstico de condições pulmonares e cardíacas.', categoria: 'pacote', subDescricao: 'Diagnóstico por Imagem', tipoFerramenta: 'Equipamento Radiológico' },
  { id: 3, nome: 'Dermatologia', descricao: 'Tratamento de pele, unhas e cabelos, incluindo pequenas cirurgias.', categoria: 'Serviço', subDescricao: 'Dra. Ana Beatriz Costa', tipoFerramenta: 'Atendimento Clínico' },
  { id: 4, nome: 'Hemograma Completo', descricao: 'Análise detalhada das células sanguíneas para avaliação geral da saúde.', categoria: 'pacote', subDescricao: 'Análises Clínicas', tipoFerramenta: 'Análise Laboratorial' },
  { id: 5, nome: 'Ortopedia e Traumatologia', descricao: 'Especialidade focada em lesões e doenças do sistema locomotor.', categoria: 'Serviço', subDescricao: 'Dr. Carlos Eduardo Lima', tipoFerramenta: 'Atendimento Clínico' },
  { id: 6, nome: 'Ultrassonografia Abdominal', descricao: 'Avaliação dos órgãos internos do abdômen, como fígado e rins.', categoria: 'pacote', subDescricao: 'Diagnóstico por Imagem', tipoFerramenta: 'Equipamento de Ultrassom' },
  { id: 7, nome: 'Ginecologia e Obstetrícia', descricao: 'Cuidado completo da saúde da mulher, incluindo pré-natal.', categoria: 'Serviço', subDescricao: 'Dra. Fernanda Sampaio', tipoFerramenta: 'Atendimento Clínico' },
  { id: 8, nome: 'Fisioterapia Motora', descricao: 'Sessões para reabilitação de movimentos e alívio de dores.', categoria: 'Serviço', subDescricao: 'Reabilitação Física', tipoFerramenta: 'Terapia Manual e Equipamentos' },
  { id: 9, nome: 'Endocrinologia', descricao: 'Diagnóstico e tratamento de distúrbios hormonais e metabólicos.', categoria: 'Serviço', subDescricao: 'Dr. Lucas Vasconcelos', tipoFerramenta: 'Atendimento Clínico' },
  { id: 10, nome: 'Exame de Glicemia', descricao: 'Medição do nível de açúcar no sangue, essencial para diabéticos.', categoria: 'pacote', subDescricao: 'Análises Clínicas', tipoFerramenta: 'Análise Laboratorial' },
  { id: 11, nome: 'Nutrição Clínica', descricao: 'Aconselhamento e plano alimentar personalizado para sua saúde.', categoria: 'Serviço', subDescricao: 'Acompanhamento Nutricional', tipoFerramenta: 'Consulta Nutricional' },
  { id: 12, nome: 'Ressonância Magnética', descricao: 'Exame de imagem de alta definição para diagnóstico preciso.', categoria: 'pacote', subDescricao: 'Diagnóstico por Imagem', tipoFerramenta: 'Equipamento de Ressonância' },
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
	const [searchTerm, setSearchTerm] = useState('');
	const [activeCategory, setActiveCategory] = useState('Todos');
	const [currentPage, setCurrentPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate()

	useEffect(() => {
		const filtered = servicosMock.filter(servico => {
			const matchesCategory = activeCategory === 'Todos' || servico.categoria === activeCategory;
			const matchesSearch = searchTerm === '' ||
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
		const filtered = servicosMock.filter(servico => {
			const matchesCategory = activeCategory === 'Todos' || servico.categoria === activeCategory;
			const matchesSearch = searchTerm === '' ||
				servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
				servico.id.toString().includes(searchTerm);
			return matchesCategory && matchesSearch;
		});

		const nextPage = currentPage + 1;
		const startIndex = currentPage * ITEMS_PER_PAGE;
		const endIndex = nextPage * ITEMS_PER_PAGE;

		const newItems = filtered.slice(startIndex, endIndex);

		setDisplayedServices(prev => [...prev, ...newItems]);
		setCurrentPage(nextPage);
		setHasMore(filtered.length > displayedServices.length + newItems.length);
	};

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
	};

	const handleCategoryChange = (newCategory: string) => {
		setActiveCategory(newCategory);
	};

	return (
		<div className="bg-[#F8F9FA] min-h-screen">
			<header className="border-b border-b-[#DADCE0] h-full max-h-[80px] p-4 bg-white">
				<h1 className="text-[30px] font-medium">Serviços & Pacotes</h1>
			</header>
			<main className="p-4 md:p-8">
        <div className='bg-white shadow-custom p-4 mb-4 rounded-lg'>

				<div className="flex justify-start mb-6">
					<button onClick={() => handleCategoryChange('Todos')} className={`px-4 py-2 text-lg ${activeCategory === 'Todos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Todos</button>
					<button onClick={() => handleCategoryChange('Serviço')} className={`px-4 py-2 text-lg ${activeCategory === 'Serviço' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Serviço</button>
					<button onClick={() => handleCategoryChange('pacote')} className={`px-4 py-2 text-lg ${activeCategory === 'pacote' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>pacote</button>
				</div>
				<div className="flex mb-6 items-center gap-6">
          <Input
            type="text"
            placeholder="Pesquisar por paciente, especialidade ou médico..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full"
            />
            <Button className='bg-blue-600 transition-colors' onClick={() => {
              navigate('/newService')
            }}><Plus />Adicionar</Button>
				</div>
            </div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{displayedServices.map(servico => (
						<div key={servico.id} className="bg-white shadow-custom border border-gray-200 rounded-lg p-6 flex flex-col justify-between">
							<div>
								<div className="flex justify-between items-start mb-4">
									<h2 className="text-2xl font-bold">{servico.nome}</h2>
									<span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${servico.categoria === 'Serviço' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>{servico.categoria}</span>
								</div>
								<p className="text-gray-600 mb-4">{servico.descricao}</p>
								<div className="flex items-center">
									<div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center font-bold text-gray-500">{servico.nome.charAt(0)}</div>
									<div>
										<h3 className="font-semibold">{servico.subDescricao}</h3>
										<p className="text-sm text-gray-500">{servico.tipoFerramenta}</p>
									</div>
								</div>
							</div>
							<a href="#" className="mt-6 text-center text-green-600 font-semibold py-2">
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
			</main>
		</div>
	);
};
