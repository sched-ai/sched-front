import { useQuery } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { IService } from "./useGetAllServices";

export const useGetService = (id: string, enabled = true) => {
  const { get } = useAPI<IService>();

  return useQuery({
    queryKey: ["service", id],
    enabled: !!id && enabled,
    queryFn: async () => {
      const response = await get({
        endpoint: `services/${id}`,
        label: "Serviço",
        showSuccessFeedback: false,
      });
      return response;
    },
  });
};
