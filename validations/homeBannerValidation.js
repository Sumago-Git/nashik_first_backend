// validations/homeBannerValidation.js

const { param } = require('express-validator');

const validateHomeBannerId = [
  param('id').isInt().withMessage('ID must be an integer'),
];

module.exports = { validateHomeBannerId };
