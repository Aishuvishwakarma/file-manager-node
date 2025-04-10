import { Schema, model, Types } from "mongoose";

const folderSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    parent: { type: Types.ObjectId, ref: "Folder", default: null },
  },
  { timestamps: true }
);

export const Folder = model("Folder", folderSchema);
