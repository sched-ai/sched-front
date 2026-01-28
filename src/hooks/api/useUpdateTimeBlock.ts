import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { IUseMutationParams } from "@/types";
import type { ICreateTimeBlockPayload } from "./useCreateTimeBlock";

interface IUpdateTimeBlockParams {
  id: string;
  payload: Partial<ICreateTimeBlockPayload>;
}

export const useUpdateTimeBlock = ({ onSuccessFn }: IUseMutationParams) => {
  const queryClient = useQueryClient();
  const { update } = useAPI<Partial<ICreateTimeBlockPayload>>();

  return useMutation({
    mutationFn: ({ id, payload }: IUpdateTimeBlockParams) =>
      update({
        endpoint: `time-blocks/${id}`,
        body: payload,
        label: "Atualização de Bloqueio",
      }),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["time-blocks"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      if (onSuccessFn) {
        onSuccessFn(data);
      }
    },

    onError: (error) => {
      console.error("Erro ao atualizar o bloqueio:", error);
    },
  });
};
