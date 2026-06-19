import { IApiResponse } from "@/app/types";
import { apiService } from "../api";
import { IStrategy } from "@/features/strategies/types/strategies.types";

export const strategiesApi = {
  create: (data: Partial<IStrategy>) =>
    apiService
      .post<IApiResponse<IStrategy>>("/strategies", data)
      .then((res) => res.data),

  getAll: () =>
    apiService
      .get<IApiResponse<{ strategies: IStrategy[] }>>("/strategies")
      .then((res) => res.data),

  get: (id: string) =>
    apiService
      .get<IApiResponse<IStrategy>>(`/strategies/${id}`)
      .then((res) => res.data),

  update: (id: string, data: Partial<IStrategy>) =>
    apiService
      .patch<IApiResponse<IStrategy>>(`/strategies/${id}`, data)
      .then((res) => res.data),

  remove: (id: string) =>
    apiService
      .delete<IApiResponse>(`/strategies/${id}`)
      .then((res) => res.data),
};
