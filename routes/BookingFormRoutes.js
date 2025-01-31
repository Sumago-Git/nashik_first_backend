const express = require('express');
const { addBookingForm, getSlotInfobyid, registerSlotInfo, updateBookingForm, updateSlotInfo, getSlotInfo, deleteSlotInfo, getBookingForm, getBookingEntriesByDateAndCategory, updateTrainingStatus, getAllEntriesByCategory, isActiveStatus, isDeleteStatus, deleteBookingForm, uploadOrAddBookingForm, uploadXLSX } = require('../controllers/BookingFormController');
const { validateBookingForm, validateBookingFormId } = require('../validations/bookingFormValidation');
const { validationResult } = require('express-validator');
const apiResponse = require('../helper/apiResponse');
const authenticateToken = require('../middleware/auth');
const { uploadSingleXLSX } = require('../middleware/multerPDF')
const router = express.Router();

router.post('/create-uploadXLSX', uploadSingleXLSX, uploadXLSX);
router.post('/registerSlotInfo', registerSlotInfo);
router.delete('/deleteSlotInfo/:id', deleteSlotInfo)
router.get('/getSlotInfobyid/:id', getSlotInfobyid)
router.post('/getSlotInfo', getSlotInfo)
router.put('/updateSlotInfo/:id', updateSlotInfo)
router.post('/create-uploadOrAddBookingForm', uploadSingleXLSX, uploadOrAddBookingForm);
// Add booking form
router.post('/create-bookingform', uploadSingleXLSX, validateBookingForm, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();
}, addBookingForm);

// Route to get booking entries by date and category using POST method
router.post('/get-bookingentries-by-date-category1', getBookingEntriesByDateAndCategory);

// Route to get booking entries by category using POST method
router.post('/get-bookingentries-by-category', getAllEntriesByCategory);


// Update booking form
router.put('/bookingform/:id', authenticateToken, updateBookingForm);

// Get booking forms
router.get('/get-bookingforms', authenticateToken, getBookingForm);

// Toggle booking form status
router.put('/isactive-booking/:id', authenticateToken, validateBookingFormId, isActiveStatus);
router.put('/updateTrainingStatus', updateTrainingStatus)
// Toggle booking form delete status
router.delete('/isdelete-booking/:id', authenticateToken, validateBookingFormId, isDeleteStatus);
router.put('/delete-booking/:id', authenticateToken, validateBookingFormId, deleteBookingForm);

module.exports = router;