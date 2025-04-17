"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const folder_controller_1 = require("../controllers/folder.controller");
const validate_1 = require("../middleware/validate");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const createFolder_schema_1 = require("../validations/createFolder.schema");
const router = express_1.default.Router();
router.post("/folder", (0, validate_1.validateSchema)(createFolder_schema_1.createFolderSchema), folder_controller_1.createFolder);
router.post('/upload', uploadMiddleware_1.upload.single('file'), (0, validate_1.validateSchema)(createFolder_schema_1.uploadFileSchema), folder_controller_1.uploadFile);
router.get("/", folder_controller_1.getFileSystemStructure);
router.get("/count", folder_controller_1.getFileSystemCounts);
router.delete("/:id", folder_controller_1.deleteFileOrFolder);
router.patch("/:id", folder_controller_1.updateFolder);
exports.default = router;
