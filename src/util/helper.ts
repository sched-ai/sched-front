import Moment from 'moment';

type Grouped<T> = Record<string, T[]>;

interface IGroupByKeys<T> {
	groups: Grouped<T>;
	keys: string[];
}

export const findIndex = (list: any[], element: any, reference: string) => {
	return list.indexOf(list.find((e) => e[reference] === element[reference]));
};

export function capitalizeFirst(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export const groupBy = <T extends Record<string, any>>(
	object: T[] = [],
	field: keyof T = ''
): IGroupByKeys<T> => {

	if (!object || !field) return {
		groups: {},
		keys: []
	};

	const groups = object.reduce((acc: Grouped<T>, obj) => {
		const key = obj[field] as string;
		if (!acc[key]) {
			acc[key] = [];
		}
		acc[key].push(obj);
		return acc;
	}, {});


	return {
		groups,
		keys: Object.keys(groups)
	};
};

export const sum = (array: any, key: string) => {
	return array.reduce((a: any, b: any) => a + (b[key] || 0), 0);
};

export const filteredSum = (array: any, key: string, filterArray: any) => {
	return array.reduce((acc: any, obj: any) => {
		if (obj[filterArray[0]] === filterArray[1])
			return acc + (obj[key] || 0);
		else 
			return acc;
	}, 0);
};

export const formatReqDate = (date: string) => {
	return Moment(date).format('MM/DD/YYYY');
};

export const formatLocalDate = (date: string) => {
	return Moment(date).format('DD/MM/YYYY');
};

export const formatCalendarDate = (date: string) => {
	return Moment(date).format('YYYY-MM-DD');
};

export const formatCnpj = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(
      /^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})$/
    );

    if (!match) return value;

    let formatted = "";
    if (match[1]) formatted += match[1];
    if (match[2]) formatted += `.${match[2]}`;
    if (match[3]) formatted += `.${match[3]}`;
    if (match[4]) formatted += `/${match[4]}`;
    if (match[5]) formatted += `-${match[5]}`;

    return formatted;
  };

export const formatCpf = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);

  if (!match) return value;

  let formatted = "";
  if (match[1]) formatted += match[1];
  if (match[2]) formatted += `.${match[2]}`;
  if (match[3]) formatted += `.${match[3]}`;
  if (match[4]) formatted += `-${match[4]}`;

  return formatted;
};


export const formatPhone = (value: string) => {
	const cleaned = value.replace(/\D/g, "");
	const normalized = cleaned.startsWith("55") && cleaned.length > 11
		? cleaned.slice(2)
		: cleaned;
	const len = normalized.length;

  if (len === 0) return "";
	if (len <= 2) return `(${normalized}`;
	if (len <= 6) return `(${normalized.slice(0, 2)}) ${normalized.slice(2)}`;
	if (len <= 10) return `(${normalized.slice(0, 2)}) ${normalized.slice(2, 6)}-${normalized.slice(6)}`;
	return `(${normalized.slice(0, 2)}) ${normalized.slice(2, 7)}-${normalized.slice(7, 11)}`;
};

export const formatCurrency = (value: any, precision=2) => {
	var translation = localStorage.getItem('translation');
	var currency = 'BRL';

	if (translation) {
		translation = translation.replace('_', '-');
		if (translation === 'en') currency = 'USD';
		else if (translation === 'es') currency = 'EUR';
	} else translation = 'pt-BR';
  
	return new Intl.NumberFormat(translation, {
		style: 'currency',
		minimumFractionDigits: precision,
		maximumFractionDigits: precision,
		currency }).format(value);
};

export const formatDecimal = (value: any, precision=2) => {
	var translation = localStorage.getItem('translation');
  
	if (translation){
		translation = translation.replace('_', '-');
	} else translation = 'pt-BR';

	return new Intl.NumberFormat(translation, {
		style: 'decimal',
		minimumFractionDigits: precision,
		maximumFractionDigits: precision }).format(value);
};

export const getPhoneMask = (phone: string) => {
	return phone.length <= 14 ? '(99) 9999-99999' : '(99) 99999-9999';
};

export const currencyToFloat = (value: string) => {
	return parseFloat(value.replace('R$', '').split('.').join('').replace(',', '.'));
};

export const removePhoneMask = (phone: string) => {
	return phone.replace('(', '').replace(')', '').replace('-', '').replace(' ', '');
};

export const reduceCharLength = (name: string) => {
	if (name.length > 20) return `${ name.substring(0, 20) } ...`;
	else return name;
};

export const findAndUpdate = (setList: Function, element: any, ref: string) => {
	setList((current_list: any[]) => {
		const index = findIndex(current_list, element, ref);
		if (index > -1) current_list[index] = element;
		return current_list;
	}); 
};

export const listUpdate = (setList: Function, element: any, index: number) => {
	setList((current_list: any[]) => {
		if (index > -1) current_list[index] = element;
		return current_list;
	}); 
};

export const findAndRemove = (setList: Function, element: any, ref: string) => {
	setList((current_list: any[]) => {
		const index = findIndex(current_list, element, ref);
		if (index > -1) current_list.splice(index, 1);
		return current_list;
	}); 
};

export const listRemove = (setList: Function, index: number) => {
	setList((current_list: any[]) => {
		return current_list.filter((_: any, i: number) => i !== index);
	}); 
};