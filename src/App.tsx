import { Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "./components/Layout";
import { routesConfig } from "./router/routesConfig";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import React from "react";
import useToast from "./hooks/useToast";
import { ProtectedRoute } from "./router/protectedRoute";
import { UserProvider } from "./context/user";

// eslint-disable-next-line react-refresh/only-export-components
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { showToast } = useToast();
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  React.useEffect(() => {
    const expired = sessionStorage.getItem("expired");
    if (expired) {
      sessionStorage.removeItem("expired");
      showToast({
        label: "Sua sessão expirou!",
        message: "Faça login novamente para continuar.",
        type: "error",
        toastId: "toast-expired",
        autoClose: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Routes>
          {routesConfig.map((route) => {
            const finalElement = route.template ? (
              <Layout>{route.element}</Layout>
            ) : (
              route.element
            );

            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  route.authRoute ? (
                    <ProtectedRoute>{finalElement}</ProtectedRoute>
                  ) : (
                    finalElement
                  )
                }
              />
            );
          })}
        </Routes>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
