import React from 'react';

import { createConsumer } from '@rails/actioncable';

const {
	VITE_APP_API_CABLE_URL
} = import.meta.env;

interface IContext {
	setSubscription: Function
}

interface ICableProvider {
	children: React.ReactNode
}

const initialValue = {
	setSubscription: () => {}
};

const consumer = createConsumer(`${ VITE_APP_API_CABLE_URL }`);

const CableContext = React.createContext<IContext>(initialValue);

export const CableProvider = ({ children }: ICableProvider) => {
	const setSubscription = (channel: string, params: any, resolveReceived: Function) => {
		const channel_options = {
			channel, 
			...params 
		};

		const channel_handlers = {
			initialized() {
				console.log('iniciou');
			},
			connected() {
				console.log('conectou');
			},
			disconnected() {
				// console.log('desconectou');
			},
			received(data: any) {
				resolveReceived(data);
			}   
		};

		return consumer.subscriptions.create(channel_options, channel_handlers);
	};

	return (
		<CableContext.Provider value={{ setSubscription }}>
			{children}
		</CableContext.Provider>
	);
};

export default CableContext;