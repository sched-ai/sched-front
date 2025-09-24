import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import useAPI from "../useAPI";

export interface IUser {
  id: number;
  name: string;
  email: string;
  type: string;          // e.g. 'person'
  role: string;          // e.g. 'user'
  active: boolean;
  created_at: string;    // ISO datetime string
  updated_at: string;    // ISO datetime string
  profileConfigs: Record<string, unknown>;
}

interface IUserResponse {
  user: IUser;
}

interface UseGetUserProps {
  onSuccessFn?: (data: IUser) => void;
  enabled?: boolean;
}

export const useGetUser = ({ onSuccessFn, enabled = true }: UseGetUserProps = {}) => {
  const { get } = useAPI<IUserResponse>();

  const query = useQuery<IUserResponse, unknown, IUser>({
    queryKey: ["user"],
    queryFn: () =>
      get({
        label: "User",
        autoClose: false,
        showSuccessFeedback: false,
        endpoint: "auth/me/",
      }).then((response) => {
        if (!response) {
          throw new Error("Empty response");
        }
        return response;
      }),
    select: (data) => data.user,
    enabled,
  });

  // substitui o antigo `onSuccess`
  useEffect(() => {
    if (query.isSuccess && query.data) {
      onSuccessFn?.(query.data);
    }
  }, [query.isSuccess, query.data, onSuccessFn]);

  return query;
};
