import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAPI from './useAPI';
import type { WorkplaceSchedule } from './useUpdateWorkplaceSchedule';

interface ICreateOnlineWorkplacePayload {
  nickname: string;
  schedule: WorkplaceSchedule;
}

export const useCreateOnlineWorkplace = () => {
  const queryClient = useQueryClient();
  const { post } = useAPI<{ message: string }>();

  return useMutation({
    mutationFn: (payload: ICreateOnlineWorkplacePayload) =>
      post({
        endpoint: 'company/workplaces/online',
        body: payload,
        label: 'Local online',
        showSuccessFeedback: false,
        showErrorFeedback: false,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },

    onError: (error: unknown) => {
      console.error('Erro ao criar local online:', error);
    },
  });
};

export default useCreateOnlineWorkplace;
