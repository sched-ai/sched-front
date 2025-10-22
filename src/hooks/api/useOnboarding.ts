import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { IUseMutationParams } from '@/types';
import useAPI from './useAPI';
import { QueryKeys } from '.';

export interface IOnboardingBody {
    type: 'AUTONOMO' | 'EMPRESA';
    professionalName?: string;
    fieldOfWork?: string;
    professionalLicense?: string;
    companyName?: string;
    companyDocument?: string;
    workSchedules: Array<{
        dayOfWeek: number;
        startTime: string;
        endTime: string;
    }>;
	locations?: Array<{
	  id?: string;
	  name?: string;
	  cep?: string;
	  address?: string;
	  number?: string;
	  district?: string;
	  city?: string;
	  state?: string;
	  complement?: string;
	}>;
}

export const useOnboarding = ({ onSuccessFn }: IUseMutationParams) => {
	const { post } = useAPI<unknown>();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (body: IOnboardingBody) => post({
			label: 'Onboarding',
			autoClose: false,
			showSuccessFeedback: false,
			endpoint: '/onboarding',
			body: {
				type: body.type,
                professionalName: body.professionalName,
                fieldOfWork: body.fieldOfWork,
                professionalLicense: body.professionalLicense,
                companyName: body.companyName,
                companyDocument: body.companyDocument,
                workSchedules: body.workSchedules
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