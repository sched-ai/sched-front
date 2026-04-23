import { useQuery } from "@tanstack/react-query";
import useAPI from "./useAPI";

export interface Company {
  id: string;
  name: string;
  botStatus: boolean;
}

export const useGetCompany = () => {
  const { get } = useAPI<Company>();

  return useQuery({
    queryKey: ["company"],
    queryFn: async () => {
      const response = await get({ endpoint: "company", label: "Empresa", showSuccessFeedback: false });
      return response;
    },
  });
};

export default useGetCompany;
