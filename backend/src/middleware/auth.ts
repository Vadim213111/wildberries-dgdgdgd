import { Request, Response, NextFunction } from "express";
import { verifyToken, ApiError, AuthRequest } from "../utils/index.js";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthRequest;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Missing or invalid authorization header");
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyToken(token);
    req.auth = payload;
    next();
  } catch (err) {
    throw new ApiError(401, "Invalid or expired token");
  }
};
