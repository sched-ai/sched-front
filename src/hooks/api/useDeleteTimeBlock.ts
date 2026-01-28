import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { IUseMutationParams } from "@/types";

export interface IDeleteTimeBlockPayload {
  id: string;
}

export const useDeleteTimeBlock = ({ onSuccessFn }: IUseMutationParams) => {
  const queryClient = useQueryClient();
  const { destroy } = useAPI();

  return useMutation({
    mutationFn: (id: string) =>
      destroy({
        endpoint: `time-blocks/${id}`,
        label: "Exclusão de bloqueio",
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-blocks"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      if (onSuccessFn) {
        onSuccessFn();
      }
    },

    onError: (error) => {
      console.error("Erro ao excluir o bloqueio:", error);
    },
  });
};
