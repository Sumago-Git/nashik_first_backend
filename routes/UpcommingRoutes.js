const express = require("express");
const { uploadSingle } = require("../middleware/multer");
const {
  addUpcomming,
  updateUpcomming,
  toggleUpcommingStatus,
  toggleUpcommingDelete,
  getUpcommingEntries,
  getActiveUpcomingEntries
} = require("../controllers/UpcommingController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Route to create a new Upcomming entry
router.post(
  "/create-Upcomming",
  authenticateToken,
  uploadSingle,
  addUpcomming
);

// Route to update an existing Upcomming entry
router.put(
  "/update-Upcomming/:id",
  authenticateToken,
  uploadSingle,
  updateUpcomming
);

// Route to toggle isActive status of Upcomming
router.put(
  "/Upcomming-status/:id",
  authenticateToken,
  toggleUpcommingStatus
);

// Route to toggle isDelete status of Upcomming
router.delete(
  "/Upcomming-delete/:id",
  authenticateToken,
  toggleUpcommingDelete
);

// Route to get all active Upcomming entries
router.get("/get-Upcomming", getActiveUpcomingEntries);

// Route to get active Upcomming entries with authentication
router.get("/find-Upcomming", authenticateToken, getUpcommingEntries);

module.exports = router;
