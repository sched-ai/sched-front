import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { IUseMutationParams } from "@/types";

export interface ICreateServicePayload {
  professionalId?: string;
  clientId?: string | null;
  serviceId?: string | null;
  workplaceId?: string | null;
  startDate: string; // ISO 8601
  duration?: number;
  description?: string;
}

export const useCreateAppointment = ({ onSuccessFn }: IUseMutationParams) => {
  const queryClient = useQueryClient();
  
  const { post } = useAPI<ICreateServicePayload>();

  return useMutation({
    mutationFn: (serviceData: ICreateServicePayload) => 
      post({
        endpoint: "appointment",
        body: serviceData,
        label: "Criação de Consulta",
      }),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      if (onSuccessFn) {
        onSuccessFn()
      }
    },

    onError: (error) => {
      console.error("Erro ao criar o serviço:", error);
    },
  });
};