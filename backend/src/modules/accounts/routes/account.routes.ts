import { Router } from "express";

import { authenticate } from "../../../middleware/auth.js";
import { asyncHandler } from "../../../utils/helpers.js";
import {
  createAccount,
  deleteAccount,
  getAccount,
  getAccountInfo,
  listAccounts,
  updateAccount,
} from "../index.js";

const router = Router();
router.use(authenticate);

router.post("/", asyncHandler(createAccount));
router.get("/", asyncHandler(listAccounts));
router.get("/:accountId", asyncHandler(getAccount));
router.get("/:accountId/info", asyncHandler(getAccountInfo));
router.patch("/:accountId", asyncHandler(updateAccount));
router.delete("/:accountId", asyncHandler(deleteAccount));

export default router;
