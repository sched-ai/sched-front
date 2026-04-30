import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  File as FileIconGlyph,
  FileText,
  FileType2,
  Image as ImageIcon,
  Paperclip,
  Trash2,
} from "lucide-react";

import { DeleteNoteModal } from "@/components/DeleteNoteModal";
import { PatientHeader } from "@/components/PatientHeader";
import { Button } from "@/components/ui/button";
import {
  type AppointmentAttachmentAPI,
  useAppointmentAttachmentAccessLinksByAppointment,
} from "@/hooks/api/useAppointmentAttachments";
import { type AppointmentAPI, useGetAllAppointments } from "@/hooks/api/useGetAllAppointments";
import { useGetClient } from "@/hooks/api/useGetClient";
import useToast from "@/hooks/useToast";
import { normalizeRichTextContent, richTextToPlainText } from "@/util/richText";

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

function formatDurationClock(totalSeconds?: number | null) {
  if (!totalSeconds || totalSeconds <= 0) return "";

  const h = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${h}:${m}:${s}`;
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

function getStatusLabel(status?: string) {
  const normalized = status?.toLowerCase() || "";

  if (["concluido", "finished", "done"].includes(normalized)) return "Concluido";
  if (["agendado", "pending", "scheduled", "confirmed"].includes(normalized)) return "Agendado";

  return status || "Status";
}

function getStatusVisual(status?: string) {
  const label = getStatusLabel(status);

  if (label === "Concluido") return { textClass: "text-green-600", dotClass: "bg-green-600" };
  if (label === "Agendado") return { textClass: "text-blue-600", dotClass: "bg-blue-600" };

  return { textClass: "text-gray-500", dotClass: "bg-gray-400" };
}

export const PatientHistory = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
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

  const { mutateAsync: requestAttachmentAccessLinksAsync } = useAppointmentAttachmentAccessLinksByAppointment();
  const requestAttachmentAccessLinksRef = useRef(requestAttachmentAccessLinksAsync);

  const rawAppointments = appointmentsResponse?.data || [];
  const appointments = rawAppointments.filter((appointment) => {
    const normalizedStatus = appointment.status?.toLowerCase() || "";

    if (["cancelado", "cancelled", "canceled"].includes(normalizedStatus)) return false;

    const isFinalized = ["concluido", "finished", "done"].includes(normalizedStatus);
    if (!isFinalized) return false;

    const startTime = new Date(appointment.startDate).getTime();
    if (Number.isNaN(startTime)) return false;

    return startTime <= Date.now();
  });

  const hasAppointments = !isLoading && appointments.length > 0;
  const displayAppointments = hasAppointments
    ? [...appointments].sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )
    : [];

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [expandedAttachmentsAppointmentId, setExpandedAttachmentsAppointmentId] = useState<string | null>(null);
  const [attachmentLinks, setAttachmentLinks] = useState<SignedLinkCache>({});
  const [loadingPreviewAppointmentId, setLoadingPreviewAppointmentId] = useState<string | null>(null);

  useEffect(() => {
    requestAttachmentAccessLinksRef.current = requestAttachmentAccessLinksAsync;
  }, [requestAttachmentAccessLinksAsync]);

  const toggleExpand = (annotationId: string) => {
    setExpandedCards((prev) => ({ ...prev, [annotationId]: !prev[annotationId] }));
  };

  const handleDeleteNote = (annotationId: string) => {
    setNoteToDelete(annotationId);
  };

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
    <div className="w-full h-full bg-gray-50">
      <DeleteNoteModal
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onSuccess={() => refetch()}
        noteId={noteToDelete}
      />

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Histórico de Atendimentos</h1>
          <p className="text-sm text-gray-600 mt-2">
            Visualize e acompanhe todos os atendimentos realizados.
          </p>
        </div>

        <PatientHeader
          name={patient.name}
          age={patient.age}
          birthDate={patient.birthDate}
          gender={patient.gender}
          cpf={patient.cpf}
          phone={patient.phone}
        />

        <div className="relative pl-[124px]">
          <div className="absolute left-[46px] top-0 bottom-0 w-[2px] bg-gray-200" />

          <div className="space-y-6">
            {isLoading && <div className="ml-[120px] text-sm text-gray-600">Carregando histórico...</div>}

            {!isLoading && !hasAppointments && (
              <div className="ml-[120px] text-sm text-gray-600">
                Nenhum atendimento encontrado para este paciente.
              </div>
            )}

            {displayAppointments.map((appointment) => {
              const dateObj = new Date(appointment.startDate);
              const day = format(dateObj, "dd");
              const month = format(dateObj, "MMM", { locale: ptBR }).toUpperCase().replace(".", "");
              const year = format(dateObj, "yyyy");
              const time = format(dateObj, "HH:mm");

              const serviceName = appointment.service?.name || "Atendimento";
              const professionalName = appointment.employee?.name || "Profissional não informado";
              const durationLabel = formatDurationClock(appointment.consultationDurationSeconds);
              const annotations = appointment.annotations || [];
              const latestAnnotation =
                annotations.length > 0
                  ? [...annotations].sort(
                      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )[0]
                  : null;
              const attachments = appointment.attachments || [];
              const hasAttachments = attachments.length > 0;
              const isAttachmentsExpanded = expandedAttachmentsAppointmentId === appointment.id;
              const imageAttachments = attachments.filter((attachment) => attachment.category === "image");
              const documentAttachments = attachments.filter((attachment) => attachment.category !== "image");
              const statusLabel = getStatusLabel(appointment.status);
              const statusVisual = getStatusVisual(appointment.status);

              return (
                <div key={appointment.id} className="flex gap-6">
                  <div className="flex-shrink-0 z-10">
                    <div className="w-[92px] h-[92px] bg-gray-900 text-white rounded-lg flex flex-col items-center justify-center">
                      <span className="text-3xl leading-none">{day}</span>
                      <span className="text-xs uppercase">{month}</span>
                      <span className="text-xs opacity-70">{year}</span>
                    </div>
                  </div>

                  <div className="flex-1 bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-2">
                          <p className="text-gray-900">
                            <span className="italic">{serviceName}</span>
                            <span className="text-gray-900"> · {professionalName}</span>
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <span className="inline-flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{time}</span>
                            </span>
                            <span className={`inline-flex items-center gap-2 ${statusVisual.textClass}`}>
                              <span className={`w-2 h-2 rounded-full ${statusVisual.dotClass}`} />
                              {statusLabel}
                            </span>
                            {durationLabel && <span>Duração {durationLabel}</span>}
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={() =>
                            navigate(`/appointment/${appointment.id}`, {
                              state: { atendimento: appointment, paciente: patient },
                            })
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 rounded-md inline-flex items-center gap-2 whitespace-nowrap"
                        >
                          Acessar atendimento
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="border-t border-gray-200 pt-4 space-y-4">
                        {hasAttachments && (
                          <div>
                            <button
                              type="button"
                              onClick={() => void handleToggleAttachments(appointment)}
                              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 hover:border-gray-300 transition-colors flex items-center justify-between gap-3"
                            >
                              <span className="inline-flex items-center gap-2 text-sm text-gray-900">
                                <Paperclip className="w-4 h-4 text-gray-900" strokeWidth={1.5} />
                                Anexos ({attachments.length})
                              </span>
                              <span className="inline-flex items-center gap-2 text-xs text-gray-600">
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
                              <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3 space-y-3">
                                {imageAttachments.length > 0 && (
                                  <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">
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
                                            className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 text-left hover:border-gray-300 transition-colors disabled:cursor-default"
                                            title={attachment.name}
                                          >
                                            <div className="aspect-square w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                              {previewUrl ? (
                                                <img
                                                  src={previewUrl}
                                                  alt={attachment.name}
                                                  className="w-full h-full object-cover"
                                                />
                                              ) : (
                                                <div className="px-3 text-center text-xs text-gray-500">
                                                  {loadingPreviewAppointmentId === appointment.id
                                                    ? "Carregando preview..."
                                                    : "Preview indisponível"}
                                                </div>
                                              )}
                                            </div>
                                            <div className="px-2 py-1.5">
                                              <p className="text-[11px] text-gray-700 truncate">{attachment.name}</p>
                                              <p className="text-[10px] text-gray-500 mt-0.5">
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
                                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                                      Documentos · {documentAttachments.length}
                                    </p>
                                    <div className="flex flex-col gap-2">
                                      {documentAttachments.map((attachment) => (
                                        <button
                                          key={attachment.id}
                                          type="button"
                                          onClick={() => void handleDownloadAttachment(appointment.id, attachment)}
                                          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 flex items-center gap-3 text-left hover:bg-white hover:border-gray-300 transition-colors"
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
                                            <p className="text-sm text-gray-700 truncate">{attachment.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                              {formatBytes(attachment.size)}
                                            </p>
                                          </div>
                                          <Download className="w-4 h-4 text-gray-500 shrink-0" strokeWidth={1.5} />
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
                              const noteContentHtml = normalizeRichTextContent(note.content || "");
                              const noteContentPlain = richTextToPlainText(noteContentHtml);
                              const isExpanded = expandedCards[note.id];
                              const shouldTruncate = noteContentPlain.length > 200;
                              const displayedText = shouldTruncate
                                ? `${noteContentPlain.slice(0, 200)}...`
                                : noteContentPlain;

                              return (
                                <div
                                  key={note.id}
                                  className="bg-white p-4 rounded-lg border border-gray-200 relative group transition-colors hover:border-gray-300"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs text-gray-600 font-medium flex items-center gap-1">
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
                                  {isExpanded || !shouldTruncate ? (
                                    <div
                                      className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_a]:text-blue-600 [&_a]:underline"
                                      dangerouslySetInnerHTML={{ __html: noteContentHtml }}
                                    />
                                  ) : (
                                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                                      {displayedText}
                                    </p>
                                  )}
                                  {shouldTruncate && (
                                    <button
                                      onClick={() => toggleExpand(note.id)}
                                      className="text-gray-900 font-semibold text-sm mt-2 hover:underline block"
                                    >
                                      {isExpanded ? "Ler menos" : "Ler mais"}
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm italic">Sem observações.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientHistory;
