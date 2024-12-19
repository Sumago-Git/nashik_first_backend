const express = require('express');
const { addSessionslot,fetchSlots, updateSessionslot,getAvailableSlotsByDateAndCategory, getSessionSessionslot, toggleIsActive, checkTrainerConflictByDate, toggleIsDelete, getAvailableslots2, getSessionslotsByCategory, getSessionbySessionslot, getSessionbySessionslot2, getAvailableslots } = require('../controllers/SesssionslotController');
const { validationResult } = require('express-validator');
const { Id } = require('../validations/slotValidation'); // Assuming validations are similar

const apiResponse = require('../helper/apiResponse');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Add Sessionslot
router.post('/create-Sessionslot', (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();

}, addSessionslot);

router.post('/checkTrainerConflict', checkTrainerConflictByDate);

// Update Sessionslot
router.put('/Sessionslot/:id', authenticateToken, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return apiResponse.validationErrorWithData(res, 'Validation Error', errors.array());
  }
  next();
}, updateSessionslot);


router.post("/sessionslots", getSessionslotsByCategory);
router.get("/fetchSlots",fetchSlots)
// Get all SessionSessionslot
router.post("/getAvailableSlotsByDateAndCategory",getAvailableSlotsByDateAndCategory)
router.get('/get-SessionSessionslot', getSessionSessionslot);
router.post('/getAvailableslotslots', getAvailableslots)
router.post('/getAvailableslotslots2', getAvailableslots2)
router.post('/get-getSessionbySessionslot', getSessionbySessionslot);
router.post('/get-getSessionbySessionslot2', getSessionbySessionslot2);
// Toggle Sessionslot active status
router.put('/isactive-Sessionslot/:id', authenticateToken, toggleIsActive);

// Toggle Sessionslot delete status (soft delete)
router.delete('/isdelete-Sessionslot/:id', authenticateToken, toggleIsDelete);



module.exports = router;
