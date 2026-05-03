import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  File as FileIconGlyph,
  FileText,
  FileType2,
  Image as ImageIcon,
  Paperclip,
  Pause,
  Play,
  RotateCcw,
  Upload,
  X,
  XCircle,
  TriangleAlert,
} from "lucide-react";
import { PatientHeader } from "@/components/PatientHeader";
import { RichTextNoteEditor } from "@/components/RichTextNoteEditor";
import { useCreateAnnotation } from "@/hooks/api/useCreateAnnotation";
import { useGetAppointment } from "@/hooks/api/useGetAppointment";
import { useGetClient } from "@/hooks/api/useGetClient";
import { useGetService } from "@/hooks/api/useGetService";
import { useFinalizeAppointment } from "@/hooks/api/useFinalizeAppointment";
import {
  type AppointmentAttachmentAPI,
  useAppointmentAttachmentAccessLinks,
  useCompleteAppointmentAttachments,
  useDeleteAppointmentAttachment,
  useInitiateAppointmentAttachments,
} from "@/hooks/api/useAppointmentAttachments";
import useToast from "@/hooks/useToast";
import { isRichTextContentEmpty, normalizeRichTextContent } from "@/util/richText";

const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;
const IMAGE_MAX_DIMENSION = 1600;
const IMAGE_COMPRESSION_QUALITY = 0.82;

const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  "application/msword",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

type QueuedUploadedFile = {
  id: string;
  file: File;
  name: string;
  size: number;
  mime: string;
  preview: string;
  progress: number;
  done: boolean;
  status: "queued" | "uploading" | "done" | "error";
  error?: string;
};

type SignedLinkCacheEntry = {
  url: string;
  expiresAt: string;
};

type SignedLinkCache = Record<string, SignedLinkCacheEntry>;

type UploadExecutionResult = {
  attachmentId: string;
  clientTempId: string;
  success: boolean;
};

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

function calculateAge(birthDate: string | undefined): number | undefined {
  if (!birthDate) return undefined;
  const dob = new Date(birthDate);
  if (Number.isNaN(dob.getTime())) return undefined;
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}

