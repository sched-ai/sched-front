import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronDown,
  Clock,
  Download,
  File as FileIconGlyph,
  FileText,
  FileType2,
  Image as ImageIcon,
  Paperclip,
  Plus,
  Trash2,
} from "lucide-react";

import { DeleteNoteModal } from "@/components/DeleteNoteModal";
import { PatientHeader } from "@/components/PatientHeader";
import { Button } from "@/components/ui/button";
import {
  type AppointmentAttachmentAPI,
  useAppointmentAttachmentAccessLinksByAppointment,
} from "@/hooks/api/useAppointmentAttachments";
import { useCreateAnnotation } from "@/hooks/api/useCreateAnnotation";
import { type AppointmentAPI, useGetAllAppointments } from "@/hooks/api/useGetAllAppointments";
import { useGetClient } from "@/hooks/api/useGetClient";
import useToast from "@/hooks/useToast";

type SignedLinkCacheEntry = {
  url: string;
  expiresAt: string;
};

type SignedLinkCache = Record<string, SignedLinkCacheEntry>;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileCategory(mime: string): "image" | "pdf" | "doc" | "other" {
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  if (mime.includes("word") || mime.includes("document")) return "doc";
  return "other";
}

function FileIcon({ mime, className }: { mime: string; className?: string }) {
  const category = getFileCategory(mime);

  if (category === "image") return <ImageIcon className={className} strokeWidth={1.5} />;
  if (category === "pdf") return <FileType2 className={className} strokeWidth={1.5} />;
  if (category === "doc") return <FileText className={className} strokeWidth={1.5} />;

  return <FileIconGlyph className={className} strokeWidth={1.5} />;
}

function fileBg(mime: string): string {
  const category = getFileCategory(mime);

  if (category === "image") return "bg-blue-50 text-blue-500 border-blue-100";
  if (category === "pdf") return "bg-red-50 text-red-500 border-red-100";
  if (category === "doc") return "bg-indigo-50 text-indigo-500 border-indigo-100";
  return "bg-slate-50 text-slate-500 border-slate-200";
}

function getAccessLinkCacheKey(
  appointmentId: string,
  mode: "preview" | "download",
  attachmentId: string
) {
  return `${appointmentId}:${mode}:${attachmentId}`;
}

function isSignedLinkExpired(expiresAt: string) {
  return new Date(expiresAt).getTime() <= Date.now() + 30_000;
}

