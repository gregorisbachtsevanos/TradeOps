import { NextFunction, Response, Request } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { AppError } from "../utils/helpers.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    let token: string | null = null;

    // First, try to get token from signed cookies (HTTP-only)
    if ((req as any).signedCookies && (req as any).signedCookies.auth_token) {
      token = (req as any).signedCookies.auth_token;
    } else {
      // Fallback to Authorization header for API compatibility
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.replace("Bearer ", "");
      }
    }

    if (!token) {
      throw new AppError(401, "Authorization token is missing");
    }

    const decoded = jwt.verify(token, config.auth.jwtSecret) as JwtPayload;

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(401, "Invalid or expired token");
  }
};

export const signJwt = (payload: {
  userId: string;
  email: string;
  name: string;
}): string => {
  return jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: "8h",
  });
};
