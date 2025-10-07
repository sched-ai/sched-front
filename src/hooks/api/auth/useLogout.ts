import { useMutation, useQueryClient } from '@tanstack/react-query';

import { StorageService } from '../../../services';
import type { IUseMutationParams } from '@/types';
import useAPI from '../useAPI';
import { QueryKeys } from '../index';

export const useLogout = ({ onSuccessFn }: IUseMutationParams) => {
	const { post } = useAPI();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => post({
			label: 'Logout',
			autoClose: false,
			showSuccessFeedback: false,
			endpoint: '/auth/logout'
		}),
		onSuccess: () => {
			StorageService.logout();
			queryClient.invalidateQueries({
				queryKey: [QueryKeys.current_user]
			});
			queryClient.clear();
			
			if (onSuccessFn) {
				onSuccessFn();
			}
		}
	});
};
