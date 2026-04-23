import { useQuery } from "@tanstack/react-query";
import useAPI from "./useAPI";

export interface Faq {
  id: string;
  trigger: string;
  answer: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export const useGetFaqs = () => {
  const { get } = useAPI<Faq[]>();

  return useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const response = await get({ endpoint: "faq", label: "FAQs", showSuccessFeedback: false });
      return response;
    },
  });
};

export default useGetFaqs;
