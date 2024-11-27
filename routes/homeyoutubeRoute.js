const express = require('express');
const { addhomeyoutube, updatehomeyoutube, gethomeyoutube, isActiveStatus, isDeleteStatus, getActiveHomeYoutube } = require('../controllers/homeyoutubeController');
const { validatehomeyoutube, validatehomeyoutubeId } = require('../validations/homeyoutubeValidation');
const { validationResult } = require('express-validator');
const apiResponse = require('../helper/apiResponse');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Add home counter

router.post('/create-homeyoutube', validatehomeyoutube, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();
}, addhomeyoutube);

// Update home counter
router.put('/update-homeyoutube/:id', authenticateToken, validatehomeyoutubeId, validatehomeyoutube, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();
}, updatehomeyoutube);

// Get home counters
router.get('/get-homeyoutube', getActiveHomeYoutube);
// Get home counters
router.get('/find-homeyoutube', authenticateToken, gethomeyoutube);

// Toggle home counter status
router.put('/isactive-homeyoutube/:id', authenticateToken, validatehomeyoutubeId, isActiveStatus);

// Toggle home counter delete status
router.delete('/delete-homeyoutube/:id', authenticateToken, validatehomeyoutubeId, isDeleteStatus);


module.exports = router;
