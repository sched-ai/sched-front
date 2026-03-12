import { useMutation } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { IUseMutationParams } from "@/types";

export interface IUpdateServicePayload {
  name: string;
  description?: string | null;
  duration?: number | null;
  price?: number | null;
  type?: 'SERVICE' | 'PACKAGE';
  department?: string | null;
  employeeId?: string | null;
}

interface IUpdateMutationFnParams {
  id: string;
  payload: IUpdateServicePayload;
}


export const useUpdateService = ({ onSuccessFn }: IUseMutationParams) => {

  const { update } = useAPI<IUpdateServicePayload>();

  return useMutation({
    mutationFn: ({ id, payload }: IUpdateMutationFnParams) =>
      update({
        endpoint: `services/${id}`,
        body: payload,
        label: "Atualização de Serviço",
      }),

    onSuccess: (data) => {
      
      
      if (onSuccessFn) {
        onSuccessFn(data);
      }
    },

    onError: (error) => {
      console.error("Erro ao atualizar o serviço:", error);
    },
  });
};