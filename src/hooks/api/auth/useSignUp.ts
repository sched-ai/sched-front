import { useMutation, useQueryClient } from '@tanstack/react-query';

import { StorageService } from '../../../services';
import type { IUseMutationParams } from '@/types';
import type { ISignUpForm } from '@/types/forms';

import useAPI from '../useAPI';

import { QueryKeys } from '../index';

interface ISignUpResponse {
	user: {
		id: number;
		name: string;
		email: string;
		type: string;
		role: string;
		active: boolean;
		created_at: string;
		updated_at: string;
		profileConfigs: {
			user_id: number;
		};
	};
	access_token: string;
	refresh_token: string;
	token_type: string;
}

export const useSignUp = ({ onSuccessFn }: IUseMutationParams) => {
	const { post } = useAPI<ISignUpResponse>();
	const queryClient = useQueryClient();

	return useMutation<ISignUpResponse, Error, ISignUpForm>({
	mutationFn: async (body: ISignUpForm) => {
		const response = await post({
		label: 'Sign up',
		autoClose: false,
		showSuccessFeedback: true,
		endpoint: '/auth/register',
		body,
		});

		if (!response) {
		throw new Error('Empty response from register endpoint');
		}

		return response as ISignUpResponse;
	},
	onSuccess: (resp: ISignUpResponse) => {
		if (resp) {
		StorageService.login({
			token: resp.access_token,
			refreshToken: resp.refresh_token,
		});
		queryClient.invalidateQueries({
			queryKey: [QueryKeys.current_user],
		});
		if (onSuccessFn) {
			onSuccessFn();
		}
		}
	},
	});
};