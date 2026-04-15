import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";

export const useDeleteWorkplace = () => {
  const queryClient = useQueryClient();
  const { destroy } = useAPI<void>();

  return useMutation({
    mutationFn: (workplaceId: string) =>
      destroy({
        endpoint: `company/workplaces/${workplaceId}`,
        label: "Local",
        showSuccessFeedback: false,
        showErrorFeedback: false,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },

    onError: (error) => {
      console.error("Erro ao excluir local:", error);
    },
  });
};

export default useDeleteWorkplace;
