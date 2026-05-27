import { Request, Response } from "express";
import { analyticsService } from "../modules/analytics/analyticsService.js";
import {
  createSuccessResponse,
  AppError,
  asyncHandler,
} from "../utils/helpers.js";

/**
 * GET /analytics/strategy/:strategyId/metrics
 * Get strategy performance metrics
 */
export const getStrategyMetrics = asyncHandler(
  async (req: Request, res: Response) => {
    const { strategyId } = req.params;

    const metrics = await analyticsService.getStrategyMetrics(strategyId);

    res.status(200).json(createSuccessResponse(metrics));
  },
);

/**
 * GET /analytics/account/:accountId/metrics
 * Get account performance metrics
 */
export const getAccountMetrics = asyncHandler(
  async (req: Request, res: Response) => {
    const { accountId } = req.params;

    const metrics = await analyticsService.getAccountMetrics(accountId);

    res.status(200).json(createSuccessResponse(metrics));
  },
);

/**
 * GET /analytics/account/:accountId/trades
 * Get recent trades
 */
export const getRecentTrades = asyncHandler(
  async (req: Request, res: Response) => {
    const { accountId } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const trades = await analyticsService.getRecentTrades(accountId, limit);

    res.status(200).json(createSuccessResponse({ trades }));
  },
);

/**
 * GET /analytics/account/:accountId/daily-pnl?days=30
 * Get daily P&L data
 */
export const getDailyPnL = asyncHandler(async (req: Request, res: Response) => {
  const { accountId } = req.params;
  const days = Math.min(parseInt(req.query.days as string) || 30, 365);

  const dailyPnL = await analyticsService.getDailyPnL(accountId, days);

  res.status(200).json(createSuccessResponse({ dailyPnL }));
});
