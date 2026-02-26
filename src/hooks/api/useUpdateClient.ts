import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { ClientAPI } from "./useGetAllClients";

export interface IUpdateClientPayload {
  name: string;
  cpf: string;
  phone?: string;
  email?: string;
  gender?: string;
  photoUrl?: string;
}

interface IUpdateClientParams {
  id: string;
  payload: IUpdateClientPayload;
}

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  const { update } = useAPI<ClientAPI>();

  return useMutation({
    mutationFn: ({ id, payload }: IUpdateClientParams) =>
      update({
        endpoint: `clients/${id}`,
        body: payload,
        label: "Paciente",
        successMessage: "Paciente atualizado com sucesso!",
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },

    onError: (error) => {
      console.error("Erro ao atualizar o paciente:", error);
    },
  });
};

export default useUpdateClient;
