import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Clock,
  Plus,
  FolderOpen,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useGetAllAppointments } from "@/hooks/api/useGetAllAppointments";
import { useCreateAnnotation } from "@/hooks/api/useCreateAnnotation";
import { DeleteNoteModal } from "@/components/DeleteNoteModal";

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

  const { mutateAsync: createAnnotation, isPending: isCreating } = useCreateAnnotation({
    onSuccessFn: () => {
      refetch();
    }
  });

  // Extract appointments list
  const rawAppointments = Array.isArray(appointmentsResponse) 
    ? appointmentsResponse 
    : (appointmentsResponse?.data || []);
    
  const appointments = rawAppointments.filter((apt: any) => apt.status !== 'cancelled');

  const hasAppointments = !isLoading && appointments.length > 0;
  const displayAppointments = hasAppointments ? appointments : [];

  /* UI State for "Ler mais" */
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  /* UI State for Note Editing */
  const [editingAptId, setEditingAptId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  /* UI State for Delete Note Modal */
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStartEdit = (apt: any) => {
    setEditingAptId(apt.id);
    setNoteText("");
  };

  const handleCancelEdit = () => {
    setEditingAptId(null);
    setNoteText("");
  };

  const handleSaveNote = async (apt: any) => {
    if (!noteText.trim()) return;
    try {
      await createAnnotation({
        appointmentId: apt.id,
        clientId: apt.clientId,
        content: noteText
      });

      setEditingAptId(null);
      setNoteText("");
    } catch (error) {
      console.error("Failed to save note", error);
    }
  };

  const handleDeleteNote = (annotationId: string) => {
    setNoteToDelete(annotationId);
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
      <DeleteNoteModal
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onSuccess={() => refetch()}
        noteId={noteToDelete}
      />
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
                   const doctorName = apt.employee?.name || "Dr. Desconhecido";

                   /* Annotations Logic */
                   const annotations = apt.annotations || [];
                   const latestAnnotation = annotations.length > 0
                     ? [...annotations].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
                     : null;
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

                             {/* Annotations List */}
                             {latestAnnotation ? (
                               <div className="flex flex-col gap-3">
                                 {[latestAnnotation].map((note: any) => {
                                   const noteDate = new Date(note.createdAt);
                                   const noteDateFormatted = format(noteDate, "dd/MM/yyyy 'às' HH:mm");
                                   const noteContent = note.content || "";
                                   const isExpanded = expandedCards[note.id];
                                   const shouldTruncate = noteContent.length > 200;
                                   const displayedText = (isExpanded || !shouldTruncate) ? noteContent : noteContent.slice(0, 200) + "...";
                                   
                                   return (
                                     <div key={note.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative group transition-all hover:border-slate-300">
                                       <div className="flex justify-between items-start mb-2">
                                         <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                           <Clock className="w-3 h-3" />
                                           {noteDateFormatted}
                                         </span>
                                         <button 
                                           onClick={() => handleDeleteNote(note.id)}
                                           className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-md"
                                           title="Excluir nota"
                                         >
                                           <Trash2 className="w-3.5 h-3.5" />
                                         </button>
                                       </div>
                                       <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                                         {displayedText}
                                       </p>
                                       {shouldTruncate && (
                                         <button 
                                           onClick={() => toggleExpand(note.id)}
                                           className="text-[#141736] font-bold text-sm mt-2 hover:underline block"
                                         >
                                           {isExpanded ? "Ler menos" : "Ler mais"}
                                         </button>
                                       )}
                                     </div>
                                   );
                                 })}
                               </div>
                             ) : (
                               !isEditing && (
                                 <p className="text-slate-400 text-sm italic">
                                   Sem observações.
                                 </p>
                               )
                             )}

                             {/* Edit Mode (Add Note) */}
                             {isEditing && (
                               <div className="mt-4">
                                 <textarea
                                   ref={textareaRef}
                                   value={noteText}
                                   onChange={(e) => setNoteText(e.target.value)}
                                   className="w-full p-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#141736] text-sm text-slate-700 leading-relaxed resize-y min-h-[100px]"
                                   placeholder="Digite a nota aqui..."
                                 />
                               </div>
                             )}
                          </div>

                          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-200">
                            {isEditing ? (
                              <>
                                <Button 
                                  variant="ghost" 
                                  onClick={handleCancelEdit}
                                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                                  disabled={isCreating}
                                >
                                  Cancelar
                                </Button>
                                <Button 
                                  onClick={() => handleSaveNote(apt)}
                                  className="bg-[#141736] text-white hover:bg-[#141736]/90 rounded-full px-6"
                                  disabled={isCreating}
                                >
                                  {isCreating ? "Salvando..." : "Salvar"}
                                </Button>
                              </>
                            ) : annotations.length === 0 ? (
                              <Button 
                                variant="outline" 
                                onClick={() => handleStartEdit(apt)}
                                className="border-[#141736] text-[#141736] hover:bg-[#141736] hover:text-white transition-colors gap-2 rounded-full px-6"
                              >
                                <Plus className="w-4 h-4" />
                                Adicionar Nota
                              </Button>
                            ) : null}
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
