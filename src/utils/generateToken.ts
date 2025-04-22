import jwt from "jsonwebtoken";
import { fileSystemConfig } from "../config/fileSystem.config";

export const generateToken = (userId: string): string => {
  const secret = fileSystemConfig.JWT_SECRET;
  const expiry = fileSystemConfig.JWT_EXPIRY_IN || "7d";

  if (!secret || !expiry) {
    throw new Error("JWT_SECRET or JWT_EXPIRY_IN not defined in environment variables");
  }

  return jwt.sign({ userId }, secret, {
    expiresIn: "7d",
  });
};
