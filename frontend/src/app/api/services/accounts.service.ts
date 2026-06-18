import {
  IAccount,
  IAccountInfo,
} from "@/features/Dashboard/types/dashboard.types";
import { apiService } from "../api";
import { IApiResponse } from "@/app/types";

export const accountsApi = {
  create: (data: { externalId: string; balance: number; equity: number }) =>
    apiService
      .post<IApiResponse<IAccount>>("/accounts", data)
      .then((res) => res.data),

  getAll: () =>
    apiService
      .get<IApiResponse<{ accounts: IAccount[] }>>("/accounts")
      .then((res) => res.data),

  get: (id: string) =>
    apiService
      .get<IApiResponse<IAccount>>(`/accounts/${id}`)
      .then((res) => res.data),

  info: (id: string) =>
    apiService
      .get<IApiResponse<IAccountInfo>>(`/accounts/${id}/info`)
      .then((res) => res.data),

  update: (id: string, data: Partial<IAccount>) =>
    apiService
      .patch<IApiResponse<IAccount>>(`/accounts/${id}`, data)
      .then((res) => res.data),

  remove: (id: string) =>
    apiService
      .delete<IApiResponse<null>>(`/accounts/${id}`)
      .then((res) => res.data),
};
