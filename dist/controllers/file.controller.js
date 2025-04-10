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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.getFileById = exports.getFiles = void 0;
const file_model_1 = require("../models/file.model");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const getFiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { folderId, page = 1, limit = 10 } = req.query;
    const query = folderId ? { folder: folderId } : {};
    const files = yield file_model_1.File.find(query)
        .skip((+page - 1) * +limit)
        .limit(+limit);
    const count = yield file_model_1.File.countDocuments(query);
    res.json({ files, total: count });
});
exports.getFiles = getFiles;
const getFileById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = yield file_model_1.File.findById(req.params.id);
    if (!file) {
        res.status(404).json({ message: "File not found" });
        return;
    }
    res.status(200).json(file);
});
exports.getFileById = getFileById;
const deleteFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _id = req.params.id;
        const file = yield file_model_1.File.findById(_id);
        if (!file) {
            res.status(404).json({ error: "File not found in DB" });
        }
        console.log(file.path);
        const filePath = path_1.default.join(__dirname, "..", "..", file.path);
        console.log(filePath);
        try {
            yield promises_1.default.unlink(filePath);
        }
        catch (fsError) {
            console.warn(`Could not delete physical file: ${fsError}`);
        }
        yield file_model_1.File.deleteOne({ _id });
        res.status(200).json({ message: "File deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting file:", error);
        res.status(500).json({ error: "Failed to delete file" });
    }
});
exports.deleteFile = deleteFile;
