const express = require('express');
const { addhomeyoutube, updatehomeyoutube, gethomeyoutube, isActiveStatus, isDeleteStatus } = require('../controllers/homeyoutubeController');
// const { validateHomeCounter, validateHomeCounterId } = require('../validations/homeCounterValidation');
const { validateHomeCounter, validateHomeCounterId } = require('../validations/homeCounterValidation');

const { validationResult } = require('express-validator');
const apiResponse = require('../helper/apiResponse');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Add homeyoutube
router.post('/create-homeyoutube', validateHomeCounter, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();
}, addhomeyoutube);

// Update homeyoutube
router.put('/update-homeyoutube/:id', authenticateToken, validateHomeCounterId, validateHomeCounter, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();
}, updatehomeyoutube);

// Get homeyoutubes
router.get('/get-homeyoutube', gethomeyoutube);
// Get homeyoutubes
router.get('/find-homeyoutube', authenticateToken, gethomeyoutube);

// Toggle homeyoutube status
router.put('/isactive-homeyoutube/:id', authenticateToken, validateHomeCounterId, isActiveStatus);

// Toggle homeyoutube delete status
router.delete('/delete-homeyoutube/:id', authenticateToken, validateHomeCounterId, isDeleteStatus);


module.exports = router;
