const express = require('express');
const { 
  addAnnualReturn, 
  updateAnnualReturn, 
  getAnnualReturns, 
  toggleActiveStatus, 
  toggleDeleteStatus 
} = require('../controllers/AnnualReturnController');
const { AnnualReturnValidation, AnnualReturnValidationId } = require('../validations/AnnualReturnValidation');
const { validationResult } = require('express-validator');
const apiResponse = require('../helper/apiResponse');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Add annual report
router.post('/create-AnnualReturn', AnnualReturnValidation, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();
}, addAnnualReturn);

// Update annual report
router.put('/AnnualReturn/:id', authenticateToken, AnnualReturnValidationId, AnnualReturnValidation, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();
}, updateAnnualReturn);

// Get all annual reports
router.get('/get-AnnualReturns', getAnnualReturns);

// Toggle active status
router.put('/isactive-annual/:id', authenticateToken, AnnualReturnValidationId, toggleActiveStatus);

// Toggle delete status
router.delete('/isdelete-annual/:id', authenticateToken, AnnualReturnValidationId, toggleDeleteStatus);

module.exports = router;