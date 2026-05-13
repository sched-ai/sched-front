import { useMutation } from "@tanstack/react-query";
import useAPI from "./useAPI";

export type RecurrenceConflictReason =
  | "NON_WORKING_DAY"
  | "OUTSIDE_WORKING_HOURS"
  | "TIME_BLOCK"
  | "APPOINTMENT_CONFLICT";

export interface IPreviewRecurrenceOccurrence {
  startDate: string;
  endDate: string;
}

export interface IPreviewRecurrenceConflict {
  date: string;
  startDate: string;
  endDate: string;
  reason: RecurrenceConflictReason;
  conflictingEntity?: { id?: string; reason?: string | null } | null;
}

export interface IPreviewRecurrenceResponse {
  validOccurrences: IPreviewRecurrenceOccurrence[];
  conflicts: IPreviewRecurrenceConflict[];
}

export interface IPreviewAppointmentRecurrencePayload {
  employeeId?: string;
  serviceId?: string | null;
  workplaceId?: string | null;
  startDate: string;
  duration?: number;
  frequency?: "DAILY" | "WEEKLY" | "MONTHLY" | null;
  days_of_week?: number[];
  isInfiniteRecurring?: boolean;
  recurringUntilDate?: string | null;
  recurringOccurrences?: number | null;
}

export const usePreviewAppointmentRecurrence = () => {
  const { post } = useAPI<IPreviewRecurrenceResponse>();

  return useMutation({
    mutationFn: (payload: IPreviewAppointmentRecurrencePayload) =>
      post({
        endpoint: "appointment/preview-recurrence",
        body: payload,
        label: "Preview de recorrência",
        showSuccessFeedback: false,
      }),
  });
};
