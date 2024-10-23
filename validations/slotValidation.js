const { body, param } = require('express-validator');

exports.validateSlot = [
  body('time').notEmpty().withMessage('Time is required'),
  body('sessions').notEmpty().withMessage('Sessions is required'),
];

exports.validateSlotId = [
    param('id').isInt().withMessage('ID must be an integer'),
  ];
