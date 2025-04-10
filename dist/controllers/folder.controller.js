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
exports.deleteFolder = exports.updateFolder = exports.getFolderStructure = exports.createFolder = void 0;
const folder_model_1 = require("../models/folder.model");
const file_model_1 = require("../models/file.model");
const createFolder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, parent, description } = req.body;
    const folder = new folder_model_1.Folder({ name, parent, description });
    yield folder.save();
    res.status(201).json(folder);
});
exports.createFolder = createFolder;
// Recursive
const buildFolderTree = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (parentId = null, filters = {}) {
    const folderQuery = { parent: parentId };
    if (filters.name) {
        folderQuery.name = { $regex: filters.name, $options: "i" };
    }
    if (filters.description) {
        folderQuery.description = { $regex: filters.description, $options: "i" };
    }
    if (filters.createdAt) {
        const date = new Date(filters.createdAt);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        folderQuery.createdAt = { $gte: date, $lt: nextDay };
    }
    const folders = yield folder_model_1.Folder.find(folderQuery).lean();
    const foldersWithChildrenAndFiles = yield Promise.all(folders.map((folder) => __awaiter(void 0, void 0, void 0, function* () {
        const children = yield buildFolderTree(folder._id.toString(), filters);
        const fileQuery = { folder: folder._id };
        if (filters.name) {
            fileQuery.name = { $regex: filters.name, $options: "i" };
        }
        if (filters.createdAt) {
            const date = new Date(filters.createdAt);
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);
            fileQuery.createdAt = { $gte: date, $lt: nextDay };
        }
        const files = yield file_model_1.File.find(fileQuery).lean();
        return Object.assign(Object.assign({}, folder), { children,
            files });
    })));
    return foldersWithChildrenAndFiles;
});
const getFolderStructure = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const filters = {
            name: (_a = req.query.name) === null || _a === void 0 ? void 0 : _a.toString(),
            description: (_b = req.query.description) === null || _b === void 0 ? void 0 : _b.toString(),
            createdAt: (_c = req.query.createdAt) === null || _c === void 0 ? void 0 : _c.toString(),
        };
        const folders = yield buildFolderTree(null, filters);
        const files = yield file_model_1.File.find({ folder: null }).lean();
        res.json({ folders, files });
    }
    catch (error) {
        console.error("Error building folder structure:", error);
        res.status(500).json({ error: "Failed to fetch folder structure" });
    }
});
exports.getFolderStructure = getFolderStructure;
const updateFolder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _id = req.params.id;
        const data = req.body;
        const updatedFolder = yield folder_model_1.Folder.findByIdAndUpdate(_id, data, {
            new: true,
        });
        if (!updatedFolder) {
            res.status(404).json({ error: "Folder not found" });
            return;
        }
        res.status(200).json({ message: "Folder updated", folder: updatedFolder });
    }
    catch (error) {
        console.error("Error updating folder:", error);
        res.status(500).json({ error: "Failed to update folder" });
    }
});
exports.updateFolder = updateFolder;
const deleteFolder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _id = req.params.id;
        const result = yield folder_model_1.Folder.deleteOne({ _id });
        yield folder_model_1.Folder.deleteOne({ parent: _id });
        if (result.deletedCount === 0) {
            res.status(404).json({ error: "Folder not found" });
            return;
        }
        res.status(200).json({ message: "Folder deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting folder:", error);
        res.status(500).json({ error: "Failed to delete folder" });
    }
});
exports.deleteFolder = deleteFolder;
