import express from 'express';
import { getFiles, getFileById } from '../controllers/file.controller';

const router = express.Router();

router.get('/', getFiles);
router.get('/:id', getFileById);

export default router;
