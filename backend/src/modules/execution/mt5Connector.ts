import { v4 as uuidv4 } from "uuid";
import logger from "../../config/logger.js";
import { TradeExecutionResult, AccountInfo } from "../../types/index.js";

/**
 * Mock MT5 Connector - Abstraction layer for trade execution
 * In production, this would connect to real MT5 via its API
 */
export class MT5ConnectorService {
  private mockTrades: Map<
    string,
    { symbol: string; direction: string; entryPrice: number }
  > = new Map();

  async executeTrade(
    symbol: string,
    direction: "BUY" | "SELL",
    price: number,
    quantity: number,
    stopLoss?: number,
    takeProfit?: number,
  ): Promise<TradeExecutionResult> {
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

      this.mockTrades.set(externalTradeId, { symbol, direction, entryPrice: price });

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

  async closeTrade(
    externalTradeId: string,
    exitPrice: number,
  ): Promise<TradeExecutionResult> {
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
          pnl: (exitPrice - trade.entryPrice) * 1, // Assuming 1 unit quantity
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

  async getAccountInfo(accountId: string): Promise<AccountInfo> {
    try {
      // Mock account data - in production, fetch from MT5
      await new Promise((resolve) => setTimeout(resolve, 50));

      logger.debug("Fetching account info", { accountId });

      return {
        id: accountId,
        balance: 100000,
        equity: 100000 + Math.random() * 5000,
        exposure: Math.random() * 30000,
        openTrades: Math.floor(Math.random() * 10),
        dailyPnL: Math.random() * 1000 - 500,
      };
    } catch (error) {
      logger.error("Failed to fetch account info", {
        accountId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  async getPositionInfo(externalTradeId: string): Promise<{
    symbol: string;
    direction: string;
    entryPrice: number;
  } | null> {
    return this.mockTrades.get(externalTradeId) ?? null;
  }

  async getOpenTrades(accountId: string): Promise<string[]> {
    // Mock: return random number of open trades
    const count = Math.floor(Math.random() * 10);
    return Array.from({ length: count }, (_, i) => `TRADE_${i}`);
  }
}

export const mt5ConnectorService = new MT5ConnectorService();
