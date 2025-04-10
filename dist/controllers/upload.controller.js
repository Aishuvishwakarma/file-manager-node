"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const file_model_1 = require("../models/file.model");
const uploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { folderId } = req.body;
    const file = req.file;
    if (!file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
    }
    const newFile = new file_model_1.File({
        name: file.originalname,
        path: file.path,
        type: file.mimetype,
        folder: folderId || null,
    });
    yield newFile.save();
    res.status(201).json(newFile);
});
exports.uploadFile = uploadFile;
