import { useQuery } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { ClientAPI } from "./useGetAllClients";

export const useGetClient = (id: string, enabled = true) => {
  const { get } = useAPI<ClientAPI>();

  return useQuery({
    queryKey: ["client", id],
    enabled: !!id && enabled,
    queryFn: async () => {
      const response = await get({
        endpoint: `clients/${id}`,
        label: "Paciente",
        showSuccessFeedback: false,
      });
      return response;
    },
  });
};
