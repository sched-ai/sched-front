import { useQuery } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { AppointmentAPI } from "./useGetAllAppointments";

export const useGetAppointment = (id: string, enabled = true) => {
  const { get } = useAPI<AppointmentAPI>();

  return useQuery({
    queryKey: ["appointment", id],
    enabled: !!id && enabled,
    queryFn: async () => {
      const response = await get({ 
        endpoint: `appointment/${id}`, 
        label: "Agendamento",
        showSuccessFeedback: false 
      });
      return response;
    },
  });
};
