import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";

export type WorkplaceSchedule = Record<string, { startMinute: number | null; endMinute: number | null }>;

interface IUpdateWorkplaceScheduleParams {
  id: string;
  payload: {
    schedule: WorkplaceSchedule;
  };
}

export const useUpdateWorkplaceSchedule = () => {
  const queryClient = useQueryClient();
  const { patch } = useAPI<{ message: string }>();

  return useMutation({
    mutationFn: ({ id, payload }: IUpdateWorkplaceScheduleParams) =>
      patch({
        endpoint: `company/workplaces/${id}/schedule`,
        body: payload,
        label: "Local",
        showSuccessFeedback: false,
        showErrorFeedback: false,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },

    onError: (error: unknown) => {
      console.error("Erro ao atualizar horários do local:", error);
    },
  });
};

export default useUpdateWorkplaceSchedule;