function formatHHMMSS(totalSeconds: number) {
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

function formatDisplayDate(dateValue?: string) {
  if (!dateValue) return "";

  const dateOnly = dateValue.split("T")[0];
  const isoMatch = dateOnly.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}/${month}/${year}`;
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return dateValue;

  return parsedDate.toLocaleDateString("pt-BR");
}

function getStatusLabel(status?: string) {
  const normalized = status?.toLowerCase() || "";

  if (["concluido", "finished", "done"].includes(normalized)) return "Concluído";
  if (["agendado", "pending", "scheduled", "confirmed"].includes(normalized)) return "Agendado";
  if (["cancelado", "cancelled"].includes(normalized)) return "Cancelado";

  return status || "Desconhecido";
}

function getStatusVisual(status?: string) {
  const label = getStatusLabel(status);

  if (label === "Concluído") return { color: "text-green-600", dot: "bg-green-500" };
  if (label === "Agendado") return { color: "text-blue-600", dot: "bg-blue-500" };
  if (label === "Cancelado") return { color: "text-red-600", dot: "bg-red-500" };

  return { color: "text-slate-600", dot: "bg-slate-400" };
}

function isFinishedStatus(status?: string) {
  const normalized = status?.toLowerCase() || "";
  return ["concluido", "finished", "done"].includes(normalized);
}

function isAllowedAttachmentMime(mime: string) {
  return mime.startsWith("image/") || ALLOWED_ATTACHMENT_MIME_TYPES.has(mime);
}

function getAccessLinkCacheKey(mode: "preview" | "download", attachmentId: string) {
  return `${mode}:${attachmentId}`;
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

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Falha ao carregar a imagem."));
    image.src = url;
  });
}

async function compressImageFile(file: File) {
  const supportedTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

  if (!supportedTypes.has(file.type)) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const longestSide = Math.max(image.width, image.height);
    const shouldResize = longestSide > IMAGE_MAX_DIMENSION;
    const shouldAttemptCompression = shouldResize || file.size > 1_000_000;

    if (!shouldAttemptCompression) {
      return file;
    }

    const scale = shouldResize ? IMAGE_MAX_DIMENSION / longestSide : 1;
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, width, height);

    const compressedBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, file.type, IMAGE_COMPRESSION_QUALITY);
    });

    if (!compressedBlob || compressedBlob.size >= file.size) {
      return file;
    }

    return new File([compressedBlob], file.name, {
      type: compressedBlob.type || file.type,
      lastModified: file.lastModified,
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function runWithConcurrency<T>(tasks: Array<() => Promise<T>>, limit: number) {
  if (!tasks.length) return [];

  const results: T[] = new Array(tasks.length);
  let currentIndex = 0;

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, async () => {
    while (currentIndex < tasks.length) {
      const taskIndex = currentIndex;
      currentIndex += 1;
      results[taskIndex] = await tasks[taskIndex]();
    }
  });

  await Promise.all(workers);
  return results;
}

function ConsultationTimer({
  serviceId,
  startDate,
  endDate,
  storedDurationSeconds,
  isFinished,
  isFinalizing,
  onFinalizeConsultation,
}: {
  serviceId?: string | null;
  startDate?: string;
  endDate?: string;
  storedDurationSeconds?: number | null;
  isFinished?: boolean;
  isFinalizing?: boolean;
  onFinalizeConsultation?: (durationSeconds?: number) => Promise<void> | void;
}) {
  const { data: service, isLoading } = useGetService(serviceId ?? "", !!serviceId);

  const [initialSeconds, setInitialSeconds] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  runningRef.current = running;

  useEffect(() => {
    if (typeof storedDurationSeconds === "number" && storedDurationSeconds > 0) {
      setInitialSeconds(storedDurationSeconds);

      if (!runningRef.current) {
        setTimerSeconds(storedDurationSeconds);
      }

      return;
    }

    let minutes = 0;

    if (service?.duration) {
      minutes = service.duration;
    } else if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();

      if (!Number.isNaN(start) && !Number.isNaN(end) && end > start) {
        minutes = Math.round((end - start) / 60000);
      }
    }

    if (minutes > 0) {
      const seconds = minutes * 60;
      setInitialSeconds(seconds);

      if (!runningRef.current) {
        setTimerSeconds(seconds);
      }
    }
  }, [endDate, service?.duration, startDate, storedDurationSeconds]);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopInterval();
    intervalRef.current = window.setInterval(() => {
      setTimerSeconds((seconds) => {
        const next = seconds - 1;

        if (next <= 0) {
          if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setRunning(false);
          return 0;
        }

        return next;
      });
    }, 1000);
  }, [stopInterval]);

  const handleToggleTimer = useCallback(() => {
    if (initialSeconds === 0 || isFinished || isFinalizing) return;

    if (running) {
      stopInterval();
      setRunning(false);
      return;
    }

    setTimerSeconds((prev) => (prev === 0 ? initialSeconds : prev));
    setRunning(true);
    startTimer();
  }, [initialSeconds, isFinished, isFinalizing, running, startTimer, stopInterval]);

  const handleReset = useCallback(() => {
    if (isFinished || isFinalizing) return;
    stopInterval();
    setRunning(false);
    setTimerSeconds(initialSeconds);
  }, [initialSeconds, isFinished, isFinalizing, stopInterval]);

  const handleFinalize = useCallback(async () => {
    const elapsedSeconds = Math.max(0, initialSeconds - timerSeconds);
    if (!onFinalizeConsultation || isFinished || isFinalizing || elapsedSeconds < 1) return;

    stopInterval();
    setRunning(false);

    const durationToPersist = elapsedSeconds > 0 ? elapsedSeconds : initialSeconds;

    await onFinalizeConsultation(durationToPersist > 0 ? durationToPersist : undefined);
  }, [initialSeconds, isFinished, isFinalizing, onFinalizeConsultation, stopInterval, timerSeconds]);

  const elapsedSeconds = Math.max(0, initialSeconds - timerSeconds);
  const canFinalize = elapsedSeconds >= 1 && !isFinished && !isFinalizing;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Duração da consulta</p>
          <div className="text-slate-900 text-3xl">
            {isLoading ? "..." : initialSeconds === 0 ? "--:--:--" : formatHHMMSS(timerSeconds)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleTimer}
            disabled={initialSeconds === 0 || !!isFinished || !!isFinalizing}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition ${
              initialSeconds === 0 || isFinished || isFinalizing
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            title={running ? "Pausar" : "Iniciar"}
          >
            {running ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            onClick={handleReset}
            disabled={(!running && timerSeconds === initialSeconds) || !!isFinished || !!isFinalizing}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition ${
              (!running && timerSeconds === initialSeconds) || isFinished || isFinalizing
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            title="Zerar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isLoading && initialSeconds === 0 && (
        <p className="text-sm text-slate-500">Sem duração configurada para este atendimento.</p>
      )}

      <Button
        type="button"
        onClick={() => void handleFinalize()}
        disabled={!canFinalize}
        className={`w-full h-10 rounded-lg text-white ${
          isFinished
            ? "bg-red-600 hover:bg-red-600 cursor-default"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {isFinished ? "Consulta finalizada" : isFinalizing ? "Finalizando consulta..." : "Finalizar consulta"}
      </Button>
    </div>
  );
}

