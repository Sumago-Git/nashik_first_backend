const express = require('express');
const {
  addAnnualReport,
  getAnnualReports,
  getActiveAnnualReports,
  updateAnnualReport, // Ensure this is included
  toggleAnnualReportStatus,
  toggleAnnualReportDelete
} = require('../controllers/AnnualReportController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Route to create a new Annual Report (POST)
router.post('/create-annualReport', authenticateToken, addAnnualReport);

// Route to get all Annual Reports (GET)
router.get('/get-annualReports', getAnnualReports);

// Route to get all active Annual Reports (GET)
router.get('/get-active-annualReports', getActiveAnnualReports);

// Route to update an existing Annual Report (PUT)
router.put('/update-annualReport/:id', authenticateToken, updateAnnualReport); 

// Route to toggle isActive status (PUT)
router.put('/annualReport-status/:id', authenticateToken, toggleAnnualReportStatus);

// Route to toggle isDelete status (DELETE)
router.delete('/annualReport-delete/:id', authenticateToken, toggleAnnualReportDelete);

module.exports = router;
