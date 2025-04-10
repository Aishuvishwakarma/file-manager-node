import express from "express";
import {
  createFolder,
  getFolderStructure,
  deleteFolder,
  updateFolder,
  getFolderCount
} from "../controllers/folder.controller";

const router = express.Router();

router.post("/", createFolder);
router.get("/", getFolderStructure);
router.get("/", getFolderCount);
router.delete("/:id", deleteFolder);
router.patch("/:id", updateFolder);

export default router;
