import { Request, Response } from "express";
import { prisma } from "../db.js";
import {
  createStrategySchema,
  updateStrategySchema,
} from "../utils/validation.js";
import {
  createSuccessResponse,
  AppError,
  asyncHandler,
} from "../utils/helpers.js";
import logger from "../config/logger.js";

/**
 * POST /strategies
 * Create a new trading strategy
 */
export const createStrategy = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.query.user_id as string;

    if (!userId) {
      throw new AppError(400, "user_id query parameter is required");
    }

    const validatedData = createStrategySchema.parse(req.body);

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    const strategy = await prisma.strategy.create({
      data: {
        userId,
        ...validatedData,
      },
    });

    logger.info("Strategy created", {
      strategyId: strategy.id,
      userId,
      name: strategy.name,
    });

    res
      .status(201)
      .json(createSuccessResponse(strategy, "Strategy created successfully"));
  },
);

/**
 * GET /strategies/:strategyId
 * Get strategy details
 */
export const getStrategy = asyncHandler(async (req: Request, res: Response) => {
  const { strategyId } = req.params;

  const strategy = await prisma.strategy.findUnique({
    where: { id: strategyId },
    include: {
      _count: {
        select: {
          trades: true,
          signals: true,
        },
      },
    },
  });

  if (!strategy) {
    throw new AppError(404, "Strategy not found");
  }

  res.status(200).json(createSuccessResponse(strategy));
});

/**
 * GET /strategies?user_id=xxx
 * List strategies for a user
 */
export const listStrategies = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.query.user_id as string;

    if (!userId) {
      throw new AppError(400, "user_id query parameter is required");
    }

    const strategies = await prisma.strategy.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            trades: true,
            signals: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(createSuccessResponse({ strategies }));
  },
);

/**
 * PATCH /strategies/:strategyId
 * Update strategy
 */
export const updateStrategy = asyncHandler(
  async (req: Request, res: Response) => {
    const { strategyId } = req.params;

    const strategy = await prisma.strategy.findUnique({
      where: { id: strategyId },
    });

    if (!strategy) {
      throw new AppError(404, "Strategy not found");
    }

    const validatedData = updateStrategySchema.parse(req.body);

    const updatedStrategy = await prisma.strategy.update({
      where: { id: strategyId },
      data: validatedData,
    });

    logger.info("Strategy updated", {
      strategyId,
      changes: Object.keys(validatedData),
    });

    res
      .status(200)
      .json(
        createSuccessResponse(updatedStrategy, "Strategy updated successfully"),
      );
  },
);

/**
 * DELETE /strategies/:strategyId
 * Delete strategy
 */
export const deleteStrategy = asyncHandler(
  async (req: Request, res: Response) => {
    const { strategyId } = req.params;

    const strategy = await prisma.strategy.findUnique({
      where: { id: strategyId },
    });

    if (!strategy) {
      throw new AppError(404, "Strategy not found");
    }

    await prisma.strategy.delete({
      where: { id: strategyId },
    });

    logger.info("Strategy deleted", {
      strategyId,
      name: strategy.name,
    });

    res
      .status(200)
      .json(createSuccessResponse(null, "Strategy deleted successfully"));
  },
);
