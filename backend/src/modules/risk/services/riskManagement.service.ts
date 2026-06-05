import { prisma } from "../../../config/db.js";
import { config } from "../../../config/index.js";
import logger from "../../../config/logger.js";
import { RiskCheckResult } from "../types/riskManagement.types.js";

export class RiskManagementService {
  private getTodayStart(): Date {
    const today = new Date().toDateString();
    return new Date(today);
  }

  async checkRiskLimits(
    accountId: string,
    strategyId: string,
    proposedExposure: number,
  ): Promise<RiskCheckResult> {
    try {
      const startOfDay = this.getTodayStart();
      const riskState = await prisma.riskState.findUnique({
        where: {
          accountId_strategyId_date: {
            accountId,
            strategyId,
            date: startOfDay,
          },
        },
      });

      const account = await prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        return {
          allowed: false,
          reason: "Account not found",
        };
      }

      const maxDailyLoss =
        account.balance * (config.riskManagement.maxDailyLossPercent / 100);
      const maxExposure =
        account.balance * (config.riskManagement.maxExposurePercent / 100);

      if (riskState?.breachedLimit) {
        return {
          allowed: false,
          reason: "Daily loss limit breached",
        };
      }

      if (
        riskState?.dailyPnL !== undefined &&
        riskState.dailyPnL < -maxDailyLoss
      ) {
        return {
          allowed: false,
          reason: `Daily loss limit exceeded: ${-riskState.dailyPnL} / ${maxDailyLoss}`,
        };
      }

      if (
        riskState?.openTrades !== undefined &&
        riskState.openTrades >= config.riskManagement.maxOpenTrades
      ) {
        return {
          allowed: false,
          reason: `Max open trades limit reached: ${riskState.openTrades}/${config.riskManagement.maxOpenTrades}`,
        };
      }

      const currentExposure = riskState?.maxExposure ?? 0;
      const newExposure = currentExposure + proposedExposure;

      if (newExposure > maxExposure) {
        return {
          allowed: false,
          reason: `Exposure limit exceeded: ${newExposure} / ${maxExposure}`,
          currentExposure,
          availableExposure: maxExposure - currentExposure,
        };
      }

      logger.info("Risk check passed", {
        accountId,
        strategyId,
        proposedExposure,
        currentExposure,
        openTrades: riskState?.openTrades ?? 0,
      });

      return {
        allowed: true,
        currentExposure,
        availableExposure: maxExposure - currentExposure,
      };
    } catch (error) {
      logger.error("Risk check error", {
        accountId,
        strategyId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

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
      const startOfDay = this.getTodayStart();
      const account = await prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        logger.warn(
          "Unable to update daily PnL because account was not found",
          {
            accountId,
            strategyId,
          },
        );
        return;
      }

      const maxDailyLoss =
        account.balance * (config.riskManagement.maxDailyLossPercent / 100);

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
          openTrades: 0,
          maxExposure: 0,
          breachedLimit: pnlDelta < -maxDailyLoss,
        },
        update: {
          dailyPnL: {
            increment: pnlDelta,
          },
        },
      });

      if (riskState.dailyPnL < -maxDailyLoss && !riskState.breachedLimit) {
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
      const startOfDay = this.getTodayStart();

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
          maxExposure: 0,
          dailyPnL: 0,
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
      const startOfDay = this.getTodayStart();
      const riskState = await prisma.riskState.findUnique({
        where: {
          accountId_strategyId_date: {
            accountId,
            strategyId,
            date: startOfDay,
          },
        },
      });

      if (!riskState) {
        await prisma.riskState.create({
          data: {
            accountId,
            strategyId,
            date: startOfDay,
            openTrades: 0,
            maxExposure: 0,
            dailyPnL: 0,
          },
        });
        return;
      }

      await prisma.riskState.update({
        where: {
          accountId_strategyId_date: {
            accountId,
            strategyId,
            date: startOfDay,
          },
        },
        data: {
          openTrades: Math.max(0, riskState.openTrades - 1),
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

  async adjustExposure(
    accountId: string,
    strategyId: string,
    amount: number,
  ): Promise<void> {
    try {
      const startOfDay = this.getTodayStart();
      const riskState = await prisma.riskState.findUnique({
        where: {
          accountId_strategyId_date: {
            accountId,
            strategyId,
            date: startOfDay,
          },
        },
      });

      if (!riskState) {
        await prisma.riskState.create({
          data: {
            accountId,
            strategyId,
            date: startOfDay,
            openTrades: 0,
            maxExposure: Math.max(0, amount),
            dailyPnL: 0,
          },
        });
        return;
      }

      await prisma.riskState.update({
        where: {
          accountId_strategyId_date: {
            accountId,
            strategyId,
            date: startOfDay,
          },
        },
        data: {
          maxExposure: Math.max(0, riskState.maxExposure + amount),
        },
      });
    } catch (error) {
      logger.error("Failed to adjust exposure", {
        accountId,
        strategyId,
        amount,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export const riskManagementService = new RiskManagementService();
