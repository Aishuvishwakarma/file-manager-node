import { Request, Response } from "express";
import { File } from "../models/file.model";
import fs from "fs/promises";
import path from "path";

export const getFiles = async (req: Request, res: Response) => {
  const { folderId, page = 1, limit = 10 } = req.query;

  const query = folderId ? { folder: folderId } : {};
  const files = await File.find(query)
    .skip((+page - 1) * +limit)
    .limit(+limit);

  const count = await File.countDocuments(query);
  res.json({ files, total: count });
};

export const getFilesCount = async (req: Request, res: Response) => {
  const counts = await File.countDocuments()
  res.json({ counts });
};

export const getFileById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const file = await File.findById(req.params.id);

  if (!file) {
    res.status(404).json({ message: "File not found" });
    return;
  }

  res.status(200).json(file);
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const _id = req.params.id;

    const file: any = await File.findById(_id);
    if (!file) {
      res.status(404).json({ error: "File not found in DB" });
    }
    console.log(file.path);
    const filePath = path.join(__dirname, "..", "..", file.path);
    console.log(filePath);

    try {
      await fs.unlink(filePath);
    } catch (fsError) {
      console.warn(`Could not delete physical file: ${fsError}`);
    }

    await File.deleteOne({ _id });

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
};
