import { Router } from "express";
import {
  createStrategy,
  getStrategy,
  listStrategies,
  updateStrategy,
  deleteStrategy,
} from "../controllers/strategyController.js";
import { asyncHandler } from "../utils/helpers.js";

const router = Router();

router.post("/", asyncHandler(createStrategy));
router.get("/", asyncHandler(listStrategies));
router.get("/:strategyId", asyncHandler(getStrategy));
router.patch("/:strategyId", asyncHandler(updateStrategy));
router.delete("/:strategyId", asyncHandler(deleteStrategy));

export default router;
