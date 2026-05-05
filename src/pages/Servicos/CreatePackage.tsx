import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCreateService } from "@/hooks/api/useCreateService";
import { useUpdateService } from "@/hooks/api/useEditService";
import { useGetAllServices, type IService } from "@/hooks/api/useGetAllServices";
import { useGetAllWorkplaces } from "@/hooks/api/useGetAllWorkplaces";
import { useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Package, 
  Plus, 
  Trash2, 
  Info,
  Search,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DndContext, useDraggable, useDroppable, type DragEndEvent, DragOverlay, defaultDropAnimationSideEffects } from "@dnd-kit/core";
import { SidebarTrigger } from "@/components/ui/sidebar";

// --- Helpers ---

const formatBRL = (value: string) => {
  const onlyNums = value.replace(/[^0-9]/g, "");
  if (!onlyNums) return "";
  const int = parseInt(onlyNums, 10);
  const number = int / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(number);
};

const parseBRL = (formatted: string | null) => {
  if (!formatted) return null;
  const onlyNums = formatted.replace(/[^0-9]/g, "");
  if (!onlyNums) return null;
  const int = parseInt(onlyNums, 10);
  return int / 100;
};

const baseInputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

// --- DND Components ---

const DraggableServiceItem = ({ service }: { service: IService }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `draggable-${service.id}`,
    data: service,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "group flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-grab active:cursor-grabbing hover:border-blue-300 hover:shadow-sm transition-all",
        isDragging && "opacity-50 border-blue-500 shadow-md"
      )}
    >
      <div className="text-slate-400 group-hover:text-blue-500 transition-colors">
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate">{service.name}</p>
        <p className="text-xs text-slate-500">
          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(service.price))}
        </p>
      </div>
      <div className="bg-slate-100 p-1.5 rounded-lg text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
        <Plus className="w-3.5 h-3.5" />
      </div>
    </div>
  );
};

const DroppablePackageArea = ({ children, isOver }: { children: React.ReactNode; isOver: boolean }) => {
  const { setNodeRef } = useDroppable({
    id: "package-droppable-area",
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[200px] rounded-2xl border-2 border-dashed transition-all p-6",
        isOver 
          ? "bg-blue-50 border-blue-400 shadow-inner scale-[0.99]" 
          : "bg-white border-slate-200"
      )}
    >
      {children}
    </div>
  );
};

// --- Main Component ---

