// validations/socialContactValidation.js
const { body, param } = require('express-validator');

exports.validateSocialContact = [
  body('facebook').notEmpty().withMessage('Facebook URL is required'),
  body('instagram').notEmpty().withMessage('Instagram URL is required'),
  body('youtube').notEmpty().withMessage('YouTube URL is required'),
  body('twitter').notEmpty().withMessage('Twitter URL is required'),
];

exports.validateSocialContactId = [
  param('id').isInt().withMessage('Invalid Social Contact ID'),
];
