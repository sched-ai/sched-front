import { useQuery } from "@tanstack/react-query";
import useAPI from "./useAPI";

export interface AppointmentAPI {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  employeeId: string | null;
  clientId: string | null;
  clientName: string | null;
  workplaceId: string | null;
  serviceId: string | null;
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
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export const useGetAllAppointments = ({ status, search, startDate, endDate, page = 1, limit = 10, enabled = true }: UseGetAllAppointmentsParams = {}) => {
  const { get } = useAPI<AppointmentsResponse>();

  return useQuery({
    queryKey: ["appointments", status, search, startDate, endDate, page, limit],
    enabled,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status && status !== 'todos') params.append('status', status);
      if (search) params.append('search', search);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const endpoint = `appointment?${params.toString()}`;
      const response = await get({ endpoint, label: "Agendamentos", showSuccessFeedback: false });
      return response;
    },
  });
};

export default useGetAllAppointments;
