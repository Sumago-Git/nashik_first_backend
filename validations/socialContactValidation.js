const { body, param } = require('express-validator');

exports.validateSocialContact = [
  body('instagram')
    .optional()
    .isString()
    .withMessage('Instagram handle must be a string'),
  body('facebook')
    .optional()
    .isString()
    .withMessage('Facebook handle must be a string'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address'),
  body('whatsapp')
    .optional()
    .isString()
    .withMessage('WhatsApp number must be a string'),
  body('linkedin')
    .optional()
    .isString()
    .withMessage('LinkedIn handle must be a string'),
];

exports.validateSocialContactId = [
  param('id')
    .isInt()
    .withMessage('SocialContact ID must be an integer'),
];
