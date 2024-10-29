const express = require('express');
const { addBookingForm, updateBookingForm, getBookingForm, isActiveStatus, isDeleteStatus, uploadOrAddBookingForm, uploadXLSX } = require('../controllers/BookingFormController');
const { validateBookingForm, validateBookingFormId } = require('../validations/bookingFormValidation');
const { validationResult } = require('express-validator');
const apiResponse = require('../helper/apiResponse');
const authenticateToken = require('../middleware/auth');
const { uploadSingleXLSX } = require('../middleware/multerPDF')
const router = express.Router();

router.post('/create-uploadXLSX', uploadSingleXLSX, uploadXLSX);
router.post('/create-uploadOrAddBookingForm', uploadSingleXLSX, uploadOrAddBookingForm);
// Add booking form
router.post('/create-bookingform', uploadSingleXLSX, validateBookingForm, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();
}, addBookingForm);

// Update booking form
router.put('/bookingform/:id', authenticateToken, validateBookingFormId, validateBookingForm, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();
}, updateBookingForm);

// Get booking forms
router.get('/get-bookingforms', authenticateToken, getBookingForm);

// Toggle booking form status
router.put('/isactive-booking/:id', authenticateToken, validateBookingFormId, isActiveStatus);

// Toggle booking form delete status
router.delete('/isdelete-booking/:id', authenticateToken, validateBookingFormId, isDeleteStatus);

module.exports = router;
