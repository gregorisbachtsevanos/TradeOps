import axios, { AxiosInstance } from "axios";
import {
  IStrategy,
  IAnalyticsMetrics,
  IApiResponse,
  IPaginatedResponse,
} from "../types/index.js";
import { IDailyPnL } from "@/features/StrategyPerformance/types/strategyPerformance.types.js";
import {
  IAccount,
  IAccountInfo,
} from "@/features/AccountSelector/types/accountSelector.types.js";
import { ITrade } from "@/features/ChartWorkspace/types/chartWorkspace.types.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
      // Enable cookies to be sent with requests (HTTP-only cookies)
      withCredentials: true,
    });

    // Interceptor to handle token expiration
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear any stale data and redirect to login
          window.location.href = "/";
        }
        return Promise.reject(error);
      },
    );
  }

  // Auth endpoints
  async register(
    email: string,
    password: string,
    name: string,
  ): Promise<
    IApiResponse<{
      user: { id: string; email: string; name: string };
    }>
  > {
    const response = await this.client.post("/auth/register", {
      email,
      password,
      name,
    });
    // Token is now stored in HTTP-only cookie automatically
    return response.data;
  }

  async login(
    email: string,
    password: string,
  ): Promise<
    IApiResponse<{
      user: { id: string; email: string; name: string };
    }>
  > {
    const response = await this.client.post("/auth/login", {
      email,
      password,
    });
    // Token is now stored in HTTP-only cookie automatically
    return response.data;
  }

  async logout(): Promise<IApiResponse> {
    const response = await this.client.post("/auth/logout");
    return response.data;
  }

  async getCurrentUser(): Promise<
    IApiResponse<{ id: string; email: string; name: string }>
  > {
    const response = await this.client.get("/auth/me");
    return response.data;
  }

  // Trades
  async getTrades(
    accountId: string,
    page: number = 1,
    limit: number = 20,
    status?: string,
    symbol?: string,
  ): Promise<IApiResponse<IPaginatedResponse<ITrade>>> {
    const response = await this.client.get("/trades", {
      params: { account_id: accountId, page, limit, status, symbol },
    });
    return response.data;
  }

  async getTrade(tradeId: string): Promise<IApiResponse<ITrade>> {
    const response = await this.client.get(`/trades/${tradeId}`);
    return response.data;
  }

  async closeTrade(tradeId: string): Promise<IApiResponse<ITrade>> {
    const response = await this.client.post(`/trades/${tradeId}/close`);
    return response.data;
  }

  async getTradeLivePrice(tradeId: string): Promise<IApiResponse> {
    const response = await this.client.get(`/trades/${tradeId}/live-price`);
    return response.data;
  }

  // Strategies
  async createStrategy(data: {
    name: string;
    description?: string;
    riskPercent: number;
  }): Promise<IApiResponse<IStrategy>> {
    const response = await this.client.post("/strategies", data);
    return response.data;
  }

  async getStrategies(): Promise<IApiResponse<{ strategies: IStrategy[] }>> {
    const response = await this.client.get("/strategies");
    return response.data;
  }

  async getStrategy(strategyId: string): Promise<IApiResponse<IStrategy>> {
    const response = await this.client.get(`/strategies/${strategyId}`);
    return response.data;
  }

  async updateStrategy(
    strategyId: string,
    data: Partial<IStrategy>,
  ): Promise<IApiResponse<IStrategy>> {
    const response = await this.client.patch(`/strategies/${strategyId}`, data);
    return response.data;
  }

  async deleteStrategy(strategyId: string): Promise<IApiResponse> {
    const response = await this.client.delete(`/strategies/${strategyId}`);
    return response.data;
  }

  // Accounts
  async createAccount(data: {
    externalId: string;
    balance: number;
    equity: number;
  }): Promise<IApiResponse<IAccount>> {
    const response = await this.client.post("/accounts", data);
    return response.data;
  }

  async getAccounts(): Promise<IApiResponse<{ accounts: IAccount[] }>> {
    const response = await this.client.get("/accounts");
    return response.data;
  }

  async getAccount(accountId: string): Promise<IApiResponse<IAccount>> {
    const response = await this.client.get(`/accounts/${accountId}`);
    return response.data;
  }

  async getAccountInfo(accountId: string): Promise<IApiResponse<IAccountInfo>> {
    const response = await this.client.get(`/accounts/${accountId}/info`);
    return response.data;
  }

  async updateAccount(
    accountId: string,
    data: Partial<IAccount>,
  ): Promise<IApiResponse<IAccount>> {
    const response = await this.client.patch(`/accounts/${accountId}`, data);
    return response.data;
  }

  async deleteAccount(accountId: string): Promise<IApiResponse<null>> {
    const response = await this.client.delete(`/accounts/${accountId}`);
    return response.data;
  }

  // Analytics
  async getStrategyMetrics(
    strategyId: string,
  ): Promise<IApiResponse<IAnalyticsMetrics>> {
    const response = await this.client.get(
      `/analytics/strategy/${strategyId}/metrics`,
    );
    return response.data;
  }

  async getAccountMetrics(
    accountId: string,
  ): Promise<IApiResponse<IAnalyticsMetrics>> {
    const response = await this.client.get(
      `/analytics/account/${accountId}/metrics`,
    );
    return response.data;
  }

  async getRecentTrades(
    accountId: string,
    limit: number = 20,
  ): Promise<IApiResponse<{ trades: ITrade[] }>> {
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
  ): Promise<IApiResponse<{ dailyPnL: IDailyPnL[] }>> {
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
