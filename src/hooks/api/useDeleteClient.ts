import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  const { destroy } = useAPI<void>();

  return useMutation({
    mutationFn: (clientId: string) =>
      destroy({
        endpoint: `clients/${clientId}`,
        label: "Paciente",
        successMessage: "Paciente excluído com sucesso!",
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },

    onError: (error) => {
      console.error("Erro ao excluir o paciente:", error);
    },
  });
};

export default useDeleteClient;
