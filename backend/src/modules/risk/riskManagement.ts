import { prisma } from "../../db.js";
import { config } from "../../config/index.js";
import logger from "../../config/logger.js";
import { RiskCheckResult } from "../../types/index.js";

/**
 * Risk Management Service
 * Enforces trading rules and validates position constraints
 */
export class RiskManagementService {
  async checkRiskLimits(
    accountId: string,
    strategyId: string,
    proposedExposure: number,
  ): Promise<RiskCheckResult> {
    try {
      const today = new Date().toDateString();
      const startOfDay = new Date(today);

      // Get today's risk state
      const riskState = await prisma.riskState.findFirst({
        where: {
          accountId,
          strategyId,
          date: {
            gte: startOfDay,
          },
        },
      });

      // Get account info
      const account = await prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        return {
          allowed: false,
          reason: "Account not found",
        };
      }

      // Check 1: Max daily loss limit
      if (riskState && riskState.breachedLimit) {
        return {
          allowed: false,
          reason: "Daily loss limit breached",
        };
      }

      const maxDailyLoss =
        account.balance * (config.riskManagement.maxDailyLossPercent / 100);
      if (riskState && riskState.dailyPnL < -maxDailyLoss) {
        return {
          allowed: false,
          reason: `Daily loss limit exceeded: ${-riskState.dailyPnL} / ${maxDailyLoss}`,
        };
      }

      // Check 2: Max open trades limit
      if (
        riskState &&
        riskState.openTrades >= config.riskManagement.maxOpenTrades
      ) {
        return {
          allowed: false,
          reason: `Max open trades limit reached: ${riskState.openTrades}/${config.riskManagement.maxOpenTrades}`,
        };
      }

      // Check 3: Max exposure limit
      const maxExposure = account.balance * 0.5; // 50% of balance
      const newExposure = (riskState?.maxExposure || 0) + proposedExposure;

      if (newExposure > maxExposure) {
        return {
          allowed: false,
          reason: `Exposure limit exceeded: ${newExposure} / ${maxExposure}`,
          currentExposure: riskState?.maxExposure || 0,
          availableExposure: maxExposure - (riskState?.maxExposure || 0),
        };
      }

      logger.info("Risk check passed", {
        accountId,
        strategyId,
        proposedExposure,
        currentExposure: riskState?.maxExposure || 0,
        openTrades: riskState?.openTrades || 0,
      });

      return {
        allowed: true,
        currentExposure: riskState?.maxExposure || 0,
        availableExposure: maxExposure - (riskState?.maxExposure || 0),
      };
    } catch (error) {
      logger.error("Risk check error", {
        accountId,
        strategyId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // Fail closed - reject trade on error
      return {
        allowed: false,
        reason: "Risk check failed",
      };
    }
  }

  async updateDailyPnL(
    accountId: string,
    strategyId: string,
    pnlDelta: number,
  ): Promise<void> {
    try {
      const today = new Date().toDateString();
      const startOfDay = new Date(today);

      const riskState = await prisma.riskState.upsert({
        where: {
          accountId_strategyId_date: {
            accountId,
            strategyId,
            date: startOfDay,
          },
        },
        create: {
          accountId,
          strategyId,
          date: startOfDay,
          dailyPnL: pnlDelta,
          openTrades: 1,
        },
        update: {
          dailyPnL: {
            increment: pnlDelta,
          },
        },
      });

      // Check if daily loss limit breached
      const maxDailyLoss =
        (await prisma.account.findUnique({ where: { id: accountId } }))
          ?.balance! *
        (config.riskManagement.maxDailyLossPercent / 100);

      if (riskState.dailyPnL < -maxDailyLoss) {
        await prisma.riskState.update({
          where: {
            accountId_strategyId_date: {
              accountId,
              strategyId,
              date: startOfDay,
            },
          },
          data: {
            breachedLimit: true,
          },
        });

        logger.warn("Daily loss limit breached", {
          accountId,
          strategyId,
          dailyPnL: riskState.dailyPnL,
        });
      }
    } catch (error) {
      logger.error("Failed to update daily PnL", {
        accountId,
        strategyId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async incrementOpenTrades(
    accountId: string,
    strategyId: string,
  ): Promise<void> {
    try {
      const today = new Date().toDateString();
      const startOfDay = new Date(today);

      await prisma.riskState.upsert({
        where: {
          accountId_strategyId_date: {
            accountId,
            strategyId,
            date: startOfDay,
          },
        },
        create: {
          accountId,
          strategyId,
          date: startOfDay,
          openTrades: 1,
        },
        update: {
          openTrades: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      logger.error("Failed to increment open trades", {
        accountId,
        strategyId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async decrementOpenTrades(
    accountId: string,
    strategyId: string,
  ): Promise<void> {
    try {
      const today = new Date().toDateString();
      const startOfDay = new Date(today);

      await prisma.riskState.upsert({
        where: {
          accountId_strategyId_date: {
            accountId,
            strategyId,
            date: startOfDay,
          },
        },
        create: {
          accountId,
          strategyId,
          date: startOfDay,
          openTrades: 0,
        },
        update: {
          openTrades: {
            decrement: 1,
          },
        },
      });
    } catch (error) {
      logger.error("Failed to decrement open trades", {
        accountId,
        strategyId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export const riskManagementService = new RiskManagementService();
