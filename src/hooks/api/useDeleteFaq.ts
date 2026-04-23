import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";

export const useDeleteFaq = () => {
  const { destroy } = useAPI<{ message: string }>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await destroy({ endpoint: `faq/${id}`, label: "FAQ", showSuccessFeedback: true });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });
};

export default useDeleteFaq;
