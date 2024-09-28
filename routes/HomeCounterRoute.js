const express = require('express');
const { addHomeCounter, updateHomeCounter, getHomeCounter, isActiveStatus, isDeleteStatus } = require('../controllers/HomeCounterController');
const { validateHomeCounter, validateHomeCounterId } = require('../validations/homeCounterValidation');
const { validationResult } = require('express-validator');
const apiResponse = require('../helper/apiResponse');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Add home counter
router.post('/create-homecounter', validateHomeCounter, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();
}, addHomeCounter);

// Update home counter
router.put('/update-homecounter/:id', authenticateToken, validateHomeCounterId, validateHomeCounter, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();
}, updateHomeCounter);

// Get home counters
router.get('/get-homecounter', getHomeCounter);
// Get home counters
router.get('/find-homecounter', authenticateToken, getHomeCounter);

// Toggle home counter status
router.put('/isactive-homecounter/:id', authenticateToken, validateHomeCounterId, isActiveStatus);

// Toggle home counter delete status
router.delete('/delete-homecounter/:id', authenticateToken, validateHomeCounterId, isDeleteStatus);


module.exports = router;
