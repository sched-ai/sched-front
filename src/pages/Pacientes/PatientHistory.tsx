import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Clock,
  Plus,
  FolderOpen
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useGetAllAppointments } from "@/hooks/api/useGetAllAppointments";
import { useUpdateAppointment } from "@/hooks/api/useUpdateAppointment";

export const PatientHistory = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const initialPatientData = location.state?.paciente || {};
  
  const patient = {
    id: id,
    name: initialPatientData.name || "Paciente",
    age: initialPatientData.age || "", 
    gender: initialPatientData.gender || "",
    cpf: initialPatientData.cpf || "",
    phone: initialPatientData.phone || "",
    email: initialPatientData.email || "",
    address: initialPatientData.address || "",
    birthDate: initialPatientData.birthDate || "",
  };

  // Fetch appointments for this patient
  const { data: appointmentsResponse, isLoading, refetch } = useGetAllAppointments({
    search: patient.name, 
    limit: 50
  });

  const { mutateAsync: updateAppointment, isPending: isUpdating } = useUpdateAppointment({
    onSuccessFn: () => {
      refetch();
    }
  });

  // Extract appointments list
  const appointments = Array.isArray(appointmentsResponse) 
    ? appointmentsResponse 
    : (appointmentsResponse?.data || []);

  const hasAppointments = !isLoading && appointments.length > 0;
  const displayAppointments = hasAppointments ? appointments : [];

  /* UI State for "Ler mais" */
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  /* UI State for Note Editing */
  const [editingAptId, setEditingAptId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStartEdit = (apt: any) => {
    console.log("Editing Appointment:", apt); // Debugging: Check available fields
    setEditingAptId(apt.id);
    setNoteText(apt.description || apt.notes || apt.observacao || "");
  };

  const handleCancelEdit = () => {
    setEditingAptId(null);
    setNoteText("");
  };

  const handleSaveNote = async (aptId: string) => {
    try {
      await updateAppointment({
        id: aptId,
        payload: {
          description: noteText
        }
      });
      setEditingAptId(null);
    } catch (error) {
      console.error("Failed to save note", error);
    }
  };

  useEffect(() => {
    if (editingAptId && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [editingAptId]);

  return (
    <div className="w-full h-full flex flex-col bg-[#FAFAFA]">
      <div className="p-6 w-full">
        
        <div className="flex flex-col gap-8">
            
            {/* Top Header Card */}
            <div className="bg-white rounded-[20px] shadow-custom p-6 flex items-center relative overflow-hidden">
               <div className="absolute left-0 top-0 bottom-0 w-3 bg-[#141736]"></div>
               <div className="flex items-center gap-6 ml-4">
                  <div className="w-20 h-20 rounded-full border-4 border-[#141736] flex items-center justify-center bg-white text-[#141736]"> 
                    <User className="w-10 h-10" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-[#141736]">{patient.name}</h1>
                    <p className="text-slate-600 mt-1">
                      {patient.age ? `Idade: ${patient.age} anos | ` : ''} 
                      {patient.gender ? `${patient.gender} | ` : ''} 
                      {patient.cpf ? `CPF: ${patient.cpf} | ` : ''} 
                      {patient.phone ? `Tel: ${patient.phone}` : ''}
                    </p>
                  </div>
               </div>
            </div>

            {/* Timeline Section */}
            <div className="relative pl-4">
               {/* Vertical Line */}
               <div className="absolute left-[38px] top-0 bottom-0 w-[2px] bg-slate-200"></div>

               <div className="flex flex-col gap-8">
                 {isLoading && (
                    <div className="ml-32 text-slate-500">Carregando histórico...</div>
                 )}
                 
                 {!isLoading && !hasAppointments && (
                    <div className="ml-32 text-slate-500">
                        Nenhum atendimento encontrado para este paciente.
                    </div>
                 )}

                 {displayAppointments.map((apt) => {
                   const dateObj = new Date(apt.startDate);
                   const day = format(dateObj, "dd");
                   const month = format(dateObj, "MMM", { locale: ptBR }).toUpperCase().replace('.', '');
                   const year = format(dateObj, "yyyy");
                   const time = format(dateObj, "HH:mm");
                   
                   const serviceName = apt.service?.name || "Atendimento";
                   const doctorName = apt.professional?.user?.name || "Dr. Desconhecido";

                   /* Text Truncation Logic */
                   const text = apt.description || "";
                   const hasText = text.trim().length > 0;
                   const isExpanded = expandedCards[apt.id];
                   const shouldTruncate = text.length > 200;
                   const displayedText = (isExpanded || !shouldTruncate) ? text : text.slice(0, 200) + "...";
                   const isEditing = editingAptId === apt.id;

                   return (
                     <div key={apt.id} className="flex gap-6 relative">
                        {/* Date Bubble */}
                        <div className="flex-shrink-0 z-10">
                          <div className="w-[76px] h-[76px] bg-[#141736] rounded-[14px] flex flex-col items-center justify-center text-white shadow-lg">
                            <span className="text-2xl font-bold leading-none">{day}</span>
                            <span className="text-xs font-medium uppercase tracking-wider">{month}</span>
                            <span className="text-[10px] opacity-80 mt-1">{year}</span>
                          </div>
                        </div>

                        {/* Content Card */}
                        <div className="flex-1 bg-gray-100 rounded-[16px] p-6 shadow-sm border border-slate-100">
                          <div className="flex justify-between items-start mb-4 border-b border-slate-200 pb-3">
                             <h3 className="text-lg font-semibold text-[#141736] italic">
                               {serviceName} - <span className="font-normal">{doctorName}</span>
                             </h3>
                             <div className="flex items-center gap-1 text-slate-500 text-sm">
                               <Clock className="w-4 h-4" />
                               <span>{time}</span>
                             </div>
                          </div>

                          <div className="mb-4">
                             {/* Attachments if any */}
                             {(apt.hasAttachments) && (
                               <div className="flex gap-4 mb-4">
                                  <div className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80">
                                    <FolderOpen className="w-10 h-10 text-[#141736]" />
                                    <span className="text-[10px] text-slate-600">Exame 1</span>
                                  </div>
                               </div>
                             )}

                             {/* Description text or Edit Mode */}
                             {isEditing ? (
                               <textarea
                                 ref={textareaRef}
                                 value={noteText}
                                 onChange={(e) => setNoteText(e.target.value)}
                                 className="w-full p-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#141736] text-sm text-slate-700 leading-relaxed resize-y min-h-[100px]"
                                 placeholder="Digite a nota aqui..."
                               />
                             ) : (
                               <>
                                 {hasText ? (
                                   <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                                     {displayedText}
                                   </p>
                                 ) : (
                                   <p className="text-slate-400 text-sm italic">
                                     Sem observações.
                                   </p>
                                 )}
                                 
                                 {shouldTruncate && (
                                   <button 
                                     onClick={() => toggleExpand(apt.id)}
                                     className="text-[#141736] font-bold text-sm mt-1 hover:underline block"
                                   >
                                     {isExpanded ? "Ler menos" : "Ler mais"}
                                   </button>
                                 )}
                               </>
                             )}
                          </div>

                          <div className="flex justify-end gap-3">
                            {isEditing ? (
                              <>
                                <Button 
                                  variant="ghost" 
                                  onClick={handleCancelEdit}
                                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                                  disabled={isUpdating}
                                >
                                  Cancelar
                                </Button>
                                <Button 
                                  onClick={() => handleSaveNote(apt.id)}
                                  className="bg-[#141736] text-white hover:bg-[#141736]/90 rounded-full px-6"
                                  disabled={isUpdating}
                                >
                                  {isUpdating ? "Salvando..." : "Salvar"}
                                </Button>
                              </>
                            ) : (
                              <Button 
                                variant="outline" 
                                onClick={() => handleStartEdit(apt)}
                                className="border-[#141736] text-[#141736] hover:bg-[#141736] hover:text-white transition-colors gap-2 rounded-full px-6"
                              >
                                <Plus className="w-4 h-4" />
                                {hasText ? "Editar Nota" : "Adicionar Nota"}
                              </Button>
                            )}
                          </div>
                        </div>
                     </div>
                   );
                 })}
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PatientHistory;
