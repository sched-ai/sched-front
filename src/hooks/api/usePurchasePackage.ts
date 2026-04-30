import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { IUseMutationParams } from "@/types";

export interface IPurchasePackagePayload {
  clientId: string;
  packageId: string;
  totalPaid?: string;
}

export const usePurchasePackage = ({ onSuccessFn, onErrorFn }: IUseMutationParams) => {
  const queryClient = useQueryClient();
  const { post } = useAPI<IPurchasePackagePayload>();

  return useMutation({
    mutationFn: (data: IPurchasePackagePayload) =>
      post({
        endpoint: "customer-packages/purchase",
        body: data,
        label: "Vinculação de Pacote",
      }),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientCredits"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      if (onSuccessFn) {
        onSuccessFn();
      }
    },

    onError: (error: unknown) => {
      console.error("Erro ao vincular pacote:", error);
      onErrorFn?.(error);
    },
  });
};
