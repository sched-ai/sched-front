import { useMutation } from '@tanstack/react-query';

import type { IUseMutationParams } from '@/types';
import type { IResetPasswordForm } from '@/types/forms';

import useAPI from '../useAPI';

interface IResetPasswordResponse {
  message: string;
}

export const useResetPassword = ({ onSuccessFn, onErrorFn }: IUseMutationParams<IResetPasswordResponse>) => {
  const { post } = useAPI<IResetPasswordResponse>();

  return useMutation({
    mutationFn: (body: IResetPasswordForm) => post({
      label: 'Redefinição de senha',
      endpoint: '/auth/reset-password',
      body,
      showSuccessFeedback: false,
      showErrorFeedback: false,
    }),

    onSuccess: (resp) => {
      if (onSuccessFn) {
        onSuccessFn(resp);
      }
    },

    onError: (error: unknown) => {
      if (onErrorFn) {
        onErrorFn(error);
      }
    }
  });
};
