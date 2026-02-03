import { useQuery } from "@tanstack/react-query";
import useAPI from "./useAPI";

export interface ClientAPI {
  id: string;
  name: string;
  cpf: string;
  phone?: string | null;
  email?: string | null;
  createdAt?: string; // Prisma specific
  companyId: string;
}

export interface ClientsResponse {
  data: ClientAPI[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UseGetAllClientsParams {
  search?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export const useGetAllClients = ({ search, page = 1, limit = 10, enabled = true }: UseGetAllClientsParams = {}) => {
  const { get } = useAPI<ClientsResponse>();

  return useQuery({
    queryKey: ["clients", search, page, limit],
    enabled,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const endpoint = `clients?${params.toString()}`;
      const response = await get({ endpoint, label: "Pacientes", showSuccessFeedback: false });
      return response;
    },
  });
};

export default useGetAllClients;
