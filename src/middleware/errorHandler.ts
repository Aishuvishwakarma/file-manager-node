import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  // Only show full stack in development
  if (process.env.NODE_ENV === "development") {
    console.error("💥", err);
    res.status(statusCode).json({
      message: err.message,
      stack: err.stack,
    });
    return;  // This ends the middleware chain
  }

  // In production, avoid leaking stack traces
  res.status(statusCode).json({
    message: isOperational ? err.message : "Something went wrong!",
  });
};
