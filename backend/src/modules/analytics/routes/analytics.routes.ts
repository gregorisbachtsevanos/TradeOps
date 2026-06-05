import { Router } from "express";
import {
  getStrategyMetrics,
  getAccountMetrics,
  getRecentTrades,
  getDailyPnL,
} from "../index.js";
import { asyncHandler } from "../../../utils/helpers.js";
import { authenticate } from "../../../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.get("/strategy/:strategyId/metrics", asyncHandler(getStrategyMetrics));
router.get("/account/:accountId/metrics", asyncHandler(getAccountMetrics));
router.get("/account/:accountId/trades", asyncHandler(getRecentTrades));
router.get("/account/:accountId/daily-pnl", asyncHandler(getDailyPnL));

export default router;
