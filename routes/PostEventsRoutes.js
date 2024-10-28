const express = require("express");
const { uploadSingle } = require("../middleware/multer");
const {
  addPostEvents,
  updatePostEvents,
  togglePostEventsStatus,
  togglePostEventsDelete,
  getPostEvents,
} = require("../controllers/PostEventsController");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Route to create a new PostEvents
router.post(
  "/create-PostEvents",
  authenticateToken,
  uploadSingle,
  addPostEvents
);

// Route to update an existing PostEvents
router.put(
  "/update-PostEvents/:id",
  authenticateToken,
  uploadSingle,
  updatePostEvents
);

// Route to toggle isActive status of PostEvents
router.put(
  "/PostEvents-status/:id",
  authenticateToken,
  togglePostEventsStatus
);

// Route to toggle isDelete status of PostEvents
router.delete(
  "/PostEvents-delete/:id",
  authenticateToken,
  togglePostEventsDelete
);

// Route to get all active PhotoGalleries
router.get("/get-PostEvents", getPostEvents);

// Route to get all active PhotoGalleries
router.get("/find-PostEvents", authenticateToken, getPostEvents);

module.exports = router;
