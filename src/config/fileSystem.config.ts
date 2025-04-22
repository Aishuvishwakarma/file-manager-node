export const fileSystemConfig = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY_IN: process.env.JWT_EXPIRY_IN || "7d",
};
