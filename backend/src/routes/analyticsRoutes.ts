import { Router } from "express";
import {
  getStrategyMetrics,
  getAccountMetrics,
  getRecentTrades,
  getDailyPnL,
} from "../controllers/analyticsController.js";
import { asyncHandler } from "../utils/helpers.js";

const router = Router();

router.get("/strategy/:strategyId/metrics", asyncHandler(getStrategyMetrics));
router.get("/account/:accountId/metrics", asyncHandler(getAccountMetrics));
router.get("/account/:accountId/trades", asyncHandler(getRecentTrades));
router.get("/account/:accountId/daily-pnl", asyncHandler(getDailyPnL));

export default router;
