// /routes/annualReportRoutes.js

const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { validationResult } = require('express-validator');
const apiResponse = require('../helper/apiResponse');
const authenticateToken = require('../middleware/auth'); // Assuming you have an auth middleware
const {
  addAnnualReport,
  updateAnnualReport,
  getAnnualReports,
  toggleIsActive,
  toggleIsDelete,
} = require('../controllers/annualReportController');
const {
  validateAnnualReport,
  validateAnnualReportId,
} = require('../validations/annualReportValidation');

// Add Annual Report
router.post(
  '/create-annualreport',
  authenticateToken, // Protect the route
  upload.single('pdf'), // 'pdf' is the field name in the form
  validateAnnualReport, // Validate request body
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If a file was uploaded but validation failed, delete the uploaded file
      if (req.file) {
        const fs = require('fs');
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Failed to delete uploaded file after validation error:', err);
        });
      }
      return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
    }
    next();
  },
  addAnnualReport
);

// Update Annual Report
router.put(
  '/update-annualreport/:id',
  authenticateToken, // Protect the route
  upload.single('pdf'), // Allow updating the PDF
  validateAnnualReportId, // Validate ID parameter
  validateAnnualReport, // Validate request body
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If a file was uploaded but validation failed, delete the uploaded file
      if (req.file) {
        const fs = require('fs');
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Failed to delete uploaded file after validation error:', err);
        });
      }
      return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
    }
    next();
  },
  updateAnnualReport
);

// Get All Annual Reports
router.get('/get-annualreports', authenticateToken, getAnnualReports);

// Toggle isActive Status
router.put(
  '/toggle-isactive/:id',
  authenticateToken,
  validateAnnualReportId,
  toggleIsActive
);

// Toggle isDelete Status
router.delete(
  '/toggle-isdelete/:id',
  authenticateToken,
  validateAnnualReportId,
  toggleIsDelete
);

module.exports = router;
