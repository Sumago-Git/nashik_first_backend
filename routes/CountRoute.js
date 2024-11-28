const express = require("express");
const router = express.Router();
const { getCounts } = require("../controllers/CountController"); // Adjust the path as per your structure

// Define route to get counts from both SessionSlot and BookingEntries
router.get("/get-entry-counts", getCounts);

module.exports = router;