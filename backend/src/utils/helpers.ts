import { NextFunction, Request, RequestHandler, Response } from "express";
import { IApiResponse } from "../types/index.js";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const createSuccessResponse = <T>(
  data: T,
  message: string = "Success",
): IApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date().toISOString(),
});

export const createErrorResponse = (
  error: string,
  statusCode: number = 400,
): IApiResponse => ({
  success: false,
  error,
  timestamp: new Date().toISOString(),
});

export const asyncHandler =
  (
    fn: (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => Promise<void> | void,
  ): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const isProduction = (): boolean =>
  process.env.NODE_ENV === "production";

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const calculatePositionSize = (
  balance: number,
  riskPercent: number,
  entryPrice: number,
  stopLoss: number,
): number => {
  const riskAmount = balance * (riskPercent / 100);
  const priceRisk = Math.abs(entryPrice - stopLoss);
  if (priceRisk === 0) return 0;
  return riskAmount / priceRisk;
};

export const calculatePnL = (
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  direction: "BUY" | "SELL" = "BUY",
  commission: number = 0,
): { pnl: number; pnlPercent: number } => {
  const priceDifference =
    direction === "BUY" ? exitPrice - entryPrice : entryPrice - exitPrice;
  const pnl = priceDifference * quantity - commission;
  const pnlPercent = (priceDifference / entryPrice) * 100;
  return { pnl, pnlPercent };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isDuplicate = (
  previousSignals: Array<{ symbol: string; action: string; timestamp: Date }>,
  currentSignal: { symbol: string; action: string; timestamp: Date },
  windowMinutes: number = 5,
): boolean => {
  const windowMs = windowMinutes * 60 * 1000;
  return previousSignals.some(
    (sig) =>
      sig.symbol === currentSignal.symbol &&
      sig.action === currentSignal.action &&
      new Date(sig.timestamp).getTime() >
        currentSignal.timestamp.getTime() - windowMs,
  );
};
