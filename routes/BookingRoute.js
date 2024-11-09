const express = require('express');
const { addBookingEntry, getBookingEntries, getBookingEntriesByDateAndCategory, getBookingEntryById, updateBookingEntry, deleteBookingEntry, toggleActive, toggleDelete } = require('../controllers/BookingEntriesController');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// Route to add a new booking entry
router.post('/create-bookingentry', authenticateToken, addBookingEntry);

// Route to get booking entries by date and category using POST method
router.post('/get-bookingentries-by-date-category', authenticateToken, getBookingEntriesByDateAndCategory);

// Route to get all booking entries
router.get('/get-bookingentries', authenticateToken, getBookingEntries);

// Route to get a booking entry by ID
router.get('/get-bookingentry/:id', authenticateToken, getBookingEntryById);

// Route to update a booking entry by ID
router.put('/update-bookingentry/:id', authenticateToken, updateBookingEntry);

// Route to delete a booking entry by ID
router.delete('/delete-bookingentry/:id', authenticateToken, deleteBookingEntry);

// Route to toggle active status of a booking entry
router.put('/toggle-active/:id', authenticateToken, toggleActive);

// Route to toggle delete status of a booking entry
router.put('/toggle-delete/:id', authenticateToken, toggleDelete);

module.exports = router;
