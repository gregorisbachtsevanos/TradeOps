import { Request, Response, NextFunction } from "express";
import { config } from "../config/index.js";
import { AppError } from "../utils/helpers.js";
import logger from "../config/logger.js";

export const validateWebhookSecret = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const passphrase =
    req.body.passphrase ||
    (req.headers["x-webhook-secret"] as string) ||
    (req.headers["x-tradingview-webhook-secret"] as string);

  if (!passphrase || passphrase !== config.trading.webhookSecret) {
    logger.warn("Invalid webhook secret attempted", {
      ip: req.ip,
    });
    throw new AppError(401, "Unauthorized: Invalid webhook secret");
  }

  next();
};

export const validateContentType = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const contentType = req.headers["content-type"];

  if (!contentType || !contentType.includes("application/json")) {
    throw new AppError(400, "Content-Type must be application/json");
  }

  next();
};
