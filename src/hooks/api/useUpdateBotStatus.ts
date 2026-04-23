import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { Company } from "./useGetCompany";

export interface UpdateBotStatusPayload {
  botStatus: boolean;
}

export const useUpdateBotStatus = () => {
  const { patch } = useAPI<Company>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateBotStatusPayload) => {
      const response = await patch({ endpoint: "company/bot-status", body: payload, label: "Status do Bot", showSuccessFeedback: true });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
    },
  });
};

export default useUpdateBotStatus;
