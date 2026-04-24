import { useQuery } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { AppointmentAttachmentAPI } from "./useAppointmentAttachments";

export interface AppointmentAPI {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  consultationDurationSeconds?: number | null;
  employeeId: string | null;
  clientId: string | null;
  clientName: string | null;
  workplaceId: string | null;
  serviceId: string | null;
  createdByAI: boolean;
  employee?: { name: string } | null;
  client?: { 
    id?: string;
    name: string; 
    cpf?: string; 
    phone?: string; 
    email?: string; 
    address?: string; 
    birthDate?: string; 
  } | null;
  service?: { name: string } | null;
  description?: string;
  annotations?: Array<{
    id: string;
    content: string;
    createdAt: string;
  }>;
  attachments?: AppointmentAttachmentAPI[];
}

export interface AppointmentsResponse {
  data: AppointmentAPI[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: {
    total: number;
    concluidos: number;
    agendados: number;
    cancelados: number;
  };
}

interface UseGetAllAppointmentsParams {
  status?: string;
  search?: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  includeAttachments?: boolean;
  enabled?: boolean;
}

export const useGetAllAppointments = ({
  status,
  search,
  clientId,
  startDate,
  endDate,
  page = 1,
  limit = 10,
  includeAttachments = false,
  enabled = true,
}: UseGetAllAppointmentsParams = {}) => {
  const { get } = useAPI<AppointmentsResponse>();

  return useQuery({
    queryKey: ["appointments", status, search, clientId, startDate, endDate, page, limit, includeAttachments],
    enabled,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status && status !== 'todos') params.append('status', status);
      if (search) params.append('search', search);
      if (clientId) params.append('clientId', clientId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (includeAttachments) params.append('includeAttachments', 'true');
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const endpoint = `appointment?${params.toString()}`;
      const response = await get({ endpoint, label: "Agendamentos", showSuccessFeedback: false });
      return response;
    },
  });
};

export default useGetAllAppointments;
