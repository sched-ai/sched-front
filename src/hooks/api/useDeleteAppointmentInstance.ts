import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { IUseMutationParams } from "@/types";

export interface IDeleteAppointmentInstancePayload {
  id: string;
  date: string;
  deleteType: "single" | "following";
}

export const useDeleteAppointmentInstance = ({ onSuccessFn }: IUseMutationParams) => {
  const queryClient = useQueryClient();
  const { destroyWithBody } = useAPI();

  return useMutation({
    mutationFn: ({ id, date, deleteType }: IDeleteAppointmentInstancePayload) =>
      destroyWithBody({
        endpoint: `appointment/${id}/instances/${date}?deleteType=${deleteType}`,
        body: { deleteType },
        label: "Agendamento",
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      if (onSuccessFn) {
        onSuccessFn();
      }
    },

    onError: (error) => {
      console.error("Erro ao excluir instância do agendamento:", error);
    },
  });
};
