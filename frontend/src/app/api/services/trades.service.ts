import { ITrade } from "@/features/overview/types/overview.types";
import { apiService } from "../api";
import { IApiResponse, IPaginatedResponse } from "@/app/types";

export const tradesApi = {
  getTrades: (
    accountId: string,
    page = 1,
    limit = 20,
    status?: string,
    symbol?: string,
  ) =>
    apiService
      .get<IApiResponse<IPaginatedResponse<ITrade>>>("/trades", {
        params: { account_id: accountId, page, limit, status, symbol },
      })
      .then((res) => res.data),

  getTrade: (tradeId: string) =>
    apiService
      .get<IApiResponse<ITrade>>(`/trades/${tradeId}`)
      .then((res) => res.data),

  closeTrade: (tradeId: string) =>
    apiService
      .post<IApiResponse<ITrade>>(`/trades/${tradeId}/close`)
      .then((res) => res.data),

  realtimePrice: (tradeId: string, days = 30) =>
    apiService
      .get<
        IApiResponse<{ dailyPnL: string }>
      >(`/trades/${tradeId}/live-price`, { params: { days } })
      .then((res) => res.data),
};
