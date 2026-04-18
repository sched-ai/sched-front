import { useMutation } from '@tanstack/react-query';

import type { IUseMutationParams } from '@/types';
import type { IForgotPasswordForm } from '@/types/forms';

import useAPI from '../useAPI';

interface IForgotPasswordResponse {
  message: string;
}

export const useForgotPassword = ({ onSuccessFn, onErrorFn }: IUseMutationParams<IForgotPasswordResponse>) => {
  const { post } = useAPI<IForgotPasswordResponse>();

  return useMutation({
    mutationFn: (body: IForgotPasswordForm) => post({
      label: 'Recuperação de senha',
      endpoint: '/auth/forgot-password',
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
