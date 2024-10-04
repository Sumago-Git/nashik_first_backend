const express = require('express');
const { 
  addAnnualReport, 
  updateAnnualReport, 
  getAnnualReports, 
  toggleActiveStatus, 
  toggleDeleteStatus 
} = require('../controllers/AnnualReportController');
const { validateAnnualReport, validateAnnualReportId } = require('../validations/annualReportValidation');
const { validationResult } = require('express-validator');
const apiResponse = require('../helper/apiResponse');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Add annual report
router.post('/create-annualreport', validateAnnualReport, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();
}, addAnnualReport);

// Update annual report
router.put('/annualreport/:id', authenticateToken, validateAnnualReportId, validateAnnualReport, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();
}, updateAnnualReport);

// Get all annual reports
router.get('/get-annualreports', getAnnualReports);

// Toggle active status
router.put('/isactive-annual/:id', authenticateToken, validateAnnualReportId, toggleActiveStatus);

// Toggle delete status
router.delete('/isdelete-annual/:id', authenticateToken, validateAnnualReportId, toggleDeleteStatus);

module.exports = router;
