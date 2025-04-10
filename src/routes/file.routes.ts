import express from "express";
import {
  getFiles,
  deleteFile,
  getFileById,
} from "../controllers/file.controller";

const router = express.Router();

router.get("/", getFiles);
router.get("/:id", getFileById);
router.delete("/:id", deleteFile);

export default router;
