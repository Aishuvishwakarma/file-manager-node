import { Request, Response } from "express";
import { FileSystem } from "../models/fileSystem.model"; // updated model
import path from "path";
import {
  createFolderService,
  deleteFileOrFolderService,
  getBreadcrumbService,
  getFileSystemStructureService,
  updateFolderService,
  uploadFileService,
} from "../services/fileSystem.service";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

// extended Request type to include user info
interface AuthenticatedRequest extends Request {
  user?: any;
}

// Create a new folder
export const createFolder = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const createdBy = req.user?.userId;
    const folder = await createFolderService({ createdBy, ...req.body });
    res.status(201).json(folder);
  }
);

// Route to upload a file (uses multer middleware for file handling + validation)
export const uploadFile = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { folderId } = req.body;
    const file = req.file;
    const createdBy = req.user?.userId;

    if (!file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    // 🛠️ Extract only relative path (remove absolute system path)
    const relativePath = path.relative(path.join(__dirname, ".."), file.path);

    // ✅ Save only relative path in DB
    const newFile = await uploadFileService(
      {
        ...file,
        path: relativePath, // Save relative path
      },
      folderId || null,
      createdBy
    ); // Pass folderId to the service

    res.status(201).json(newFile);
  }
);

// Route to fetch the full folder/file structure
export const getFileSystemStructure = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const createdBy = req.user?.userId;

    console.log(req.user, "req.user?.userId;");
    const filters = {
      name: req.query.name?.toString(),
      description: req.query.description?.toString(),
      createdAt: req.query.createdAt?.toString(),
      createdBy: createdBy,
    };

    const data = await getFileSystemStructureService(filters);

    res.json(data);
  }
);

// Route to get file/folder counts (e.g., total folders, total files)
export const getFileSystemCounts = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const [folderCount, fileCount] = await Promise.all([
      FileSystem.countDocuments({ type: "folder", createdBy: req.user.userId }),
      FileSystem.countDocuments({ type: "file", createdBy: req.user.userId }),
    ]);

    res.json({
      folders: folderCount,
      files: fileCount,
    });
  }
);

// Route to delete a file or folder by ID
export const updateFolder = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id;
    const data = req.body;

    const folder = await updateFolderService(id, data);

    if (!folder) {
      throw new AppError("Folder not found", 404);
    }

    res.status(200).json({ message: "Folder updated", folder });
  }
);

// Route to update folder details by ID
export const deleteFileOrFolder = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id;
    const result = await deleteFileOrFolderService(id);
    if (!result) {
      throw new AppError("Item not found", 404);
    }
    res.status(200).json(result);
  }
);

// This route is used to get the breadcrumb structure for a specific folder
export const getBreadcrumb = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id;
    const breadcrumb = await getBreadcrumbService(id);
    if (!breadcrumb) {
      throw new AppError("Folder not found", 404);
    }
    res.status(200).json(breadcrumb);
  }
);
