"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const file_controller_1 = require("../controllers/file.controller");
const router = express_1.default.Router();
router.get("/", file_controller_1.getFiles);
router.get("/:id", file_controller_1.getFileById);
router.delete("/:id", file_controller_1.deleteFile);
exports.default = router;
