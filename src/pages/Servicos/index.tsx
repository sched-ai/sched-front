import { useState, useEffect } from 'react';

const ITEMS_PER_PAGE = 6;

const servicosMock = [
  { id: 1, nome: 'Klubi', descricao: 'Um novo jeito de fazer Consórcio', categoria: 'Serviço', subDescricao: 'Painel de Controle', tipoFerramenta: 'Ferramenta Assessor' },
  { id: 2, nome: 'XP Investimentos', descricao: 'Assessoria completa para seus investimentos', categoria: 'pacote', subDescricao: 'Serviço de Investidor', tipoFerramenta: 'Ferramenta Assessor' },
  { id: 3, nome: 'Guide', descricao: 'Invista com quem entende do assunto', categoria: 'pacote', subDescricao: 'Painel de Controle', tipoFerramenta: 'Ferramenta Assessor' },
  { id: 4, nome: 'Hub de Conteúdos', descricao: 'Materiais e notícias do mercado', categoria: 'Serviço', subDescricao: 'Portal de Notícias', tipoFerramenta: 'Ferramenta de Estudo' },
  { id: 5, nome: 'Simulador de Renda', descricao: 'Calcule seu potencial de ganhos', categoria: 'Serviço', subDescricao: 'Calculadora Financeira', tipoFerramenta: 'Ferramenta Assessor' },
  { id: 6, nome: 'Carteiras Recomendadas', descricao: 'Sugestões de carteiras por perfil', categoria: 'pacote', subDescricao: 'Análise de Ativos', tipoFerramenta: 'Ferramenta Assessor' },
  { id: 7, nome: 'Tech Solutions', descricao: 'Soluções de tecnologia para o mercado', categoria: 'pacote', subDescricao: 'Desenvolvimento', tipoFerramenta: 'Ferramenta Técnica' },
  { id: 8, nome: 'Ágora', descricao: 'A corretora de investimentos do Bradesco', categoria: 'pacote', subDescricao: 'Home Broker', tipoFerramenta: 'Ferramenta Assessor' },
  { id: 9, nome: 'Cursos Financeiros', descricao: 'Aprenda a investir do zero', categoria: 'Serviço', subDescricao: 'Serviço EAD', tipoFerramenta: 'Ferramenta de Estudo' },
  { id: 10, nome: 'Legal Docs', descricao: 'Gestão de documentos e contratos', categoria: 'pacote', subDescricao: 'Gestor de Documentos', tipoFerramenta: 'Ferramenta Admin' },
  { id: 11, nome: 'Fast Report', descricao: 'Relatórios de performance automatizados', categoria: 'Serviço', subDescricao: 'Gerador de Relatórios', tipoFerramenta: 'Ferramenta Assessor' },
  { id: 12, nome: 'Compliance Fácil', descricao: 'Mantenha-se em conformidade com as regras', categoria: 'pacote', subDescricao: 'Auditoria e Controle', tipoFerramenta: 'Ferramenta Admin' },
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
        <h1 className="text-[30px] font-medium">Serviços</h1>
      </header>
      <main className="p-4 md:p-8">
        <div className="flex justify-center mb-6">
          <button onClick={() => handleCategoryChange('Todos')} className={`px-4 py-2 text-lg ${activeCategory === 'Todos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Todos</button>
          <button onClick={() => handleCategoryChange('pacote')} className={`px-4 py-2 text-lg ${activeCategory === 'pacote' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>pacote</button>
           <button onClick={() => handleCategoryChange('Serviço')} className={`px-4 py-2 text-lg ${activeCategory === 'Serviço' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Serviço</button>
        </div>
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Procurar por nome, código..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-4 pl-12 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <svg className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedServices.map(servico => (
            <div key={servico.id} className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col justify-between">
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
                Acessar
              </a>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={loadMoreServices}
              className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Carregar Mais
            </button>
          </div>
        )}
      </main>
    </div>
  );
};