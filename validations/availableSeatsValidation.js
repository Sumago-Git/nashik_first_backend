const { body, param } = require('express-validator');

exports.validateAvailableSeats = [
  body('seatCount').isInt({ min: 1 }).withMessage('Seat count must be a positive integer'),
];

exports.validateAvailableSeatsId = [
  param('id').isInt().withMessage('ID must be an integer'),
];
