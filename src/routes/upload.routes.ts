import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadFile } from '../controllers/upload.controller';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'src/uploads',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/', upload.single('file'), uploadFile);

export default router;
