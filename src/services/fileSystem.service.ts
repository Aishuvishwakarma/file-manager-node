import { FileSystem } from "../models/fileSystem.model";
import { CreateFolderDTO } from "../dtos/createFolder.dto";
import path from "path";
import fs from "fs/promises";
import { AppError } from "../utils/AppError";

// Reusable service for creating a file or folder
export const createFileSystemEntry = async (data: {
  name: string;
  path: string;
  type: string;
  parent?: string | null;
  description?: string | null;
}) => {
  const entry = new FileSystem({
    name: data.name,
    path: data.path,
    type: data.type,
    parent: data.parent || null,
    description: data.description || null,
  });

  return await entry.save();
};

// Service for creating a folder
export const createFolderService = async (data: CreateFolderDTO) => {
  if (!data.name) {
    throw new AppError("Folder name is required", 400);
  }
  return await createFileSystemEntry({
    name: data.name,
    path: "", // Folders might not have a path if we're not uploading files
    type: "folder",
    parent: data.parent,
    description: data.description,
  });
};

// Service for uploading a file (this can use the above generic function)
export const uploadFileService = async (
  file: Express.Multer.File,
  folderId: string | null
) => {
  if (!file) {
    throw new AppError("File is required for upload", 400);
  }

  return await createFileSystemEntry({
    name: file.originalname,
    path: file.path,
    type: "file",
    parent: folderId,
  });
};

// Recursive
export const buildFileSystemTree = async (
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
      const children = await buildFileSystemTree(
        folder._id.toString(),
        filters
      );

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
        children,
        files,
      };
    })
  );

  return result;
};
// Service to get the file system structure
export const getFileSystemStructureService = async (filters: any) => {
  const folders = await buildFileSystemTree(null, filters);

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

  return { folders, files: topLevelFiles };
};

// Service to recursive folder deletion
export const deleteFolderRecursively = async (
  folderId: string
): Promise<void> => {
  const children = await FileSystem.find({ parent: folderId });

  for (const child of children) {
    if (child.type === "folder") {
      await deleteFolderRecursively(child._id.toString());
    } else {
      try {
        const filePath = path.join(__dirname, "..", child.path || "");
        await fs.unlink(filePath);
      } catch (fsError) {
        console.warn(`Could not delete file from disk: ${fsError}`);
      }
      await FileSystem.deleteOne({ _id: child._id });
    }
  }

  await FileSystem.deleteOne({ _id: folderId });
};

// Service to delete a file or folder
export const deleteFileOrFolderService = async (
  id: string
): Promise<{ message: string }> => {
  const item: any = await FileSystem.findById(id);

  if (!item) {
    throw new AppError("Item not found", 404);
  }

  if (item.type === "folder") {
    await deleteFolderRecursively(id);
    return { message: "Folder and its contents deleted successfully" };
  } else {
    try {
      const filePath = path.join(__dirname, "..", item.path || "");
      await fs.unlink(filePath);
    } catch (fsError) {
      console.warn(`Could not delete physical file: ${fsError}`);
    }

    await FileSystem.deleteOne({ _id: id });
    return { message: "File deleted successfully" };
  }
};

// Service to update a folder
export const updateFolderService = async (id: string, data: any) => {
  const updatedFolder = await FileSystem.findOneAndUpdate(
    { _id: id, type: "folder" },
    data,
    { new: true }
  );

  if (!updatedFolder) {
    throw new AppError("Folder not found", 404);
  }

  return updatedFolder;
};

// Service to get breadcrumb for a folder
export const getBreadcrumbService = async (folderId: string) => {
  const path = [];
  let current = await FileSystem.findById(folderId).lean();

  if (!current) {
    throw new AppError("Folder not found", 404);
  }

  while (current) {
    path.unshift({
      _id: current._id,
      name: current.name,
    });

    if (!current.parent) break;
    current = await FileSystem.findById(current.parent).lean();
  }

  return path; // ordered from root to clicked folder
};
