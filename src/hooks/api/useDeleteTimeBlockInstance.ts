import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { IUseMutationParams } from "@/types";

export interface IDeleteTimeBlockInstancePayload {
  id: string;
  date: string;
  deleteType: "single" | "following";
}

export const useDeleteTimeBlockInstance = ({ onSuccessFn }: IUseMutationParams) => {
  const queryClient = useQueryClient();
  const { destroyWithBody } = useAPI();

  return useMutation({
    mutationFn: ({ id, date, deleteType }: IDeleteTimeBlockInstancePayload) =>
      destroyWithBody({
        endpoint: `time-blocks/${id}/instances/${date}?deleteType=${deleteType}`,
        body: { deleteType },
        label: "Bloqueio",
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-blocks"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      if (onSuccessFn) {
        onSuccessFn();
      }
    },

    onError: (error) => {
      console.error("Erro ao excluir instância do bloqueio:", error);
    },
  });
};
