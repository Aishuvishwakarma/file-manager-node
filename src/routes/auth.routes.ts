import express from "express";
import { register, login } from "../controllers/auth.controller";
import { validateSchema } from "../middleware/validate";
import { createUserSchema } from "../validations/createUser.schema";

const router = express.Router();

router.post("/register", validateSchema(createUserSchema), register);
router.post("/login", validateSchema(createUserSchema), login);

export default router;
