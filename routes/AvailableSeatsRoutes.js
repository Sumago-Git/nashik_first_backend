const express = require('express');
const { addAvailability, updateAvailability, getAvailability, toggleIsActive, toggleIsDelete } = require('../controllers/AvailableSeatsController');
const { validationResult } = require('express-validator');
const apiResponse = require('../helper/apiResponse');
const authenticateToken = require('../middleware/auth');
const { validateAvailableSeats, validateAvailableSeatsId } = require('../validations/availableSeatsValidation');

const router = express.Router();

// Add slot
router.post('/create-seat', validateAvailableSeats, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();
}, addAvailability);

// Update slot
router.put('/seat/:id', authenticateToken, validateAvailableSeatsId, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  } 
  next();
}, updateAvailability);

// Get all slots
router.get('/get-seat', getAvailability);

// Toggle slot active status
router.put('/isactive-seat/:id', authenticateToken, validateAvailableSeatsId, toggleIsActive);

// Toggle slot delete status (soft delete)
router.delete('/isdelete-seat/:id', authenticateToken, validateAvailableSeatsId, toggleIsDelete);

module.exports = router;
