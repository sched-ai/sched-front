import { useMutation, useQueryClient } from "@tanstack/react-query";

import useAPI from "./useAPI";
import useToast from "../useToast";

interface IUpdateProfileResponse {
  message?: string;
}

interface IUpdateProfilePayload {
  name?: string;
  phone?: string;
  document?: string;
  description?: string;
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { patch } = useAPI<IUpdateProfileResponse>();
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
    if (status === 403) return "Você não tem permissão para alterar este perfil.";

    return "Tente novamente em instantes.";
  };

  return useMutation({
    mutationFn: (payload: IUpdateProfilePayload) =>
      patch({
        endpoint: "/user/profile",
        body: payload,
        label: "Perfil",
        showSuccessFeedback: false,
        showErrorFeedback: false,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      // showToast({
      //   label: "Perfil atualizado com sucesso!",
      //   message: "",
      //   type: "success",
      //   toastId: "update-profile-success",
      // });
    },

    onError: (error) => {
      console.error("Erro ao atualizar perfil:", error);
      showToast({
        label: "Erro ao alterar o perfil",
        message: getFriendlyErrorMessage(error),
        type: "error",
        toastId: "update-profile-error",
        autoClose: false,
      });
    },
  });
};

export default useUpdateProfile;
