import { createRequire } from "node:module";
import { v4 as uuidv4 } from "uuid";
import logger from "../../../config/logger.js";
import { config } from "../../../config/index.js";
import { IAccountInfo } from "../../accounts/index.js";
import { ITradeExecutionResult } from "../../trades/index.js";

const require = createRequire(import.meta.url);

export class MT5ConnectorService {
  private mockTrades: Map<
    string,
    { symbol: string; direction: string; entryPrice: number }
  > = new Map();

  private get isMockBroker(): boolean {
    return config.broker.useMockBroker;
  }

  private get baseUrl(): string {
    return config.broker.apiBaseUrl.replace(/\/+$/, "");
  }

  private get headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.broker.apiKey}`,
    };
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    if (!this.baseUrl) {
      throw new Error("Broker API base URL is not configured");
    }

    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers as Record<string, string>),
        ...this.headers,
      },
    });

    const rawText = await response.text();
    const payload = rawText ? JSON.parse(rawText) : {};

    if (!response.ok) {
      const error = (payload as any)?.error || response.statusText;
      throw new Error(`Broker API request failed: ${error}`);
    }

    return payload as T;
  }

  private async ensureBrokerConfig(): Promise<void> {
    if (this.isMockBroker) {
      return;
    }

    if (!config.broker.apiBaseUrl || !config.broker.apiKey) {
      throw new Error(
        "Broker configuration is missing. Set BROKER_API_BASE_URL and BROKER_API_KEY",
      );
    }
  }

  async executeTrade(
    accountExternalId: string,
    symbol: string,
    direction: "BUY" | "SELL",
    price: number,
    quantity: number,
    stopLoss?: number,
    takeProfit?: number,
  ): Promise<ITradeExecutionResult> {
    if (this.isMockBroker) {
      try {
        const tradeId = uuidv4();
        const externalTradeId = `MT5_${Date.now()}_${uuidv4().substring(0, 8)}`;

        // Simulate trade execution delay
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Mock success rate (95%)
        if (Math.random() > 0.95) {
          logger.warn("Mock trade execution failed", {
            symbol,
            direction,
            price,
          });
          return {
            success: false,
            error: "Market conditions changed, unable to execute trade",
          };
        }

        this.mockTrades.set(externalTradeId, {
          symbol,
          direction,
          entryPrice: price,
        });

        logger.info("Trade executed", {
          tradeId,
          externalTradeId,
          symbol,
          direction,
          quantity,
          price,
          stopLoss,
          takeProfit,
        });

        return {
          success: true,
          tradeId,
          externalTradeId,
          details: {
            executionPrice: price,
            timestamp: new Date().toISOString(),
            stopLoss,
            takeProfit,
          },
        };
      } catch (error) {
        logger.error("Trade execution error", {
          symbol,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        return {
          success: false,
          error: "Failed to execute trade",
        };
      }
    }

    await this.ensureBrokerConfig();

    try {
      const payload = {
        accountExternalId,
        symbol,
        direction,
        price,
        quantity,
        stopLoss,
        takeProfit,
      };

      const response = await this.request<{
        success?: boolean;
        data?: Record<string, unknown>;
        error?: string;
      }>("/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response.success === false) {
        return {
          success: false,
          error: response.error || "Broker rejected order",
        };
      }

      const order = response.data ?? response;
      return {
        success: true,
        externalTradeId:
          (order as any).externalTradeId ?? (order as any).id ?? undefined,
        tradeId: (order as any).id ?? undefined,
        details: order,
      };
    } catch (error) {
      logger.error("Broker trade execution failed", {
        symbol,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to execute trade with broker",
      };
    }
  }

  async closeTrade(
    accountExternalId: string,
    externalTradeId: string,
    exitPrice?: number,
  ): Promise<ITradeExecutionResult> {
    if (this.isMockBroker) {
      try {
        const trade = this.mockTrades.get(externalTradeId);

        if (!trade) {
          return {
            success: false,
            error: `Trade ${externalTradeId} not found`,
          };
        }

        // Simulate close delay
        await new Promise((resolve) => setTimeout(resolve, 50));

        this.mockTrades.delete(externalTradeId);

        logger.info("Trade closed", {
          externalTradeId,
          symbol: trade.symbol,
          entryPrice: trade.entryPrice,
          exitPrice,
        });

        return {
          success: true,
          details: {
            exitPrice,
            pnl: (exitPrice ?? trade.entryPrice) - trade.entryPrice,
            closeTime: new Date().toISOString(),
          },
        };
      } catch (error) {
        logger.error("Trade close error", {
          externalTradeId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        return {
          success: false,
          error: "Failed to close trade",
        };
      }
    }

    await this.ensureBrokerConfig();

    try {
      const response = await this.request<{
        success?: boolean;
        data?: Record<string, unknown>;
        error?: string;
      }>(`/orders/${encodeURIComponent(externalTradeId)}/close`, {
        method: "POST",
        body: JSON.stringify({ accountExternalId, exitPrice }),
      });

      if (response.success === false) {
        return {
          success: false,
          error: response.error || "Broker failed to close order",
        };
      }

      const result = response.data ?? response;
      return {
        success: true,
        details: {
          exitPrice:
            (result as any).exitPrice ??
            (result as any).closePrice ??
            (result as any).executionPrice ??
            exitPrice,
          pnl: (result as any).pnl ?? (result as any).profit,
          closeTime: (result as any).closeTime,
        },
      };
    } catch (error) {
      logger.error("Broker trade close failed", {
        externalTradeId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to close trade with broker",
      };
    }
  }

  async getAccountInfo(accountExternalId: string): Promise<IAccountInfo> {
    if (this.isMockBroker) {
      await new Promise((resolve) => setTimeout(resolve, 50));

      logger.debug("Fetching account info", { accountExternalId });

      return {
        id: accountExternalId,
        balance: 100000,
        equity: 100000 + Math.random() * 5000,
        exposure: Math.random() * 30000,
        openTrades: Math.floor(Math.random() * 10),
        dailyPnL: Math.random() * 1000 - 500,
      };
    }

    await this.ensureBrokerConfig();

    try {
      const response = await this.request<{
        success?: boolean;
        data?: IAccountInfo;
        error?: string;
      }>(`/accounts/${encodeURIComponent(accountExternalId)}/info`, {
        method: "GET",
      });

      if (response.success === false) {
        throw new Error(response.error || "Broker returned an error");
      }

      const accountInfo = response.data ?? (response as IAccountInfo);
      return {
        id: accountInfo.id,
        balance: Number(accountInfo.balance),
        equity: Number(accountInfo.equity),
        exposure: Number(accountInfo.exposure),
        openTrades: Number(accountInfo.openTrades),
        dailyPnL: Number(accountInfo.dailyPnL),
      };
    } catch (error) {
      logger.error("Failed to fetch account info", {
        accountExternalId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  async getMarketQuote(
    symbol: string,
  ): Promise<{ symbol: string; price: number; timestamp: string }> {
    if (this.isMockBroker) {
      return {
        symbol,
        price: 100,
        timestamp: new Date().toISOString(),
      };
    }

    await this.ensureBrokerConfig();

    try {
      const response = await this.request<{
        success?: boolean;
        data?: { price: number; timestamp: string };
        error?: string;
      }>(`/market-data/quote?symbol=${encodeURIComponent(symbol)}`, {
        method: "GET",
      });

      if (response.success === false) {
        throw new Error(response.error || "Broker market data error");
      }

      const quote =
        response.data ?? (response as { price: number; timestamp: string });
      return {
        symbol,
        price: Number(quote.price),
        timestamp: quote.timestamp,
      };
    } catch (error) {
      logger.error("Failed to fetch market quote", {
        symbol,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  async getPositionInfo(
    externalTradeId: string,
  ): Promise<Record<string, unknown> | null> {
    if (this.isMockBroker) {
      return this.mockTrades.get(externalTradeId) ?? null;
    }

    await this.ensureBrokerConfig();

    try {
      const response = await this.request<{
        success?: boolean;
        data?: Record<string, unknown>;
        error?: string;
      }>(`/orders/${encodeURIComponent(externalTradeId)}`, {
        method: "GET",
      });

      if (response.success === false) {
        throw new Error(response.error || "Broker returned an error");
      }

      return response.data ?? response;
    } catch (error) {
      logger.error("Failed to fetch position info", {
        externalTradeId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return null;
    }
  }
}

export const mt5ConnectorService = new MT5ConnectorService();
