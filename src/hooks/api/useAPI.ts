	import { type TypeOptions, toast } from 'react-toastify';

	import type { IUseApiOptions, TAxiosResponse } from '@/types';

	import { useAxios } from './useAxios';
	import useToast from '../useToast';

	interface IFeedBackHandlerParams {
		label: string;
		message: string;
		toastId: string;
		type: TypeOptions;
		autoClose?: number | false | undefined;
		showFeedback?: boolean;
	}

	interface IErrorHandlerParams {
		error: any;
		label: string;
		showErrorFeedback?: boolean;
		message: string;
		getErrorMessage?: (error: unknown, defaultMessage: string)=> string | undefined;
		autoClose?: number | false | undefined;
	}

	const useAPI = <T>() => {
		const axiosInstance = useAxios();
		const { showToast } = useToast();

		const feedbackHandler = (params: IFeedBackHandlerParams) => {
			const { showFeedback = true, ...toastParams } = params;
			if(showFeedback){
				toast.dismiss();
				showToast({ ...toastParams });
			}
		};

		const errorHandler = (params: IErrorHandlerParams) => {
			const {
				label,
				error,
				message: errorMessage,
				showErrorFeedback = true,
				getErrorMessage,
			} = params;

			const resolveErrorMessage = (defaultMessage: string) => {
				return getErrorMessage?.(error, defaultMessage) || defaultMessage;
			};

			const autoClose = false;

			if(!navigator.onLine){
				return showToast({
					label: 'Sem conexão!',
					message: 'Parece que você está offline, verifique sua conexão com a internet e tente novamente!',
					toastId: 'error-offline-toast',
					type: 'warning',
					autoClose
				});
			}

			if( error?.response?.status >= 500 || error?.code === 'ERR_NETWORK' ){
				const defaultMessage = error?.response?.data?.message || 'Falha na comunicação com o servidor, por favor, tente novamente mais tarde.';
				feedbackHandler({
					label,
					message: resolveErrorMessage(defaultMessage),
					toastId: 'error-load-toast',
					type: 'error',
					autoClose,
					showFeedback: showErrorFeedback
				});

				throw error;
			}

			if (error?.response?.status === 401) {
				localStorage.clear();
				sessionStorage.clear();
				feedbackHandler({
					label,
					message: 'Sessão expirada, por favor, faça login novamente.',
					toastId: 'error-load-toast',
					type: 'error',
					autoClose,
					showFeedback: showErrorFeedback
				});
			}

			if (error?.response?.status > 300) {
				const requestMessage = resolveErrorMessage(
					error?.response?.data?.detail || error?.response?.data?.message || `${ errorMessage } (${ error.response.status })`
				);
				feedbackHandler({
					label,
					message: requestMessage,
					toastId: 'error-load-toast',
					type: 'error',
					autoClose,
					showFeedback: showErrorFeedback
				});
				throw error;
			}
		};

		const get = async(options: IUseApiOptions) => {
			const {
				errorMessage,
				getErrorMessage,
				showErrorFeedback,
				successMessage,
				showSuccessFeedback = false,
				label = '',
				autoClose,
				endpoint
			} = options;

			try {
				const resp = await axiosInstance.get<TAxiosResponse<T>>(`${ endpoint }`);
				feedbackHandler({
					label,
					message: label !== '' ? successMessage || resp.data.message ||  `${ label.charAt(0).toUpperCase() + label.slice(1) } carregado com sucesso!` : '',
					toastId: 'success-get-toast',
					type: 'success',
					autoClose,
					showFeedback: showSuccessFeedback
				});
				return resp.data;
			} catch (error: any) {
				errorHandler({
					error,
					label,
					showErrorFeedback,
					getErrorMessage,
					message: errorMessage || `Erro ao carregar ${ label.toLocaleLowerCase() }!`,
				});
			}
		};

		const post = async <TBody>(options: IUseApiOptions<TBody>) => {
			const {
				errorMessage,
				getErrorMessage,
				showErrorFeedback = true,
				successMessage,
				showSuccessFeedback = true,
				label='',
				autoClose,
				endpoint,
				body,
				isFile
			} = options;

			if(isFile){
				axiosInstance.interceptors.request.use((config) => {
					config.headers['Content-Type'] = 'multipart/form-data';
					return config;
				});
			}

			try {
				const resp = await axiosInstance.post<TAxiosResponse<T>>(`${ endpoint }`, body);
				feedbackHandler({
					label,
					message: label !=='' ? successMessage || resp.data.message || `${ label.charAt(0).toUpperCase() + label.slice(1) } criado com sucesso!` : '',
					toastId: 'success-post-toast',
					type: 'success',
					autoClose,
					showFeedback: showSuccessFeedback
				});
				return resp.data;
			} catch (error: any) {
				errorHandler({
					label,
					error,
					getErrorMessage,
					message: errorMessage || `Erro ao criar ${ label.toLocaleLowerCase() }!`,
					showErrorFeedback
				});
			}
		};

		const update = async <TBody>(options: IUseApiOptions<TBody>) => {
    const {
      errorMessage,
			getErrorMessage,
      showErrorFeedback = true,
      successMessage,
      showSuccessFeedback = true,
      label='',
      autoClose,
      endpoint,
      body,
      isFile
    } = options;

    if(isFile){
      axiosInstance.interceptors.request.use((config) => {
        config.headers['Content-Type'] = 'multipart/form-data';
        return config;
      });
    }

    try {
      const resp = await axiosInstance.put<TAxiosResponse<T>>(`${endpoint}`, body);
      feedbackHandler({
        label,
        message: label!=='' ? successMessage || resp.data.message || `${ label.charAt(0).toUpperCase() + label.slice(1) } atualizado com sucesso!` : '',
        toastId: 'success-put-toast',
        type: 'success',
        showFeedback: showSuccessFeedback,
        autoClose
      });
      return resp.data;
    } catch (error: any) {
      errorHandler({
        label,
        error,
				getErrorMessage,
        message: errorMessage || `Erro ao atualizar ${ label.toLocaleLowerCase() }!`,
        showErrorFeedback
      });
    }
  };

		const patch = async <TBody>(options: IUseApiOptions<TBody>) => {
			const {
				errorMessage,
				getErrorMessage,
				showErrorFeedback = true,
				successMessage,
				showSuccessFeedback = true,
				label='',
				autoClose,
				endpoint,
				body,
				isFile
			} = options;

			if(isFile){
				axiosInstance.interceptors.request.use((config) => {
					config.headers['Content-Type'] = 'multipart/form-data';
					return config;
				});
			}

			try {
				const resp = await axiosInstance.patch<TAxiosResponse<T>>(`${ endpoint }`, body);
				feedbackHandler({
					label,
					message: label!=='' ? resp.data.message || successMessage || `${ label.charAt(0).toUpperCase() + label.slice(1) } atualizado com sucesso!` : '',
					toastId: 'success-patch-toast',
					type: 'success',
					showFeedback: showSuccessFeedback,
					autoClose
				});
				return resp.data;
			} catch (error: any) {
				errorHandler({
					label,
					error,
					getErrorMessage,
					message: errorMessage || `Erro ao atualizar ${ label.toLocaleLowerCase() }!`,
					showErrorFeedback
				});
			}
		};

		const destroy = async(options: IUseApiOptions) => {
			const {
				errorMessage,
				getErrorMessage,
				showErrorFeedback = true,
				successMessage,
				showSuccessFeedback = true,
				label = '',
				autoClose,
				endpoint
			} = options;

			try {
				const resp = await axiosInstance.delete<TAxiosResponse<T>>(`${ endpoint }`);
				feedbackHandler({
					label,
					message: label!=='' ? successMessage || resp.data.message  || `${ label.charAt(0).toUpperCase() + label.slice(1) } deletado com sucesso!` : '',
					toastId: 'success-delete-toast',
					type: 'success',
					autoClose,
					showFeedback: showSuccessFeedback
				});
				return resp.data;
			} catch (error: any) {
				errorHandler({
					label,
					error,
					getErrorMessage,
					message: errorMessage || `Erro ao deletar ${ label.toLocaleLowerCase() }!`,
					showErrorFeedback
				});
			}
		};

		const destroyWithBody = async <TBody>(options: IUseApiOptions<TBody>) => {
			const {
				errorMessage,
				getErrorMessage,
				showErrorFeedback = true,
				successMessage,
				showSuccessFeedback = true,
				label = '',
				autoClose,
				endpoint,
				body
			} = options;

			try {
				const resp = await axiosInstance.delete<TAxiosResponse<T>>(`${ endpoint }`, { data: body });
				feedbackHandler({
					label,
					message: label!=='' ? successMessage || resp.data.message  || `${ label.charAt(0).toUpperCase() + label.slice(1) } processado com sucesso!` : '',
					toastId: 'success-delete-body-toast',
					type: 'success',
					autoClose,
					showFeedback: showSuccessFeedback
				});
				return resp.data;
			} catch (error: any) {
				errorHandler({
					label,
					error,
					getErrorMessage,
					message: errorMessage || `Erro ao processar ${ label.toLocaleLowerCase() }!`,
					showErrorFeedback
				});
			}
		};

		return {
			get,
			post,
			patch,
			update,
			destroy,
			destroyWithBody
		};
	};

	export default useAPI;