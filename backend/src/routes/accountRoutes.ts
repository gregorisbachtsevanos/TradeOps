import { Router } from "express";
import {
  createAccount,
  getAccount,
  listAccounts,
  getAccountInfo,
  updateAccount,
  deleteAccount,
} from "../controllers/accountController.js";
import { asyncHandler } from "../utils/helpers.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.post("/", asyncHandler(createAccount));
router.get("/", asyncHandler(listAccounts));
router.get("/:accountId", asyncHandler(getAccount));
router.get("/:accountId/info", asyncHandler(getAccountInfo));
router.patch("/:accountId", asyncHandler(updateAccount));
router.delete("/:accountId", asyncHandler(deleteAccount));

export default router;
