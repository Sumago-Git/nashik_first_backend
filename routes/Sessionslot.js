const express = require('express');
const { addSessionslot, updateSessionslot, getSessionSessionslot, toggleIsActive, toggleIsDelete } = require('../controllers/SesssionslotController');
const { validationResult } = require('express-validator');
const {    Id } = require('../validations/slotValidation'); // Assuming validations are similar

const apiResponse = require('../helper/apiResponse');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Add Sessionslot
router.post('/create-Sessionslot',   (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();

}, addSessionslot);

// Update Sessionslot
router.put('/Sessionslot/:id', authenticateToken,    (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();
}, updateSessionslot);

// Get all SessionSessionslot
router.get('/get-SessionSessionslot', getSessionSessionslot);

// Toggle Sessionslot active status
router.put('/isactive-Sessionslot/:id', authenticateToken, toggleIsActive);

// Toggle Sessionslot delete status (soft delete)
router.delete('/isdelete-Sessionslot/:id', authenticateToken,  toggleIsDelete);

module.exports = router;
