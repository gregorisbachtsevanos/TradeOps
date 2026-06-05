import { Response } from "express";
import { prisma } from "../../../config/db.js";

import {
  createSuccessResponse,
  AppError,
  asyncHandler,
} from "../../../utils/helpers.js";
import logger from "../../../config/logger.js";
import { AuthenticatedRequest } from "../../../middleware/auth.js";
import {
  createStrategySchema,
  updateStrategySchema,
} from "../dto/strategy.dto.js";

const requireCurrentUser = (req: AuthenticatedRequest): string => {
  if (!req.user?.id) {
    throw new AppError(401, "Unauthorized");
  }
  return req.user.id;
};

const assertStrategyOwnership = async (
  strategyId: string,
  userId: string,
): Promise<{ userId: string; name: string }> => {
  const strategy = await prisma.strategy.findUnique({
    where: { id: strategyId },
  });

  if (!strategy) {
    throw new AppError(404, "Strategy not found");
  }
  if (strategy.userId !== userId) {
    throw new AppError(403, "Unauthorized access to strategy");
  }
  return strategy as { userId: string; name: string };
};

/**
 * POST /strategies
 * Create a new trading strategy
 */
export const createStrategy = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireCurrentUser(req);
    const validatedData = createStrategySchema.parse(req.body);

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
export const getStrategy = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireCurrentUser(req);
    const { strategyId } = req.params;

    await assertStrategyOwnership(strategyId, userId);

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

    res.status(200).json(createSuccessResponse(strategy));
  },
);

/**
 * GET /strategies
 * List strategies for a user
 */
export const listStrategies = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireCurrentUser(req);

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
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireCurrentUser(req);
    const { strategyId } = req.params;

    await assertStrategyOwnership(strategyId, userId);

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
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireCurrentUser(req);
    const { strategyId } = req.params;

    const strategy = await assertStrategyOwnership(strategyId, userId);

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
