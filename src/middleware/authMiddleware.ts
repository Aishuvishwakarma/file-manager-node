import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

// Define an extended Request type to include user info
interface AuthenticatedRequest extends Request {
  user?: any;
}

// Middleware to protect routes using JWT
export const protect = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token;

    //  Check for token in Authorization header
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new AppError("Not authorized, token missing", 401);
    }

    try {
      // Verify token using secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
      };

      // Get Attach user info to request object
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        throw new AppError("User not found", 404);
      }

      req.user = { userId: user._id };

      next();
    } catch (err) {
      // 5. Invalid token
      throw new AppError("Token verification failed", 401);
    }
  }
);
