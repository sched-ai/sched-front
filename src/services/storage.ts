export const TOKEN_KEY = '@base-recat-token';
export const REFRESH_TOKEN_KEY = '@base-react-refresh-token';

export const isAuthenticated = () => localStorage.getItem(TOKEN_KEY) !== null;

interface IStorageLogin {
	token: string ; 
	refreshToken: string ;
}

export const login = ({ refreshToken, token }: IStorageLogin) => {
	localStorage.setItem(TOKEN_KEY, token);
	localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const logout = () => {
	localStorage.clear();
};

export const getToken = () => localStorage.getItem(TOKEN_KEY) || '';