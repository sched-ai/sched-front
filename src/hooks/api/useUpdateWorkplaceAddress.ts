import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";

export interface IUpdateWorkplaceAddressPayload {
  nickname: string;
  address: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
}

interface IUpdateWorkplaceAddressParams {
  id: string;
  payload: IUpdateWorkplaceAddressPayload;
}

export const useUpdateWorkplaceAddress = () => {
  const queryClient = useQueryClient();
  const { patch } = useAPI<{ message: string }>();

  return useMutation({
    mutationFn: ({ id, payload }: IUpdateWorkplaceAddressParams) =>
      patch({
        endpoint: `company/workplaces/${id}/address`,
        body: payload,
        label: "Local",
        showSuccessFeedback: false,
        showErrorFeedback: false,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },

    onError: (error: unknown) => {
      console.error("Erro ao atualizar endereço do local:", error);
    },
  });
};

export default useUpdateWorkplaceAddress;
