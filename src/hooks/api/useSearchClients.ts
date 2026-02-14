import { useQuery } from "@tanstack/react-query";
import useAPI from "./useAPI";

export interface ClientAPI {
  id: string;
  name: string;
}

export type ClientsResponse = ClientAPI[];

interface useSearchClientsParams {
  search?: string;
}

export const useSearchClients = ({ search }: useSearchClientsParams = {}) => {
  const { get } = useAPI<ClientsResponse>();

  return useQuery({
    queryKey: ["clients", "search", search],
    queryFn: async () => {
      if (!search) return [];

      const response = await get({
        endpoint: `/clients/search?search=${encodeURIComponent(search)}`,
        label: "Clientes",
        showSuccessFeedback: false,
        showErrorFeedback: false
      });
      return response || [];
    },
    enabled: !!search && search.trim().length > 0,
  });
};

export default useSearchClients;
