const express = require('express');
const { addSlot, updateSlot, getSlots, toggleIsActive, toggleIsDelete, } = require('../controllers/SlotsController');
const { validateSlot, validateSlotId } = require('../validations/slotValidation'); // Assuming validations are similar
const { validationResult } = require('express-validator');
const apiResponse = require('../helper/apiResponse');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Add slot
router.post('/create-slot', validateSlot, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();
}, addSlot);

// Update slot
router.put('/slot/:id', authenticateToken, validateSlotId, validateSlot, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();
}, updateSlot);

// Get all slots
router.get('/get-slots', getSlots);

// Toggle slot active status
router.put('/isactive-slot/:id', authenticateToken, validateSlotId, toggleIsActive);



// Toggle slot delete status (soft delete)
router.delete('/isdelete-slot/:id', authenticateToken, validateSlotId, toggleIsDelete);

module.exports = router;
