const { body, param } = require('express-validator');

exports.validateBookingForm = [
  body('learningNo').isString().withMessage('Learning number is required and must be a string'),
  body('fname').isString().withMessage('First name is required and must be a string'),
  body('mname').optional().isString().withMessage('Middle name must be a string'),
  body('lname').isString().withMessage('Last name is required and must be a string'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('phone').isString().withMessage('Phone number is required and must be a string'),

  body('slotdate').isString().withMessage('Slot date is required'),
  body('slotsession').isString().withMessage('Slot session is required'),
];

exports.validateBookingFormId = [
  param('id').isInt().withMessage('BookingForm ID must be an integer'),
];