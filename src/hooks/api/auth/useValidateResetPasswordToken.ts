import { useQuery } from '@tanstack/react-query';

import { QueryKeys } from '..';
import useAPI from '../useAPI';

interface IValidateResetPasswordTokenResponse {
  valid: boolean;
  expiresAt: string;
}

export const useValidateResetPasswordToken = (token: string) => {
  const { get } = useAPI<IValidateResetPasswordTokenResponse>();

  return useQuery({
    queryKey: [QueryKeys.validate_reset_password_token, token],
    queryFn: () => get({
      label: 'Validação do link',
      endpoint: `/auth/reset-password/validate?token=${encodeURIComponent(token)}`,
      showSuccessFeedback: false,
      showErrorFeedback: false,
    }),
    enabled: token.trim().length > 0,
    retry: false,
  });
};
