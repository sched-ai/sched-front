import type { IValidationParams } from "@/types";

export const isNotEmpty = (value: any) => {
	return value !== undefined || value !== '' || value !== null;
};

export const hasMinValue = (field: string, min_value: number) => {
	return field.length >= min_value;
};

export const isValidCpf = (cpf: string) => {
	cpf = cpf.replace(/[^\d]+/g, '');

	if ( !cpf || cpf.length !== 11 ||
    cpf === '00000000000' ||
    cpf === '11111111111' ||
    cpf === '22222222222' ||
    cpf === '33333333333' ||
    cpf === '44444444444' ||
    cpf === '55555555555' ||
    cpf === '66666666666' ||
    cpf === '77777777777' ||
    cpf === '88888888888' ||
    cpf === '99999999999' 
	) return false;

	var soma = 0;
	var resto;
	for (var i = 1; i <= 9; i++) soma = soma + parseInt(cpf.substring(i-1, i)) * (11 - i);
	resto = (soma * 10) % 11;

	if ((resto === 10) || (resto === 11)) resto = 0;
	if (resto !== parseInt(cpf.substring(9, 10)) ) return false;

	soma = 0;
	for (i = 1; i <= 10; i++) soma = soma + parseInt(cpf.substring(i-1, i)) * (12 - i);
	resto = (soma * 10) % 11;

	if ((resto === 10) || (resto === 11)) resto = 0;
	if (resto !== parseInt(cpf.substring(10, 11) )) return false;
	return true;
};

export const isValidCnpj = (cnpj: string) => {
	cnpj = cnpj.replace(/[^\d]+/g, '');
  
	if ( !cnpj || cnpj.length !== 14
    || cnpj === '00000000000000' 
    || cnpj === '11111111111111' 
    || cnpj === '22222222222222' 
    || cnpj === '33333333333333' 
    || cnpj === '44444444444444' 
    || cnpj === '55555555555555' 
    || cnpj === '66666666666666' 
    || cnpj === '77777777777777' 
    || cnpj === '88888888888888' 
    || cnpj === '99999999999999') return false;
    
	// Valida DVs
	let tamanho = cnpj.length - 2;
	let numeros = cnpj.substring(0, tamanho);
	let digitos = cnpj.substring(tamanho);
	let soma = 0;
	let pos = tamanho - 7;
	for (let i = tamanho; i >= 1; i--) {
		soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
		if (pos < 2)
			pos = 9;
	}
	let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
	if (resultado !== parseInt(digitos.charAt(0)))
		return false;
        
	tamanho = tamanho + 1;
	numeros = cnpj.substring(0, tamanho);
	soma = 0;
	pos = tamanho - 7;
	for (let i = tamanho; i >= 1; i--) {
		soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
		if (pos < 2) pos = 9;
	}
	resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
	if (resultado !== parseInt(digitos.charAt(1))) return false;
          
	return true;
};

export const isValidBirth = (birth: string) => {
	const dateNow = new Date();
	const birthdate = new Date(birth);

	return !(dateNow.getFullYear() - birthdate.getFullYear() < 18 || 
    (dateNow.getFullYear() - birthdate.getFullYear() === 18 && 
    dateNow.getMonth() - birthdate.getMonth() > 0) ||
    (dateNow.getFullYear() - birthdate.getFullYear() === 18 && 
    dateNow.getMonth() - birthdate.getMonth() === 0 &&
    dateNow.getDate() - birthdate.getDate() > 0));
};

export const isValidEmail = (email: string) => {
	var regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	var valid = regex.test(String(email).toLowerCase());
  
	return valid;
};

export const isValidPhone = (phone: string) => {
	return phone.length === 11 || phone.length === 10;
};

const singleFieldValidation = (schema: any, field: any) => {
	const field_path = Object.keys(field);
	const data = schema.validateSync(field_path[0], field);
	return { data };
};

const formValidation = (schema: any, values: any) => {
	const data = schema.validateSync(values, { abortEarly: false });
	return { data };
};

export const resolveValidation = (params: IValidationParams) => {
	const { mode, schema, fields } = params;
  
	try {
		if (mode === 'singleField') {
			return singleFieldValidation(schema, fields);
		}
		if (mode === 'formFields') {
			return formValidation(schema, fields);
		}
	} catch(error: any) {
		if (!error.inner) {
			throw error;
		}
		return { error };
	}
};

export const resolveErrors = (setErrors: Function, errors: any) => {
	let new_errors: any = {};
	errors.forEach((error: any) => {
		new_errors[error.path] = { message: error.message };
	});

	setErrors(new_errors);
	window.scrollTo(0, 0);
};