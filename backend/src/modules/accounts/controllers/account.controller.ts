import { Response } from "express";
import { prisma } from "../../../config/db.js";
import {
  createSuccessResponse,
  AppError,
  asyncHandler,
} from "../../../utils/helpers.js";
import { mt5ConnectorService } from "../../execution/services/mt5Connector.service.js";
import { config } from "../../../config/index.js";
import logger from "../../../config/logger.js";
import { AuthenticatedRequest } from "../../../middleware/auth.js";
import { createAccountSchema } from "../schema/dto/account.dto.js";

const requireCurrentUser = (req: AuthenticatedRequest): string => {
  if (!req.user?.id) {
    throw new AppError(401, "Unauthorized");
  }
  return req.user.id;
};

const assertAccountOwnership = async (
  accountId: string,
  userId: string,
): Promise<{ userId: string; externalId: string }> => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new AppError(404, "Account not found");
  }
  if (account.userId !== userId) {
    throw new AppError(403, "Unauthorized access to account");
  }
  return account as { userId: string; externalId: string };
};

/**
 * POST /accounts
 * Create a new trading account
 */
export const createAccount = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireCurrentUser(req);
    const validatedData = createAccountSchema.parse(req.body);

    const existing = await prisma.account.findUnique({
      where: { externalId: validatedData.externalId },
    });

    if (existing) {
      throw new AppError(400, "Account with this external ID already exists");
    }

    const accountPayload = { ...validatedData };

    if (!config.broker.useMockBroker) {
      const brokerInfo = await mt5ConnectorService.getAccountInfo(
        validatedData.externalId,
      );
      accountPayload.balance = brokerInfo.balance;
      accountPayload.equity = brokerInfo.equity;
    }

    const account = await prisma.account.create({
      data: {
        userId,
        ...accountPayload,
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
export const getAccount = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireCurrentUser(req);
    const { accountId } = req.params;

    const account = await assertAccountOwnership(accountId, userId);

    res.status(200).json(createSuccessResponse(account));
  },
);

/**
 * GET /accounts
 * List accounts for the authenticated user
 */
export const listAccounts = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireCurrentUser(req);

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
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireCurrentUser(req);
    const { accountId } = req.params;

    const account = await assertAccountOwnership(accountId, userId);

    const info = await mt5ConnectorService.getAccountInfo(account.externalId);

    await prisma.account.update({
      where: { id: accountId },
      data: {
        balance: info.balance,
        equity: info.equity,
        exposure: info.exposure,
      },
    });

    res.status(200).json(createSuccessResponse(info));
  },
);

/**
 * PATCH /accounts/:accountId
 * Update account
 */
export const updateAccount = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireCurrentUser(req);
    const { accountId } = req.params;
    const { balance, equity, isActive } = req.body;

    await assertAccountOwnership(accountId, userId);

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
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = requireCurrentUser(req);
    const { accountId } = req.params;

    await assertAccountOwnership(accountId, userId);

    await prisma.account.delete({
      where: { id: accountId },
    });

    logger.info("Account deleted", {
      accountId,
    });

    res
      .status(200)
      .json(createSuccessResponse(null, "Account deleted successfully"));
  },
);
