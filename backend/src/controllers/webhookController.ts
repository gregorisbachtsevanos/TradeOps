import { Request, Response } from "express";
import { webhookHandlerService } from "../modules/webhook/webhookHandler.js";
import { tradingViewWebhookSchema } from "../utils/validation.js";
import {
  createSuccessResponse,
  createErrorResponse,
  AppError,
  asyncHandler,
} from "../utils/helpers.js";
import logger from "../config/logger.js";

/**
 * POST /webhook/tradingview
 * Receives TradingView webhook alerts
 */
export const receiveTradingViewWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      // Validate payload schema
      const validatedPayload = tradingViewWebhookSchema.parse(req.body);

      // Extract account and strategy from query params
      const accountId =
        (req.query.account_id as string) || validatedPayload.account_id;
      const strategyId =
        (req.query.strategy_id as string) || validatedPayload.strategy_id;

      if (!accountId || !strategyId) {
        throw new AppError(
          400,
          "Missing required account and strategy identifiers. Provide account_id and strategy_id in query string or webhook payload",
        );
      }

      logger.info("Webhook received", {
        accountId,
        strategyId,
        symbol: validatedPayload.ticker,
        signal: validatedPayload.strategy_signal,
      });

      const result = await webhookHandlerService.handleTradingViewSignal(
        validatedPayload,
        accountId,
        strategyId,
      );

      if (!result.success) {
        throw new AppError(400, result.reason || "Failed to process webhook");
      }

      res
        .status(200)
        .json(
          createSuccessResponse(
            { signalId: result.signalId },
            "Webhook processed successfully",
          ),
        );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error("Webhook validation error", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      throw new AppError(400, "Invalid webhook payload");
    }
  },
);

/**
 * GET /webhook/status
 * Health check endpoint
 */
export const webhookStatus = (_req: Request, res: Response): void => {
  res
    .status(200)
    .json(
      createSuccessResponse(
        { status: "operational" },
        "Webhook service is operational",
      ),
    );
};
