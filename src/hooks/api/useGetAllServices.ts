import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import useAPI from "./useAPI";

export interface IEmployee {
  id: string;
  name: string;
}

export interface IWorkplace {
  id: string;
  nickname: string;
}

export interface IService {
  id: string;
  name: string;
  description: string | null;
  duration: number | null;
  price: string | null;
  type: 'SERVICE' | 'PACKAGE';
  department: string | null;
  employee: IEmployee | null;
  workplaces: IWorkplace[] | null;
  discount?: string | null;
  packageItems?: Array<{
    serviceId: string;
    quantity: number;
    service?: IService;
  }>;
}

interface UseGetAllServicesProps {
  onSuccessFn?: (data: IService[]) => void;
  enabled?: boolean;
}

export const useGetAllServices = ({ onSuccessFn, enabled = true }: UseGetAllServicesProps = {}) => {
  const { get } = useAPI<IService[]>();

  const query = useQuery<IService[], Error, IService[]>({
    queryKey: ["services"],
    
    queryFn: async () => {
      const response = await get({
        label: "Serviços",
        autoClose: false,
        showSuccessFeedback: false,
        endpoint: "services",
      });

      if (!response) {
        throw new Error("A resposta da API para serviços é inválida.");
      }
      
      return response;
    },

    enabled,
  });

  useEffect(() => {
    if (query.isSuccess && query.data) {
      onSuccessFn?.(query.data);
    }
  }, [query.isSuccess, query.data, onSuccessFn]);

  return query;
};