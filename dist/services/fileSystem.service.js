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
exports.updateFolderService = exports.deleteFileOrFolderService = exports.deleteFolderRecursively = exports.getFileSystemStructureService = exports.buildFileSystemTree = exports.uploadFileService = exports.createFolderService = exports.createFileSystemEntry = void 0;
const fileSystem_model_1 = require("../models/fileSystem.model");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
// Reusable service for creating a file or folder
const createFileSystemEntry = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const entry = new fileSystem_model_1.FileSystem({
        name: data.name,
        path: data.path,
        type: data.type,
        parent: data.parent || null,
        description: data.description || null,
    });
    return yield entry.save();
});
exports.createFileSystemEntry = createFileSystemEntry;
// Service for creating a folder
const createFolderService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, exports.createFileSystemEntry)({
        name: data.name,
        path: "", // Folders might not have a path if we're not uploading files
        type: "folder",
        parent: data.parent,
        description: data.description,
    });
});
exports.createFolderService = createFolderService;
// Service for uploading a file (this can use the above generic function)
const uploadFileService = (file, folderId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, exports.createFileSystemEntry)({
        name: file.originalname,
        path: file.path,
        type: "file",
        parent: folderId,
    });
});
exports.uploadFileService = uploadFileService;
// Recursive
const buildFileSystemTree = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (parentId = null, filters = {}) {
    const baseQuery = { parent: parentId, type: "folder" };
    if (filters.name) {
        baseQuery.name = { $regex: filters.name, $options: "i" };
    }
    if (filters.description) {
        baseQuery.description = { $regex: filters.description, $options: "i" };
    }
    if (filters.createdAt) {
        const date = new Date(filters.createdAt);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        baseQuery.createdAt = { $gte: date, $lt: nextDay };
    }
    const folders = yield fileSystem_model_1.FileSystem.find(baseQuery).lean();
    const result = yield Promise.all(folders.map((folder) => __awaiter(void 0, void 0, void 0, function* () {
        const children = yield (0, exports.buildFileSystemTree)(folder._id.toString(), filters);
        const fileQuery = { parent: folder._id, type: "file" };
        if (filters.name) {
            fileQuery.name = { $regex: filters.name, $options: "i" };
        }
        if (filters.createdAt) {
            const date = new Date(filters.createdAt);
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);
            fileQuery.createdAt = { $gte: date, $lt: nextDay };
        }
        const files = yield fileSystem_model_1.FileSystem.find(fileQuery).lean();
        return Object.assign(Object.assign({}, folder), { children,
            files });
    })));
    return result;
});
exports.buildFileSystemTree = buildFileSystemTree;
// Service to get the file system structure
const getFileSystemStructureService = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    const folders = yield (0, exports.buildFileSystemTree)(null, filters);
    const topLevelFilesQuery = { parent: null, type: "file" };
    if (filters.name) {
        topLevelFilesQuery.name = { $regex: filters.name, $options: "i" };
    }
    if (filters.createdAt) {
        const date = new Date(filters.createdAt);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        topLevelFilesQuery.createdAt = { $gte: date, $lt: nextDay };
    }
    const topLevelFiles = yield fileSystem_model_1.FileSystem.find(topLevelFilesQuery).lean();
    return { folders, files: topLevelFiles };
});
exports.getFileSystemStructureService = getFileSystemStructureService;
// Service to recursive folder deletion 
const deleteFolderRecursively = (folderId) => __awaiter(void 0, void 0, void 0, function* () {
    const children = yield fileSystem_model_1.FileSystem.find({ parent: folderId });
    for (const child of children) {
        if (child.type === "folder") {
            yield (0, exports.deleteFolderRecursively)(child._id.toString());
        }
        else {
            try {
                const filePath = path_1.default.join(__dirname, "..", "..", child.path || "");
                yield promises_1.default.unlink(filePath);
            }
            catch (fsError) {
                console.warn(`Could not delete file from disk: ${fsError}`);
            }
            yield fileSystem_model_1.FileSystem.deleteOne({ _id: child._id });
        }
    }
    yield fileSystem_model_1.FileSystem.deleteOne({ _id: folderId });
});
exports.deleteFolderRecursively = deleteFolderRecursively;
// Service to delete a file or folder
const deleteFileOrFolderService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const item = yield fileSystem_model_1.FileSystem.findById(id);
    if (!item) {
        throw new Error("Item not found");
    }
    if (item.type === "folder") {
        yield (0, exports.deleteFolderRecursively)(id);
        return { message: "Folder and its contents deleted successfully" };
    }
    else {
        try {
            const filePath = path_1.default.join(__dirname, "..", "..", item.path || "");
            yield promises_1.default.unlink(filePath);
        }
        catch (fsError) {
            console.warn(`Could not delete physical file: ${fsError}`);
        }
        yield fileSystem_model_1.FileSystem.deleteOne({ _id: id });
        return { message: "File deleted successfully" };
    }
});
exports.deleteFileOrFolderService = deleteFileOrFolderService;
// Service to update a folder 
const updateFolderService = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedFolder = yield fileSystem_model_1.FileSystem.findOneAndUpdate({ _id: id, type: "folder" }, data, { new: true });
    if (!updatedFolder) {
        throw new Error("Folder not found");
    }
    return updatedFolder;
});
exports.updateFolderService = updateFolderService;
