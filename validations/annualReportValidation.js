const { body, param } = require('express-validator');

// Validation for Annual Report
exports.validateAnnualReport = [
  body('label')
    .notEmpty()
    .withMessage('Label is required')
    .isString()
    .withMessage('Label must be a string'),

  body('links')
    .notEmpty()
    .withMessage('Links are required')
    .isString()
    .withMessage('Links must be a string'),
];

// Validation for Annual Report ID
exports.validateAnnualReportId = [
  param('id')
    .isInt()
    .withMessage('Annual Report ID must be an integer'),
];
