import { useQuery } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { IWorkplace } from "./useGetAllServices";

export const useGetAllWorkplaces = () => {
  const { get } = useAPI<IWorkplace[]>();

  return useQuery({
    queryKey: ["workplaces"],
    queryFn: async () => {
      const response = await get({
        label: "Locais de atendimento",
        autoClose: false,
        showSuccessFeedback: false,
        endpoint: "company/workplaces",
      });

      if (!response) {
        throw new Error("A resposta da API para locais é inválida.");
      }
      
      return response;
    },
  });
};
