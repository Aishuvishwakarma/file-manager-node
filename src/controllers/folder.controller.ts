import { Request, Response } from "express";
import { FileSystem } from "../models/fileSystem.model"; // updated model
import path from "path";
import fs from "fs/promises";
import { createFolderService, uploadFileService } from "../services/fileSystem.service";

export const createFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    const folder = await createFolderService(req.body);
    res.status(201).json(folder);
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ message: "Failed to create folder" });
  }
};

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
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
    const newFile = await uploadFileService({
      ...file,
      path: relativePath, // Save relative path
    }, folderId || null); // Pass folderId to the service

    res.status(201).json(newFile);
  } catch (error) {
    console.error("File upload failed:", error);
    res.status(500).json({ message: "File upload failed", error });
  }
};

// Recursive
const buildFileSystemTree = async (
  parentId: string | null = null,
  filters: any = {}
): Promise<any[]> => {
  const baseQuery: any = { parent: parentId, type: "folder" };

  if (filters.name) {
    baseQuery.name = { $regex: filters.name, $options: "i" };
  }

  if (filters.description) {
    baseQuery.description = { $regex: filters.description, $options: "i" };
  }

  if (filters.createdAt) {
    const date = new Date(filters.createdAt);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    baseQuery.createdAt = { $gte: date, $lt: nextDay };
  }

  const folders = await FileSystem.find(baseQuery).lean();

  const result = await Promise.all(
    folders.map(async (folder) => {
      // Fetch subfolders and files for this folder
      const children = await buildFileSystemTree(folder._id.toString(), filters);

      const fileQuery: any = { parent: folder._id, type: "file" };

      if (filters.name) {
        fileQuery.name = { $regex: filters.name, $options: "i" };
      }

      if (filters.createdAt) {
        const date = new Date(filters.createdAt);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        fileQuery.createdAt = { $gte: date, $lt: nextDay };
      }

      const files = await FileSystem.find(fileQuery).lean();

      return {
        ...folder,
        children, // nested folders
        files,    // direct files
      };
    })
  );

  return result;
};

export const getFileSystemStructure = async (req: Request, res: Response) => {
  try {
    const filters = {
      name: req.query.name?.toString(),
      description: req.query.description?.toString(),
      createdAt: req.query.createdAt?.toString(),
    };

    // Top-level folders (parent: null)
    const folders = await buildFileSystemTree(null, filters);

    // Top-level files (parent: null)
    const topLevelFilesQuery: any = { parent: null, type: "file" };

    if (filters.name) {
      topLevelFilesQuery.name = { $regex: filters.name, $options: "i" };
    }

    if (filters.createdAt) {
      const date = new Date(filters.createdAt);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      topLevelFilesQuery.createdAt = { $gte: date, $lt: nextDay };
    }

    const topLevelFiles = await FileSystem.find(topLevelFilesQuery).lean();

    res.json({ folders, files: topLevelFiles });
  } catch (error) {
    console.error("Error building file system structure:", error);
    res.status(500).json({ error: "Failed to fetch file system structure" });
  }
};


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

export const updateFolder = async (req: Request, res: Response) => {
  try {
    const _id = req.params.id;
    const data = req.body;

    const updatedFolder = await FileSystem.findOneAndUpdate(
      { _id, type: "folder" },
      data,
      { new: true }
    );

    if (!updatedFolder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    res.status(200).json({ message: "Folder updated", folder: updatedFolder });
  } catch (error) {
    console.error("Error updating folder:", error);
    res.status(500).json({ error: "Failed to update folder" });
  }
};


// Recursive folder deletion helper
const deleteFolderRecursively = async (folderId: string) => {
  const children = await FileSystem.find({ parent: folderId });

  for (const child of children) {
    if (child.type === "folder") {
      await deleteFolderRecursively(child._id.toString());
    } else {
      try {
        const filePath = path.join(__dirname, "..", "..", child.path || "");
        await fs.unlink(filePath);
      } catch (fsError) {
        console.warn(`Could not delete file from disk: ${fsError}`);
      }
      await FileSystem.deleteOne({ _id: child._id });
    }
  }

  await FileSystem.deleteOne({ _id: folderId });
};

export const deleteFileOrFolder = async (req: Request, res: Response) => {
  try {
    const _id = req.params.id;
    const item: any = await FileSystem.findById(_id);

    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    if (item.type === "folder") {
      await deleteFolderRecursively(_id);
      res.status(200).json({ message: "Folder and its contents deleted successfully" });
    } else {
      // Delete file from disk
      try {
        const filePath = path.join(__dirname, "..", "..", item.path || "");
        await fs.unlink(filePath);
      } catch (fsError) {
        console.warn(`Could not delete physical file: ${fsError}`);
      }

      await FileSystem.deleteOne({ _id });
      res.status(200).json({ message: "File deleted successfully" });
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Failed to delete item" });
  }
};
