import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { IUseMutationParams, ITimeBlock } from "@/types";

export type DayOfWeek = 
  | "SUNDAY" 
  | "MONDAY" 
  | "TUESDAY" 
  | "WEDNESDAY" 
  | "THURSDAY" 
  | "FRIDAY" 
  | "SATURDAY";

export interface ICreateTimeBlockPayload {
  startDate: string | Date;
  endDate: string | Date;
  reason?: string;
  isRecurring?: boolean;
  recurringDays?: DayOfWeek[];
  recurringUntilDate?: string | Date | null;
  recurringOccurrences?: number | null;
}

export const useCreateTimeBlock = ({ onSuccessFn }: IUseMutationParams) => {
  const queryClient = useQueryClient();

  const { post } = useAPI<ITimeBlock>();

  return useMutation({
      mutationFn: (timeBlockData: ICreateTimeBlockPayload) =>
      post({
        endpoint: "time-blocks",
        body: timeBlockData,
        label: "Bloqueio de Agenda",
      }),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["time-blocks"] });
      if (onSuccessFn) {
        onSuccessFn(data);
      }
    },

    onError: (error) => {
      console.error("Erro ao criar o bloqueio de agenda:", error);
    },
  });
};