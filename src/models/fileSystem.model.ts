import { Schema, model, Types } from "mongoose";

const fileSystemSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["folder", "file"], required: true },
    parent: { type: Types.ObjectId, ref: "FileSystem", default: null },
    description: { type: String, default: "" },
    path: { type: String },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const FileSystem = model("FileSystem", fileSystemSchema);
