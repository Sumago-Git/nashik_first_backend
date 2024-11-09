const express = require('express');
const {
  addAnnualReturn,
  getAnnualReturns,
  getActiveAnnualReturns,
  updateAnnualReturn, // Ensure this is included
  toggleAnnualReturnStatus,
  toggleAnnualReturnDelete
} = require('../controllers/AnnualReturnController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Route to create a new Annual Return (POST)
router.post('/create-annualReturn', authenticateToken, addAnnualReturn);

// Route to get all Annual Returns (GET)
router.get('/get-annualReturns', getAnnualReturns);

// Route to get all active Annual Returns (GET)
router.get('/get-active-annualReturns', getActiveAnnualReturns);

// Route to update an existing Annual Return (PUT)
router.put('/update-annualReturn/:id', authenticateToken, updateAnnualReturn); 

// Route to toggle isActive status (PUT)
router.put('/annualReturn-status/:id', authenticateToken, toggleAnnualReturnStatus);

// Route to toggle isDelete status (DELETE)
router.delete('/annualReturn-delete/:id', authenticateToken, toggleAnnualReturnDelete);

module.exports = router;
