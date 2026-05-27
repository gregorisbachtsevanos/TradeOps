import { Router } from "express";
import {
  listTrades,
  getTrade,
  getTradeLivePrice,
  closeTrade,
} from "../controllers/tradeController.js";
import { asyncHandler } from "../utils/helpers.js";

const router = Router();

router.get("/", asyncHandler(listTrades));
router.get("/:tradeId", asyncHandler(getTrade));
router.get("/:tradeId/live-price", asyncHandler(getTradeLivePrice));
router.post("/:tradeId/close", asyncHandler(closeTrade));

export default router;
