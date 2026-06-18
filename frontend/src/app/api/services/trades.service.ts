import { ITrade } from "@/features/ChartWorkspace/types/chartWorkspace.types";
import { apiClient } from "../api.client";
import { IApiResponse, IPaginatedResponse } from "@/app/types";

export const tradesApi = {
  getTrades: (
    accountId: string,
    page = 1,
    limit = 20,
    status?: string,
    symbol?: string,
  ) =>
    apiClient
      .get<IApiResponse<IPaginatedResponse<ITrade>>>("/trades", {
        params: { account_id: accountId, page, limit, status, symbol },
      })
      .then((res) => res.data),

  getTrade: (tradeId: string) =>
    apiClient
      .get<IApiResponse<ITrade>>(`/trades/${tradeId}`)
      .then((res) => res.data),

  closeTrade: (tradeId: string) =>
    apiClient
      .post<IApiResponse<ITrade>>(`/trades/${tradeId}/close`)
      .then((res) => res.data),
};