export const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const navData: any = (location && (location.state as any)) || null;
  const atendimentoState = navData?.atendimento || navData;

  const [patient, setPatient] = useState<any>(() => ({
    id: id || "1",
    clientId: atendimentoState?.clientId || atendimentoState?.client?.id || "",
    name: atendimentoState?.clientName || atendimentoState?.client?.name || atendimentoState?.paciente || "",
    cpf: atendimentoState?.client?.cpf || atendimentoState?.cpf || atendimentoState?.document || "",
    phone: atendimentoState?.client?.phone || atendimentoState?.phone || atendimentoState?.telefone || "",
    email: atendimentoState?.client?.email || atendimentoState?.email || "",
    address: atendimentoState?.client?.address || atendimentoState?.address || "",
    birth: atendimentoState?.client?.birthDate || atendimentoState?.birth || "",
    age:
      atendimentoState?.client?.age ||
      atendimentoState?.age ||
      calculateAge(atendimentoState?.client?.birthDate || atendimentoState?.birth) ||
      undefined,
    gender: atendimentoState?.client?.gender || atendimentoState?.gender || "",
    especialidade: atendimentoState?.especialidade || atendimentoState?.specialty || "",
    data: atendimentoState?.startDate?.split("T")[0] || atendimentoState?.data || atendimentoState?.date || "",
    hora:
      atendimentoState?.startDate?.split("T")[1]?.substring(0, 5) ||
      atendimentoState?.hora ||
      atendimentoState?.time ||
      "",
    medico: atendimentoState?.employee?.name || atendimentoState?.medico || "",
    status: atendimentoState?.status || "",
    tipoConsulta: atendimentoState?.service?.name || atendimentoState?.tipoConsulta || "",
  }));
  const atendimentoPrevRef = useRef<string | any>(null);

  const [annotationText, setAnnotationText] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"nota" | "arquivos">("nota");
  const [queuedFiles, setQueuedFiles] = useState<QueuedUploadedFile[]>([]);
  const [accessLinks, setAccessLinks] = useState<SignedLinkCache>({});
  const [attachmentToDelete, setAttachmentToDelete] = useState<AppointmentAttachmentAPI | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSavingFiles, setIsSavingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const queuedFilesRef = useRef<QueuedUploadedFile[]>([]);
  const previewRequestsInFlightRef = useRef<Set<string>>(new Set());
  const { data: fetchedAppointment, refetch: refetchAppointment, isLoading } = useGetAppointment(id || "", !!id);

  const clientId = fetchedAppointment?.clientId || fetchedAppointment?.client?.id || patient.clientId || "";
  const { data: fullClientData } = useGetClient(clientId, !!clientId);

  const { mutateAsync: createAnnotation, isPending: isCreatingAnnotation } = useCreateAnnotation({
    onSuccessFn: () => {
      refetchAppointment();
    },
  });
  const { mutateAsync: finalizeAppointment, isPending: isFinalizingAppointment } = useFinalizeAppointment();

  const initiateAttachments = useInitiateAppointmentAttachments(id || "");
  const completeAttachments = useCompleteAppointmentAttachments(id || "");
  const { mutateAsync: requestAttachmentAccessLinksAsync } = useAppointmentAttachmentAccessLinks(id || "");
  const deleteAttachment = useDeleteAppointmentAttachment(id || "");
  const requestAttachmentAccessLinksRef = useRef(requestAttachmentAccessLinksAsync);

  useEffect(() => {
    queuedFilesRef.current = queuedFiles;
  }, [queuedFiles]);

  useEffect(() => {
    requestAttachmentAccessLinksRef.current = requestAttachmentAccessLinksAsync;
  }, [requestAttachmentAccessLinksAsync]);

  useEffect(() => {
    return () => {
      queuedFilesRef.current.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, []);

  useEffect(() => {
    if (!atendimentoState) return;
    try {
      const serialized = JSON.stringify(atendimentoState);
      if (atendimentoPrevRef.current !== serialized) {
        atendimentoPrevRef.current = serialized;
        setPatient((current: any) => ({ ...current, ...atendimentoState }));
      }
    } catch {
      if (atendimentoPrevRef.current !== atendimentoState) {
        atendimentoPrevRef.current = atendimentoState as any;
        setPatient((current: any) => ({ ...current, ...atendimentoState }));
      }
    }
  }, [atendimentoState]);

  useEffect(() => {
    if (fullClientData) {
      setPatient((prev: any) => ({
        ...prev,
        clientId: fullClientData.id || prev.clientId,
        name: fullClientData.name || prev.name,
        cpf: fullClientData.cpf || prev.cpf,
        phone: fullClientData.phone || prev.phone,
        email: fullClientData.email || prev.email,
        gender: fullClientData.gender || prev.gender,
        age: (fullClientData as any).age || calculateAge((fullClientData as any).birthDate) || prev.age,
        birth: (fullClientData as any).birthDate || prev.birth,
      }));
    }
  }, [fullClientData]);

  useEffect(() => {
    if (fetchedAppointment) {
      setPatient((prev: any) => ({
        ...prev,
        clientId: fetchedAppointment.clientId || fetchedAppointment.client?.id || prev.clientId,
        name: fetchedAppointment.client?.name || fetchedAppointment.clientName || prev.name,
      }));
    }
  }, [fetchedAppointment]);

  useEffect(() => {
    const firstAnnotation = fetchedAppointment?.annotations?.[0];
    setAnnotationText(normalizeRichTextContent(firstAnnotation?.content || ""));
  }, [fetchedAppointment]);

  const storedAttachments = fetchedAppointment?.attachments || [];
  const storedImages = storedAttachments.filter((attachment) => attachment.category === "image");
  const storedDocuments = storedAttachments.filter((attachment) => attachment.category !== "image");
  const queuedImages = queuedFiles.filter((file) => getFileCategory(file.mime) === "image");
  const queuedDocuments = queuedFiles.filter((file) => getFileCategory(file.mime) !== "image");
  const queuedDoneCount = queuedFiles.filter((file) => file.done).length;
  const totalAttachmentCount = storedAttachments.length + queuedFiles.length;
  const appointmentDate = formatDisplayDate(fetchedAppointment?.startDate || patient.data || "");
  const appointmentTime = fetchedAppointment?.startDate?.split("T")[1]?.substring(0, 5) || patient.hora || "";
  const statusVisual = getStatusVisual(fetchedAppointment?.status || patient.status);
  const statusLabel = getStatusLabel(fetchedAppointment?.status || patient.status);
  const isFinished = isFinishedStatus(fetchedAppointment?.status || patient.status);
  const storedImageKey = storedImages.map((attachment) => attachment.id).join("|");
  const storedImageIds = useMemo(
    () => storedImageKey.split("|").filter(Boolean),
    [storedImageKey]
  );

  const getCachedSignedLink = useCallback(
    (mode: "preview" | "download", attachmentId: string) => {
      const key = getAccessLinkCacheKey(mode, attachmentId);
      const cachedLink = accessLinks[key];

      if (!cachedLink || isSignedLinkExpired(cachedLink.expiresAt)) {
        return undefined;
      }

      return cachedLink.url;
    },
    [accessLinks]
  );

  useEffect(() => {
    if (activeTab !== "arquivos" || !storedImageIds.length) return;

    const missingPreviewIds = storedImageIds.filter((attachmentId) => {
      const cacheKey = getAccessLinkCacheKey("preview", attachmentId);
      const cachedLink = accessLinks[cacheKey];

      return (
        (!cachedLink || isSignedLinkExpired(cachedLink.expiresAt)) &&
        !previewRequestsInFlightRef.current.has(attachmentId)
      );
    });

    if (!missingPreviewIds.length) return;

    let isCancelled = false;
    missingPreviewIds.forEach((attachmentId) => previewRequestsInFlightRef.current.add(attachmentId));

    requestAttachmentAccessLinksRef.current({
        mode: "preview",
        attachmentIds: missingPreviewIds,
      })
      .then((response) => {
        if (isCancelled || !response?.links?.length) return;

        setAccessLinks((prev) => {
          const next = { ...prev };

          response.links.forEach((link) => {
            next[getAccessLinkCacheKey("preview", link.attachmentId)] = {
              url: link.url,
              expiresAt: link.expiresAt,
            };
          });

          return next;
        });
      })
      .catch((error) => {
        console.error("Error prefetching attachment previews:", error);
      })
      .finally(() => {
        missingPreviewIds.forEach((attachmentId) => {
          previewRequestsInFlightRef.current.delete(attachmentId);
        });
      });

    return () => {
      isCancelled = true;
    };
  }, [activeTab, accessLinks, storedImageKey]);

  const updateQueuedFile = useCallback((fileId: string, updater: (file: QueuedUploadedFile) => QueuedUploadedFile) => {
    setQueuedFiles((prev) => prev.map((file) => (file.id === fileId ? updater(file) : file)));
  }, []);

  const removeQueuedFile = useCallback((fileId: string) => {
    setQueuedFiles((prev) => {
      const fileToRemove = prev.find((file) => file.id === fileId);
      if (fileToRemove?.preview) URL.revokeObjectURL(fileToRemove.preview);
      return prev.filter((file) => file.id !== fileId);
    });
  }, []);

  const clearQueuedFiles = useCallback(() => {
    setQueuedFiles((prev) => {
      prev.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });

      return [];
    });
  }, []);

  const cleanUpInitiatedAttachments = useCallback(
    async (attachmentIds: string[]) => {
      if (!attachmentIds.length) return;

      await Promise.allSettled(attachmentIds.map((attachmentId) => deleteAttachment.mutateAsync(attachmentId)));
    },
    [deleteAttachment]
  );

  const handleIncomingFiles = useCallback(
    async (list: FileList | null) => {
      if (!list?.length) return;

      const nextQueuedFiles: QueuedUploadedFile[] = [];
      const rejectedMessages: string[] = [];

      for (const originalFile of Array.from(list)) {
        if (!isAllowedAttachmentMime(originalFile.type)) {
          rejectedMessages.push(`${originalFile.name}: tipo de arquivo não permitido.`);
          continue;
        }

        let preparedFile = originalFile;

        try {
          preparedFile = await compressImageFile(originalFile);
        } catch (error) {
          console.error("Error compressing attachment image:", error);
        }

        if (preparedFile.size > MAX_ATTACHMENT_SIZE_BYTES) {
          rejectedMessages.push(`${preparedFile.name}: excede o limite de 10 MB.`);
          continue;
        }

        nextQueuedFiles.push({
          id: crypto.randomUUID(),
          file: preparedFile,
          name: preparedFile.name,
          size: preparedFile.size,
          mime: preparedFile.type,
          preview: preparedFile.type.startsWith("image/") ? URL.createObjectURL(preparedFile) : "",
          progress: 0,
          done: false,
          status: "queued",
        });
      }

      if (nextQueuedFiles.length) {
        setQueuedFiles((prev) => [...prev, ...nextQueuedFiles]);
        setActiveTab("arquivos");
      }

      if (rejectedMessages.length) {
        showToast({
          label: "Alguns arquivos não foram adicionados",
          message: rejectedMessages[0],
          type: "error",
          toastId: "attachment-rejected",
          autoClose: false,
        });
      }
    },
    [showToast]
  );

  const onDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragCounter.current += 1;
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsDragging(false);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      dragCounter.current = 0;
      setIsDragging(false);
      void handleIncomingFiles(event.dataTransfer.files);
      setActiveTab("arquivos");
    },
    [handleIncomingFiles]
  );

  const handleSaveAnnotation = useCallback(async () => {
    const normalizedAnnotation = normalizeRichTextContent(annotationText);

    if (isRichTextContentEmpty(normalizedAnnotation)) return;

    const appointmentId = fetchedAppointment?.id || id || "";
    const selectedClientId =
      patient.clientId || clientId || fetchedAppointment?.clientId || fetchedAppointment?.client?.id || "";

    if (!appointmentId || !selectedClientId) return;

    try {
      await createAnnotation({
        appointmentId,
        clientId: selectedClientId,
        content: normalizedAnnotation,
      });
    } catch (error) {
      console.error("Failed to create annotation", error);
    }
  }, [annotationText, clientId, createAnnotation, fetchedAppointment, id, patient.clientId]);

  const handleFinalizeConsultation = useCallback(
    async (durationSeconds?: number) => {
      const appointmentId = fetchedAppointment?.id || id || "";
      if (!appointmentId) return;

      try {
        await finalizeAppointment({
          id: appointmentId,
          consultationDurationSeconds: durationSeconds,
        });

        await queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] });
        await queryClient.invalidateQueries({ queryKey: ["appointments"] });
        await refetchAppointment();
      } catch (error) {
        console.error("Error finalizing appointment:", error);
      }
    },
    [fetchedAppointment?.id, finalizeAppointment, id, queryClient, refetchAppointment]
  );

  const handleSaveFiles = useCallback(async () => {
    if (!id || !queuedFiles.length || isSavingFiles) return;

    setIsSavingFiles(true);

    try {
      const queuedSnapshot = [...queuedFiles];
      const initiateResponse = await initiateAttachments.mutateAsync({
        files: queuedSnapshot.map((file) => ({
          clientTempId: file.id,
          name: file.name,
          size: file.size,
          mime: file.mime,
        })),
      });

      const uploadInstructions = new Map(
        (initiateResponse?.files || []).map((file) => [file.clientTempId, file])
      );

      const uploadTasks = queuedSnapshot
        .filter((file) => uploadInstructions.has(file.id))
        .map((file) => async (): Promise<UploadExecutionResult> => {
          const uploadInstruction = uploadInstructions.get(file.id)!;

          updateQueuedFile(file.id, (currentFile) => ({
            ...currentFile,
            status: "uploading",
            progress: 0,
            done: false,
            error: undefined,
          }));

          try {
            await axios.put(uploadInstruction.uploadUrl, file.file, {
              headers: {
                "Content-Type": file.mime,
              },
              onUploadProgress: (progressEvent) => {
                const total = progressEvent.total || file.size || 1;
                const progress = Math.min(99, Math.max(1, Math.round((progressEvent.loaded * 100) / total)));

                updateQueuedFile(file.id, (currentFile) => ({
                  ...currentFile,
                  progress,
                  status: "uploading",
                }));
              },
            });

            updateQueuedFile(file.id, (currentFile) => ({
              ...currentFile,
              progress: 100,
              done: true,
              status: "done",
            }));

            return {
              attachmentId: uploadInstruction.attachmentId,
              clientTempId: file.id,
              success: true,
            };
          } catch (error) {
            console.error("Error uploading attachment to R2:", error);

            updateQueuedFile(file.id, (currentFile) => ({
              ...currentFile,
              progress: 0,
              done: false,
              status: "error",
              error: "Falha no envio.",
            }));

            return {
              attachmentId: uploadInstruction.attachmentId,
              clientTempId: file.id,
              success: false,
            };
          }
        });

      const uploadResults = await runWithConcurrency(uploadTasks, 3);
      const successfulUploads = uploadResults.filter((result) => result.success);
      const failedUploads = uploadResults.filter((result) => !result.success);

      if (failedUploads.length) {
        await cleanUpInitiatedAttachments(failedUploads.map((result) => result.attachmentId));
      }

      if (successfulUploads.length) {
        try {
          await completeAttachments.mutateAsync({
            attachments: successfulUploads.map((result) => ({
              attachmentId: result.attachmentId,
            })),
          });
        } catch (error) {
          console.error("Error completing attachment uploads:", error);

          await cleanUpInitiatedAttachments(successfulUploads.map((result) => result.attachmentId));

          const completedQueueIds = new Set(successfulUploads.map((result) => result.clientTempId));
          setQueuedFiles((prev) =>
            prev.map((file) =>
              completedQueueIds.has(file.id)
                ? {
                    ...file,
                    progress: 0,
                    done: false,
                    status: "error",
                    error: "Falha ao finalizar o envio.",
                  }
                : file
            )
          );

          showToast({
            label: "Erro ao salvar arquivos",
            message: "Não foi possível finalizar o envio dos anexos.",
            type: "error",
            toastId: "appointment-attachments-complete-error",
            autoClose: false,
          });

          return;
        }

        const successfulQueueIds = new Set(successfulUploads.map((result) => result.clientTempId));
        setQueuedFiles((prev) => {
          prev.forEach((file) => {
            if (successfulQueueIds.has(file.id) && file.preview) {
              URL.revokeObjectURL(file.preview);
            }
          });

          return prev.filter((file) => !successfulQueueIds.has(file.id));
        });

        await queryClient.invalidateQueries({ queryKey: ["appointment", id] });
        await refetchAppointment();
      }

      if (successfulUploads.length && !failedUploads.length) {
        showToast({
          label: "Arquivos salvos com sucesso!",
          message: "",
          type: "success",
          toastId: "appointment-attachments-success",
        });
      } else if (successfulUploads.length) {
        showToast({
          label: "Parte dos arquivos foi salva",
          message: "Alguns anexos falharam e permaneceram na fila para um novo envio.",
          type: "warning",
          toastId: "appointment-attachments-partial",
          autoClose: false,
        });
      } else {
        showToast({
          label: "Erro ao salvar arquivos",
          message: "Nenhum arquivo conseguiu ser enviado. Tente novamente.",
          type: "error",
          toastId: "appointment-attachments-error",
          autoClose: false,
        });
      }
    } catch (error) {
      console.error("Error saving appointment attachments:", error);
      showToast({
        label: "Erro ao salvar arquivos",
        message: "Não foi possível iniciar o envio dos anexos.",
        type: "error",
        toastId: "appointment-attachments-initiate-error",
        autoClose: false,
      });
    } finally {
      setIsSavingFiles(false);
    }
  }, [
    cleanUpInitiatedAttachments,
    completeAttachments,
    id,
    initiateAttachments,
    isSavingFiles,
    queryClient,
    queuedFiles,
    refetchAppointment,
    showToast,
    updateQueuedFile,
  ]);

  const handleDownloadStoredAttachment = useCallback(
    async (attachment: AppointmentAttachmentAPI) => {
      const cachedDownloadLink = getCachedSignedLink("download", attachment.id);

      if (cachedDownloadLink) {
        openSignedLink(cachedDownloadLink);
        return;
      }

      try {
        const response = await requestAttachmentAccessLinksAsync({
          mode: "download",
          attachmentIds: [attachment.id],
        });

        const signedLink = response?.links?.[0];
        if (!signedLink) {
          throw new Error("Signed link not returned.");
        }

        setAccessLinks((prev) => ({
          ...prev,
          [getAccessLinkCacheKey("download", attachment.id)]: {
            url: signedLink.url,
            expiresAt: signedLink.expiresAt,
          },
        }));

        openSignedLink(signedLink.url);
      } catch (error) {
        console.error("Error requesting attachment download link:", error);
        showToast({
          label: "Erro ao baixar arquivo",
          message: "Não foi possível gerar o link de download.",
          type: "error",
          toastId: "appointment-attachment-download-error",
          autoClose: false,
        });
      }
    },
    [getCachedSignedLink, requestAttachmentAccessLinksAsync, showToast]
  );

  const handleDeleteStoredAttachment = useCallback(
    async (attachment: AppointmentAttachmentAPI) => {
      try {
        await deleteAttachment.mutateAsync(attachment.id);
        setAccessLinks((prev) => {
          const next = { ...prev };
          delete next[getAccessLinkCacheKey("preview", attachment.id)];
          delete next[getAccessLinkCacheKey("download", attachment.id)];
          return next;
        });

        await queryClient.invalidateQueries({ queryKey: ["appointment", id] });
        await refetchAppointment();

        showToast({
          label: "Arquivo removido com sucesso!",
          message: "",
          type: "success",
          toastId: "appointment-attachment-delete-success",
        });
      } catch (error) {
        console.error("Error deleting appointment attachment:", error);
        showToast({
          label: "Erro ao remover arquivo",
          message: "Não foi possível remover este anexo.",
          type: "error",
          toastId: "appointment-attachment-delete-error",
          autoClose: false,
        });
      }
    },
    [deleteAttachment, id, queryClient, refetchAppointment, showToast]
  );

  const handleRequestDeleteStoredAttachment = useCallback((attachment: AppointmentAttachmentAPI) => {
    setAttachmentToDelete(attachment);
  }, []);

  const handleCancelDeleteStoredAttachment = useCallback(() => {
    if (deleteAttachment.isPending) return;
    setAttachmentToDelete(null);
  }, [deleteAttachment.isPending]);

  const handleConfirmDeleteStoredAttachment = useCallback(async () => {
    if (!attachmentToDelete) return;

    await handleDeleteStoredAttachment(attachmentToDelete);
    setAttachmentToDelete(null);
  }, [attachmentToDelete, handleDeleteStoredAttachment]);

  const isCancelledState = patient.status && ["cancelado", "cancelled"].includes(patient.status.toLowerCase());
  const isCancelledFetched =
    fetchedAppointment?.status && ["cancelado", "cancelled"].includes(fetchedAppointment.status.toLowerCase());
  const isCancelled = isCancelledState || isCancelledFetched;

  if (isLoading && !fetchedAppointment && !patient.status) {
    return (
      <div className="min-h-screen">
        <div className="p-6 md:p-8 mx-auto">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm px-6 py-10 text-center text-slate-500">
            Carregando atendimento...
          </div>
        </div>
      </div>
    );
  }

  if (isCancelled) {
    return (
      <div className="min-h-screen">
        <div className="p-6 md:p-8 mx-auto space-y-6 h-full">
          <div>
            <h1 className="text-[2rem] text-slate-900">Detalhes do Atendimento</h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe as informações do atendimento e o histórico do paciente.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm px-6 py-10 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="w-7 h-7 text-red-500" strokeWidth={1.5} />
            </div>
            <h2 className="text-slate-900 mb-2">Atendimento cancelado</h2>
            <p className="text-slate-500 mb-6">
              Não é possível visualizar os detalhes de um atendimento que foi cancelado.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate(-1)}>
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="p-6 md:p-8 mx-auto space-y-6 h-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-0">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground">Detalhes do Atendimento</h1>
            <p className="text-muted-foreground mt-2">
             
              Acompanhe as informações do atendimento e registre observações de forma organizada.
            
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 self-start border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 h-10 px-4 whitespace-nowrap mb-4 md:mb-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>

        <PatientHeader
          name={patient.name}
          age={patient.age}
          birthDate={patient.birth}
          gender={patient.gender}
          cpf={patient.cpf}
          phone={patient.phone}
          action={
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 h-11 min-w-[160px] flex items-center justify-center whitespace-nowrap rounded-xl"
              onClick={() => {
                const selectedClientId =
                  patient.clientId ||
                  fetchedAppointment?.clientId ||
                  fetchedAppointment?.client?.id ||
                  (location.state as any)?.atendimento?.clientId ||
                  (location.state as any)?.paciente?.id;

                if (selectedClientId) {
                  navigate(`/patients/${selectedClientId}/history`, { state: { paciente: patient } });
                } else {
                  console.warn("Client ID not found for navigation.", {
                    fetchedAppointment,
                    patient,
                    state: location.state,
                  });
                }
              }}
            >
              <span className="w-4 h-4 mr-2 flex-shrink-0 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </span>
              <span>Ver histórico</span>
            </Button>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-6">
            <ConsultationTimer
              serviceId={
                fetchedAppointment?.serviceId ||
                (location.state as any)?.atendimento?.serviceId ||
                (location.state as any)?.atendimento?.service?.id
              }
              startDate={fetchedAppointment?.startDate || (location.state as any)?.atendimento?.startDate}
              endDate={fetchedAppointment?.endDate || (location.state as any)?.atendimento?.endDate}
              storedDurationSeconds={
                fetchedAppointment?.consultationDurationSeconds ||
                (location.state as any)?.atendimento?.consultationDurationSeconds ||
                null
              }
              isFinished={isFinished}
              isFinalizing={isFinalizingAppointment}
              onFinalizeConsultation={handleFinalizeConsultation}
            />

            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Resumo</p>
                <p className="text-slate-900">{fetchedAppointment?.service?.name || "Atendimento"}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <CalendarDays className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                  <span>{formatDisplayDate(fetchedAppointment?.startDate || patient.data || "")}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock3 className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                  <span>{fetchedAppointment?.startDate?.split("T")[1]?.substring(0, 5) || patient.hora || ""}</span>
                </div>
                <div className={`inline-flex items-center gap-1.5 ${statusVisual.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusVisual.dot}`} />
                  {statusLabel}
                </div>
              </div>
            </div>
          </div>

          <div
            className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col relative overflow-hidden"
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            {isDragging && (
              <div className="absolute inset-0 z-20 rounded-lg border-2 border-dashed border-blue-400 bg-blue-50/80 flex flex-col items-center justify-center gap-3 pointer-events-none">
                <Upload className="w-8 h-8 text-blue-500" strokeWidth={1.5} />
                <p className="text-sm text-blue-600">Solte os arquivos aqui</p>
              </div>
            )}

            <div className="flex items-center border-b border-slate-100 px-5 pt-4 gap-0">
              <button
                type="button"
                onClick={() => setActiveTab("nota")}
                className={`flex items-center gap-2 px-1 pb-3 mr-5 text-sm border-b-2 transition-colors ${
                  activeTab === "nota"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <FileText className="w-4 h-4" strokeWidth={1.5} />
                Anotação
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("arquivos")}
                className={`flex items-center gap-2 px-1 pb-3 text-sm border-b-2 transition-colors ${
                  activeTab === "arquivos"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Paperclip className="w-4 h-4" strokeWidth={1.5} />
                Arquivos
                {totalAttachmentCount > 0 && (
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs ${
                      activeTab === "arquivos" ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {totalAttachmentCount}
                  </span>
                )}
              </button>

              <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400 pb-3">
                <Clock3 className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>
                  {appointmentDate} • {appointmentTime}
                </span>
              </div>
            </div>

            {activeTab === "nota" && (
              <>
                <div className="p-5 flex-1 flex flex-col gap-4">
                  <p className="text-sm text-muted-foreground">
                    Registre ou atualize as observações deste atendimento.
                  </p>

                  <RichTextNoteEditor
                    value={annotationText}
                    onChange={setAnnotationText}
                    placeholder="Adicione uma observação relevante sobre o atendimento..."
                    minHeightClassName="min-h-[220px]"
                  />
                </div>

                <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAnnotationText("")}
                    className="h-10 min-w-[88px] px-5 whitespace-nowrap border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  >
                    Limpar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveAnnotation}
                    className="h-10 min-w-[88px] px-5 whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    disabled={isCreatingAnnotation}
                  >
                    {isCreatingAnnotation ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </>
            )}

            {activeTab === "arquivos" && (
              <>
                <div className="p-5 flex flex-col gap-5">
                  <p className="text-sm text-muted-foreground">
                    Envie fotos ou documentos relacionados a este atendimento.
                  </p>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full rounded-xl border-2 border-dashed px-6 py-8 flex flex-col items-center gap-3 transition-all cursor-pointer group ${
                      isDragging
                        ? "border-blue-400 bg-blue-50"
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        isDragging ? "bg-blue-100" : "bg-slate-100 group-hover:bg-blue-50"
                      }`}
                    >
                      <Upload
                        className={`w-5 h-5 transition-colors ${
                          isDragging ? "text-blue-500" : "text-slate-400 group-hover:text-blue-500"
                        }`}
                        strokeWidth={1.5}
                      />
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-slate-700">
                        <span className="text-blue-600">Clique para selecionar</span> ou arraste arquivos aqui
                      </p>
                      <p className="text-xs text-slate-400 mt-1">PNG, JPG, PDF, DOCX até 10 MB</p>
                    </div>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    className="hidden"
                    onChange={(event) => {
                      void handleIncomingFiles(event.target.files);
                      event.target.value = "";
                    }}
                  />

                  {storedImages.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">
                        Fotos salvas · {storedImages.length}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {storedImages.map((image) => {
                          const previewUrl = getCachedSignedLink("preview", image.id);

                          return (
                            <div
                              key={image.id}
                              className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
                            >
                              {previewUrl ? (
                                <button
                                  type="button"
                                  onClick={() => openSignedLink(previewUrl)}
                                  className="w-full h-full"
                                  title={image.name}
                                >
                                  <img
                                    src={previewUrl}
                                    alt={image.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                </button>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-center px-3 text-xs text-slate-400">
                                  Carregando preview...
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRequestDeleteStoredAttachment(image)}
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                title="Remover arquivo"
                              >
                                <X className="w-3 h-3" />
                              </button>

                              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                                <p className="text-white text-xs truncate">{image.name}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {queuedImages.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">
                        Novas fotos · {queuedImages.length}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {queuedImages.map((image) => (
                          <div
                            key={image.id}
                            className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
                          >
                            <img
                              src={image.preview}
                              alt={image.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />

                            {image.status !== "done" && (
                              <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center gap-1 px-3 text-center">
                                {image.status === "uploading" && (
                                  <>
                                    <p className="text-white text-xs">{image.progress}%</p>
                                    <div className="w-3/4 h-1 bg-white/30 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-white rounded-full transition-all duration-200"
                                        style={{ width: `${image.progress}%` }}
                                      />
                                    </div>
                                  </>
                                )}
                                {image.status === "queued" && (
                                  <p className="text-white text-xs">Na fila para envio</p>
                                )}
                                {image.status === "error" && (
                                  <p className="text-white text-xs">{image.error || "Falha no envio"}</p>
                                )}
                              </div>
                            )}

                            {image.done && (
                              <div className="absolute top-1.5 left-1.5">
                                <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                  <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={2.5} />
                                </span>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => removeQueuedFile(image.id)}
                              disabled={isSavingFiles}
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all disabled:opacity-40"
                              title="Remover da fila"
                            >
                              <X className="w-3 h-3" />
                            </button>

                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                              <p className="text-white text-xs truncate">{image.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {storedDocuments.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">
                        Documentos salvos · {storedDocuments.length}
                      </p>
                      <div className="flex flex-col gap-2">
                        {storedDocuments.map((document) => (
                          <div
                            key={document.id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 group hover:bg-white hover:border-slate-300 transition"
                          >
                            <div
                              className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${fileBg(document.mime)}`}
                            >
                              <FileIcon mime={document.mime} className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-700 truncate">{document.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs text-slate-400">{formatBytes(document.size)}</p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => void handleDownloadStoredAttachment(document)}
                              className="w-8 h-8 rounded-md flex items-center justify-center text-blue-600 hover:bg-blue-50 transition"
                              title="Baixar arquivo"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRequestDeleteStoredAttachment(document)}
                              className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                              title="Remover arquivo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {queuedDocuments.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">
                        Novos documentos · {queuedDocuments.length}
                      </p>
                      <div className="flex flex-col gap-2">
                        {queuedDocuments.map((document) => (
                          <div
                            key={document.id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50 group hover:bg-white hover:border-slate-300 transition"
                          >
                            <div
                              className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${fileBg(document.mime)}`}
                            >
                              <FileIcon mime={document.mime} className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-700 truncate">{document.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs text-slate-400">{formatBytes(document.size)}</p>

                                {document.status === "uploading" && (
                                  <div className="flex items-center gap-1.5 flex-1">
                                    <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-200"
                                        style={{ width: `${document.progress}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-slate-400 tabular-nums">{document.progress}%</span>
                                  </div>
                                )}

                                {document.status === "queued" && (
                                  <span className="text-xs text-slate-400">Na fila para envio</span>
                                )}

                                {document.status === "done" && (
                                  <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                    <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
                                    Enviado
                                  </span>
                                )}

                                {document.status === "error" && (
                                  <span className="text-xs text-red-500">{document.error || "Falha no envio"}</span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeQueuedFile(document.id)}
                              disabled={isSavingFiles}
                              className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-40"
                              title="Remover da fila"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {totalAttachmentCount === 0 && (
                    <div className="text-center py-2">
                      <p className="text-sm text-slate-400">Nenhum arquivo enviado ainda.</p>
                    </div>
                  )}
                </div>

                {queuedFiles.length > 0 && (
                  <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      {isSavingFiles
                        ? `${queuedDoneCount} de ${queuedFiles.length} arquivo${queuedFiles.length !== 1 ? "s" : ""} enviado${queuedDoneCount !== 1 ? "s" : ""}`
                        : `${queuedFiles.length} arquivo${queuedFiles.length !== 1 ? "s" : ""} na fila para envio`}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={clearQueuedFiles}
                        disabled={isSavingFiles}
                        className="px-4 py-2 rounded-md border border-slate-300 bg-white text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Limpar tudo
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleSaveFiles()}
                        disabled={isSavingFiles}
                        className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isSavingFiles ? "Salvando arquivos..." : "Salvar arquivos"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={!!attachmentToDelete}
        onOpenChange={(open) => {
          if (!open) {
            handleCancelDeleteStoredAttachment();
          }
        }}
      >
        <DialogContent className="max-w-md bg-white border border-slate-200 rounded-xl" showCloseButton={!deleteAttachment.isPending}>
          <div className="flex items-center gap-2 mb-1">
            <TriangleAlert className="w-5 h-5 text-red-500" />
            <DialogTitle className="text-lg text-slate-900">Confirmar exclusão</DialogTitle>
          </div>

          <DialogDescription className="text-sm text-slate-600 mt-1">
            Tem certeza que deseja excluir o arquivo{" "}
            <span className="font-semibold text-slate-900">"{attachmentToDelete?.name}"</span>? Essa ação não pode ser
            desfeita.
          </DialogDescription>

          <DialogFooter className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelDeleteStoredAttachment}
              disabled={deleteAttachment.isPending}
              className="px-2"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleConfirmDeleteStoredAttachment()}
              disabled={deleteAttachment.isPending}
              className="bg-red-600 hover:bg-red-700 text-white px-2"
            >
              {deleteAttachment.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientDetails;



