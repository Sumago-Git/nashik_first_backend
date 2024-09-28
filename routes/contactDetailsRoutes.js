const express = require('express');
const { addContactDetails, updateContactDetails, getContactDetails, isActiveStatus, isDeleteStatus } = require('../controllers/ContactDetailsController');
const { validateContactDetails, validateContactDetailsId } = require('../validations/contactDetailsValidation');
const { validationResult } = require('express-validator');
const apiResponse = require('../helper/apiResponse');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Add contact details
router.post('/create-contactdetails', validateContactDetails, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();
}, addContactDetails);

// Update contact details
router.put('/update-contactdetails/:id', authenticateToken, validateContactDetailsId, validateContactDetails, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();
}, updateContactDetails);

// Get contact details
router.get('/get-contactdetails', getContactDetails);
// Get contact details with authentication
router.get('/find-contactdetails', authenticateToken, getContactDetails);

// Toggle contact details status
router.put('/isactive-contact/:id', authenticateToken, validateContactDetailsId, isActiveStatus);

// Toggle contact details delete status
router.delete('/isdelete-contact/:id', authenticateToken, validateContactDetailsId, isDeleteStatus);

module.exports = router;
