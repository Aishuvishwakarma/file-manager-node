"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Folder = void 0;
const mongoose_1 = require("mongoose");
const folderSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, default: "" },
    parent: { type: mongoose_1.Types.ObjectId, ref: "Folder", default: null },
}, { timestamps: true });
exports.Folder = (0, mongoose_1.model)("Folder", folderSchema);
