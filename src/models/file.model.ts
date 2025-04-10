import { Schema, model, Types } from 'mongoose';

const fileSchema = new Schema({
  name: { type: String, required: true },
  path: { type: String, required: true },
  type: { type: String },
  folder: { type: Types.ObjectId, ref: 'Folder', default: null },
  createdAt: { type: Date, default: Date.now },
});

export const File = model('File', fileSchema);
