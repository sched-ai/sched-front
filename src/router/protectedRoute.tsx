import { useUser } from '@/context/user';
import { isAuthenticated } from '@/services/storage';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { userData } = useUser();
  const onboarded = userData?.onboarded;
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/signin" replace />;
  }
  
  if (!onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};