"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystem = void 0;
const mongoose_1 = require("mongoose");
const fileSystemSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['folder', 'file'], required: true },
    parent: { type: mongoose_1.Types.ObjectId, ref: 'FileSystem', default: null },
    description: { type: String, default: '' },
    path: { type: String },
}, { timestamps: true });
exports.FileSystem = (0, mongoose_1.model)('FileSystem', fileSystemSchema);
