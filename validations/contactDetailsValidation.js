const { body, param } = require('express-validator');

exports.validateContactDetails = [
  body('email').optional().isEmail().withMessage('Invalid email address'),
  body('phone').optional().isString().withMessage('Invalid phone number'),
  body('address').optional().isString().withMessage('Invalid address'),
  body('whatsapp').optional().isString().withMessage('Invalid address'),
];

exports.validateContactDetailsId = [
  param('id').isInt().withMessage('Invalid ID'),
];
