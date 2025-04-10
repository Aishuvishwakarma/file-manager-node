import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
dotenv.config();
connectDB()
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';

import folderRoutes from './routes/folder.routes';
import fileRoutes from './routes/file.routes';
import uploadRoutes from './routes/upload.routes';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/folders', folderRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/upload', uploadRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));
