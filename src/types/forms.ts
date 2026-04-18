export interface ISignInForm {
	email: string,
	password: string,
}

export interface ISignUpForm {
	email: string,
	password: string,
	name: string
}

export interface IForgotPasswordForm {
	email: string,
}

export interface IResetPasswordForm {
	token: string,
	newPassword: string,
}
