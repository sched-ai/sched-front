import { useQuery } from "@tanstack/react-query";
import useAPI from "./useAPI";

export interface AppointmentAPI {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  professionalId: string | null;
  clientId: string | null;
  clientName: string | null;
  workplaceId: string | null;
  serviceId: string | null;
  professional?: { user?: { name: string } | null } | null;
  client?: { name: string } | null;
  service?: { name: string } | null;
}

interface UseGetAllAppointmentsParams {
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
}

export const useGetAllAppointments = ({ status, search, startDate, endDate, enabled = true }: UseGetAllAppointmentsParams = {}) => {
  const { get } = useAPI<AppointmentAPI[]>();

  return useQuery({
    queryKey: ["appointments", status, search, startDate, endDate],
    enabled,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status && status !== 'todos') params.append('status', status);
      if (search) params.append('search', search);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const endpoint = `appointment?${params.toString()}`;
      const response = await get({ endpoint, label: "Agendamentos", showSuccessFeedback: false });
      return response || [];
    },
  });
};

export default useGetAllAppointments;
