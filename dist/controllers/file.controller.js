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
exports.getFileById = exports.getFiles = void 0;
const file_model_1 = require("../models/file.model");
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
