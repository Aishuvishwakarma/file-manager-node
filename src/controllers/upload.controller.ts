import { Request, Response } from 'express';
import { File } from '../models/file.model';

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
    const { folderId } = req.body;
    const file = req.file;
  
    if (!file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
  
    const newFile = new File({
      name: file.originalname,
      path: file.path,
      type: file.mimetype,
      folder: folderId || null,
    });
  
    await newFile.save();
  
    res.status(201).json(newFile);
  };
  
