import { useMutation } from "@tanstack/react-query";
import { useAxios } from "./useAxios";
import { toast } from "sonner";

interface UseDeleteAnnotationProps {
  onSuccessFn?: () => void;
  onErrorFn?: () => void;
}

export const useDeleteAnnotation = ({
  onSuccessFn,
  onErrorFn,
}: UseDeleteAnnotationProps = {}) => {
  const api = useAxios();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/annotations/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Nota excluída com sucesso.");
      if (onSuccessFn) onSuccessFn();
    },
    onError: (error: any) => {
      console.error("Error deleting annotation:", error);
      toast.error(
        error?.response?.data?.error ||
          "Ocorreu um erro ao excluir a nota. Tente novamente."
      );
      if (onErrorFn) onErrorFn();
    },
  });
};
