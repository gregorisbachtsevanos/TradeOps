import axios, { AxiosInstance } from "axios";
import {
  Trade,
  Strategy,
  Account,
  AccountInfo,
  AnalyticsMetrics,
  DailyPnL,
  ApiResponse,
  PaginatedResponse,
} from "../types/index.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Trades
  async getTrades(
    accountId: string,
    page: number = 1,
    limit: number = 20,
    status?: string,
    symbol?: string,
  ): Promise<ApiResponse<PaginatedResponse<Trade>>> {
    const response = await this.client.get("/trades", {
      params: { account_id: accountId, page, limit, status, symbol },
    });
    return response.data;
  }

  async getTrade(tradeId: string): Promise<ApiResponse<Trade>> {
    const response = await this.client.get(`/trades/${tradeId}`);
    return response.data;
  }

  async getTradeLivePrice(tradeId: string): Promise<ApiResponse> {
    const response = await this.client.get(`/trades/${tradeId}/live-price`);
    return response.data;
  }

  async closeTrade(tradeId: string): Promise<ApiResponse<Trade>> {
    const response = await this.client.post(`/trades/${tradeId}/close`);
    return response.data;
  }

  // Strategies
  async createStrategy(
    userId: string,
    data: { name: string; description?: string; riskPercent: number },
  ): Promise<ApiResponse<Strategy>> {
    const response = await this.client.post("/strategies", data, {
      params: { user_id: userId },
    });
    return response.data;
  }

  async getStrategies(userId: string): Promise<ApiResponse<{ strategies: Strategy[] }>> {
    const response = await this.client.get("/strategies", {
      params: { user_id: userId },
    });
    return response.data;
  }

  async getStrategy(strategyId: string): Promise<ApiResponse<Strategy>> {
    const response = await this.client.get(`/strategies/${strategyId}`);
    return response.data;
  }

  async updateStrategy(
    strategyId: string,
    data: Partial<Strategy>,
  ): Promise<ApiResponse<Strategy>> {
    const response = await this.client.patch(`/strategies/${strategyId}`, data);
    return response.data;
  }

  async deleteStrategy(strategyId: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/strategies/${strategyId}`);
    return response.data;
  }

  // Accounts
  async createAccount(
    userId: string,
    data: { externalId: string; balance: number; equity: number },
  ): Promise<ApiResponse<Account>> {
    const response = await this.client.post("/accounts", data, {
      params: { user_id: userId },
    });
    return response.data;
  }

  async getAccounts(userId: string): Promise<ApiResponse<{ accounts: Account[] }>> {
    const response = await this.client.get("/accounts", {
      params: { user_id: userId },
    });
    return response.data;
  }

  async getAccount(accountId: string): Promise<ApiResponse<Account>> {
    const response = await this.client.get(`/accounts/${accountId}`);
    return response.data;
  }

  async getAccountInfo(accountId: string): Promise<ApiResponse<AccountInfo>> {
    const response = await this.client.get(`/accounts/${accountId}/info`);
    return response.data;
  }

  async updateAccount(
    accountId: string,
    data: Partial<Account>,
  ): Promise<ApiResponse<Account>> {
    const response = await this.client.patch(`/accounts/${accountId}`, data);
    return response.data;
  }

  async deleteAccount(accountId: string): Promise<ApiResponse<null>> {
    const response = await this.client.delete(`/accounts/${accountId}`);
    return response.data;
  }

  // Analytics
  async getStrategyMetrics(
    strategyId: string,
  ): Promise<ApiResponse<AnalyticsMetrics>> {
    const response = await this.client.get(
      `/analytics/strategy/${strategyId}/metrics`,
    );
    return response.data;
  }

  async getAccountMetrics(
    accountId: string,
  ): Promise<ApiResponse<AnalyticsMetrics>> {
    const response = await this.client.get(
      `/analytics/account/${accountId}/metrics`,
    );
    return response.data;
  }

  async getRecentTrades(
    accountId: string,
    limit: number = 20,
  ): Promise<ApiResponse<{ trades: Trade[] }>> {
    const response = await this.client.get(
      `/analytics/account/${accountId}/trades`,
      {
        params: { limit },
      },
    );
    return response.data;
  }

  async getDailyPnL(
    accountId: string,
    days: number = 30,
  ): Promise<ApiResponse<{ dailyPnL: DailyPnL[] }>> {
    const response = await this.client.get(
      `/analytics/account/${accountId}/daily-pnl`,
      {
        params: { days },
      },
    );
    return response.data;
  }
}

export const apiService = new ApiService();
