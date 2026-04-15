import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAPI from './useAPI';
import type { WorkplaceSchedule } from './useUpdateWorkplaceSchedule';

interface ICreateWorkplacePayload {
  nickname: string;
  address: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
  schedule: WorkplaceSchedule;
}

export const useCreateWorkplace = () => {
  const queryClient = useQueryClient();
  const { post } = useAPI<{ message: string }>();

  return useMutation({
    mutationFn: (payload: ICreateWorkplacePayload) =>
      post({
        endpoint: 'company/workplaces',
        body: payload,
        label: 'Local',
        showSuccessFeedback: false,
        showErrorFeedback: false,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },

    onError: (error: unknown) => {
      console.error('Erro ao criar local:', error);
    },
  });
};

export default useCreateWorkplace;
