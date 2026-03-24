import { useMutation, useQueryClient } from "@tanstack/react-query";

import useAPI from "./useAPI";

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

  return useMutation({
    mutationFn: (phone: string) =>
      patch({
        endpoint: "company/phone",
        body: { phone },
        label: "Telefone da clínica",
        successMessage: "Telefone atualizado com sucesso!",
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },

    onError: (error) => {
      console.error("Erro ao atualizar o telefone da clínica:", error);
    },
  });
};

export default useUpdateCompanyPhone;
