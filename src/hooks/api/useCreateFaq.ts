import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { Faq } from "./useGetFaqs";

export interface CreateFaqPayload {
  trigger: string;
  answer: string;
}

export const useCreateFaq = () => {
  const { post } = useAPI<Faq>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateFaqPayload) => {
      const response = await post({ endpoint: "faq", body: payload, label: "FAQ", showSuccessFeedback: true });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });
};

export default useCreateFaq;
