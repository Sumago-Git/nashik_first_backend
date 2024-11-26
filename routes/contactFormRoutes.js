const express = require("express");
const {
  addContactForm,
  updateContactForm,
  getContactForms,
  isActiveStatus,
  isDeleteStatus,
} = require("../controllers/ContactFormController");
const { validationResult } = require("express-validator");
const apiResponse = require("../helper/apiResponse");
const authenticateToken = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Create the uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "../uploads/contactform");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Specify the directory to save the files
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, ""); // Remove unwanted characters
    cb(null, `${uniqueSuffix}-${sanitizedFilename}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only .jpeg, .png, and .pdf files are allowed as suggestion files"),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

// Middleware for validating request body and file upload
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(
      res,
      "Validation Error",
      errors.array()
    );
  }
  next();
};

// Add contact form with file upload
router.post(
  "/create-contactform",
  upload.single("suggestionfile"), // Multer middleware
  validateRequest, // Validation middleware
  (req, res, next) => {
    if (req.file) {
      req.body.suggestionfile = req.file.path; // Add file path to request body
    }
    next();
  },
  addContactForm
);

// Update contact form with file upload
router.put(
  "/update-contactform/:id",
  authenticateToken,
  upload.single("suggestionfile"), // Multer middleware
  validateRequest, // Validation middleware
  (req, res, next) => {
    if (req.file) {
      req.body.suggestionfile = req.file.path; // Add file path to request body
    }
    next();
  },
  updateContactForm
);

// Get all contact forms
router.get("/get-contactforms", getContactForms);

// Toggle contact form status (isActive)
router.put("/isactive-contactform/:id", authenticateToken, isActiveStatus);

// Toggle contact form delete status (isDelete)
router.delete("/delete-contactform/:id", authenticateToken, isDeleteStatus);

module.exports = router;
