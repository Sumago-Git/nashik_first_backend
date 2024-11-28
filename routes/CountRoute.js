const express = require("express");
const router = express.Router();
const { getCounts } = require("../controllers/CountController"); // Adjust the path as per your structure
const authenticateToken = require("../middleware/auth"); // Assuming authentication middleware

// Define route to get counts from both SessionSlot and BookingEntries
router.post("/get-entry-counts", authenticateToken, getCounts);

module.exports = router;