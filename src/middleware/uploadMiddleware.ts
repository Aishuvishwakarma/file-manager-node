import multer from "multer";
import path from "path";

// Set up multer storage engine to store files in a specific directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));  // Store files in the "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);  // Give each file a unique name
  },
});

// Initialize multer with the storage configuration
export const upload = multer({ storage });
