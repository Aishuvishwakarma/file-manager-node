"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const folder_controller_1 = require("../controllers/folder.controller");
const router = express_1.default.Router();
router.post("/", folder_controller_1.createFolder);
router.post("/", folder_controller_1.getFolderStructure);
router.get("/structure", folder_controller_1.getFolderStructure);
router.get("/search", folder_controller_1.searchFoldersAndFiles);
exports.default = router;
