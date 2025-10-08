import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { IUseMutationParams } from '@/types';
import type { ISignUpForm } from '@/types/forms';

import useAPI from '../useAPI';

import { QueryKeys } from '../index';

interface ISignUpResponse {
	id: string;
	nome: string;
	email: string;
}

export const useSignUp = ({ onSuccessFn }: IUseMutationParams) => {
	const { post } = useAPI<ISignUpResponse>();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (body: ISignUpForm) => post({
			label: 'Cadastro',
			autoClose: false,
			showSuccessFeedback: false,
			endpoint: '/auth/register',
			body: {
				name: body.name,
				email: body.email,
				password: body.password
			}
		}),
		
		onSuccess: (resp) => {
			if(resp){
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