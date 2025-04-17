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
exports.deleteFileOrFolder = exports.updateFolder = exports.getFileSystemCounts = exports.getFileSystemStructure = exports.uploadFile = exports.createFolder = void 0;
const fileSystem_model_1 = require("../models/fileSystem.model"); // updated model
const path_1 = __importDefault(require("path"));
const fileSystem_service_1 = require("../services/fileSystem.service");
// Create a new folder
const createFolder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const folder = yield (0, fileSystem_service_1.createFolderService)(req.body);
        res.status(201).json(folder);
    }
    catch (error) {
        console.error("Error creating folder:", error);
        res.status(500).json({ message: "Failed to create folder" });
    }
});
exports.createFolder = createFolder;
// Route to upload a file (uses multer middleware for file handling + validation)
const uploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { folderId } = req.body;
        const file = req.file;
        if (!file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }
        // 🛠️ Extract only relative path (remove absolute system path)
        const relativePath = path_1.default.relative(path_1.default.join(__dirname, ".."), file.path);
        // ✅ Save only relative path in DB
        const newFile = yield (0, fileSystem_service_1.uploadFileService)(Object.assign(Object.assign({}, file), { path: relativePath }), folderId || null); // Pass folderId to the service
        res.status(201).json(newFile);
    }
    catch (error) {
        console.error("File upload failed:", error);
        res.status(500).json({ message: "File upload failed", error });
    }
});
exports.uploadFile = uploadFile;
// Route to fetch the full folder/file structure
const getFileSystemStructure = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const filters = {
            name: (_a = req.query.name) === null || _a === void 0 ? void 0 : _a.toString(),
            description: (_b = req.query.description) === null || _b === void 0 ? void 0 : _b.toString(),
            createdAt: (_c = req.query.createdAt) === null || _c === void 0 ? void 0 : _c.toString(),
        };
        const data = yield (0, fileSystem_service_1.getFileSystemStructureService)(filters);
        res.json(data);
    }
    catch (error) {
        console.error("Error building file system structure:", error);
        res.status(500).json({ error: "Failed to fetch file system structure" });
    }
});
exports.getFileSystemStructure = getFileSystemStructure;
// Route to get file/folder counts (e.g., total folders, total files)
const getFileSystemCounts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [folderCount, fileCount] = yield Promise.all([
            fileSystem_model_1.FileSystem.countDocuments({ type: "folder" }),
            fileSystem_model_1.FileSystem.countDocuments({ type: "file" }),
        ]);
        res.json({
            folders: folderCount,
            files: fileCount,
        });
    }
    catch (error) {
        console.error("Error getting file system counts:", error);
        res.status(500).json({ error: "Failed to get file system counts" });
    }
});
exports.getFileSystemCounts = getFileSystemCounts;
// Route to delete a file or folder by ID
const updateFolder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const data = req.body;
        const folder = yield (0, fileSystem_service_1.updateFolderService)(id, data);
        res.status(200).json({ message: "Folder updated", folder });
    }
    catch (error) {
        const status = error.message === "Folder not found" ? 404 : 500;
        console.error("Error updating folder:", error);
        res.status(status).json({ error: error.message || "Failed to update folder" });
    }
});
exports.updateFolder = updateFolder;
// Route to update folder details by ID
const deleteFileOrFolder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const result = yield (0, fileSystem_service_1.deleteFileOrFolderService)(id);
        res.status(200).json(result);
    }
    catch (error) {
        const status = error.message === "Item not found" ? 404 : 500;
        res.status(status).json({ error: error.message || "Failed to delete item" });
    }
});
exports.deleteFileOrFolder = deleteFileOrFolder;
