import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import fileSystemRoutes from "./routes/fileSystem.routes";

dotenv.config(); // Load environment variables from .env file

connectDB(); // Custom function to connect to MongoDB

const app = express();

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Register file system-related routes under /api/file-system
app.use("/api/file-system", fileSystemRoutes);

// Set the server port from environment or use 5000 as default
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start the Express server
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));
