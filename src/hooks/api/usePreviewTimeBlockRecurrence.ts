import { useMutation } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type {
  IPreviewRecurrenceResponse,
} from "./usePreviewAppointmentRecurrence";

export interface IPreviewTimeBlockRecurrencePayload {
  startDate: string;
  endDate: string;
  reason?: string;
  isInfiniteRecurring?: boolean;
  recurringUntilDate?: string | null;
  recurringOccurrences?: number | null;
  frequency?: "DAILY" | "WEEKLY" | "MONTHLY" | null;
  days_of_week?: number[];
  timeBlockId?: string;
}

export const usePreviewTimeBlockRecurrence = () => {
  const { post } = useAPI<IPreviewRecurrenceResponse>();

  return useMutation({
    mutationFn: (payload: IPreviewTimeBlockRecurrencePayload) =>
      post({
        endpoint: "time-blocks/preview-recurrence",
        body: payload,
        label: "Preview de bloqueio recorrente",
        showSuccessFeedback: false,
      }),
  });
};
