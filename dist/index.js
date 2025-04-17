"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const fileSystem_routes_1 = __importDefault(require("./routes/fileSystem.routes"));
dotenv_1.default.config(); // Load environment variables from .env file
(0, db_1.default)(); // Custom function to connect to MongoDB
const app = (0, express_1.default)();
// Enable Cross-Origin Resource Sharing
app.use((0, cors_1.default)());
// Middleware to parse JSON request bodies
app.use(express_1.default.json());
// Middleware to parse URL-encoded data
app.use(express_1.default.urlencoded({ extended: true }));
// Serve uploaded files statically from the "uploads" directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Register file system-related routes under /api/file-system
app.use('/api/file-system', fileSystem_routes_1.default);
// Set the server port from environment or use 5000 as default
const PORT = process.env.PORT || 5000;
// Connect to MongoDB and start the Express server
mongoose_1.default
    .connect(process.env.MONGO_URI)
    .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
    .catch((err) => console.error(err));
