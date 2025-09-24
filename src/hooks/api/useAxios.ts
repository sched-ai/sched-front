import axios, { AxiosHeaders } from 'axios';

import { StorageService } from '../../services';

const {
	VITE_APP_API_URL,
	VITE_APP_API_TOKEN
} = import.meta.env;

export const useAxios = () => {
	const headers = new AxiosHeaders({
		'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, sessao, Authorization',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'POST, PUT, GET, PATCH, DELETE, OPTIONS',
		'Content-Type': 'application/json',
		'X-API-Key': VITE_APP_API_TOKEN,
	});

	const axiosInstance = axios.create({
		baseURL: `${ VITE_APP_API_URL }`,
		headers
	});

	axiosInstance.interceptors.request.use(async config => {
		try {
			const token = StorageService.getToken();
			if (token !== null) {
				config.headers['Authorization'] = `Bearer ${ token }`;
			}
			return config;
		} catch (error) {
			return Promise.reject(error);
		}
	});

	return axiosInstance;
};