import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { IUseMutationParams } from "@/types";

export interface IDeleteAppointmentPayload {
  id: string;
}

export const useDeleteAppointment = ({ onSuccessFn }: IUseMutationParams) => {
  const queryClient = useQueryClient();
  const { patch } = useAPI();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      patch({
        endpoint: `appointment/${id}/cancel`,
        label: "Agendamento",
        body: { reason }
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      if (onSuccessFn) {
        onSuccessFn();
      }
    },

    onError: (error) => {
      console.error("Erro ao excluir o agendamento:", error);
    },
  });
};
