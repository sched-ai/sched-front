import { createContext, useState } from 'react';

import Spinner from '@/components/Spinner';

interface ContextType {
	loading: boolean,
	setLoading: Function
}

const initialValue = {
	loading: false,
	setLoading: () => {}
};

const LoaderContext = createContext<ContextType>(initialValue);

export const LoaderProvider = ({ children }: any) => {
	const [ loading, setLoading ] = useState(false);
  
	return (
		<LoaderContext.Provider value={{ loading, setLoading }}>
			{loading && <Spinner />}
			{children}
		</LoaderContext.Provider>
	);
};

export default LoaderContext;