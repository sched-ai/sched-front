import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { IUseMutationParams } from "@/types";
import { getAppointmentErrorMessage, type ICreateServicePayload } from "./useCreateAppointment";

interface IUpdateAppointmentParams {
  id: string;
  payload: Partial<ICreateServicePayload>;
}

export const useUpdateAppointment = ({ onSuccessFn, onErrorFn }: IUseMutationParams) => {
  const queryClient = useQueryClient();
  const { update } = useAPI<Partial<ICreateServicePayload>>();

  return useMutation({
    mutationFn: ({ id, payload }: IUpdateAppointmentParams) =>
      update({
        endpoint: `appointment/${id}`,
        body: payload,
        label: "Atualização de consulta",
        getErrorMessage: getAppointmentErrorMessage,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      if (onSuccessFn) {
        onSuccessFn();
      }
    },

    onError: (error: unknown) => {
      console.error("Erro ao atualizar consulta:", error);
      onErrorFn?.(error);
    },
  });
};
