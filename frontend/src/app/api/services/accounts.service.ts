import {
  IAccount,
  IAccountInfo,
} from "@/features/AccountSelector/types/accountSelector.types";
import { apiClient } from "../api.client";
import { IApiResponse } from "@/app/types";

export const accountsApi = {
  create: (data: { externalId: string; balance: number; equity: number }) =>
    apiClient
      .post<IApiResponse<IAccount>>("/accounts", data)
      .then((res) => res.data),

  getAll: () =>
    apiClient
      .get<IApiResponse<{ accounts: IAccount[] }>>("/accounts")
      .then((res) => res.data),

  get: (id: string) =>
    apiClient
      .get<IApiResponse<IAccount>>(`/accounts/${id}`)
      .then((res) => res.data),

  info: (id: string) =>
    apiClient
      .get<IApiResponse<IAccountInfo>>(`/accounts/${id}/info`)
      .then((res) => res.data),

  update: (id: string, data: Partial<IAccount>) =>
    apiClient
      .patch<IApiResponse<IAccount>>(`/accounts/${id}`, data)
      .then((res) => res.data),

  remove: (id: string) =>
    apiClient
      .delete<IApiResponse<null>>(`/accounts/${id}`)
      .then((res) => res.data),
};
