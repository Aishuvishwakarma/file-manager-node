import { Request, Response } from "express";
import { Folder } from "../models/folder.model";
import { File } from "../models/file.model";

export const createFolder = async (req: Request, res: Response) => {
  const { name, parent, description } = req.body;
  const folder = new Folder({ name, parent, description });
  await folder.save();
  res.status(201).json(folder);
};

// Recursive function to get children
const buildFolderTree: any = async (parentId: string | null = null) => {
  const folders = await Folder.find({ parent: parentId }).lean();

  // For each folder, fetch its children recursively
  const foldersWithChildren = await Promise.all(
    folders.map(async (folder) => {
      const children = await buildFolderTree(folder._id.toString());
      return { ...folder, children };
    })
  );

  return foldersWithChildren;
};

export const getFolderStructure = async (req: Request, res: Response) => {
  try {
    const tree = await buildFolderTree(null); // Start from root folders (parent: null)
    res.json({ folders: tree });
  } catch (error) {
    console.error("Error building folder structure:", error);
    res.status(500).json({ error: "Failed to fetch folder structure" });
  }
};

export const updateFolder = async (req: Request, res: Response) => {
  try {
    const _id = req.params.id;
    const data = req.body;

    const updatedFolder = await Folder.findByIdAndUpdate(_id, data, { new: true });

    if (!updatedFolder) {
      res.status(404).json({ error: "Folder not found" })
      return
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
      return
    }

    res.status(200).json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({ error: "Failed to delete folder" });
  }
};
