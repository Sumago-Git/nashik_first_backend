const { body, param } = require('express-validator');

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

exports.validateAnnualReportId = [
  param('id')
    .isInt()
    .withMessage('AnnualReport ID must be an integer'),
];
