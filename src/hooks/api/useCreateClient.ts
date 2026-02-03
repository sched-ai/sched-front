import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { ClientAPI } from "./useGetAllClients";

interface CreateClientDTO {
  name: string;
  cpf: string;
  phone?: string;
  email?: string;
  gender?: string;
  photoUrl?: string;
}

export const useCreateClient = () => {
    const { post } = useAPI<ClientAPI>();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateClientDTO) => {
            return await post({
                endpoint: "clients",
                body: data,
                label: "Paciente",
                successMessage: "Paciente criado com sucesso!",
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
        },
    });
};

export default useCreateClient;
