export interface ISignInForm {
	email: string,
	password: string,
}

export interface ISignUpForm {
	name: string;
	email: string;
	password: string;
	type?: 'person' | 'organization';
	role?: 'user' | 'admin';
	active?: boolean;
	is_admin?: boolean;
}