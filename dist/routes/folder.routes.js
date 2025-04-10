"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const folder_controller_1 = require("../controllers/folder.controller");
const router = express_1.default.Router();
router.post("/", folder_controller_1.createFolder);
router.get("/", folder_controller_1.getFolderStructure);
router.delete("/:id", folder_controller_1.deleteFolder);
router.patch("/:id", folder_controller_1.updateFolder);
exports.default = router;
