import { Request, Response } from "express";
import { User } from "../models/user.model";
import { generateToken } from "../utils/generateToken";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
// extended Request type to include user info
interface AuthenticatedRequest extends Request {
  user?: any;
}

// Get Logged In User
export const getUser = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const existingUser = await User.findOne({ _id: req.user.userId });
    // if user not exists
    if (!existingUser) {
      throw new AppError("User not exists", 404);
    }
    res.status(200).json({ user: existingUser });
  }
);
