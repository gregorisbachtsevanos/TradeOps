import { prisma } from "../../db.js";
import { mt5ConnectorService } from "../execution/mt5Connector.js";
import { riskManagementService } from "../risk/riskManagement.js";
import { calculatePositionSize, calculatePnL } from "../../utils/helpers.js";
import logger from "../../config/logger.js";

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

      const [account, strategy] = await Promise.all([
        prisma.account.findUnique({ where: { id: accountId } }) as Promise<{
          id: string;
          externalId: string;
          isActive: boolean;
          balance: number;
        } | null>,
        prisma.strategy.findUnique({ where: { id: strategyId } }) as Promise<{
          id: string;
          isActive: boolean;
          riskPercent: number;
        } | null>,
      ]);

      if (!account) {
        const reason = "Account not found";
        logger.warn(reason, { signalId, accountId });
        return { success: false, reason };
      }

      if (!strategy) {
        const reason = "Strategy not found";
        logger.warn(reason, { signalId, strategyId });
        return { success: false, reason };
      }

      const direction = action === "CLOSE" ? "BUY" : action;

      if (!account.isActive) {
        const reason = "Account is not active";
        await this.rejectTrade(
          signalId,
          accountId,
          strategyId,
          symbol,
          direction,
          reason,
        );
        return { success: false, reason };
      }

      if (!strategy.isActive) {
        const reason = "Strategy is not active";
        await this.rejectTrade(
          signalId,
          accountId,
          strategyId,
          symbol,
          direction,
          reason,
        );
        return { success: false, reason };
      }

      if (action === "CLOSE") {
        return await this.closePosition(account, strategyId, symbol);
      }

      const stopLoss = direction === "BUY" ? price * 0.98 : price * 1.02;
      const quantity = calculatePositionSize(
        account.balance,
        strategy.riskPercent,
        price,
        stopLoss,
      );

      if (quantity <= 0) {
        const reason = "Invalid position size calculated";
        await this.rejectTrade(
          signalId,
          accountId,
          strategyId,
          symbol,
          direction,
          reason,
        );
        return { success: false, reason };
      }

      const proposedExposure = price * quantity;

      const riskCheck = await riskManagementService.checkRiskLimits(
        accountId,
        strategyId,
        proposedExposure,
      );

      if (!riskCheck.allowed) {
        const reason = riskCheck.reason || "Risk limits exceeded";
        logger.warn("Trade rejected due to risk limits", {
          signalId,
          reason,
        });
        await this.rejectTrade(
          signalId,
          accountId,
          strategyId,
          symbol,
          direction,
          reason,
        );
        return { success: false, reason };
      }

      const executionResult = await mt5ConnectorService.executeTrade(
        account.externalId,
        symbol,
        direction,
        price,
        quantity,
        stopLoss,
      );

      if (!executionResult.success) {
        const reason = executionResult.error || "Execution failed";
        await this.rejectTrade(
          signalId,
          accountId,
          strategyId,
          symbol,
          direction,
          reason,
        );
        return { success: false, reason };
      }

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

      await riskManagementService.incrementOpenTrades(accountId, strategyId);
      await riskManagementService.adjustExposure(
        accountId,
        strategyId,
        proposedExposure,
      );

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
    account: { id: string; externalId: string },
    strategyId: string,
    symbol: string,
  ): Promise<{ success: boolean; tradeId?: string; reason?: string }> {
    try {
      const openTrade = await prisma.trade.findFirst({
        where: {
          accountId: account.id,
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

      const closeResult = await mt5ConnectorService.closeTrade(
        account.externalId,
        openTrade.externalTradeId,
      );

      if (!closeResult.success) {
        return { success: false, reason: closeResult.error };
      }

      const exitPrice = Number(
        closeResult.details?.exitPrice ?? closeResult.details?.executionPrice,
      );

      if (!exitPrice || Number.isNaN(exitPrice)) {
        return {
          success: false,
          reason: "Invalid exit price returned by broker",
        };
      }

      const { pnl, pnlPercent } = calculatePnL(
        openTrade.entryPrice,
        exitPrice,
        openTrade.quantity,
        openTrade.direction as "BUY" | "SELL",
        openTrade.commission || 0,
      );

      const updatedTrade = await prisma.trade.update({
        where: { id: openTrade.id },
        data: {
          exitPrice,
          exitTime: new Date(),
          status: "CLOSED",
          pnl,
          pnlPercent,
        },
      });

      await riskManagementService.updateDailyPnL(
        account.id,
        openTrade.strategyId,
        pnl,
      );
      await riskManagementService.decrementOpenTrades(
        account.id,
        openTrade.strategyId,
      );
      await riskManagementService.adjustExposure(
        account.id,
        openTrade.strategyId,
        -openTrade.entryPrice * openTrade.quantity,
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
        accountId: account.id,
        symbol,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return { success: false, reason: "Close failed" };
    }
  }

  private async rejectTrade(
    signalId: string,
    accountId: string,
    strategyId: string,
    symbol: string,
    direction: "BUY" | "SELL",
    reason: string,
  ): Promise<void> {
    if (!accountId || !strategyId) {
      logger.warn(
        "Reject record skipped because account or strategy is missing",
        {
          signalId,
          accountId,
          strategyId,
        },
      );
      return;
    }

    try {
      await prisma.trade.create({
        data: {
          accountId,
          signalId,
          strategyId,
          symbol,
          direction,
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
        accountId,
        strategyId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export const tradeEngineService = new TradeEngineService();
