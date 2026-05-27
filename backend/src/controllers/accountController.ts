import { Request, Response } from "express";
import { prisma } from "../db.js";
import { createAccountSchema } from "../utils/validation.js";
import {
  createSuccessResponse,
  AppError,
  asyncHandler,
} from "../utils/helpers.js";
import { mt5ConnectorService } from "../modules/execution/mt5Connector.js";
import logger from "../config/logger.js";

/**
 * POST /accounts
 * Create a new trading account
 */
export const createAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.query.user_id as string;

    if (!userId) {
      throw new AppError(400, "user_id query parameter is required");
    }

    const validatedData = createAccountSchema.parse(req.body);

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    // Check for duplicate external ID
    const existing = await prisma.account.findUnique({
      where: { externalId: validatedData.externalId },
    });

    if (existing) {
      throw new AppError(400, "Account with this external ID already exists");
    }

    const account = await prisma.account.create({
      data: {
        userId,
        ...validatedData,
      },
    });

    logger.info("Account created", {
      accountId: account.id,
      userId,
      externalId: account.externalId,
    });

    res
      .status(201)
      .json(createSuccessResponse(account, "Account created successfully"));
  },
);

/**
 * GET /accounts/:accountId
 * Get account details
 */
export const getAccount = asyncHandler(async (req: Request, res: Response) => {
  const { accountId } = req.params;

  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new AppError(404, "Account not found");
  }

  res.status(200).json(createSuccessResponse(account));
});

/**
 * GET /accounts?user_id=xxx
 * List accounts for a user
 */
export const listAccounts = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.query.user_id as string;

    if (!userId) {
      throw new AppError(400, "user_id query parameter is required");
    }

    const accounts = await prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(createSuccessResponse({ accounts }));
  },
);

/**
 * GET /accounts/:accountId/info
 * Get live account info from MT5
 */
export const getAccountInfo = asyncHandler(
  async (req: Request, res: Response) => {
    const { accountId } = req.params;

    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new AppError(404, "Account not found");
    }

    const info = await mt5ConnectorService.getAccountInfo(account.externalId);

    res.status(200).json(createSuccessResponse(info));
  },
);

/**
 * PATCH /accounts/:accountId
 * Update account
 */
export const updateAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const { accountId } = req.params;
    const { balance, equity, isActive } = req.body;

    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new AppError(404, "Account not found");
    }

    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: {
        ...(balance !== undefined && { balance }),
        ...(equity !== undefined && { equity }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    logger.info("Account updated", {
      accountId,
      changes: Object.keys({ balance, equity, isActive }).filter(
        (k) => req.body[k] !== undefined,
      ),
    });

    res
      .status(200)
      .json(
        createSuccessResponse(updatedAccount, "Account updated successfully"),
      );
  },
);

/**
 * DELETE /accounts/:accountId
 * Delete account
 */
export const deleteAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const { accountId } = req.params;

    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new AppError(404, "Account not found");
    }

    await prisma.account.delete({
      where: { id: accountId },
    });

    logger.info("Account deleted", {
      accountId,
      externalId: account.externalId,
    });

    res
      .status(200)
      .json(createSuccessResponse(null, "Account deleted successfully"));
  },
);
