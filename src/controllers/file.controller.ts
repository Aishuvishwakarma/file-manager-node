import { Request, Response } from "express";
import { File } from "../models/file.model";

export const getFiles = async (req: Request, res: Response) => {
  const { folderId, page = 1, limit = 10 } = req.query;

  const query = folderId ? { folder: folderId } : {};
  const files = await File.find(query)
    .skip((+page - 1) * +limit)
    .limit(+limit);

  const count = await File.countDocuments(query);
  res.json({ files, total: count });
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
