// /validations/annualReportValidation.js

const { body, param } = require('express-validator');

// Validation for AnnualReport ID
exports.AnnualReturnValidationId = [
  param('id')
    .exists().withMessage('ID parameter is required')
    .isInt().withMessage('ID must be an integer'),
];

// Validation for AnnualReport Fields
exports.AnnualReturnValidation = [
  body('financialYear')
    .notEmpty().withMessage('Financial Year is required')
  // Since PDF upload is handled by Multer, no need to validate here
  // However, if you want to ensure that a PDF is uploaded during creation, handle it in the controller
];
