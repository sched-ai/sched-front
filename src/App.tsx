import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import React from "react";
import useToast from "./hooks/useToast";
import { UserProvider } from "./context/user";
import { AppRoutes } from "./router/routesConfig";

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
        {/* 2. Renderize o componente AppRoutes aqui. Ele já contém o <Routes> */}
        <AppRoutes />
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;