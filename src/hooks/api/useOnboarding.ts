import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { IUseMutationParams } from '@/types';
import useAPI from './useAPI';
import { QueryKeys } from '.';

export interface IOnboardingBody {
    type: 'AUTONOMO' | 'EMPRESA';
    professionalName?: string;
    fieldOfWork?: string;
		howFound?: string;
		phone?: string;
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
			neighborhood?: string;
			number?: string;
			district?: string;
			city?: string;
			state?: string;
			complement?: string;
			schedules?: Array<{
				dayOfWeek?: number;
				day?: number;
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
						nickname: (loc as { nickname?: string }).nickname ?? loc.name,
						cep: loc.cep,
						address: loc.address,
						neighborhood: loc.neighborhood,
						number: loc.number,
						district: loc.district,
						city: loc.city,
						state: loc.state,
						complement: loc.complement,
						schedules: loc.schedules ? loc.schedules.map(s => ({ day: s.dayOfWeek ?? s.day, startTime: s.startTime, endTime: s.endTime })) : [],
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
								neighborhood: '',
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
					phone: body.phone,
					howFound: body.howFound,
					offersHomeVisit: !!body.offersHomeVisit,
					offersOnline: !!body.offersOnline,
					locations: mappedLocations.map(l => {
						const schedule: Record<string, { startMinute: number | null; endMinute: number | null }> = {
							"0": { startMinute: null, endMinute: null },
							"1": { startMinute: null, endMinute: null },
							"2": { startMinute: null, endMinute: null },
							"3": { startMinute: null, endMinute: null },
							"4": { startMinute: null, endMinute: null },
							"5": { startMinute: null, endMinute: null },
							"6": { startMinute: null, endMinute: null },
						};
						const timeToMinutes = (timeStr?: string) => {
							if (!timeStr) return null;
							const parts = timeStr.split(':');
							const h = parseInt(parts[0], 10) || 0;
							const m = parseInt(parts[1], 10) || 0;
							return h * 60 + m;
						};

						for (const s of l.schedules) {
							if (s.day == null) continue;
							const sMin = timeToMinutes(s.startTime);
							const eMin = timeToMinutes(s.endTime);
							if (sMin !== null && eMin !== null) {
								schedule[String(s.day)] = { startMinute: sMin, endMinute: eMin };
							}
						}

						return {
							nickname: l.nickname,
							address: l.address,
							neighborhood: l.neighborhood,
							state: l.state,
							city: l.city,
							number: l.number,
							complement: l.complement,
							schedule
						};
					}),
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

export const useCheckDocument = () => {
	const { get } = useAPI<{ isNew: boolean }>();

	return useMutation({
		mutationFn: (document: string) => get({
			label: 'Check Document',
			endpoint: `/onboarding/isNewDocument/${document}`,
			showSuccessFeedback: false,
		}),
	});
};
