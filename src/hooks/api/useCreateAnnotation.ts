import { useMutation } from "@tanstack/react-query";
import { useAxios } from "./useAxios";
import { toast } from "sonner";

export interface CreateAnnotationPayload {
  appointmentId: string;
  clientId: string;
  content: string;
}

interface UseCreateAnnotationProps {
  onSuccessFn?: () => void;
  onErrorFn?: () => void;
}

export const useCreateAnnotation = ({
  onSuccessFn,
  onErrorFn,
}: UseCreateAnnotationProps = {}) => {
  const api = useAxios();

  return useMutation({
    mutationFn: async (payload: CreateAnnotationPayload) => {
      const { data } = await api.post("/annotations", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Nota adicionada com sucesso!");
      if (onSuccessFn) onSuccessFn();
    },
    onError: (error: any) => {
      console.error("Error creating annotation:", error);
      toast.error(
        error?.response?.data?.error ||
          "Ocorreu um erro ao adicionar a nota. Tente novamente."
      );
      if (onErrorFn) onErrorFn();
    },
  });
};
