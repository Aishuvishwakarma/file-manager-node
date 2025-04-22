import { Request, Response } from "express";
import { User } from "../models/user.model";
import { generateToken } from "../utils/generateToken";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

// Register
export const register = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });

  // Check if user already exists
  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  const user = await User.create({ email, password });
  const token = generateToken(user._id.toString());

  res.status(201).json({ user: { email: user.email }, token });
});

// Login
export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user: any = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid credentials", 400);
  }

  const token = generateToken(user._id.toString());
  res.status(200).json({ user: { email: user.email }, token });
});
