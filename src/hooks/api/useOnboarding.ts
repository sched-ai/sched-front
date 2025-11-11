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
		workSchedules?: Array<{
				dayOfWeek: number;
				startTime: string;
				endTime: string;
				locationId?: string;
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
			schedules?: Array<{
				dayOfWeek?: number;
				startTime?: string;
				endTime?: string;
			}>;
		}>;
		offersHomeVisit?: boolean;
		offersOnline?: boolean;
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
			body: (() => {
				const mappedLocations = (body.locations || []).map(loc => ({
					id: loc.id,
					nickname: loc.name,
					cep: loc.cep,
					address: loc.address,
					number: loc.number,
					district: loc.district,
					city: loc.city,
					state: loc.state,
					complement: loc.complement,
					schedules: loc.schedules ? loc.schedules.map(s => ({ day: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime })) : [],
				}));

				if (body.workSchedules && body.workSchedules.length > 0) {
					const hasLocationIds = body.workSchedules.some(s => !!s.locationId);
					if (hasLocationIds) {
						for (const s of body.workSchedules) {
							const target = mappedLocations.find(l => l.id && s.locationId && l.id === s.locationId);
							const schedule = { day: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime };
							if (target) target.schedules.push(schedule);
						}
					} else {
						if (mappedLocations.length === 0) {
							mappedLocations.push({
								id: undefined,
								nickname: 'Without location',
								address: '',
								cep: undefined,
								number: '',
								district: undefined,
								city: '',
								state: '',
								complement: undefined,
								schedules: body.workSchedules.map(s => ({ day: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime }))
							});
						} else {
							mappedLocations[0].schedules = mappedLocations[0].schedules.concat(body.workSchedules.map(s => ({ day: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime })));
						}
					}
				}

				return {
					type: body.type,
					professionalName: body.professionalName,
					fieldOfWork: body.fieldOfWork,
					professionalLicense: body.professionalLicense,
					companyName: body.companyName,
					companyDocument: body.companyDocument,
					offersHomeVisit: !!body.offersHomeVisit,
					offersOnline: !!body.offersOnline,
					locations: mappedLocations.map(l => ({
						nickname: l.nickname,
						address: l.address,
						state: l.state,
						city: l.city,
						number: l.number,
						complement: l.complement,
						schedules: (l.schedules || []).map(s => ({ day: s.day, startTime: s.startTime, endTime: s.endTime }))
					})),
				};
			})()
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