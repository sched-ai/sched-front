import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { IUseMutationParams } from "@/types";
import type { ICreateServicePayload } from "./useCreateAppointment";

interface IUpdateAppointmentParams {
  id: string;
  payload: Partial<ICreateServicePayload>;
}

export const useUpdateAppointment = ({ onSuccessFn }: IUseMutationParams) => {
  const queryClient = useQueryClient();
  const { update } = useAPI<Partial<ICreateServicePayload>>();

  return useMutation({
    mutationFn: ({ id, payload }: IUpdateAppointmentParams) =>
      update({
        endpoint: `appointment/${id}`,
        body: payload,
        label: "Atualização de consulta",
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      if (onSuccessFn) {
        onSuccessFn();
      }
    },

    onError: (error) => {
      console.error("Erro ao atualizar o consulta:", error);
    },
  });
};
