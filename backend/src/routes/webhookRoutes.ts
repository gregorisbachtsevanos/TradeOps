import { Router } from "express";
import {
  receiveTradingViewWebhook,
  webhookStatus,
} from "../controllers/webhookController.js";
import {
  validateWebhookSecret,
  validateContentType,
} from "../middleware/webhookValidation.js";
import { asyncHandler } from "../utils/helpers.js";

const router = Router();

router.post(
  "/tradingview",
  validateContentType,
  validateWebhookSecret,
  asyncHandler(receiveTradingViewWebhook),
);

router.get("/status", webhookStatus);

export default router;
