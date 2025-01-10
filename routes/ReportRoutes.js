const express = require('express');
const { Id } = require('../validations/slotValidation'); // Assuming validations are similar
const apiResponse = require('../helper/apiResponse');
const authenticateToken = require('../middleware/auth');
const router = express.Router();
const { validationResult } = require("express-validator");

const {
    trainingTypeWiseCount1
  } = require('../controllers/ReportsController');
// Add Sessionslot
router.post('/training-type-wise-count', (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();

}, trainingTypeWiseCount1);



module.exports = router;
