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
    phone?: string;
    companyType: 'EMPRESA' | 'AUTONOMO';
    document?: string | null;
    workplaces: {
      address: string;
      city: string;
      complement: string | null;
      id: string;
      nickname: string;
      number: string;
      schedule: Record<string, { startMinute: number; endMinute: number }> | null;
      state: string;
    }[];
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
  onboardingStep: number;
  membership: IMembership;
}

interface UseGetUserProps {
  onSuccessFn?: (data: IUser) => void;
  enabled?: boolean;
}

type UserEnvelope = {
  ok?: boolean;
  data?: IUser;
} & Partial<IUser>;

export const useGetUser = ({ onSuccessFn, enabled = true }: UseGetUserProps = {}) => {
  const { get } = useAPI<UserEnvelope>();

  const query = useQuery<IUser, Error, IUser>({
    queryKey: ["user"],
    queryFn: () =>
      get({
        label: "User",
        autoClose: false,
        showSuccessFeedback: false,
        endpoint: "user/me",
      }).then((response) => {
        const payload =
          response?.data && typeof response.data === "object"
            ? response.data
            : response;

        if (!payload) {
          throw new Error("Empty response");
        }
        return payload as IUser;
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
