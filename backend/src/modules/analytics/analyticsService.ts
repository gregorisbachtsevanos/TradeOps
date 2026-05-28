import { prisma } from "../../db.js";
import logger from "../../config/logger.js";
import { AnalyticsMetrics } from "../../types/index.js";

/**
 * Analytics Service
 * Provides trading metrics and performance analysis
 */
export class AnalyticsService {
  async getStrategyMetrics(strategyId: string): Promise<AnalyticsMetrics> {
    try {
      // Get all closed trades for the strategy
      const trades = await prisma.trade.findMany({
        where: {
          strategyId,
          status: "CLOSED",
        },
      });

      if (trades.length === 0) {
        return this.getEmptyMetrics();
      }

      const closedTrades = trades.filter((t) => t.pnl !== null);
      const winningTrades = closedTrades.filter((t) => (t.pnl || 0) > 0);
      const losingTrades = closedTrades.filter((t) => (t.pnl || 0) < 0);

      const totalProfit = winningTrades.reduce(
        (sum, t) => sum + (t.pnl || 0),
        0,
      );
      const totalLoss = Math.abs(
        losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0),
      );

      const winRate =
        closedTrades.length > 0
          ? (winningTrades.length / closedTrades.length) * 100
          : 0;
      const profitFactor =
        totalLoss > 0
          ? totalProfit / totalLoss
          : totalProfit > 0
            ? null
            : 0;

      const maxDrawdown = await this.calculateMaxDrawdown(closedTrades);
      const averageWin =
        winningTrades.length > 0 ? totalProfit / winningTrades.length : 0;
      const averageLoss =
        losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;

      return {
        winRate,
        totalTrades: trades.length,
        totalWinningTrades: winningTrades.length,
        totalLosingTrades: losingTrades.length,
        totalProfit,
        totalLoss,
        profitFactor,
        maxDrawdown,
        averageWin,
        averageLoss,
      };
    } catch (error) {
      logger.error("Analytics calculation error", {
        strategyId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return this.getEmptyMetrics();
    }
  }

  async getAccountMetrics(accountId: string): Promise<AnalyticsMetrics> {
    try {
      const trades = await prisma.trade.findMany({
        where: {
          accountId,
          status: "CLOSED",
        },
      });

      if (trades.length === 0) {
        return this.getEmptyMetrics();
      }

      const closedTrades = trades.filter((t) => t.pnl !== null);
      const winningTrades = closedTrades.filter((t) => (t.pnl || 0) > 0);
      const losingTrades = closedTrades.filter((t) => (t.pnl || 0) < 0);

      const totalProfit = winningTrades.reduce(
        (sum, t) => sum + (t.pnl || 0),
        0,
      );
      const totalLoss = Math.abs(
        losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0),
      );

      const winRate =
        closedTrades.length > 0
          ? (winningTrades.length / closedTrades.length) * 100
          : 0;
      const profitFactor =
        totalLoss > 0
          ? totalProfit / totalLoss
          : totalProfit > 0
            ? null
            : 0;

      const maxDrawdown = await this.calculateMaxDrawdown(closedTrades);
      const averageWin =
        winningTrades.length > 0 ? totalProfit / winningTrades.length : 0;
      const averageLoss =
        losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;

      return {
        winRate,
        totalTrades: trades.length,
        totalWinningTrades: winningTrades.length,
        totalLosingTrades: losingTrades.length,
        totalProfit,
        totalLoss,
        profitFactor,
        maxDrawdown,
        averageWin,
        averageLoss,
      };
    } catch (error) {
      logger.error("Account analytics error", {
        accountId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return this.getEmptyMetrics();
    }
  }

  async getRecentTrades(accountId: string, limit: number = 20) {
    try {
      return await prisma.trade.findMany({
        where: { accountId },
        orderBy: { entryTime: "desc" },
        take: limit,
        include: {
          signal: true,
          strategy: true,
        },
      });
    } catch (error) {
      logger.error("Failed to fetch recent trades", {
        accountId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return [];
    }
  }

  async getDailyPnL(accountId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const riskStates = await prisma.riskState.findMany({
        where: {
          accountId,
          date: {
            gte: startDate,
          },
        },
        orderBy: { date: "asc" },
      });

      return riskStates.map((rs) => ({
        date: rs.date.toISOString().split("T")[0],
        pnl: rs.dailyPnL,
        trades: rs.openTrades,
      }));
    } catch (error) {
      logger.error("Failed to fetch daily PnL", {
        accountId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return [];
    }
  }

  private async calculateMaxDrawdown(trades: any[]): Promise<number> {
    if (trades.length === 0) return 0;

    let maxEquity = 0;
    let maxDrawdown = 0;
    let currentEquity = 0;

    for (const trade of trades.sort(
      (a, b) => a.entryTime.getTime() - b.entryTime.getTime(),
    )) {
      currentEquity += trade.pnl || 0;
      maxEquity = Math.max(maxEquity, currentEquity);

      const drawdown =
        maxEquity === 0 ? 0 : ((currentEquity - maxEquity) / maxEquity) * 100;
      maxDrawdown = Math.min(maxDrawdown, drawdown);
    }

    return Math.abs(maxDrawdown);
  }

  private getEmptyMetrics(): AnalyticsMetrics {
    return {
      winRate: 0,
      totalTrades: 0,
      totalWinningTrades: 0,
      totalLosingTrades: 0,
      totalProfit: 0,
      totalLoss: 0,
      profitFactor: 0,
      maxDrawdown: 0,
      averageWin: 0,
      averageLoss: 0,
    };
  }
}

export const analyticsService = new AnalyticsService();
