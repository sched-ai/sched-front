import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { IUseMutationParams } from "@/types";

export const useDeleteService = ({ onSuccessFn }: IUseMutationParams) => {
  const queryClient = useQueryClient();
  
  const { destroy } = useAPI<void>();

  return useMutation({
    mutationFn: (serviceId: string) => 
      destroy({
        endpoint: `services/${serviceId}`,
        label: "Exclusão de Serviço",
      }),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      if (onSuccessFn) {
        onSuccessFn();
      }
    },

    onError: (error) => {
      console.error("Erro ao excluir o serviço:", error);
    },
  });
};