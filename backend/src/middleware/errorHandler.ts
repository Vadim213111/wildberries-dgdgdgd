import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/index.js";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
    });
  }

  res.status(500).json({
    error: "Internal server error",
    statusCode: 500,
  });
};
