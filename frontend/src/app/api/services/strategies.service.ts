import { IApiResponse, IStrategy } from "@/app/types";
import { apiClient } from "../api.client";

export const strategiesApi = {
  create: (data: { name: string; description?: string; riskPercent: number }) =>
    apiClient
      .post<IApiResponse<IStrategy>>("/strategies", data)
      .then((res) => res.data),

  getAll: () =>
    apiClient
      .get<IApiResponse<{ strategies: IStrategy[] }>>("/strategies")
      .then((res) => res.data),

  get: (id: string) =>
    apiClient
      .get<IApiResponse<IStrategy>>(`/strategies/${id}`)
      .then((res) => res.data),

  update: (id: string, data: Partial<IStrategy>) =>
    apiClient
      .patch<IApiResponse<IStrategy>>(`/strategies/${id}`, data)
      .then((res) => res.data),

  remove: (id: string) =>
    apiClient.delete<IApiResponse>(`/strategies/${id}`).then((res) => res.data),
};
