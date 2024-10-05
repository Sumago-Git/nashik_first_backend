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
} = require('../controllers/AnnualReportController');
const {
  validateAnnualReport,
  validateAnnualReportId,
} = require('../validations/annualReportValidation');

// Add Annual Report
router.post(
  '/create-annualreport',
  authenticateToken,
  upload.single('pdf'),
  (req, res, next) => {
    if (req.fileValidationError) {
      return apiResponse.validationErrorWithData(res, 'Validation Error', [{ msg: req.fileValidationError }]);
    }
    if (!req.file) {
      return apiResponse.validationErrorWithData(res, 'Validation Error', [{ msg: 'PDF file is required' }]);
    }
    next();
  },
  validateAnnualReport,
  addAnnualReport
);

// Update Annual Report
exports.updateAnnualReport = async (req, res) => {
  try {
    const { id } = req.params;
    const annualReport = await AnnualReport.findByPk(id);

    if (!annualReport) {
      return apiResponse.notFoundResponse(res, 'Annual Report not found');
    }

    const { financialYear } = req.body;
    let pdfPath = annualReport.links; // Existing PDF path

    if (req.file) {
      // Optionally, delete the old PDF file from the server
      if (annualReport.links) {
        fs.unlink(path.resolve(annualReport.links), (err) => {
          if (err) console.error('Failed to delete old PDF:', err);
        });
      }
      pdfPath = req.file.path.replace(/\\/g, '/'); // Update to new file path
    }

    // Update fields
    annualReport.financialYear = financialYear;
    annualReport.links = pdfPath;

    await annualReport.save();

    return apiResponse.successResponseWithData(
      res,
      'Annual Report updated successfully',
      annualReport
    );
  } catch (error) {
    console.error('Update Annual Report failed:', error);
    return apiResponse.ErrorResponse(res, 'Update Annual Report failed');
  }
};

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
