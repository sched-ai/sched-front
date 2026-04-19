import { useGetUser, type IUser } from '@/hooks/api/auth/useGetUser';
import { StorageService } from '@/services';
import React, { createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';

interface UserContextType {
  userData?: IUser;
  userLoading: boolean;
  userError: unknown;
  refreshUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const PUBLIC_AUTH_ROUTES = new Set([
  '/signin',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/landing',
  '/politica-privacidade',
  '/termos-uso',
  '/termos-medico',
  '/termos-paciente',
]);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const hasToken = typeof window !== 'undefined' && StorageService.getToken() !== '';
  const isPublicRoute = PUBLIC_AUTH_ROUTES.has(location.pathname);
  const shouldLoadUser = hasToken && !isPublicRoute;

  const {
    data: userData,
    isLoading: userLoading = false,
    error: userError = null,
    refetch
  } = useGetUser({
    enabled: shouldLoadUser,
    onSuccessFn: () => {

    }
  });

  const refreshUser = React.useCallback(() => {
    if (typeof refetch === 'function' && shouldLoadUser) refetch();
  }, [refetch, shouldLoadUser]);

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

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser deve ser usado dentro de <UserProvider>.');
  return ctx;
};

export default UserContext;
