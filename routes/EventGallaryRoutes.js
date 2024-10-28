const express = require("express");
const { uploadSingle } = require("../middleware/multer");
const {
  addEventGallary,
  updateEventGallary,
  toggleEventGallaryStatus,
  toggleEventGallaryDelete,
  getEventGallary,
} = require("../controllers/EventGallaryController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Route to create a new EventGallary
router.post(
  "/create-EventGallary",
  authenticateToken,
  uploadSingle,
  addEventGallary
);

// Route to update an existing EventGallary
router.put(
  "/update-EventGallary/:id",
  authenticateToken,
  uploadSingle,
  updateEventGallary
);

// Route to toggle isActive status of EventGallary
router.put(
  "/EventGallary-status/:id",
  authenticateToken,
  toggleEventGallaryStatus
);

// Route to toggle isDelete status of EventGallary
router.delete(
  "/EventGallary-delete/:id",
  authenticateToken,
  toggleEventGallaryDelete
);

// Route to get all active PhotoGalleries
router.get("/get-EventGallary", getEventGallary);

// Route to get all active PhotoGalleries
router.get("/find-EventGallary", authenticateToken, getEventGallary);

module.exports = router;
