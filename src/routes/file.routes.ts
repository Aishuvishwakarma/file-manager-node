import express from "express";
import {
  getFiles,
  deleteFile,
  getFileById,
  getFilesCount,
} from "../controllers/file.controller";

const router = express.Router();

router.get("/", getFiles);
router.get("/count", getFilesCount);
router.get("/:id", getFileById);
router.delete("/:id", deleteFile);

export default router;
