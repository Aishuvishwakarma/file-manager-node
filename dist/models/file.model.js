"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.File = void 0;
const mongoose_1 = require("mongoose");
const fileSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    path: { type: String, required: true },
    type: { type: String },
    folder: { type: mongoose_1.Types.ObjectId, ref: 'Folder', default: null },
    createdAt: { type: Date, default: Date.now },
});
exports.File = (0, mongoose_1.model)('File', fileSchema);
