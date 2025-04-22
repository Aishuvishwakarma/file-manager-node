import express from "express";
import { getUser } from "../controllers/user.controller";
import { protect } from "../middleware/authMiddleware";
const router = express.Router();

// Middleware to protect routes (authentication)
router.use(protect);

// Route to get the logged-in user's information
router.get("/", getUser);

export default router;
