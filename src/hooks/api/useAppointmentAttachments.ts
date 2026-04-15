import { useMutation } from "@tanstack/react-query";

import useAPI from "./useAPI";

export interface AppointmentAttachmentAPI {
  id: string;
  name: string;
  size: number;
  mime: string;
  category: "image" | "pdf" | "doc" | "other" | string;
  status: string;
  createdAt: string;
}

export interface InitiateAppointmentAttachmentPayload {
  files: Array<{
    clientTempId: string;
    name: string;
    size: number;
    mime: string;
  }>;
}

export interface InitiateAppointmentAttachmentResponse {
  files: Array<{
    clientTempId: string;
    attachmentId: string;
    uploadUrl: string;
    expiresAt: string;
  }>;
}

export interface CompleteAppointmentAttachmentPayload {
  attachments: Array<{
    attachmentId: string;
  }>;
}

export interface CompleteAppointmentAttachmentResponse {
  message?: string;
  attachments: Array<{
    attachmentId: string;
    status: string;
  }>;
}

export interface AppointmentAttachmentAccessLinksPayload {
  mode: "preview" | "download";
  attachmentIds: string[];
}

export interface AppointmentAttachmentAccessLinksByAppointmentPayload extends AppointmentAttachmentAccessLinksPayload {
  appointmentId: string;
}

export interface AppointmentAttachmentAccessLinksResponse {
  links: Array<{
    attachmentId: string;
    url: string;
    expiresAt: string;
  }>;
}

interface DeleteAppointmentAttachmentResponse {
  message?: string;
}

const ATTACHMENT_LABEL = "Arquivos do atendimento";

export const useInitiateAppointmentAttachments = (appointmentId: string) => {
  const { post } = useAPI<InitiateAppointmentAttachmentResponse>();

  return useMutation({
    mutationFn: async (body: InitiateAppointmentAttachmentPayload) => {
      const response = await post({
        endpoint: `appointment/${appointmentId}/attachments/initiate`,
        body,
        label: ATTACHMENT_LABEL,
        showSuccessFeedback: false,
        showErrorFeedback: false,
      });

      return response;
    },
  });
};

export const useCompleteAppointmentAttachments = (appointmentId: string) => {
  const { post } = useAPI<CompleteAppointmentAttachmentResponse>();

  return useMutation({
    mutationFn: async (body: CompleteAppointmentAttachmentPayload) => {
      const response = await post({
        endpoint: `appointment/${appointmentId}/attachments/complete`,
        body,
        label: ATTACHMENT_LABEL,
        showSuccessFeedback: false,
        showErrorFeedback: false,
      });

      return response;
    },
  });
};

export const useAppointmentAttachmentAccessLinks = (appointmentId: string) => {
  const { post } = useAPI<AppointmentAttachmentAccessLinksResponse>();

  return useMutation({
    mutationFn: async (body: AppointmentAttachmentAccessLinksPayload) => {
      const response = await post({
        endpoint: `appointment/${appointmentId}/attachments/access-links`,
        body,
        label: ATTACHMENT_LABEL,
        showSuccessFeedback: false,
        showErrorFeedback: false,
      });

      return response;
    },
  });
};

export const useAppointmentAttachmentAccessLinksByAppointment = () => {
  const { post } = useAPI<AppointmentAttachmentAccessLinksResponse>();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      ...body
    }: AppointmentAttachmentAccessLinksByAppointmentPayload) => {
      const response = await post({
        endpoint: `appointment/${appointmentId}/attachments/access-links`,
        body,
        label: ATTACHMENT_LABEL,
        showSuccessFeedback: false,
        showErrorFeedback: false,
      });

      return response;
    },
  });
};

export const useDeleteAppointmentAttachment = (appointmentId: string) => {
  const { destroy } = useAPI<DeleteAppointmentAttachmentResponse>();

  return useMutation({
    mutationFn: async (attachmentId: string) => {
      const response = await destroy({
        endpoint: `appointment/${appointmentId}/attachments/${attachmentId}`,
        label: ATTACHMENT_LABEL,
        showSuccessFeedback: false,
        showErrorFeedback: false,
      });

      return response;
    },
  });
};
