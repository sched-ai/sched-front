import { useQuery, useMutation } from "@tanstack/react-query";
import useAPI from "./useAPI";

export interface MonitoringPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface MonitoringUsersResponse {
  data: Array<{
    clientId: string | null;
    clientName: string;
    clientPhone: string;
    latestMessage: string;
    latestTimestamp: string | null;
    totalMessages: number;
    totalSessions: number;
    lastSessionDate: string;
    lastSessionDateLabel: string;
    isBotActive: boolean;
  }>;
  meta: MonitoringPaginationMeta;
}

// ... (sessions and messages interfaces stay same)

export interface MonitoringSessionsResponse {
  data: Array<{
    sessionId: string;
    date: string;
    dateLabel: string;
    totalMessages: number;
    latestMessage: string;
    latestTimestamp: string | null;
  }>;
  meta: MonitoringPaginationMeta;
}

export interface MonitoringMessagesResponse {
  data: Array<{
    id: number;
    text: string;
    timestamp: string | null;
    sent: boolean;
    sessionId: string;
  }>;
  meta: MonitoringPaginationMeta;
}

export const useGetMonitoringUsers = ({
  page = 1,
  limit = 50,
  search,
}: {
  page?: number;
  limit?: number;
  search?: string;
} = {}) => {
  const { get } = useAPI<MonitoringUsersResponse>();

  return useQuery({
    queryKey: ["sched-ai-monitoring-users", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      if (search) params.append("search", search);

      return get({
        endpoint: `sched-ai/monitoring/users?${params.toString()}`,
        label: "Usuários do monitoramento",
        showSuccessFeedback: false,
      });
    },
  });
};

export const useGetMonitoringUserSessions = ({
  clientPhone,
  page = 1,
  limit = 50,
  enabled = true,
}: {
  clientPhone?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}) => {
  const { get } = useAPI<MonitoringSessionsResponse>();

  return useQuery({
    queryKey: ["sched-ai-monitoring-sessions", clientPhone, page, limit],
    enabled: enabled && Boolean(clientPhone),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));

      return get({
        endpoint: `sched-ai/monitoring/users/${clientPhone}/sessions?${params.toString()}`,
        label: "Sessões do usuário",
        showSuccessFeedback: false,
      });
    },
  });
};

export const useGetMonitoringSessionMessages = ({
  sessionId,
  page = 1,
  limit = 30,
  enabled = true,
}: {
  sessionId?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}) => {
  const { get } = useAPI<MonitoringMessagesResponse>();

  return useQuery({
    queryKey: ["sched-ai-monitoring-messages", sessionId, page, limit],
    enabled: enabled && Boolean(sessionId),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      return get({
        endpoint: `sched-ai/monitoring/sessions/${sessionId}/messages?${params.toString()}`,
        label: "Mensagens da sessão",
        showSuccessFeedback: false,
      });
    },
  });
};

export const useToggleClientBotStatus = () => {
  const { patch } = useAPI<{ success: boolean; isBotActive: boolean }>();

  return useMutation({
    mutationFn: async ({ clientId, isBotActive }: { clientId: string; isBotActive: boolean }) => {
      return patch({
        endpoint: `sched-ai/monitoring/clients/${clientId}/bot-status`,
        body: { isBotActive },
        label: "Alterar status do bot",
        showSuccessFeedback: false,
      });
    },
  });
};

export const useSendMonitoringMessage = () => {
  const { post } = useAPI<{ success: boolean; messageId: number }>();

  return useMutation({
    mutationFn: async ({ sessionId, text }: { sessionId: string; text: string }) => {
      return post({
        endpoint: `sched-ai/monitoring/sessions/${sessionId}/messages`,
        body: { text },
        label: "Enviar mensagem",
        showSuccessFeedback: false,
      });
    },
  });
};

