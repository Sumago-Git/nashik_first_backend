const { param } = require('express-validator');

// Remove validation for `holiday_date`
exports.validateHolidayId = [
  // Validate that the holiday ID is numeric
  param('id')
    .isNumeric().withMessage('Invalid holiday ID, must be a number.'),
];
