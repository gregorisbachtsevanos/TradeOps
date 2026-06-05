import { Response } from "express";
import { analyticsService } from "../services/analytics.service.js";
import { prisma } from "../../../config/db.js";
import {
  createSuccessResponse,
  AppError,
  asyncHandler,
} from "../../../utils/helpers.js";
import { AuthenticatedRequest } from "../../../middleware/auth.js";

const requireCurrentUser = (req: AuthenticatedRequest): string => {
  if (!req.user?.id) {
    throw new AppError(401, "Unauthorized");
  }
  return req.user.id;
};

const assertAccountOwnership = async (
  accountId: string,
  userId: string,
): Promise<void> => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new AppError(404, "Account not found");
  }

  if (account.userId !== userId) {
    throw new AppError(403, "Unauthorized access to account");
  }
};

const assertStrategyOwnership = async (
  strategyId: string,
  userId: string,
): Promise<void> => {
  const strategy = await prisma.strategy.findUnique({
    where: { id: strategyId },
  });

  if (!strategy) {
    throw new AppError(404, "Strategy not found");
  }

  if (strategy.userId !== userId) {
    throw new AppError(403, "Unauthorized access to strategy");
  }
};

/**
 * GET /analytics/strategy/:strategyId/metrics
 * Get strategy performance metrics
 */
export const getStrategyMetrics = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireCurrentUser(req);
    const { strategyId } = req.params;

    await assertStrategyOwnership(strategyId, userId);

    const metrics = await analyticsService.getStrategyMetrics(strategyId);

    res.status(200).json(createSuccessResponse(metrics));
  },
);

/**
 * GET /analytics/account/:accountId/metrics
 * Get account performance metrics
 */
export const getAccountMetrics = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireCurrentUser(req);
    const { accountId } = req.params;

    await assertAccountOwnership(accountId, userId);

    const metrics = await analyticsService.getAccountMetrics(accountId);

    res.status(200).json(createSuccessResponse(metrics));
  },
);

/**
 * GET /analytics/account/:accountId/trades
 * Get recent trades
 */
export const getRecentTrades = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireCurrentUser(req);
    const { accountId } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    await assertAccountOwnership(accountId, userId);

    const trades = await analyticsService.getRecentTrades(accountId, limit);

    res.status(200).json(createSuccessResponse({ trades }));
  },
);

/**
 * GET /analytics/account/:accountId/daily-pnl?days=30
 * Get daily P&L data
 */
export const getDailyPnL = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireCurrentUser(req);
    const { accountId } = req.params;
    const days = Math.min(parseInt(req.query.days as string) || 30, 365);

    await assertAccountOwnership(accountId, userId);

    const dailyPnL = await analyticsService.getDailyPnL(accountId, days);

    res.status(200).json(createSuccessResponse({ dailyPnL }));
  },
);
