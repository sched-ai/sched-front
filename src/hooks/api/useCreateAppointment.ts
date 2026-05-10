import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { IUseMutationParams } from "@/types";

export interface ICreateServicePayload {
  employeeId?: string;
  clientId?: string | null;
  serviceId?: string | null;
  workplaceId?: string | null;
  startDate: string; // ISO 8601
  duration?: number;
  description?: string;
  packageCreditId?: string;
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | null;
  days_of_week?: number[];
  isInfiniteRecurring?: boolean;
  recurringUntilDate?: string | null;
  recurringOccurrences?: number | null;
}

export const getAppointmentErrorMessage = (error: unknown, defaultMessage: string) => {
  const knownError = error as {
    response?: { data?: { error?: string; detail?: string; message?: string } };
    message?: string;
  };

  return (
    knownError.response?.data?.error ||
    knownError.response?.data?.detail ||
    knownError.response?.data?.message ||
    knownError.message ||
    defaultMessage
  );
};

export const useCreateAppointment = ({ onSuccessFn, onErrorFn }: IUseMutationParams) => {
  const queryClient = useQueryClient();
  
  const { post } = useAPI<ICreateServicePayload>();

  return useMutation({
    mutationFn: (serviceData: ICreateServicePayload) => 
      post({
        endpoint: "appointment",
        body: serviceData,
        label: "Agendamento",
        getErrorMessage: getAppointmentErrorMessage,
      }),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      if (onSuccessFn) {
        onSuccessFn()
      }
    },

    onError: (error: unknown) => {
      console.error("Erro ao criar consulta:", error);
      onErrorFn?.(error);
    },
  });
};