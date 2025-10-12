import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { IUseMutationParams } from "@/types";

export interface ICreateServicePayload {
  name: string;
  description?: string | null;
  duration?: number | null;
  price?: number | null; 
  type?: 'SERVICE' | 'PACKAGE';
  department?: string | null;
  professionalId?: string | null;
}

export const useCreateService = ({ onSuccessFn }: IUseMutationParams) => {
  const queryClient = useQueryClient();
  
  const { post } = useAPI<ICreateServicePayload>();

  return useMutation({
    mutationFn: (serviceData: ICreateServicePayload) => 
      post({
        endpoint: "services",
        body: serviceData,
        label: "Criação de Serviço",
      }),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      if (onSuccessFn) {
        onSuccessFn()
      }
    },

    onError: (error) => {
      console.error("Erro ao criar o serviço:", error);
    },
  });
};