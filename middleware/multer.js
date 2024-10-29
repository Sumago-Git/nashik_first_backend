const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define storage for multer with dynamic folder creation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderName = req.baseUrl;  // Dynamic folder name based on the route
    const uploadFolder = `uploads${folderName}`;

    // Ensure the directory exists
    const uploadPath = path.join(__dirname, '..', uploadFolder);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter to allow only certain image types
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
    return cb(new Error('Only image files are allowed'), false);
  }
  cb(null, true);
};

// Multer configuration for handling both single and multiple image uploads
const uploadSingle = multer({ storage, fileFilter }).single('img');
const uploadMultiple = multer({
  storage,
  fileFilter
}).fields([
  { name: 'img1', maxCount: 1 },
  { name: 'img2', maxCount: 1 }
]);
const uploadSinglePDF = multer({ storage, fileFilter }).single('file'); // Change 'img' to 'file'

// Export both configurations
module.exports = { uploadSingle, uploadMultiple, uploadSinglePDF};
