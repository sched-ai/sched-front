import { Routes, Route } from 'react-router-dom';
import { type ReactElement } from 'react';

// Importe seus componentes e hooks necessários AQUI
import { useUser } from '@/context/user';
import { Layout } from '@/components/Layout'; // Ajuste o caminho se necessário
import { ProtectedRoute } from './protectedRoute'; // Ajuste o caminho se necessário

// Importe suas páginas
import { SignIn } from '@/pages/SignIn';
import { SignUp } from '@/pages/SignUp';
import { FirstLogin } from '@/pages/FirstLogin';
import { Home } from '@/pages/Home';
import { Atendimentos } from '@/pages/Atendimentos';

// A interface continua a mesma
export interface RouteConfig {
  path: string;
  element: ReactElement;
  template?: boolean;
  authRoute: boolean;
}

export function AppRoutes() {
  const { userData } = useUser();
  const onboarded = userData?.onboarded;

  // A configuração das rotas continua dinâmica aqui dentro
  const routesConfig: RouteConfig[] = [
    { path: "/signin", element: <SignIn />, template: false, authRoute: false },
    { path: "/signup", element: <SignUp />, template: false, authRoute: false },
    { path: "/", element: onboarded ? <Home /> : <FirstLogin />, template: onboarded, authRoute: true },
    { path: "/atendimentos", element: <Atendimentos />, template: true, authRoute: true },
  ];

  return (
    <Routes>
      {routesConfig.map((route) => {
        // 1. A lógica do Layout foi movida para cá
        const elementWithLayout = route.template ? (
          <Layout>{route.element}</Layout>
        ) : (
          route.element
        );

        // 2. A lógica da Rota Protegida também foi movida para cá
        const finalElement = route.authRoute ? (
          <ProtectedRoute>{elementWithLayout}</ProtectedRoute>
        ) : (
          elementWithLayout
        );

        return (
          <Route
            key={route.path}
            path={route.path}
            element={finalElement}
          />
        );
      })}
    </Routes>
  );
}