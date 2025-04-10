import { Request, Response } from "express";
import { Folder } from "../models/folder.model";
import { File } from "../models/file.model";

export const createFolder = async (req: Request, res: Response) => {
  const { name, parent, description } = req.body;
  const folder = new Folder({ name, parent, description });
  await folder.save();
  res.status(201).json(folder);
};

// Recursive
const buildFolderTree: any = async (
  parentId: string | null = null,
  filters: any = {}
) => {
  const folderQuery: any = { parent: parentId };

  if (filters.name) {
    folderQuery.name = { $regex: filters.name, $options: "i" };
  }

  if (filters.description) {
    folderQuery.description = { $regex: filters.description, $options: "i" };
  }

  if (filters.createdAt) {
    const date = new Date(filters.createdAt);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    folderQuery.createdAt = { $gte: date, $lt: nextDay };
  }

  const folders = await Folder.find(folderQuery).lean();

  const foldersWithChildrenAndFiles = await Promise.all(
    folders.map(async (folder) => {
      const children = await buildFolderTree(folder._id.toString(), filters);

      const fileQuery: any = { folder: folder._id };

      if (filters.name) {
        fileQuery.name = { $regex: filters.name, $options: "i" };
      }

      if (filters.createdAt) {
        const date = new Date(filters.createdAt);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        fileQuery.createdAt = { $gte: date, $lt: nextDay };
      }

      const files = await File.find(fileQuery).lean();

      return {
        ...folder,
        children,
        files,
      };
    })
  );

  return foldersWithChildrenAndFiles;
};

export const getFolderStructure = async (req: Request, res: Response) => {
  try {
    const filters = {
      name: req.query.name?.toString(),
      description: req.query.description?.toString(),
      createdAt: req.query.createdAt?.toString(),
    };

    const folders = await buildFolderTree(null, filters);
    const files = await File.find({ folder: null }).lean();
    res.json({ folders, files });
  } catch (error) {
    console.error("Error building folder structure:", error);
    res.status(500).json({ error: "Failed to fetch folder structure" });
  }
};

export const getFolderCount = async (req: Request, res: Response) => {
  const counts = await Folder.countDocuments()
  res.json({ counts });
  return
};

export const updateFolder = async (req: Request, res: Response) => {
  try {
    const _id = req.params.id;
    const data = req.body;

    const updatedFolder = await Folder.findByIdAndUpdate(_id, data, {
      new: true,
    });

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

export const deleteFolder = async (req: Request, res: Response) => {
  try {
    const _id = req.params.id;

    const result = await Folder.deleteOne({ _id });
    await Folder.deleteOne({ parent: _id });

    if (result.deletedCount === 0) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    res.status(200).json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({ error: "Failed to delete folder" });
  }
};
