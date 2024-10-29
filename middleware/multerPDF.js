const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx'); // Make sure to import the xlsx module

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


// File filter to allow only XLSX files
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.xlsx') {
    return cb(new Error('Only XLSX files are allowed'), false);
  }
  cb(null, true);
};

// Multer configuration for handling single XLSX uploads
const uploadSingleXLSX = multer({ storage, fileFilter }).single('file'); // Change 'file' to your desired field name

// Export the XLSX upload configuration
module.exports = { uploadSingleXLSX };

// The upload handler
exports.uploadXLSX = (req, res) => {
  try {
    // Ensure the file is uploaded
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    // Read and parse the uploaded XLSX file
    const filePath = req.file.path; // No need to prepend __dirname here
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Get the first sheet name
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]); // Convert to JSON

    // Log the extracted data (optional)
    console.log(data);

    // Respond with the extracted data
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message); // Provide a more user-friendly error message
  }
};
