import { useQuery } from "@tanstack/react-query";
import useAPI from "./useAPI";

export interface ICredit {
  id: string;
  customerPackageId: string;
  serviceId: string;
  totalQuantity: number;
  remainingQuantity: number;
  service: {
    id: string;
    name: string;
    duration: number | null;
  };
  customerPackage: {
    package: {
      name: string;
    };
  };
}

interface UseGetClientCreditsProps {
  clientId?: string | null;
  enabled?: boolean;
}

export const useGetClientCredits = ({ clientId, enabled = true }: UseGetClientCreditsProps) => {
  const { get } = useAPI<ICredit[]>();

  return useQuery({
    queryKey: ["clientCredits", clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const response = await get({
        endpoint: `customer-packages/credits/${clientId}`,
        label: "Créditos do Cliente",
        showSuccessFeedback: false,
      });
      return response || [];
    },
    enabled: enabled && !!clientId,
  });
};
