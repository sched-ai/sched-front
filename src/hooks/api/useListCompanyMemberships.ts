import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import useAPI from "./useAPI";

interface IMembership {
  id: string;
  name: string;
}

interface UseListCompanyMembershipsProps {
  onSuccessFn?: (data: IMembership[]) => void;
  enabled?: boolean;
}

export const useListCompanyMemberships = ({ onSuccessFn, enabled = true }: UseListCompanyMembershipsProps = {}) => {
  const { get } = useAPI<IMembership[]>();

  const query = useQuery<IMembership[], Error, IMembership[]>({
    queryKey: ["company", "professionals"],
    queryFn: async () => {
      const response = await get({
        label: "Professionals",
        autoClose: false,
        showSuccessFeedback: false,
        endpoint: "company/professionals/",
      });
      if (!response) {
        throw new Error("Empty response");
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