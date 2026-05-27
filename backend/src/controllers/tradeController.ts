import { Request, Response } from "express";
import { prisma } from "../db.js";
import { tradeFilterSchema } from "../utils/validation.js";
import {
  createSuccessResponse,
  AppError,
  asyncHandler,
} from "../utils/helpers.js";
import { mt5ConnectorService } from "../modules/execution/mt5Connector.js";
import logger from "../config/logger.js";

/**
 * GET /trades?account_id=xxx&page=1&limit=20&status=OPEN
 * List trades for an account
 */
export const listTrades = asyncHandler(async (req: Request, res: Response) => {
  const accountId = req.query.account_id as string;

  if (!accountId) {
    throw new AppError(400, "account_id query parameter is required");
  }

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
});

/**
 * GET /trades/:tradeId
 * Get trade details
 */
export const getTrade = asyncHandler(async (req: Request, res: Response) => {
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

  res.status(200).json(createSuccessResponse(trade));
});

/**
 * GET /trades/:tradeId/live-price
 * Get live price and P&L estimate
 */
export const getTradeLivePrice = asyncHandler(
  async (req: Request, res: Response) => {
    const { tradeId } = req.params;

    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
    });

    if (!trade) {
      throw new AppError(404, "Trade not found");
    }

    if (trade.status !== "OPEN") {
      throw new AppError(400, "Trade is not open");
    }

    // Get current price (mock for now)
    const currentPrice = 100 + (Math.random() - 0.5) * 5;
    const pnl = (currentPrice - trade.entryPrice) * trade.quantity;
    const pnlPercent =
      ((currentPrice - trade.entryPrice) / trade.entryPrice) * 100;

    res.status(200).json(
      createSuccessResponse({
        currentPrice,
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
export const closeTrade = asyncHandler(async (req: Request, res: Response) => {
  const { tradeId } = req.params;

  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
  });

  if (!trade) {
    throw new AppError(404, "Trade not found");
  }

  if (trade.status !== "OPEN") {
    throw new AppError(400, "Trade is not open");
  }

  if (!trade.externalTradeId) {
    throw new AppError(400, "Trade has no external ID");
  }

  // Mock exit price
  const exitPrice = 100 + (Math.random() - 0.5) * 5;

  const result = await mt5ConnectorService.closeTrade(
    trade.externalTradeId,
    exitPrice,
  );

  if (!result.success) {
    throw new AppError(500, result.error || "Failed to close trade");
  }

  const pnl = (exitPrice - trade.entryPrice) * trade.quantity;
  const pnlPercent = ((exitPrice - trade.entryPrice) / trade.entryPrice) * 100;

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

  logger.info("Trade closed via API", {
    tradeId,
    exitPrice,
    pnl,
  });

  res
    .status(200)
    .json(createSuccessResponse(updatedTrade, "Trade closed successfully"));
});