export const CreatePackage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const { data: allServices, isLoading: isLoadingServices } = useGetAllServices();
  const { data: workplaces } = useGetAllWorkplaces();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [price, setPrice] = useState("");
  const [selectedWorkplaces, setSelectedWorkplaces] = useState<string[]>([]);
  const [packageItems, setPackageItems] = useState<{ serviceId: string; quantity: number }[]>([]);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isOverDroppable, setIsOverDroppable] = useState(false);

  const serviceToEdit = allServices?.find(s => s.id === id);
  const availableServices = (allServices || []).filter(s => s.type === "SERVICE" && s.id !== id);
  
  const filteredSidebarServices = availableServices.filter(s => 
    s.name.toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  useEffect(() => {
    if (isEditMode && serviceToEdit) {
      setNome(serviceToEdit.name || "");
      setDescricao(serviceToEdit.description || "");
      setPrice(
        serviceToEdit.price !== undefined && serviceToEdit.price !== null
          ? formatBRL((Number(serviceToEdit.price) * 100).toString())
          : ""
      );
      
      const items = (serviceToEdit as any).packageItems?.map((item: any) => ({
        serviceId: item.serviceId,
        quantity: item.quantity
      })) || [];
      setPackageItems(items);

      const serviceWorkplaces = serviceToEdit.workplaces?.map(w => w.id) || [];
      setSelectedWorkplaces(serviceWorkplaces);
    }
  }, [isEditMode, serviceToEdit]);

  useEffect(() => {
    if (!isEditMode && workplaces && workplaces.length === 1 && selectedWorkplaces.length === 0) {
      setSelectedWorkplaces([workplaces[0].id]);
    }
  }, [workplaces, isEditMode, selectedWorkplaces]);

  const { mutate: createService, isPending: isCreating } = useCreateService({
    label: "Pacote",
    successMessage: "Pacote criado com sucesso!",
    onSuccessFn: () => {
      navigate("/services");
    },
  });

  const { mutate: updateService, isPending: isUpdating } = useUpdateService({
    label: "Pacote",
    successMessage: "Pacote atualizado com sucesso!",
    onSuccessFn: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      navigate("/services");
    },
  });

  const isPending = isCreating || isUpdating;

  const isFormValid = 
    nome.trim() !== "" && 
    descricao.trim() !== "" && 
    price.trim() !== "" && 
    (parseBRL(price) || 0) > 0 && 
    packageItems.length > 0;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!nome.trim()) newErrors.nome = "O nome é obrigatório";
    if (!descricao.trim()) newErrors.descricao = "A descrição é obrigatória";
    if (!price || (parseBRL(price) || 0) === 0) newErrors.price = "O valor é obrigatório";
    if (packageItems.length === 0) newErrors.packageItems = "Arraste pelo menos um serviço para o pacote";
    if (packageItems.some(item => !item.serviceId || item.quantity <= 0)) newErrors.packageItems = "Preencha todos os serviços e quantidades";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const payload = {
      name: nome,
      description: descricao,
      type: "PACKAGE" as const,
      price: parseBRL(price),
      workplaceIds: selectedWorkplaces,
      packageItems: packageItems,
      employeeId: serviceToEdit?.employee?.id || null,
      duration: null,
      department: null
    };

    if (isEditMode && id) {
      updateService({ id, payload });
    } else {
      createService(payload);
    }
  };

  const calculateSuggestedPrice = () => {
    let total = 0;
    packageItems.forEach(item => {
      const svc = availableServices.find(s => s.id === item.serviceId);
      if (svc && svc.price) {
        total += Number(svc.price) * item.quantity;
      }
    });
    return total;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setIsOverDroppable(false);
    
    const { active, over } = event;
    
    if (over && over.id === "package-droppable-area") {
      const draggedService = active.data.current as IService;
      if (draggedService) {
        // Check if service already exists in package, if so just increment quantity
        const existingIndex = packageItems.findIndex(p => p.serviceId === draggedService.id);
        if (existingIndex !== -1) {
          handleUpdatePackageItem(existingIndex, { quantity: packageItems[existingIndex].quantity + 1 });
        } else {
          setPackageItems(prev => [...prev, { serviceId: draggedService.id, quantity: 1 }]);
        }
      }
    }
  };

  const handleUpdatePackageItem = (index: number, patch: Partial<{ serviceId: string; quantity: number }>) => {
    setPackageItems(prev => prev.map((item, i) => i === index ? { ...item, ...patch } : item));
  };

  const handleRemovePackageItem = (index: number) => {
    setPackageItems(prev => prev.filter((_, i) => i !== index));
  };

  if (isLoadingServices) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col h-screen overflow-hidden">
      <header className="bg-white border-b border-slate-200 z-20 shrink-0 flex items-stretch h-16">
        <SidebarTrigger className="w-11 h-11 min-w-[44px] self-center rounded-lg bg-white border border-slate-200 shadow-sm p-0 hover:bg-slate-50 hover:opacity-80 transition-opacity lg:hidden">
          <span className="flex flex-col items-center justify-center gap-1">
            <span className="block h-[2px] w-[18px] rounded-[2px] bg-slate-900/90" />
            <span className="block h-[2px] w-3 rounded-[2px] bg-slate-900/90" />
            <span className="block h-[2px] w-[18px] rounded-[2px] bg-slate-900/90" />
          </span>
        </SidebarTrigger>
        <div className="mx-auto px-6 h-full flex-1 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/services")}
              className="text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-slate-900">
                {isEditMode ? "Editar Pacote" : "Novo Pacote de Serviços"}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <DndContext 
        onDragStart={(e) => setActiveId(e.active.id.toString())}
        onDragOver={(e) => setIsOverDroppable(e.over?.id === "package-droppable-area")}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar: Lista de Serviços */}
          <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                Catálogo de Serviços
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="Pesquisar serviço..."
                  className={cn(baseInputClass, "pl-10 h-10")}
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin custom-scrollbar">
              <p className="text-[10px] uppercase font-bold text-slate-400 px-1 mb-1">Arraste para adicionar</p>
              {filteredSidebarServices.length > 0 ? (
                filteredSidebarServices.map(s => (
                  <DraggableServiceItem key={s.id} service={s} />
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                   <p className="text-sm">Nenhum serviço encontrado.</p>
                </div>
              )}
            </div>
          </aside>
          {/* Área Principal: Formulário */}
          <main className="flex-1 overflow-y-auto bg-slate-50/30 p-5 scrollbar-thin custom-scrollbar">
          
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Informações Básicas */}
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-400" />
                  <h2 className="text-sm font-semibold text-slate-700">Informações do Pacote</h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Nome do Pacote</label>
                      <input
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className={cn(baseInputClass, errors.nome && "border-red-500")}
                        placeholder="Ex: Combo Estética Prime"
                        type="text"
                      />
                      {errors.nome && <p className="text-xs text-red-500 font-medium">{errors.nome}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Valor de Venda (R$)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
                        <input
                          value={price.replace("R$", "").trim()}
                          onChange={(e) => setPrice(formatBRL(e.target.value))}
                          className={cn(baseInputClass, "pl-10", errors.price && "border-red-500")}
                          placeholder="0,00"
                          type="text"
                        />
                      </div>
                      {errors.price && <p className="text-xs text-red-500 font-medium">{errors.price}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Descrição</label>
                    <textarea
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      className={cn(baseInputClass, "min-h-[80px] resize-none", errors.descricao && "border-red-500")}
                      placeholder="Descreva o que este pacote oferece..."
                    />
                    {errors.descricao && <p className="text-xs text-red-500 font-medium">{errors.descricao}</p>}
                  </div>
                </div>
              </section>

              {/* Montagem do Pacote (Droppable) */}
              <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-900">Montagem do Pacote</h2>
                  </div>
                  {packageItems.length > 0 && (
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                      {packageItems.length} {packageItems.length === 1 ? 'serviço' : 'serviços'}
                    </span>
                  )}
                </div>

                <DroppablePackageArea isOver={isOverDroppable}>
                  {packageItems.length > 0 ? (
                    <div className="space-y-4">
                      {packageItems.map((item, index) => {
                        const svcDetails = allServices?.find(s => s.id === item.serviceId);
                        return (
                          <div key={index} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="bg-slate-50 p-3 rounded-lg text-slate-400">
                              <Package className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{svcDetails?.name || 'Serviço removido'}</p>
                              <p className="text-xs text-slate-500">
                                Unitário: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(svcDetails?.price || 0))}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                               <div className="flex flex-col items-center">
                                  <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">Quantidade</label>
                                  <div className="flex items-center gap-2">
                                     <input
                                      type="number"
                                      min="1"
                                      value={item.quantity}
                                      onChange={(e) => handleUpdatePackageItem(index, { quantity: parseInt(e.target.value) || 1 })}
                                      className={cn(baseInputClass, "w-20 h-9 px-2 text-center font-semibold")}
                                    />
                                  </div>
                               </div>
                               <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-400 hover:text-red-600 hover:bg-red-50 mt-5"
                                  onClick={() => handleRemovePackageItem(index)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-slate-200">
                        <Plus className="w-6 h-6 text-slate-300" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-600">Nenhum serviço adicionado</p>
                        <p className="text-xs text-slate-400">Arraste serviços do catálogo à esquerda para começar.</p>
                      </div>
                    </div>
                  )}
                </DroppablePackageArea>
                {errors.packageItems && <p className="text-xs text-red-500 font-medium px-1">{errors.packageItems}</p>}
              </section>

              


            </div>
          </main>

          {/* Coluna da Direita: Resumo Financeiro */}
          <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0">
             
             <div className="p-6 space-y-8 flex-1 overflow-y-auto scrollbar-thin custom-scrollbar">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm text-slate-500">
                    <span>Soma dos serviços</span>
                    <span className="font-medium line-through opacity-60">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(calculateSuggestedPrice())}
                    </span>
                  </div>
                  
                  <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-100">
                    <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-2">Preço Final</p>
                    <div className="flex items-baseline gap-1">
                       <span className="text-xl font-bold truncate">{price || "R$ 0,00"}</span>
                    </div>
                  </div>

                  {(parseBRL(price) || 0) > 0 && calculateSuggestedPrice() > 0 && (() => {
                    const economy = calculateSuggestedPrice() - (parseBRL(price) || 0);
                    const isPositive = economy >= 0;
                    return (
                      <div className={cn(
                        "rounded-xl p-4 border text-xs font-medium space-y-2",
                        isPositive 
                          ? "bg-green-50 text-green-700 border-green-100" 
                          : "bg-red-50 text-red-700 border-red-100"
                      )}>
                        <div className="flex flex-col justify-between">
                           <span>Economia total:</span>
                           <span className="font-bold truncate">
                             {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(economy)}
                           </span> 
                        </div>
                        {isPositive && (
                          <div className="flex justify-between text-[10px] opacity-80 uppercase tracking-tight">
                             <span>Percentual:</span>
                             <span>{Math.round((1 - (parseBRL(price) || 0) / calculateSuggestedPrice()) * 100)}% de desconto</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <h3 className="text-[10px] uppercase font-bold text-slate-400">Itens do Pacote</h3>
                  <div className="space-y-2 pr-2">
                    {packageItems.map((item, idx) => {
                      const svc = allServices?.find(s => s.id === item.serviceId);
                      return (
                        <div key={idx} className="flex justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                           <span className="text-slate-600 truncate mr-2">{svc?.name}</span>
                           <span className="text-slate-400 shrink-0 font-medium">x{item.quantity}</span>
                        </div>
                      )
                    })}
                    {packageItems.length === 0 && <p className="text-xs text-slate-400 italic">Vazio</p>}
                  </div>
                </div>
             </div>
             
             <div className="p-6 bg-slate-50 border-t border-slate-100">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isPending || !isFormValid}
                  title={!isFormValid ? "Preencha todos os campos para salvar" : ""}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white h-12 rounded-xl font-semibold shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
                >
                  {isPending ? "Processando..." : "Salvar e Publicar"}
                </Button>
             </div>
          </aside>
        </div>

        {/* Drag Overlay (Visual feedback while dragging) */}
        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.4',
              },
            },
          }),
        }}>
          {activeId ? (
            <div className="flex items-center gap-3 p-3 bg-white border-2 border-blue-500 rounded-xl shadow-xl w-64 opacity-90 cursor-grabbing">
              <GripVertical className="w-4 h-4 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  {availableServices.find(s => `draggable-${s.id}` === activeId)?.name}
                </p>
                <p className="text-xs text-blue-600 font-medium">Solte para adicionar</p>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
