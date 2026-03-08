import type { ReactNode } from 'react';
import { Tokens } from '../util';
import type { ActionMeta } from 'react-select';
import type { TypeOptions } from 'react-toastify';
import type { DayOfWeek } from '@/hooks/api/useCreateTimeBlock';

export type TIconName = 'home' | 'user' | 'settings' | 'logout' | string;


export type TAxiosResponse<T> = { message?: string } & T;
export type TColor = keyof typeof Tokens.colors | 'white' | 'black';
export type TError<T> = Partial<Record<keyof T, { message: string }>>;
export type TFontSize = keyof typeof Tokens.fontSize;

export interface ISelectOption {
	label: string;
	value: string;
}

export interface IGetSelectOptions<T> {
	data?: T[],
	valueField: keyof T;
	labelField: keyof T;
	defaultOptions?: ISelectOption[];
}

export interface ITimeBlock {
   startDate: string | Date;
  endDate: string | Date;
  reason?: string;
  isRecurring?: boolean;
  recurringDays?: DayOfWeek[];
  recurringUntilDate?: string | Date | null;
  recurringOccurrences?: number | null;
}

export interface IUseForm<T>{
	schema?: Record<string, any>,
	mode?: 'singleField' | 'formFields',
	initialValues: T,
}

export interface ISortBy {
	field: string;
	direction: 'asc' | 'desc';
}

export interface IFilter {
	created_after: string;
	created_before: string;
}

export interface IUseDataTableParamsState {
	terms: string;
	per_page: number;
	page: number;
	sort_by: ISortBy;
	filters: IFilter;
}

export interface IUseDataTable extends IUseDataTableParamsState {
	onPageChange: (selectedItem: { selected: number; })=> void;
	onRowsPerPageChange: (newValue: unknown, actionMeta: ActionMeta<unknown>)=> void;
	onSearch: (term: string)=> void;
	onSort?: (field: string)=> void;
	onFilter?: (filter: string, value: string)=> void;
}

/**
 * @type {IUseApiOptions}
 */

export interface IUseApiOptions<T = any> {
	successMessage?: string;
	errorMessage?: string;
	label?: string;
	showSuccessFeedback?: boolean;
	showErrorFeedback?: boolean;
	autoClose?: number | false;
	endpoint: string | number;
	isFile?: boolean;
	body?: T | FormData;
}

export interface IApiResponse<T> {
	data: T | null,
	status: number
}

export interface IDataResponse<T> {
	data: T;
}

export interface IPaginationParams {
	terms?: string;
	page: number;
	per_page: number;
}

export interface IListResponse<T> extends IDataResponse<T[]> {
	total_count: number;
	total_pages: number;
}


export interface IIconProps {
	name: TIconName;
	size?: number;
	color?: TColor;
	className?: string;
	hoverable?: boolean;
	style?: React.CSSProperties;
}

export interface ILayoutProps {
	children: ReactNode,
	routerProps?: any,
	currentActiveItem?: string
}

export interface INavigationItem {
	path: string,
	kind?: 'main' | 'sub',
	title?: string,
	icon?: TIconName,
	component: React.LazyExoticComponent<any>,
	layout: ({ children }: ILayoutProps)=> ReactNode,
	authRoute?: boolean
	publicRoute?: boolean
}

export interface IPaginationParams {
	terms?: string;
	page: number;
	per_page: number;
}

export interface IToastProps {
	label: string;
	message: string;
	icon?: TypeOptions;
	type: TypeOptions;
	toastId?: string;
	autoClose?: number | false;
}

/**
 * Representa os parâmetros para um hook de mutação React.
 * @template D - O tipo de dado passado para onSuccessFn.
 */
export interface IUseMutationParams<D = any> {
	/**
	 * @param data - Os dados buscados, do tipo D.
	 */
	onSuccessFn?: (data?: D)=> void;
	onErrorFn?: (error: unknown)=> void;
}

/**
 * Representa os parâmetros para um hook de consulta React.
 * @template T - O tipo de parâmetros de consulta adicionais.
 */
export interface IUseQueryParams<T = any> {
	/**
	 * Parâmetros de consulta adicionais.
	 * @type {T & IPaginationParams} - O tipo de parâmetros de consulta adicionais mesclados com IPaginationParams.
	 */
	query?: T & IPaginationParams;
}

export interface IValidationParams {
	schema: Record<string, any>,
	mode: 'singleField' | 'formFields',
	fields: Record<string, any>
}

export type UserType = "empresa" | "autonomo" | "";

export type DayKey =
    | "segunda"
    | "terça"
    | "quarta"
    | "quinta"
    | "sexta"
    | "sábado"
    | "domingo";
    
export type DaySchedule = {
	working: boolean;
	start: string;
	end: string;
	locationId?: string;
};

export type Location = {
	id: string;
	name?: string;
	address?: string;
  neighborhood?: string;
	number?: string;
	city?: string;
	state?: string;
	complement?: string;
};
