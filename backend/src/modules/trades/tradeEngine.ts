import { prisma } from "../../db.js";
import { mt5ConnectorService } from "../execution/mt5Connector.js";
import { riskManagementService } from "../risk/riskManagement.js";
import { calculatePositionSize } from "../../utils/helpers.js";
import { config } from "../../config/index.js";
import logger from "../../config/logger.js";
import { TradeIntent, TradeExecutionResult } from "../../types/index.js";

/**
 * Trade Engine Service
 * Converts trading signals into executed trades
 * Applies risk management rules and position sizing
 */
export class TradeEngineService {
  async processSignal(
    signalId: string,
    accountId: string,
    strategyId: string,
    symbol: string,
    action: "BUY" | "SELL" | "CLOSE",
    price: number,
  ): Promise<{ success: boolean; tradeId?: string; reason?: string }> {
    try {
      logger.info("Processing signal", {
        signalId,
        accountId,
        symbol,
        action,
        price,
      });

      // Get account and strategy info
      const [account, strategy] = await Promise.all([
        prisma.account.findUnique({ where: { id: accountId } }),
        prisma.strategy.findUnique({ where: { id: strategyId } }),
      ]);

      if (!account || !strategy) {
        const reason = "Account or strategy not found";
        await this.rejectTrade(signalId, reason);
        return { success: false, reason };
      }

      if (!account.isActive) {
        const reason = "Account is not active";
        await this.rejectTrade(signalId, reason);
        return { success: false, reason };
      }

      if (!strategy.isActive) {
        const reason = "Strategy is not active";
        await this.rejectTrade(signalId, reason);
        return { success: false, reason };
      }

      // Handle CLOSE action
      if (action === "CLOSE") {
        return await this.closePosition(accountId, symbol);
      }

      // For BUY/SELL actions
      const direction = action === "BUY" ? "BUY" : "SELL";

      // Calculate position size
      const stopLoss = direction === "BUY" ? price * 0.98 : price * 1.02; // 2% stop loss
      const quantity = calculatePositionSize(
        account.balance,
        strategy.riskPercent,
        price,
        stopLoss,
      );

      if (quantity <= 0) {
        const reason = "Invalid position size calculated";
        await this.rejectTrade(signalId, reason);
        return { success: false, reason };
      }

      const proposedExposure = price * quantity;

      // Check risk limits
      const riskCheck = await riskManagementService.checkRiskLimits(
        accountId,
        strategyId,
        proposedExposure,
      );

      if (!riskCheck.allowed) {
        const reason = riskCheck.reason || "Risk limits exceeded";
        await this.rejectTrade(signalId, reason);
        logger.warn("Trade rejected due to risk limits", {
          signalId,
          reason,
        });
        return { success: false, reason };
      }

      // Execute trade
      const executionResult = await mt5ConnectorService.executeTrade(
        symbol,
        direction,
        price,
        quantity,
        stopLoss,
      );

      if (!executionResult.success) {
        const reason = executionResult.error || "Execution failed";
        await this.rejectTrade(signalId, reason);
        return { success: false, reason };
      }

      // Record trade in database
      const trade = await prisma.trade.create({
        data: {
          accountId,
          signalId,
          strategyId,
          externalTradeId: executionResult.externalTradeId,
          symbol,
          direction,
          entryPrice: price,
          entryTime: new Date(),
          quantity,
          status: "OPEN",
        },
      });

      // Update risk state
      await riskManagementService.incrementOpenTrades(accountId, strategyId);

      logger.info("Trade created", {
        tradeId: trade.id,
        externalTradeId: executionResult.externalTradeId,
        symbol,
        direction,
        quantity,
      });

      return { success: true, tradeId: trade.id };
    } catch (error) {
      logger.error("Signal processing error", {
        signalId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return { success: false, reason: "Processing error" };
    }
  }

  private async closePosition(
    accountId: string,
    symbol: string,
  ): Promise<{ success: boolean; tradeId?: string; reason?: string }> {
    try {
      // Find open trade for symbol
      const openTrade = await prisma.trade.findFirst({
        where: {
          accountId,
          symbol,
          status: "OPEN",
        },
        orderBy: {
          entryTime: "desc",
        },
      });

      if (!openTrade) {
        return {
          success: false,
          reason: "No open position found for this symbol",
        };
      }

      if (!openTrade.externalTradeId) {
        return { success: false, reason: "Trade has no external ID" };
      }

      // Get current market price (in mock, this is approximate)
      const currentPrice = await this.getCurrentPrice(symbol);

      // Close via MT5 connector
      const closeResult = await mt5ConnectorService.closeTrade(
        openTrade.externalTradeId,
        currentPrice,
      );

      if (!closeResult.success) {
        return { success: false, reason: closeResult.error };
      }

      // Update trade record
      const { pnl, pnlPercent } = this.calculateTradeResult(
        openTrade.entryPrice,
        currentPrice,
        openTrade.quantity,
      );

      const updatedTrade = await prisma.trade.update({
        where: { id: openTrade.id },
        data: {
          exitPrice: currentPrice,
          exitTime: new Date(),
          status: "CLOSED",
          pnl,
          pnlPercent,
        },
      });

      // Update risk state
      await riskManagementService.updateDailyPnL(
        accountId,
        openTrade.strategyId,
        pnl,
      );
      await riskManagementService.decrementOpenTrades(
        accountId,
        openTrade.strategyId,
      );

      logger.info("Trade closed", {
        tradeId: openTrade.id,
        symbol,
        pnl,
        pnlPercent,
      });

      return { success: true, tradeId: updatedTrade.id };
    } catch (error) {
      logger.error("Close position error", {
        accountId,
        symbol,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return { success: false, reason: "Close failed" };
    }
  }

  private async rejectTrade(signalId: string, reason: string): Promise<void> {
    try {
      await prisma.trade.create({
        data: {
          accountId: "", // Placeholder
          signalId,
          strategyId: "", // Placeholder
          symbol: "",
          direction: "BUY",
          entryPrice: 0,
          entryTime: new Date(),
          quantity: 0,
          status: "REJECTED",
          reason,
        },
      });
    } catch (error) {
      logger.error("Failed to record rejected trade", {
        signalId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  private calculateTradeResult(
    entryPrice: number,
    exitPrice: number,
    quantity: number,
  ): { pnl: number; pnlPercent: number } {
    const pnl = (exitPrice - entryPrice) * quantity;
    const pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100;
    return { pnl, pnlPercent };
  }

  private async getCurrentPrice(symbol: string): Promise<number> {
    // Mock: return random price near 100
    return 100 + (Math.random() - 0.5) * 5;
  }
}

export const tradeEngineService = new TradeEngineService();
