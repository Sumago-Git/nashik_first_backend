const express = require('express');
const {
  addHoliday,
  updateHoliday,
  getHolidays,
  isActiveStatus,
  isDeleteStatus,
} = require('../controllers/HolidayController');
const { validateHolidayId } = require('../validations/holidayValidation'); // Keep this if you have holiday ID validation
const { validationResult } = require('express-validator');
const apiResponse = require('../helper/apiResponse');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Add holiday
router.post('/create-holiday', addHoliday);

// Update holiday
router.put('/holiday/:id', authenticateToken, validateHolidayId, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();
}, updateHoliday);

// Get all holidays
router.get('/get-holidays', getHolidays);
router.get('/find-holidays', authenticateToken, getHolidays);

// Toggle holiday isActive status
router.put('/isactive-holiday/:id', authenticateToken, validateHolidayId, isActiveStatus);

// Using DELETE route for toggling isDelete status
router.put('/toggle-holiday-status', authenticateToken, validateHolidayId, isDeleteStatus);
module.exports = router;
