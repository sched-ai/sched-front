import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import useAPI from "../useAPI";

export interface IWorkSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface IMembership {
  id: string;
  company: {
    id: string;
    name: string;
    companyType: 'EMPRESA' | 'AUTONOMO'; 
  };
  role: {
    name: string;
  };
  workSchedule: IWorkSchedule[];
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  onboarded: boolean;
  membership: IMembership;
}

interface UseGetUserProps {
  onSuccessFn?: (data: IUser) => void;
  enabled?: boolean;
}

export const useGetUser = ({ onSuccessFn, enabled = true }: UseGetUserProps = {}) => {
  const { get } = useAPI<IUser>();

  const query = useQuery<IUser, Error, IUser>({
    queryKey: ["user"],
    queryFn: () =>
      get({
        label: "User",
        autoClose: false,
        showSuccessFeedback: false,
        endpoint: "user/me",
      }).then((response) => {
        if (!response) {
          throw new Error("Empty response");
        }
        return response;
      }),
    enabled,
  });

  useEffect(() => {
    if (query.isSuccess && query.data) {
      onSuccessFn?.(query.data);
    }
  }, [query.isSuccess, query.data, onSuccessFn]);

  return query;
};