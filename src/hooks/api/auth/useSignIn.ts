import { useMutation, useQueryClient } from '@tanstack/react-query';

import { StorageService } from '../../../services';
import type { IUseMutationParams } from '@/types';
import type { ISignInForm } from '@/types/forms';

import useAPI from '../useAPI';

import { QueryKeys } from '../index';
// import { useUser } from '@/context/user';

interface ISignInResponse {
	token: string;
	refresh_token: string;
	token_type: string;
}

export const useSignIn = ({ onSuccessFn }: IUseMutationParams) => {
	const { post } = useAPI<ISignInResponse>();
	const queryClient = useQueryClient();
	// const { refreshUser } = useUser();

	return useMutation({
		mutationFn: (body: ISignInForm) => post({
			label: 'Login',
			autoClose: false,
			showSuccessFeedback: false,
			endpoint: '/auth/login',
			body: {
				email: body.email,
				password: body.password
			}
		}),
		
		onSuccess: (resp) => {
			if(resp){
				StorageService.login({
					token: resp.token,
					refreshToken: resp.refresh_token
				});
				// refreshUser();
				queryClient.invalidateQueries({
					queryKey: [ QueryKeys.current_user ]
				});
				if (onSuccessFn) {
					onSuccessFn();
				}
			}
		}
	});
};