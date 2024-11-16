// routes/socialContact.js
const express = require('express');
const { addSocialContact, updateSocialContact, getSocialContact, isActiveStatus, isDeleteStatus } = require('../controllers/SocialContactController');
const { validateSocialContact, validateSocialContactId } = require('../validations/socialContactValidation');
const { validationResult } = require('express-validator');
const apiResponse = require('../helper/apiResponse');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Add social contact
router.post('/create-socialcontact', validateSocialContact, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();
}, addSocialContact);

// Update social contact
router.put('/socialcontact/:id', authenticateToken, validateSocialContactId, validateSocialContact, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();
}, updateSocialContact);

// Get all social contacts
router.get('/socialcontacts', getSocialContact);

// Toggle social contact active status
router.put('/socialcontact/:id/status/active', authenticateToken, validateSocialContactId, isActiveStatus);

// Toggle social contact delete status
router.put('/socialcontact/:id/status/delete', authenticateToken, validateSocialContactId, isDeleteStatus);

module.exports = router;
