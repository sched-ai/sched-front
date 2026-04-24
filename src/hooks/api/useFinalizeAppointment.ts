import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { IUseMutationParams } from "@/types";

interface FinalizeAppointmentPayload {
  id: string;
  consultationDurationSeconds?: number;
}

interface FinalizeAppointmentResponse {
  message: string;
}

export const useFinalizeAppointment = ({ onSuccessFn, onErrorFn }: IUseMutationParams = {}) => {
  const queryClient = useQueryClient();
  const { patch } = useAPI<FinalizeAppointmentResponse>();

  return useMutation({
    mutationFn: ({ id, consultationDurationSeconds }: FinalizeAppointmentPayload) =>
      patch({
        endpoint: `appointment/${id}/status`,
        label: "Consulta",
        successMessage: "Consulta finalizada com sucesso!",
        body: {
          status: "finished",
          consultationDurationSeconds,
        },
      }),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appointment"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      onSuccessFn?.(data);
    },

    onError: (error: unknown) => {
      console.error("Erro ao finalizar a consulta:", error);
      onErrorFn?.(error);
    },
  });
};

export default useFinalizeAppointment;
