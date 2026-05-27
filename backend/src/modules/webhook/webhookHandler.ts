import { prisma } from "../db.js";
import { tradeEngineService } from "../modules/trades/tradeEngine.js";
import { isDuplicate } from "../utils/helpers.js";
import logger from "../config/logger.js";
import { TradingViewWebhookPayload } from "../types/index.js";

/**
 * Webhook Handler Service
 * Processes incoming TradingView webhook signals
 * Handles deduplication and signal storage
 */
export class WebhookHandlerService {
  async handleTradingViewSignal(
    payload: TradingViewWebhookPayload,
    accountId: string,
    strategyId: string,
  ): Promise<{ success: boolean; signalId?: string; reason?: string }> {
    try {
      logger.info("Handling TradingView signal", {
        ticker: payload.ticker,
        signal: payload.strategy_signal,
        accountId,
        strategyId,
      });

      // Verify account exists and is active
      const account = await prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        return { success: false, reason: "Account not found" };
      }

      if (!account.isActive) {
        return { success: false, reason: "Account is inactive" };
      }

      // Check for duplicates in last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentSignals = await prisma.signal.findMany({
        where: {
          accountId,
          strategyId,
          symbol: payload.ticker,
          action: payload.strategy_signal,
          timestamp: {
            gte: fiveMinutesAgo,
          },
        },
        orderBy: {
          timestamp: "desc",
        },
        take: 1,
      });

      if (recentSignals.length > 0) {
        logger.info("Duplicate signal detected", {
          ticker: payload.ticker,
          signal: payload.strategy_signal,
          accountId,
        });

        // Store as duplicate
        const signal = await prisma.signal.create({
          data: {
            accountId,
            strategyId,
            symbol: payload.ticker,
            action: payload.strategy_signal,
            price: payload.close,
            timestamp: new Date(payload.time),
            rawPayload: payload,
            isDuplicate: true,
          },
        });

        return { success: true, signalId: signal.id };
      }

      // Store signal
      const signal = await prisma.signal.create({
        data: {
          accountId,
          strategyId,
          symbol: payload.ticker,
          action: payload.strategy_signal,
          price: payload.close,
          timestamp: new Date(payload.time),
          rawPayload: payload,
          isDuplicate: false,
        },
      });

      logger.info("Signal stored", {
        signalId: signal.id,
        ticker: payload.ticker,
        action: payload.strategy_signal,
      });

      // Process the signal through the trade engine
      const processResult = await tradeEngineService.processSignal(
        signal.id,
        accountId,
        strategyId,
        payload.ticker,
        payload.strategy_signal,
        payload.close,
      );

      if (!processResult.success) {
        logger.warn("Signal processing failed", {
          signalId: signal.id,
          reason: processResult.reason,
        });
      }

      // Mark signal as processed
      await prisma.signal.update({
        where: { id: signal.id },
        data: { processedAt: new Date() },
      });

      return { success: true, signalId: signal.id };
    } catch (error) {
      logger.error("Webhook handling error", {
        ticker: payload.ticker,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return { success: false, reason: "Processing error" };
    }
  }
}

export const webhookHandlerService = new WebhookHandlerService();
