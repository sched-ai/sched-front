import { useGetUser, type IUser } from '@/hooks/api/auth/useGetUser';
import { StorageService } from '@/services';
import React, { createContext, useContext } from 'react';

interface UserContextType {
  userData?: IUser;
  userLoading: boolean;
  userError: unknown;
  refreshUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const hasToken = typeof window !== 'undefined' && StorageService.getToken() !== '';
  const {
	data: userData,
	isLoading: userLoading = false,
	error: userError = null,
	refetch
  } = useGetUser({
	enabled: hasToken,
	onSuccessFn: () => {

  }
  });

  const refreshUser = React.useCallback(() => {
	if (typeof refetch === 'function') refetch();
  }, [refetch]);

  const value = React.useMemo(
	() => ({ userData, userLoading, userError, refreshUser }),
	[userData, userLoading, userError, refreshUser]
  );

  return (
	<UserContext.Provider value={value}>
	  {children}
	</UserContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser deve ser usado dentro de <UserProvider>.');
  return ctx;
};

export default UserContext;