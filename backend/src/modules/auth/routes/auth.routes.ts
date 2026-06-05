import { Router } from "express";
import { asyncHandler } from "../../../utils/helpers.js";
import { register, login, me } from "../index.js";
import { authenticate } from "../../../middleware/auth.js";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", authenticate, asyncHandler(me));

export default router;
