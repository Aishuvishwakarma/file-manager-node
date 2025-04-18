import express from "express";
import {
  createFolder,
  getFileSystemStructure,
  deleteFileOrFolder,
  updateFolder,
  getFileSystemCounts,
  uploadFile,
  getBreadcrumb
} from "../controllers/folder.controller";
import { validateSchema } from "../middleware/validate";
import { upload } from "../middleware/uploadMiddleware";
import { createFolderSchema, uploadFileSchema } from "../validations/createFolder.schema";

const router = express.Router();

// Route to create a new folder (with validation)
router.post("/folder", validateSchema(createFolderSchema), createFolder);

// Route to upload a file (uses multer middleware for file handling + validation)
router.post("/upload", upload.single("file"), validateSchema(uploadFileSchema), uploadFile);

// Route to fetch the full folder/file structure
router.get("/", getFileSystemStructure);

// Route to get file/folder counts (e.g., total folders, total files)
router.get("/count", getFileSystemCounts);

// Route to delete a file or folder by ID
router.delete("/:id", deleteFileOrFolder);

// Route to update folder details by ID
router.patch("/:id", updateFolder);

// This route is used to get the breadcrumb structure for a specific folder
router.get("/folder/breadcrumb/:id", getBreadcrumb);

export default router;
