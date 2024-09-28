const { body, param } = require('express-validator');

const validateOffice = [
  body('title').notEmpty().withMessage('Title is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('email').isEmail().withMessage('Valid email is required'),
];

const validateOfficeId = [
  param('id').isInt().withMessage('ID must be an integer'),
];

module.exports = { validateOffice, validateOfficeId };
