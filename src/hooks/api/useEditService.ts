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


export interface IUpdateServiceParams extends IUseMutationParams {
  label?: string;
  successMessage?: string;
}

export const useUpdateService = ({ onSuccessFn, label = "Serviço", successMessage }: IUpdateServiceParams) => {

  const { update } = useAPI<IUpdateServicePayload>();

  return useMutation({
    mutationFn: ({ id, payload }: IUpdateMutationFnParams) =>
      update({
        endpoint: `services/${id}`,
        body: payload,
        label,
        successMessage,
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