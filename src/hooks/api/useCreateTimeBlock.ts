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

export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY";


export interface ICreateTimeBlockPayload {
  startDate: string | Date;
  endDate: string | Date;
  reason?: string;
  isInfiniteRecurring?: boolean;
  recurringUntilDate?: string | Date | null;
  recurringOccurrences?: number | null;
  frequency?: RecurrenceFrequency | null;
  days_of_week?: number[];
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
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      if (onSuccessFn) {
        onSuccessFn(data);
      }
    },

    onError: (error) => {
      console.error("Erro ao criar o bloqueio de agenda:", error);
    },
  });
};