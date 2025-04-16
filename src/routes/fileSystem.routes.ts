import express from "express";
import {
  createFolder,
  getFileSystemStructure,
  deleteFileOrFolder,
  updateFolder,
  getFileSystemCounts,
  uploadFile
} from "../controllers/folder.controller";
import { validateSchema } from "../middleware/validate";
import { upload } from "../middleware/uploadMiddleware";
import { createFolderSchema, uploadFileSchema } from "../validations/createFolder.schema";


const router = express.Router();

router.post("/folder", validateSchema(createFolderSchema), createFolder);
router.post('/upload', upload.single('file'), validateSchema(uploadFileSchema), uploadFile);
router.get("/", getFileSystemStructure);
router.get("/count", getFileSystemCounts);
router.delete("/:id", deleteFileOrFolder);
router.patch("/:id", updateFolder);

export default router;
