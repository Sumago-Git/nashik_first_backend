const express = require('express');
const { Id } = require('../validations/slotValidation'); // Assuming validations are similar
const apiResponse = require('../helper/apiResponse');
const authenticateToken = require('../middleware/auth');
const router = express.Router();
const { validationResult } = require("express-validator");

const {
  trainingTypeWiseCount,
    trainingTypeWiseCountByCategory,
    trainingTypeWiseCountByYear,
    trainingTypeWiseCountByMonth,
    trainingTypeWiseCountByYearAll,
    trainingTypeWiseCountByYearAllSchool,
    trainingTypeWiseCountByYearAllAdult,
    trainingTypeWiseCountRTO,
    trainingYearWiseCount,
    totalSessionsConducted
  } = require('../controllers/ReportsController');
// Add Sessionslot
router.post('/trainingTypeWiseCount',authenticateToken, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();

}, trainingTypeWiseCount);

router.post('/trainingTypeWiseCountByCategory',authenticateToken, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();

}, trainingTypeWiseCountByCategory);

router.post('/trainingTypeWiseCountByYear',authenticateToken, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();

}, trainingTypeWiseCountByYear);

router.post('/trainingTypeWiseCountByMonth',authenticateToken, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();

}, trainingTypeWiseCountByMonth);

router.post('/trainingTypeWiseCountByYearAll',authenticateToken, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();

}, trainingTypeWiseCountByYearAll);

router.post('/trainingTypeWiseCountByYearAllAdult',authenticateToken, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();

}, trainingTypeWiseCountByYearAllAdult);


router.post('/trainingTypeWiseCountByYearAllSchool',authenticateToken, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();

}, trainingTypeWiseCountByYearAllSchool);

router.post('/trainingTypeWiseCountRTO',authenticateToken, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();

}, trainingTypeWiseCountRTO);

router.post('/trainingYearWiseCount',authenticateToken, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();

}, trainingYearWiseCount);

router.post('/totalSessionsConducted',authenticateToken, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();

}, totalSessionsConducted);


module.exports = router;
