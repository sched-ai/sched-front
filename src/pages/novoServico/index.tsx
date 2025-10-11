import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomRadioInput from '@/components/CustomRadioInput';

type ItemType = "servico" | "pacote" | "";
// 1. Tipo para a nova decisão Sim/Não
type DecisionType = 'sim' | 'nao' | '';

// Mock de dados para o select de responsáveis
const responsaveisMock = [
  { id: 1, nome: 'Dr. Roberto Moreira' },
  { id: 2, nome: 'Dra. Ana Beatriz Costa' },
  { id: 3, nome: 'Dr. Carlos Eduardo Lima' },
  { id: 4, nome: 'Dra. Fernanda Sampaio' },
];

export const NovoServico = () => {
    const [itemType, setItemType] = useState<ItemType>("");
    
    // Estados dos campos principais
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [tipoAtendimento, setTipoAtendimento] = useState('');

    // 2. Novos estados para controlar a lógica de responsável e departamento
    const [incluirInfo, setIncluirInfo] = useState<DecisionType>(''); // Controla o select Sim/Não
    const [responsavel, setResponsavel] = useState(''); // Controla o select de Responsável
    const [departamento, setDepartamento] = useState(''); // Controla o input de Departamento

    // Efeito para limpar os campos caso o usuário mude a decisão para "Não"
    useEffect(() => {
        if (incluirInfo === 'nao' || incluirInfo === '') {
            setResponsavel('');
            setDepartamento('');
        }
    }, [incluirInfo]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault(); 
        const novoItem = {
            nome,
            descricao,
            categoria: itemType, 
            responsavel, // Será '' se não for incluído
            departamento, // Será '' se não for incluído
            tipoAtendimento,
        };
        console.log('Dados do novo item:', novoItem);
        alert('Item criado com sucesso! (Verifique o console)');
    };

    const handleItemTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setItemType(e.target.value as ItemType);
    };

    return (
        <div className="bg-[#F8F9FA] min-h-screen">
            <header className="border-b border-b-[#DADCE0] h-full max-h-[80px] p-4 bg-white">
                <h1 className="text-[30px] font-medium">Adicionar Novo Item</h1>
            </header>
            <main className="p-4 md:p-8">
                <form onSubmit={handleSubmit}>
                    <div className='bg-white shadow-custom p-8 mb-4 rounded-lg'>
                        
                        <div className="mb-8 pb-6 border-b">
                           <Label className='font-semibold text-gray-700 text-lg'>1. Selecione o tipo de item</Label>
                           <div className="flex flex-col sm:flex-row gap-4 mt-4">
                                <CustomRadioInput label="Serviço" htmlFor="servico" name="itemType" value="servico" checked={itemType === "servico"} onChange={handleItemTypeChange} />
                                <CustomRadioInput label="Pacote" htmlFor="pacote" name="itemType" value="pacote" checked={itemType === "pacote"} onChange={handleItemTypeChange} />
                           </div>
                        </div>

                        {itemType && (
                            <>
                                <div className="mb-6">
                                    <h2 className='font-semibold text-gray-700 text-lg'>2. Detalhes do {itemType === 'servico' ? 'Serviço' : 'Pacote'}</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Coluna 1 */}
                                    <div className="flex flex-col gap-6">
                                        <div>
                                            <Label htmlFor="nome" className='font-semibold text-gray-700'>Nome</Label>
                                            <Input id="nome" type="text" placeholder="Ex: Cardiologia" value={nome} onChange={(e) => setNome(e.target.value)} className="mt-2" required />
                                        </div>
                                        <div>
                                            <Label htmlFor="descricao" className='font-semibold text-gray-700'>Descrição</Label>
                                            <textarea id="descricao" placeholder="Descreva brevemente o item..." value={descricao} onChange={(e) => setDescricao(e.target.value)} className="mt-2" rows={5} />
                                        </div>
                                    </div>

                                    {/* Coluna 2 */}
                                    <div className="flex flex-col gap-6">
                                        {/* 3. O Select Sim/Não para incluir informações */}
                                        <div>
                                            <Label htmlFor="incluir-info" className='font-semibold text-gray-700'>Incluir Responsável e Departamento?</Label>
                                            <select
                                                id="incluir-info"
                                                value={incluirInfo}
                                                onChange={(e) => setIncluirInfo(e.target.value as DecisionType)}
                                                className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            >
                                                <option value="" disabled>Selecione uma opção...</option>
                                                <option value="sim">Sim</option>
                                                <option value="nao">Não</option>
                                            </select>
                                        </div>

                                        {/* 4. Renderização condicional baseada na seleção "Sim" */}
                                        {incluirInfo === 'sim' && (
                                            <>
                                                <div>
                                                    <Label htmlFor="responsavel" className='font-semibold text-gray-700'>Responsável</Label>
                                                    <select
                                                        id="responsavel"
                                                        value={responsavel}
                                                        onChange={(e) => setResponsavel(e.target.value)}
                                                        className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                        required
                                                    >
                                                        <option value="" disabled>Selecione um responsável...</option>
                                                        {responsaveisMock.map(resp => (
                                                            <option key={resp.id} value={resp.nome}>{resp.nome}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <Label htmlFor="departamento" className='font-semibold text-gray-700'>Departamento</Label>
                                                    <Input id="departamento" type="text" placeholder="Ex: Cardiologia Clínica" value={departamento} onChange={(e) => setDepartamento(e.target.value)} className="mt-2"/>
                                                </div>
                                            </>
                                        )}

                                        <div>
                                            <Label htmlFor="tipoAtendimento" className='font-semibold text-gray-700'>Tipo de Atendimento</Label>
                                            <Input id="tipoAtendimento" type="text" placeholder="Ex: Consulta Eletiva" value={tipoAtendimento} onChange={(e) => setTipoAtendimento(e.target.value)} className="mt-2" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                                    <Button type="button" variant="outline">
                                        Cancelar
                                    </Button>
                                    <Button type="submit" className='bg-blue-600 transition-colors'>
                                        Salvar
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </form>
            </main>
        </div>
    );
};