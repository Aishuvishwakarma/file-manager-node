import { FileSystem } from "../models/fileSystem.model";
import { CreateFolderDTO } from "../dtos/createFolder.dto";

// Reusable service for creating a file or folder
export const createFileSystemEntry = async (data: { name: string; path: string; type: string; parent?: string | null; description?: string | null }) => {
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
  return await createFileSystemEntry({
    name: data.name,
    path: "", // Folders might not have a path if we're not uploading files
    type: "folder",
    parent: data.parent,
    description: data.description,
  });
};

// Service for uploading a file (this can use the above generic function)
export const uploadFileService = async (file: Express.Multer.File, folderId: string | null) => {
  return await createFileSystemEntry({
    name: file.originalname,
    path: file.path,
    type: "file",
    parent: folderId,
  });
};
