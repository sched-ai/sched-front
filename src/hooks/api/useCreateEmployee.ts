import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAPI from "./useAPI";
import type { IUseMutationParams } from "@/types";

export interface ICreateEmployeePayload {
  companyId: string;
  name: string;
  email: string;
  cargo: string;
  workplaceIds?: string[];
}

export const useCreateEmployee = ({ onSuccessFn }: IUseMutationParams) => {
  const queryClient = useQueryClient();
  
  const { post } = useAPI<ICreateEmployeePayload>();

  return useMutation({
    mutationFn: (employeeData: ICreateEmployeePayload) => 
      post({
        endpoint: "user/employee",
        body: employeeData,
        label: "Funcionário",
      }),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", "user"] });
      if (onSuccessFn) {
        onSuccessFn()
      }
    },

    onError: (error) => {
      console.error("Erro ao criar o funcionário:", error);
    },
  });
};