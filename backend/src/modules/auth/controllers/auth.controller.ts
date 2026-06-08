import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { isMockMode } from "../../../config/index.js";
import { prisma } from "../../../config/db.js";
import {
  createSuccessResponse,
  AppError,
  asyncHandler,
} from "../../../utils/helpers.js";
import { signJwt, AuthenticatedRequest } from "../../../middleware/auth.js";
import logger from "../../../config/logger.js";
import { loginSchema, registerSchema } from "../dto/auth.dto.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = registerSchema.parse(req.body);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError(409, "User with that email already exists");
  }

  const hashedPassword = isMockMode
    ? password
    : await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });

  const token = signJwt({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  logger.info("New user registered", { userId: user.id, email: user.email });

  res
    .status(201)
    .json(
      createSuccessResponse(
        { token, user: { id: user.id, email: user.email, name: user.name } },
        "Registration successful",
      ),
    );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(401, "Invalid credentials");
  }

  const passwordMatches = isMockMode
    ? user.password === password
    : await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new AppError(401, "Invalid credentials");
  }

  const token = signJwt({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  logger.info("User logged in", { userId: user.id, email: user.email });

  res
    .status(200)
    .json(
      createSuccessResponse(
        { token, user: { id: user.id, email: user.email, name: user.name } },
        "Login successful",
      ),
    );
});

export const me = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      throw new AppError(401, "Unauthorized");
    }

    const { password: _, ...safeUser } = user;

    res.status(200).json(
      createSuccessResponse({
        id: safeUser.id,
        email: safeUser.email,
        name: safeUser.name,
      }),
    );
  },
);
