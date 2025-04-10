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
exports.searchFoldersAndFiles = exports.getFolderStructure = exports.createFolder = void 0;
const folder_model_1 = require("../models/folder.model");
const file_model_1 = require("../models/file.model");
const createFolder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, parent, description } = req.body;
    const folder = new folder_model_1.Folder({ name, parent, description });
    yield folder.save();
    res.status(201).json(folder);
});
exports.createFolder = createFolder;
const getFolderStructure = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const folders = yield folder_model_1.Folder.find();
    res.json({ folders });
});
exports.getFolderStructure = getFolderStructure;
// export const getFolderStructure = async (req: Request, res: Response) => {
//   const folders = await Folder.find();
//   const files = await File.find();
//   res.json({ folders, files });
// };
const searchFoldersAndFiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { term, folderId } = req.query;
    const regex = new RegExp(term, "i");
    const folders = yield folder_model_1.Folder.find({ parent: folderId, name: regex });
    const files = yield file_model_1.File.find({ folder: folderId, name: regex });
    res.json({ folders, files });
});
exports.searchFoldersAndFiles = searchFoldersAndFiles;
