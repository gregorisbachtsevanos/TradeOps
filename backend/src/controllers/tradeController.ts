import { Response } from "express";
import { prisma } from "../db.js";
import { tradeFilterSchema } from "../utils/validation.js";
import {
  createSuccessResponse,
  AppError,
  asyncHandler,
  calculatePnL,
} from "../utils/helpers.js";
import { mt5ConnectorService } from "../modules/execution/mt5Connector.js";
import { riskManagementService } from "../modules/risk/riskManagement.js";
import logger from "../config/logger.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

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

/**
 * GET /trades?account_id=xxx&page=1&limit=20&status=OPEN
 * List trades for an account
 */
export const listTrades = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireCurrentUser(req);
    const accountId = req.query.account_id as string;

    if (!accountId) {
      throw new AppError(400, "account_id query parameter is required");
    }

    await assertAccountOwnership(accountId, userId);

    const validatedParams = tradeFilterSchema.parse(req.query);

    const trades = await prisma.trade.findMany({
      where: {
        accountId,
        ...(validatedParams.status && { status: validatedParams.status }),
        ...(validatedParams.symbol && { symbol: validatedParams.symbol }),
      },
      include: {
        strategy: true,
        signal: true,
      },
      orderBy: { entryTime: "desc" },
      skip: (validatedParams.page - 1) * validatedParams.limit,
      take: validatedParams.limit,
    });

    const total = await prisma.trade.count({
      where: {
        accountId,
        ...(validatedParams.status && { status: validatedParams.status }),
        ...(validatedParams.symbol && { symbol: validatedParams.symbol }),
      },
    });

    res.status(200).json(
      createSuccessResponse({
        data: trades,
        pagination: {
          total,
          page: validatedParams.page,
          limit: validatedParams.limit,
          pages: Math.ceil(total / validatedParams.limit),
        },
      }),
    );
  },
);

/**
 * GET /trades/:tradeId
 * Get trade details
 */
export const getTrade = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireCurrentUser(req);
    const { tradeId } = req.params;

    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        strategy: true,
        signal: true,
        account: true,
      },
    });

    if (!trade) {
      throw new AppError(404, "Trade not found");
    }

    if (trade.account.userId !== userId) {
      throw new AppError(403, "Unauthorized access to trade");
    }

    res.status(200).json(createSuccessResponse(trade));
  },
);

/**
 * GET /trades/:tradeId/live-price
 * Get live price and P&L estimate
 */
export const getTradeLivePrice = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireCurrentUser(req);
    const { tradeId } = req.params;

    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: { account: true },
    });

    if (!trade) {
      throw new AppError(404, "Trade not found");
    }

    if (trade.account.userId !== userId) {
      throw new AppError(403, "Unauthorized access to trade");
    }

    if (trade.status !== "OPEN") {
      throw new AppError(400, "Trade is not open");
    }

    const quote = await mt5ConnectorService.getMarketQuote(trade.symbol);

    const { pnl, pnlPercent } = calculatePnL(
      trade.entryPrice,
      quote.price,
      trade.quantity,
      trade.direction as "BUY" | "SELL",
      trade.commission || 0,
    );

    res.status(200).json(
      createSuccessResponse({
        currentPrice: quote.price,
        timestamp: quote.timestamp,
        entryPrice: trade.entryPrice,
        pnl,
        pnlPercent,
        quantity: trade.quantity,
      }),
    );
  },
);

/**
 * POST /trades/:tradeId/close
 * Close an open trade
 */
export const closeTrade = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireCurrentUser(req);
    const { tradeId } = req.params;

    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: { account: true },
    });

    if (!trade) {
      throw new AppError(404, "Trade not found");
    }

    if (trade.account.userId !== userId) {
      throw new AppError(403, "Unauthorized access to trade");
    }

    if (trade.status !== "OPEN") {
      throw new AppError(400, "Trade is not open");
    }

    if (!trade.externalTradeId) {
      throw new AppError(400, "Trade has no external ID");
    }

    const result = await mt5ConnectorService.closeTrade(
      trade.account.externalId,
      trade.externalTradeId,
    );

    if (!result.success) {
      throw new AppError(500, result.error || "Failed to close trade");
    }

    const exitPrice = Number(
      result.details?.exitPrice ??
        result.details?.executionPrice ??
        result.details?.price,
    );

    if (!exitPrice || Number.isNaN(exitPrice)) {
      throw new AppError(500, "Invalid exit price returned by broker");
    }

    const { pnl, pnlPercent } = calculatePnL(
      trade.entryPrice,
      exitPrice,
      trade.quantity,
      trade.direction as "BUY" | "SELL",
      trade.commission || 0,
    );

    const updatedTrade = await prisma.trade.update({
      where: { id: tradeId },
      data: {
        exitPrice,
        exitTime: new Date(),
        status: "CLOSED",
        pnl,
        pnlPercent,
      },
    });

    await riskManagementService.updateDailyPnL(
      trade.account.id,
      trade.strategyId,
      pnl,
    );
    await riskManagementService.decrementOpenTrades(
      trade.account.id,
      trade.strategyId,
    );
    await riskManagementService.adjustExposure(
      trade.account.id,
      trade.strategyId,
      -trade.entryPrice * trade.quantity,
    );

    logger.info("Trade closed via API", {
      tradeId,
      exitPrice,
      pnl,
    });

    res
      .status(200)
      .json(createSuccessResponse(updatedTrade, "Trade closed successfully"));
  },
);
