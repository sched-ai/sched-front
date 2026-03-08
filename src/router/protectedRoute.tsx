import { useUser } from '@/context/user';
import LoadingScreen from '@/pages/LoadingScreen';
import { isAuthenticated } from '@/services/storage';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { userData, userLoading } = useUser();
  const location = useLocation();

  if (userLoading) {
      return <LoadingScreen />;
    }

  if (!isAuthenticated()) {
    return <Navigate to="/signin" replace />;
  }
  
   if (userData && userData.onboardingStep < 5 && location.pathname !== '/onboarding') {
     return <Navigate to="/onboarding" replace />;
   }

   if (userData && userData.onboardingStep > 4 && location.pathname === '/onboarding') {
         return <Navigate to="/" replace />;
   }

  return <>{children}</>;
};