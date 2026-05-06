import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { IUseMutationParams } from "@/types";
import { QueryKeys } from "./index";


export const useNextStep = ({ onSuccessFn }: IUseMutationParams) => {
  const queryClient = useQueryClient();
  
  const { post } = useAPI();

  return useMutation({
    mutationFn: () => 
      post({
        endpoint: "onboarding/nextStep",
        label: "Próximo Passo",
      }),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.current_user] });
      if (onSuccessFn) {
        onSuccessFn()
      }
    },

    onError: (error) => {
      console.error("Erro ao avançar para o próximo passo:", error);
    },
  });
};