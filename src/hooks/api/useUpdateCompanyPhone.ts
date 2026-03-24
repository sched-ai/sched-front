import { useMutation, useQueryClient } from "@tanstack/react-query";

import useAPI from "./useAPI";
import useToast from "../useToast";

interface IUpdateCompanyPhoneResponse {
  phone?: string;
  membership?: {
    company?: {
      phone?: string;
    };
  };
}

export const useUpdateCompanyPhone = () => {
  const queryClient = useQueryClient();
  const { patch } = useAPI<IUpdateCompanyPhoneResponse>();
  const { showToast } = useToast();

  const getFriendlyErrorMessage = (error: unknown) => {
    const responseMessage =
      (error as {
        response?: {
          data?: {
            error?: string;
            message?: string;
            detail?: string;
          };
          status?: number;
        };
      })?.response?.data?.error ||
      (error as {
        response?: {
          data?: {
            error?: string;
            message?: string;
            detail?: string;
          };
          status?: number;
        };
      })?.response?.data?.message ||
      (error as {
        response?: {
          data?: {
            error?: string;
            message?: string;
            detail?: string;
          };
          status?: number;
        };
      })?.response?.data?.detail;

    if (responseMessage) return responseMessage;

    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 401) return "Sua sessão expirou. Faça login novamente.";
    if (status === 403) return "Você não tem permissão para alterar este telefone.";
    if (status === 404) return "A rota de atualização ainda não está disponível neste ambiente.";
    if (status === 422) return "Informe um telefone com 11 dígitos, incluindo o DDD.";

    return "Tente novamente em instantes.";
  };

  return useMutation({
    mutationFn: (phone: string) =>
      patch({
        endpoint: "company/phone",
        body: { phone },
        label: "Telefone da clínica",
        showSuccessFeedback: false,
        showErrorFeedback: false,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      showToast({
        label: "Telefone alterado com sucesso!",
        message: "",
        type: "success",
        toastId: "company-phone-success",
      });
    },

    onError: (error) => {
      console.error("Erro ao atualizar o telefone da clínica:", error);
      showToast({
        label: "Erro ao alterar o telefone",
        message: getFriendlyErrorMessage(error),
        type: "error",
        toastId: "company-phone-error",
        autoClose: false,
      });
    },
  });
};

export default useUpdateCompanyPhone;