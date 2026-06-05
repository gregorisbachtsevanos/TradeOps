import { Router } from "express";
import {
  createStrategy,
  getStrategy,
  listStrategies,
  updateStrategy,
  deleteStrategy,
} from "../index.js";
import { asyncHandler } from "../../../utils/helpers.js";
import { authenticate } from "../../../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.post("/", asyncHandler(createStrategy));
router.get("/", asyncHandler(listStrategies));
router.get("/:strategyId", asyncHandler(getStrategy));
router.patch("/:strategyId", asyncHandler(updateStrategy));
router.delete("/:strategyId", asyncHandler(deleteStrategy));

export default router;
