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

// Create a new folder
export const createFolder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const folder = await createFolderService(req.body);
    res.status(201).json(folder);
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ message: "Failed to create folder" });
  }
};

// Route to upload a file (uses multer middleware for file handling + validation)
export const uploadFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { folderId } = req.body;
    const file = req.file;

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
      folderId || null
    ); // Pass folderId to the service

    res.status(201).json(newFile);
  } catch (error) {
    console.error("File upload failed:", error);
    res.status(500).json({ message: "File upload failed", error });
  }
};

// Route to fetch the full folder/file structure
export const getFileSystemStructure = async (req: Request, res: Response) => {
  try {
    const filters = {
      name: req.query.name?.toString(),
      description: req.query.description?.toString(),
      createdAt: req.query.createdAt?.toString(),
    };

    const data = await getFileSystemStructureService(filters);

    res.json(data);
  } catch (error) {
    console.error("Error building file system structure:", error);
    res.status(500).json({ error: "Failed to fetch file system structure" });
  }
};

// Route to get file/folder counts (e.g., total folders, total files)
export const getFileSystemCounts = async (req: Request, res: Response) => {
  try {
    const [folderCount, fileCount] = await Promise.all([
      FileSystem.countDocuments({ type: "folder" }),
      FileSystem.countDocuments({ type: "file" }),
    ]);

    res.json({
      folders: folderCount,
      files: fileCount,
    });
  } catch (error) {
    console.error("Error getting file system counts:", error);
    res.status(500).json({ error: "Failed to get file system counts" });
  }
};

// Route to delete a file or folder by ID
export const updateFolder = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const folder = await updateFolderService(id, data);

    res.status(200).json({ message: "Folder updated", folder });
  } catch (error: any) {
    const status = error.message === "Folder not found" ? 404 : 500;
    console.error("Error updating folder:", error);
    res
      .status(status)
      .json({ error: error.message || "Failed to update folder" });
  }
};

// Route to update folder details by ID
export const deleteFileOrFolder = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const result = await deleteFileOrFolderService(id);
    res.status(200).json(result);
  } catch (error: any) {
    const status = error.message === "Item not found" ? 404 : 500;
    res
      .status(status)
      .json({ error: error.message || "Failed to delete item" });
  }
};

// This route is used to get the breadcrumb structure for a specific folder
export const getBreadcrumb = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const breadcrumb = await getBreadcrumbService(id);
    if (!breadcrumb) {
      res.status(404).json({ message: "Folder not found" });
    }
    res.status(200).json(breadcrumb);
  } catch (error) {
    console.error("Error getting breadcrumb:", error);
    res.status(500).json({ message: "Failed to get breadcrumb" });
  }
};