function openSignedLink(url: string) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const PatientHistory = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const initialPatientData = location.state?.paciente || {};
  const { showToast } = useToast();
  const { data: fullClientData } = useGetClient(id || "", !!id);

  const patient = {
    id,
    name: fullClientData?.name || initialPatientData.name || "Paciente",
    age: initialPatientData.age || "",
    gender: fullClientData?.gender || initialPatientData.gender || "",
    cpf: fullClientData?.cpf || initialPatientData.cpf || "",
    phone: fullClientData?.phone || initialPatientData.phone || "",
    email: fullClientData?.email || initialPatientData.email || "",
    address: initialPatientData.address || "",
    birthDate: (fullClientData as { birthDate?: string } | undefined)?.birthDate || initialPatientData.birthDate || "",
  };

  const { data: appointmentsResponse, isLoading, refetch } = useGetAllAppointments({
    clientId: id,
    includeAttachments: true,
    limit: 50,
    enabled: !!id,
  });

  const { mutateAsync: createAnnotation, isPending: isCreating } = useCreateAnnotation({
    onSuccessFn: () => {
      refetch();
    },
  });

  const { mutateAsync: requestAttachmentAccessLinksAsync } = useAppointmentAttachmentAccessLinksByAppointment();
  const requestAttachmentAccessLinksRef = useRef(requestAttachmentAccessLinksAsync);

  const rawAppointments = appointmentsResponse?.data || [];
  const appointments = rawAppointments.filter((appointment) => {
    const normalizedStatus = appointment.status?.toLowerCase() || "";
    return !["cancelado", "cancelled", "canceled"].includes(normalizedStatus);
  });

  const hasAppointments = !isLoading && appointments.length > 0;
  const displayAppointments = hasAppointments ? appointments : [];

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [editingAptId, setEditingAptId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [expandedAttachmentsAppointmentId, setExpandedAttachmentsAppointmentId] = useState<string | null>(null);
  const [attachmentLinks, setAttachmentLinks] = useState<SignedLinkCache>({});
  const [loadingPreviewAppointmentId, setLoadingPreviewAppointmentId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    requestAttachmentAccessLinksRef.current = requestAttachmentAccessLinksAsync;
  }, [requestAttachmentAccessLinksAsync]);

  const toggleExpand = (annotationId: string) => {
    setExpandedCards((prev) => ({ ...prev, [annotationId]: !prev[annotationId] }));
  };

  const handleStartEdit = (appointment: AppointmentAPI) => {
    setEditingAptId(appointment.id);
    setNoteText("");
  };

  const handleCancelEdit = () => {
    setEditingAptId(null);
    setNoteText("");
  };

  const handleSaveNote = async (appointment: AppointmentAPI) => {
    if (!noteText.trim()) return;
    const targetClientId = appointment.clientId || patient.id || "";
    if (!targetClientId) return;

    try {
      await createAnnotation({
        appointmentId: appointment.id,
        clientId: targetClientId,
        content: noteText,
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
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [editingAptId]);

  const getCachedAttachmentLink = useCallback(
    (appointmentId: string, mode: "preview" | "download", attachmentId: string) => {
      const key = getAccessLinkCacheKey(appointmentId, mode, attachmentId);
      const cachedLink = attachmentLinks[key];

      if (!cachedLink || isSignedLinkExpired(cachedLink.expiresAt)) {
        return undefined;
      }

      return cachedLink.url;
    },
    [attachmentLinks]
  );

  const loadAttachmentPreviews = useCallback(
    async (appointmentId: string, attachments: AppointmentAttachmentAPI[]) => {
      const imageIds = attachments
        .filter((attachment) => attachment.category === "image")
        .filter((attachment) => !getCachedAttachmentLink(appointmentId, "preview", attachment.id))
        .map((attachment) => attachment.id);

      if (!imageIds.length) return;

      setLoadingPreviewAppointmentId(appointmentId);

      try {
        const response = await requestAttachmentAccessLinksRef.current({
          appointmentId,
          mode: "preview",
          attachmentIds: imageIds,
        });

        if (!response?.links?.length) return;

        setAttachmentLinks((prev) => {
          const next = { ...prev };

          response.links.forEach((link) => {
            next[getAccessLinkCacheKey(appointmentId, "preview", link.attachmentId)] = {
              url: link.url,
              expiresAt: link.expiresAt,
            };
          });

          return next;
        });
      } catch (error) {
        console.error("Error loading attachment previews from history:", error);
      } finally {
        setLoadingPreviewAppointmentId((current) => (current === appointmentId ? null : current));
      }
    },
    [getCachedAttachmentLink]
  );

  const handleToggleAttachments = useCallback(
    async (appointment: AppointmentAPI) => {
      const isOpen = expandedAttachmentsAppointmentId === appointment.id;
      setExpandedAttachmentsAppointmentId(isOpen ? null : appointment.id);

      if (isOpen) return;

      await loadAttachmentPreviews(appointment.id, appointment.attachments || []);
    },
    [expandedAttachmentsAppointmentId, loadAttachmentPreviews]
  );

  const handleDownloadAttachment = useCallback(
    async (appointmentId: string, attachment: AppointmentAttachmentAPI) => {
      const cachedDownloadLink = getCachedAttachmentLink(appointmentId, "download", attachment.id);

      if (cachedDownloadLink) {
        openSignedLink(cachedDownloadLink);
        return;
      }

      try {
        const response = await requestAttachmentAccessLinksRef.current({
          appointmentId,
          mode: "download",
          attachmentIds: [attachment.id],
        });

        const signedLink = response?.links?.[0];
        if (!signedLink) {
          throw new Error("Signed link not returned.");
        }

        setAttachmentLinks((prev) => ({
          ...prev,
          [getAccessLinkCacheKey(appointmentId, "download", attachment.id)]: {
            url: signedLink.url,
            expiresAt: signedLink.expiresAt,
          },
        }));

        openSignedLink(signedLink.url);
      } catch (error) {
        console.error("Error requesting history attachment download link:", error);
        showToast({
          label: "Erro ao baixar o anexo",
          message: "Não foi possível abrir este arquivo agora.",
          type: "error",
          toastId: `history-attachment-download-error-${attachment.id}`,
          autoClose: false,
        });
      }
    },
    [getCachedAttachmentLink, showToast]
  );

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
          <PatientHeader
            name={patient.name}
            age={patient.age}
            birthDate={patient.birthDate}
            gender={patient.gender}
            cpf={patient.cpf}
            phone={patient.phone}
          />

          <div className="relative pl-4">
            <div className="absolute left-[38px] top-0 bottom-0 w-[2px] bg-slate-200"></div>

            <div className="flex flex-col gap-8">
              {isLoading && <div className="ml-32 text-slate-500">Carregando histórico...</div>}

              {!isLoading && !hasAppointments && (
                <div className="ml-32 text-slate-500">Nenhum atendimento encontrado para este paciente.</div>
              )}

              {displayAppointments.map((appointment) => {
                const dateObj = new Date(appointment.startDate);
                const day = format(dateObj, "dd");
                const month = format(dateObj, "MMM", { locale: ptBR }).toUpperCase().replace(".", "");
                const year = format(dateObj, "yyyy");
                const time = format(dateObj, "HH:mm");

                const serviceName = appointment.service?.name || "Atendimento";
                const professionalName = appointment.employee?.name || "Profissional não informado";
                const annotations = appointment.annotations || [];
                const latestAnnotation =
                  annotations.length > 0
                    ? [...annotations].sort(
                        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                      )[0]
                    : null;
                const isEditing = editingAptId === appointment.id;
                const attachments = appointment.attachments || [];
                const hasAttachments = attachments.length > 0;
                const isAttachmentsExpanded = expandedAttachmentsAppointmentId === appointment.id;
                const imageAttachments = attachments.filter((attachment) => attachment.category === "image");
                const documentAttachments = attachments.filter((attachment) => attachment.category !== "image");

                return (
                  <div key={appointment.id} className="flex gap-6 relative">
                    <div className="flex-shrink-0 z-10">
                      <div className="w-[76px] h-[76px] bg-[#141736] rounded-[14px] flex flex-col items-center justify-center text-white shadow-lg">
                        <span className="text-2xl font-bold leading-none">{day}</span>
                        <span className="text-xs font-medium uppercase tracking-wider">{month}</span>
                        <span className="text-[10px] opacity-80 mt-1">{year}</span>
                      </div>
                    </div>

                    <div className="flex-1 bg-gray-100 rounded-[16px] p-6 shadow-sm border border-slate-100">
                      <div className="flex justify-between items-start mb-4 border-b border-slate-200 pb-3">
                        <h3 className="text-lg font-semibold text-[#141736] italic">
                          {serviceName} - <span className="font-normal">{professionalName}</span>
                        </h3>
                        <div className="flex items-center gap-1 text-slate-500 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{time}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        {hasAttachments && (
                          <div className="mb-4">
                            <button
                              type="button"
                              onClick={() => void handleToggleAttachments(appointment)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:border-slate-300 transition-colors flex items-center justify-between gap-3"
                            >
                              <span className="inline-flex items-center gap-2 text-sm text-slate-700">
                                <Paperclip className="w-4 h-4 text-[#141736]" strokeWidth={1.5} />
                                Anexos ({attachments.length})
                              </span>
                              <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                                {isAttachmentsExpanded ? "Ocultar" : "Ver anexos"}
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform ${
                                    isAttachmentsExpanded ? "rotate-180" : ""
                                  }`}
                                  strokeWidth={1.5}
                                />
                              </span>
                            </button>

                            {isAttachmentsExpanded && (
                              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm space-y-3">
                                {imageAttachments.length > 0 && (
                                  <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                                      Imagens · {imageAttachments.length}
                                    </p>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-2">
                                      {imageAttachments.map((attachment) => {
                                        const previewUrl = getCachedAttachmentLink(
                                          appointment.id,
                                          "preview",
                                          attachment.id
                                        );

                                        return (
                                          <button
                                            key={attachment.id}
                                            type="button"
                                            onClick={() => previewUrl && openSignedLink(previewUrl)}
                                            disabled={!previewUrl}
                                            className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 text-left hover:border-slate-300 transition-colors disabled:cursor-default"
                                            title={attachment.name}
                                          >
                                            <div className="aspect-square w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                                              {previewUrl ? (
                                                <img
                                                  src={previewUrl}
                                                  alt={attachment.name}
                                                  className="w-full h-full object-cover"
                                                />
                                              ) : (
                                                <div className="px-3 text-center text-xs text-slate-400">
                                                  {loadingPreviewAppointmentId === appointment.id
                                                    ? "Carregando preview..."
                                                    : "Preview indisponível"}
                                                </div>
                                              )}
                                            </div>
                                            <div className="px-2 py-1.5">
                                              <p className="text-[11px] text-slate-700 truncate">{attachment.name}</p>
                                              <p className="text-[10px] text-slate-400 mt-0.5">
                                                {formatBytes(attachment.size)}
                                              </p>
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {documentAttachments.length > 0 && (
                                  <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                                      Documentos · {documentAttachments.length}
                                    </p>
                                    <div className="flex flex-col gap-2">
                                      {documentAttachments.map((attachment) => (
                                        <button
                                          key={attachment.id}
                                          type="button"
                                          onClick={() => void handleDownloadAttachment(appointment.id, attachment)}
                                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 flex items-center gap-3 text-left hover:bg-white hover:border-slate-300 transition-colors"
                                          title={attachment.name}
                                        >
                                          <div
                                            className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${fileBg(
                                              attachment.mime
                                            )}`}
                                          >
                                            <FileIcon mime={attachment.mime} className="w-4 h-4" />
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <p className="text-sm text-slate-700 truncate">{attachment.name}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                              {formatBytes(attachment.size)}
                                            </p>
                                          </div>
                                          <Download className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.5} />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {latestAnnotation ? (
                          <div className="flex flex-col gap-3">
                            {[latestAnnotation].map((note) => {
                              const noteDate = new Date(note.createdAt);
                              const noteDateFormatted = format(noteDate, "dd/MM/yyyy 'às' HH:mm");
                              const noteContent = note.content || "";
                              const isExpanded = expandedCards[note.id];
                              const shouldTruncate = noteContent.length > 200;
                              const displayedText =
                                isExpanded || !shouldTruncate
                                  ? noteContent
                                  : `${noteContent.slice(0, 200)}...`;

                              return (
                                <div
                                  key={note.id}
                                  className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative group transition-all hover:border-slate-300"
                                >
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
                          !isEditing && <p className="text-slate-400 text-sm italic">Sem observações.</p>
                        )}

                        {isEditing && (
                          <div className="mt-4">
                            <textarea
                              ref={textareaRef}
                              value={noteText}
                              onChange={(event) => setNoteText(event.target.value)}
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
                              onClick={() => void handleSaveNote(appointment)}
                              className="bg-blue-600 text-white hover:bg-blue-700 rounded-full px-6"
                              disabled={isCreating}
                            >
                              {isCreating ? "Salvando..." : "Salvar"}
                            </Button>
                          </>
                        ) : annotations.length === 0 ? (
                          <Button
                            variant="outline"
                            onClick={() => handleStartEdit(appointment)}
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
